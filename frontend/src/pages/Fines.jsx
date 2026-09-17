import React, { useState, useEffect } from 'react';
import { 
  ReceiptIndianRupee, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Plus,
  AlertTriangle,
  FileText,
  Filter
} from 'lucide-react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { getFines, updateFine, deleteFine, createFine, getIssues } from '../api/api';

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Issue_ID: '',
    Amount: 100,
    Reason: '',
    Status: 'Unpaid'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fineData, issueData] = await Promise.all([
        getFines(),
        getIssues()
      ]);
      setFines(fineData);
      setIssues(issueData);
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to load fine records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAsPaid = async (fine) => {
    try {
      await updateFine(fine.Fine_ID, { Status: 'Paid' });
      setAlertInfo({ type: 'success', message: `Fine #${fine.Fine_ID} for ${fine.Student_Name} marked as Paid.` });
      loadData();
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to update fine status.' });
    }
  };

  const handleMarkAsUnpaid = async (fine) => {
    try {
      await updateFine(fine.Fine_ID, { Status: 'Unpaid' });
      setAlertInfo({ type: 'info', message: `Fine #${fine.Fine_ID} reset to Unpaid.` });
      loadData();
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to update fine status.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete fine record #${id}?`)) return;
    try {
      await deleteFine(id);
      setAlertInfo({ type: 'success', message: `Fine #${id} deleted.` });
      loadData();
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to delete fine record.' });
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      Issue_ID: issues.length > 0 ? issues[0].Issue_ID : '',
      Amount: 100,
      Reason: 'Late equipment return fee',
      Status: 'Unpaid'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFine(formData);
      setAlertInfo({ type: 'success', message: 'Manual fine record created.' });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error creating fine.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const filteredFines = fines.filter((f) => {
    if (statusFilter === 'All') return true;
    return f.Status === statusFilter;
  });

  const totalUnpaid = fines
    .filter(f => f.Status === 'Unpaid')
    .reduce((acc, curr) => acc + Number(curr.Amount), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Fines & Penalties</h2>
          <p className="page-description">Automated and manual fines logged for overdue loans (&gt; 7 days) or damaged equipment.</p>
        </div>
        <div className="header-actions">
          <div className="fine-total-badge">
            Total Unpaid: <strong>₹{totalUnpaid.toFixed(2)}</strong>
          </div>
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <Plus size={18} /> Record Fine
          </button>
        </div>
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
        {['All', 'Unpaid', 'Paid'].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab} Fines ({fines.filter(f => tab === 'All' ? true : f.Status === tab).length})
          </button>
        ))}
      </div>

      {/* Fines Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading fines data...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fine ID</th>
                  <th>Student</th>
                  <th>Equipment Item</th>
                  <th>Issue Ref</th>
                  <th>Amount</th>
                  <th>Reason / Note</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFines.length > 0 ? (
                  filteredFines.map((f) => (
                    <tr key={f.Fine_ID}>
                      <td>#{f.Fine_ID}</td>
                      <td>
                        <div className="font-semibold">{f.Student_Name}</div>
                        <div className="text-muted text-xs">{f.Student_Department}</div>
                      </td>
                      <td>{f.Equipment_Name}</td>
                      <td>
                        <span className="badge-tag">Issue #{f.Issue_ID}</span>
                      </td>
                      <td>
                        <span className={`font-bold ${f.Status === 'Unpaid' ? 'text-rose' : 'text-emerald'}`}>
                          ₹{Number(f.Amount).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div className="reason-text">{f.Reason || 'Standard penalty'}</div>
                      </td>
                      <td>
                        <span className={`status-pill status-${f.Status.toLowerCase()}`}>
                          {f.Status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-inline">
                          {f.Status === 'Unpaid' ? (
                            <button
                              onClick={() => handleMarkAsPaid(f)}
                              className="btn btn-sm btn-emerald"
                              title="Mark fine as Paid"
                            >
                              <CheckCircle size={14} /> Mark as Paid
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkAsUnpaid(f)}
                              className="btn btn-sm btn-outline"
                              title="Reset fine to Unpaid"
                            >
                              <Clock size={14} /> Reopen
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(f.Fine_ID)}
                            className="btn-icon btn-icon-delete"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      No fine records found for "{statusFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Fine Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Manual Fine"
      >
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label">Associated Equipment Issue *</label>
            <select
              required
              className="form-control"
              value={formData.Issue_ID}
              onChange={(e) => setFormData({ ...formData, Issue_ID: e.target.value })}
            >
              <option value="">-- Choose Issue Record --</option>
              {issues.map((i) => (
                <option key={i.Issue_ID} value={i.Issue_ID}>
                  Issue #{i.Issue_ID} — {i.Student_Name} ({i.Equipment_Name}) - {i.Issue_Date}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fine Amount (₹) *</label>
            <input
              type="number"
              min="1"
              step="5"
              required
              className="form-control"
              value={formData.Amount}
              onChange={(e) => setFormData({ ...formData, Amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Penalty Details *</label>
            <textarea
              rows="3"
              required
              className="form-control"
              placeholder="e.g. Lost shuttlecock set / racket cracked / return delayed"
              value={formData.Reason}
              onChange={(e) => setFormData({ ...formData, Reason: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Status</label>
            <select
              className="form-control"
              value={formData.Status}
              onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Fine
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
