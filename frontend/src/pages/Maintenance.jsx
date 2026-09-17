import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  CheckCircle, 
  Clock, 
  Trash2, 
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { 
  getMaintenance, 
  createMaintenance, 
  updateMaintenance, 
  deleteMaintenance, 
  getEquipment 
} from '../api/api';

export default function Maintenance() {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Equipment_ID: '',
    Maintenance_Date: new Date().toISOString().split('T')[0],
    Description: '',
    Cost: 0,
    Status: 'Pending'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintData, equipData] = await Promise.all([
        getMaintenance(),
        getEquipment()
      ]);
      setMaintenanceList(maintData);
      setEquipmentList(equipData);
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to load maintenance records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      Equipment_ID: equipmentList.length > 0 ? equipmentList[0].Equipment_ID : '',
      Maintenance_Date: new Date().toISOString().split('T')[0],
      Description: '',
      Cost: 150,
      Status: 'Pending'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenance(formData);
      setAlertInfo({ type: 'success', message: 'Maintenance record logged successfully.' });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error logging maintenance.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.Status === 'Pending' ? 'Completed' : 'Pending';
    try {
      await updateMaintenance(item.Maintenance_ID, { ...item, Status: nextStatus });
      setAlertInfo({ type: 'success', message: `Maintenance #${item.Maintenance_ID} marked as ${nextStatus}.` });
      loadData();
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to update maintenance status.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete maintenance record #${id}?`)) return;
    try {
      await deleteMaintenance(id);
      setAlertInfo({ type: 'success', message: `Maintenance record #${id} deleted.` });
      loadData();
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to delete record.' });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Equipment Maintenance Log</h2>
          <p className="page-description">Track equipment servicing, string replacements, bladder repairs, and servicing expenses.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Log Maintenance
        </button>
      </div>

      {alertInfo.message && (
        <Alert 
          type={alertInfo.type} 
          message={alertInfo.message} 
          onClose={() => setAlertInfo({ type: '', message: '' })} 
        />
      )}

      {/* Maintenance Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading maintenance records...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Serviced Date</th>
                  <th>Description</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceList.length > 0 ? (
                  maintenanceList.map((m) => (
                    <tr key={m.Maintenance_ID}>
                      <td>#{m.Maintenance_ID}</td>
                      <td>
                        <div className="font-semibold">{m.Equipment_Name}</div>
                      </td>
                      <td>
                        <span className="badge-tag">{m.Equipment_Category || 'General'}</span>
                      </td>
                      <td>{m.Maintenance_Date}</td>
                      <td>{m.Description || <span className="text-muted italic">Routine maintenance</span>}</td>
                      <td>
                        <span className="font-semibold">₹{Number(m.Cost).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className={`status-pill status-${m.Status.toLowerCase()}`}>
                          {m.Status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-inline">
                          <button
                            onClick={() => handleToggleStatus(m)}
                            className={`btn btn-sm ${m.Status === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                            title="Toggle status"
                          >
                            {m.Status === 'Pending' ? (
                              <><CheckCircle size={14} /> Mark Done</>
                            ) : (
                              <><Clock size={14} /> Set Pending</>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(m.Maintenance_ID)}
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
                      No maintenance records registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Maintenance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Equipment Maintenance"
      >
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label">Equipment Item *</label>
            <select
              required
              className="form-control"
              value={formData.Equipment_ID}
              onChange={(e) => setFormData({ ...formData, Equipment_ID: e.target.value })}
            >
              <option value="">-- Choose Equipment --</option>
              {equipmentList.map((e) => (
                <option key={e.Equipment_ID} value={e.Equipment_ID}>
                  {e.Equipment_Name} ({e.Category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Maintenance Date *</label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.Maintenance_Date}
                onChange={(e) => setFormData({ ...formData, Maintenance_Date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cost (₹)</label>
              <input
                type="number"
                min="0"
                step="5"
                className="form-control"
                value={formData.Cost}
                onChange={(e) => setFormData({ ...formData, Cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Description</label>
            <textarea
              rows="3"
              className="form-control"
              placeholder="e.g. Restringing with BG65 titanium / grip change / handle repair"
              value={formData.Description}
              onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={formData.Status}
              onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Maintenance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
