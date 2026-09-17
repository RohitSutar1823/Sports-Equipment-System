import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Dumbbell, 
  Filter, 
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '../api/api';

export default function Equipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    Equipment_Name: '',
    Category: 'Cricket',
    Total_Quantity: 10,
    Available_Quantity: 10,
    Condition: 'Good'
  });

  const categories = ['All', 'Cricket', 'Badminton', 'Basketball', 'Football', 'Table Tennis', 'Volleyball', 'Athletics', 'General'];
  const conditions = ['Good', 'Fair', 'Poor', 'Damaged'];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getEquipment();
      setEquipmentList(data);
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to fetch equipment catalog.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      Equipment_Name: '',
      Category: 'Cricket',
      Total_Quantity: 10,
      Available_Quantity: 10,
      Condition: 'Good'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      Equipment_Name: item.Equipment_Name,
      Category: item.Category || 'General',
      Total_Quantity: item.Total_Quantity,
      Available_Quantity: item.Available_Quantity,
      Condition: item.Condition || 'Good'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateEquipment(editingItem.Equipment_ID, formData);
        setAlertInfo({ type: 'success', message: `Equipment "${formData.Equipment_Name}" updated successfully.` });
      } else {
        await createEquipment(formData);
        setAlertInfo({ type: 'success', message: `Equipment "${formData.Equipment_Name}" added successfully.` });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error saving equipment item.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete equipment "${name}"?`)) return;
    try {
      await deleteEquipment(id);
      setAlertInfo({ type: 'success', message: `Equipment "${name}" deleted.` });
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Could not delete item. It may be in use by existing issue records.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const filteredEquipment = equipmentList.filter((item) => {
    const matchesSearch = item.Equipment_Name.toLowerCase().includes(search.toLowerCase()) ||
                          (item.Category && item.Category.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || item.Category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Equipment Inventory</h2>
          <p className="page-description">Manage sports equipment stock, availability, and physical condition.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Add New Equipment
        </button>
      </div>

      {alertInfo.message && (
        <Alert 
          type={alertInfo.type} 
          message={alertInfo.message} 
          onClose={() => setAlertInfo({ type: '', message: '' })} 
        />
      )}

      {/* Filter & Search Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by equipment name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control search-input"
          />
        </div>

        <div className="category-select-wrapper">
          <Filter size={16} className="filter-icon" />
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-control select-input"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading inventory...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Equipment Name</th>
                  <th>Category</th>
                  <th>Total Qty</th>
                  <th>Available Qty</th>
                  <th>Condition</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((item) => (
                    <tr key={item.Equipment_ID}>
                      <td>#{item.Equipment_ID}</td>
                      <td>
                        <div className="cell-flex">
                          <Dumbbell size={16} className="text-blue" />
                          <span className="font-semibold">{item.Equipment_Name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-tag">{item.Category || 'General'}</span>
                      </td>
                      <td>
                        <span className="badge-number">{item.Total_Quantity}</span>
                      </td>
                      <td>
                        <span className={`badge-number ${item.Available_Quantity > 0 ? 'badge-in-stock' : 'badge-out-of-stock'}`}>
                          {item.Available_Quantity}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${item.Condition ? item.Condition.toLowerCase() : 'good'}`}>
                          {item.Condition || 'Good'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-inline">
                          <button 
                            onClick={() => handleOpenEditModal(item)} 
                            className="btn-icon btn-icon-edit"
                            title="Edit Equipment"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.Equipment_ID, item.Equipment_Name)} 
                            className="btn-icon btn-icon-delete"
                            title="Delete Equipment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No equipment found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Equipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Equipment' : 'Add New Equipment'}
      >
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label">Equipment Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Yonex Nanoray Racket"
              value={formData.Equipment_Name}
              onChange={(e) => setFormData({ ...formData, Equipment_Name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={formData.Category}
                onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
              >
                {categories.filter(c => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                className="form-control"
                value={formData.Condition}
                onChange={(e) => setFormData({ ...formData, Condition: e.target.value })}
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Quantity *</label>
              <input
                type="number"
                min="1"
                required
                className="form-control"
                value={formData.Total_Quantity}
                onChange={(e) => {
                  const total = parseInt(e.target.value, 10) || 0;
                  setFormData({ 
                    ...formData, 
                    Total_Quantity: total,
                    // If creating new, also match available
                    Available_Quantity: editingItem ? formData.Available_Quantity : total
                  });
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Quantity *</label>
              <input
                type="number"
                min="0"
                max={formData.Total_Quantity}
                required
                className="form-control"
                value={formData.Available_Quantity}
                onChange={(e) => setFormData({ ...formData, Available_Quantity: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update Equipment' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
