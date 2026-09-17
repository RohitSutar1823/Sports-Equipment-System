import React, { useState, useEffect } from 'react';
import { 
  Repeat, 
  Plus, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Dumbbell, 
  Calendar,
  DollarSign
} from 'lucide-react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { 
  getIssues, 
  createIssue, 
  returnIssue, 
  getStudents, 
  getEquipment, 
  getBookings 
} from '../api/api';

export default function IssueReturn() {
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // Issue modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    Student_ID: '',
    Equipment_ID: '',
    Booking_ID: '',
    Quantity: 1,
    Issue_Date: new Date().toISOString().split('T')[0]
  });

  // Return modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [activeIssueToReturn, setActiveIssueToReturn] = useState(null);
  const [returnForm, setReturnForm] = useState({
    Return_Date: new Date().toISOString().split('T')[0],
    Is_Damaged: false,
    Damage_Description: '',
    Damage_Cost: 150,
    New_Condition: 'Fair'
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [issueData, studentData, equipData, bookingData] = await Promise.all([
        getIssues(),
        getStudents(),
        getEquipment(),
        getBookings()
      ]);
      setIssues(issueData);
      setStudents(studentData);
      setEquipmentList(equipData);
      setBookings(bookingData);
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to fetch issue and inventory records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle open issue modal
  const handleOpenIssueModal = () => {
    setIssueForm({
      Student_ID: students.length > 0 ? students[0].Student_ID : '',
      Equipment_ID: equipmentList.length > 0 ? equipmentList[0].Equipment_ID : '',
      Booking_ID: '',
      Quantity: 1,
      Issue_Date: new Date().toISOString().split('T')[0]
    });
    setIsIssueModalOpen(true);
  };

  // Submit Issue form
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedItem = equipmentList.find(e => e.Equipment_ID === Number(issueForm.Equipment_ID));
      if (selectedItem && selectedItem.Available_Quantity < Number(issueForm.Quantity)) {
        setAlertInfo({ 
          type: 'error', 
          message: `Cannot issue: only ${selectedItem.Available_Quantity} unit(s) of ${selectedItem.Equipment_Name} are available.` 
        });
        return;
      }

      const res = await createIssue(issueForm);
      setAlertInfo({ 
        type: 'success', 
        message: `Equipment successfully issued to ${res.Student_Name}. Available stock decreased by ${issueForm.Quantity}.` 
      });
      setIsIssueModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to issue equipment.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  // Handle open return modal
  const handleOpenReturnModal = (issue) => {
    setActiveIssueToReturn(issue);
    setReturnForm({
      Return_Date: new Date().toISOString().split('T')[0],
      Is_Damaged: false,
      Damage_Description: '',
      Damage_Cost: 150,
      New_Condition: 'Fair'
    });
    setIsReturnModalOpen(true);
  };

  // Calculate loan duration for return preview
  const getLoanDays = (issueDateStr, returnDateStr) => {
    if (!issueDateStr || !returnDateStr) return 0;
    const iDate = new Date(issueDateStr);
    const rDate = new Date(returnDateStr);
    const diff = Math.floor((rDate.getTime() - iDate.getTime()) / (1000 * 3600 * 24));
    return diff;
  };

  // Submit Return form
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!activeIssueToReturn) return;

    try {
      const res = await returnIssue(activeIssueToReturn.Issue_ID, returnForm);
      let successMsg = `Equipment marked as returned. Available stock replenished by ${activeIssueToReturn.Quantity}.`;

      if (res.finesCreated && res.finesCreated.length > 0) {
        const finesSummary = res.finesCreated.map(f => `₹${f.Amount} (${f.Reason})`).join(', ');
        successMsg += ` ⚠️ Automatic Fine Generated: ${finesSummary}`;
      }

      setAlertInfo({ type: 'success', message: successMsg });
      setIsReturnModalOpen(false);
      loadAllData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to process equipment return.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const selectedEquipItem = equipmentList.find(e => e.Equipment_ID === Number(issueForm.Equipment_ID));

  const filteredIssues = issues.filter((item) => {
    if (statusFilter === 'All') return true;
    return item.Status === statusFilter;
  });

  // Calculate dynamic loan days for active return modal
  const activeDays = activeIssueToReturn 
    ? getLoanDays(activeIssueToReturn.Issue_Date, returnForm.Return_Date)
    : 0;
  const isLate = activeDays > 7;
  const lateFineEst = isLate ? (activeDays - 7) * 20 : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Equipment Issue & Return</h2>
          <p className="page-description">Loan sports equipment to students, manage active checkouts, and enforce return rules.</p>
        </div>
        <button onClick={handleOpenIssueModal} className="btn btn-primary">
          <Plus size={18} /> Issue Equipment
        </button>
      </div>

      {alertInfo.message && (
        <Alert 
          type={alertInfo.type} 
          message={alertInfo.message} 
          onClose={() => setAlertInfo({ type: '', message: '' })} 
        />
      )}

      {/* Filter Tabs */}
      <div className="tabs-container">
        {['All', 'Issued', 'Returned'].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab} Issues
          </button>
        ))}
      </div>

      {/* Issues Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading loan records...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Student</th>
                  <th>Equipment Item</th>
                  <th>Qty</th>
                  <th>Issue Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <tr key={issue.Issue_ID}>
                      <td>#{issue.Issue_ID}</td>
                      <td>
                        <div className="font-semibold">{issue.Student_Name}</div>
                        <div className="text-muted text-xs">{issue.Student_Department}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{issue.Equipment_Name}</div>
                        <div className="text-muted text-xs">{issue.Equipment_Category}</div>
                      </td>
                      <td>
                        <span className="badge-number">{issue.Quantity}</span>
                      </td>
                      <td>{issue.Issue_Date}</td>
                      <td>
                        {issue.Return_Date ? (
                          <span className="text-success">{issue.Return_Date}</span>
                        ) : (
                          <span className="text-muted italic">Active loan</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill status-${issue.Status.toLowerCase()}`}>
                          {issue.Status}
                        </span>
                      </td>
                      <td className="text-right">
                        {issue.Status === 'Issued' ? (
                          <button
                            onClick={() => handleOpenReturnModal(issue)}
                            className="btn btn-sm btn-outline"
                          >
                            <RotateCcw size={14} /> Process Return
                          </button>
                        ) : (
                          <span className="status-returned-badge">
                            <CheckCircle2 size={14} className="text-emerald" /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No issue records found for "{statusFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Equipment Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Equipment to Student"
      >
        <form onSubmit={handleIssueSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label">Select Student *</label>
            <select
              required
              className="form-control"
              value={issueForm.Student_ID}
              onChange={(e) => setIssueForm({ ...issueForm, Student_ID: e.target.value })}
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.Student_ID} value={s.Student_ID}>
                  {s.Name} ({s.Department} - {s.Year})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Equipment *</label>
            <select
              required
              className="form-control"
              value={issueForm.Equipment_ID}
              onChange={(e) => setIssueForm({ ...issueForm, Equipment_ID: e.target.value })}
            >
              <option value="">-- Choose Equipment --</option>
              {equipmentList.map((e) => (
                <option key={e.Equipment_ID} value={e.Equipment_ID}>
                  {e.Equipment_Name} (Available: {e.Available_Quantity}/{e.Total_Quantity})
                </option>
              ))}
            </select>
            {selectedEquipItem && (
              <div className="hint-stock">
                Available Stock:{' '}
                <strong className={selectedEquipItem.Available_Quantity > 0 ? 'text-emerald' : 'text-rose'}>
                  {selectedEquipItem.Available_Quantity}
                </strong>
                {selectedEquipItem.Available_Quantity === 0 && ' — Out of stock! Cannot issue.'}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity to Issue *</label>
              <input
                type="number"
                min="1"
                max={selectedEquipItem ? selectedEquipItem.Available_Quantity : 100}
                required
                className="form-control"
                value={issueForm.Quantity}
                onChange={(e) => setIssueForm({ ...issueForm, Quantity: parseInt(e.target.value, 10) || 1 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Issue Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={issueForm.Issue_Date}
                onChange={(e) => setIssueForm({ ...issueForm, Issue_Date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Facility Booking Reference (Optional)</label>
            <select
              className="form-control"
              value={issueForm.Booking_ID}
              onChange={(e) => setIssueForm({ ...issueForm, Booking_ID: e.target.value })}
            >
              <option value="">None (Independent Loan)</option>
              {bookings.map((b) => (
                <option key={b.Booking_ID} value={b.Booking_ID}>
                  Booking #{b.Booking_ID} - {b.Facility_Name} ({b.Date} {b.Start_Time.slice(0, 5)}) - {b.Student_Name}
                </option>
              ))}
            </select>
          </div>

          <div className="notice-box">
            <strong>Standard Loan Rule:</strong> Equipment must be returned within <strong>7 days</strong>. Returns after 7 days will automatically incur a late fine of ₹20/day.
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsIssueModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={selectedEquipItem && selectedEquipItem.Available_Quantity < issueForm.Quantity}
            >
              Confirm Issue
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Equipment Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title={`Return Equipment (Issue #${activeIssueToReturn?.Issue_ID})`}
      >
        {activeIssueToReturn && (
          <form onSubmit={handleReturnSubmit} className="form-stack">
            <div className="return-summary-card">
              <div><strong>Student:</strong> {activeIssueToReturn.Student_Name}</div>
              <div><strong>Item:</strong> {activeIssueToReturn.Equipment_Name} (Qty: {activeIssueToReturn.Quantity})</div>
              <div><strong>Issue Date:</strong> {activeIssueToReturn.Issue_Date}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Actual Return Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={returnForm.Return_Date}
                onChange={(e) => setReturnForm({ ...returnForm, Return_Date: e.target.value })}
              />
            </div>

            {/* Late Return Alert */}
            <div className={`loan-calc-banner ${isLate ? 'loan-calc-late' : 'loan-calc-ontime'}`}>
              <Clock size={18} />
              <div>
                <strong>Loan Duration: {activeDays} day(s)</strong>
                {isLate ? (
                  <p className="text-sm">
                    Exceeded the 7-day loan window by <strong>{activeDays - 7} day(s)</strong>.
                    <br />
                    An automatic late fine of <strong>₹{lateFineEst.toFixed(2)}</strong> (₹20/day) will be registered!
                  </p>
                ) : (
                  <p className="text-sm">Returned within the permitted 7-day loan period. No late fine.</p>
                )}
              </div>
            </div>

            {/* Damage Checklist */}
            <div className="damage-check-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={returnForm.Is_Damaged}
                  onChange={(e) => setReturnForm({ ...returnForm, Is_Damaged: e.target.checked })}
                />
                <span>Equipment is Damaged / Requires Repair</span>
              </label>

              {returnForm.Is_Damaged && (
                <div className="damage-inputs-wrapper">
                  <div className="form-group">
                    <label className="form-label">Damage Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Broken frame / torn grip / bent shaft"
                      value={returnForm.Damage_Description}
                      onChange={(e) => setReturnForm({ ...returnForm, Damage_Description: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Updated Condition</label>
                      <select
                        className="form-control"
                        value={returnForm.New_Condition}
                        onChange={(e) => setReturnForm({ ...returnForm, New_Condition: e.target.value })}
                      >
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Damage Fine Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        className="form-control"
                        value={returnForm.Damage_Cost}
                        onChange={(e) => setReturnForm({ ...returnForm, Damage_Cost: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setIsReturnModalOpen(false)} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Return & Update Stock
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
