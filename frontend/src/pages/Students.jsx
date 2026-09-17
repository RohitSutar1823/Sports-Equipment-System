import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  Search 
} from 'lucide-react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    Department: 'Computer Engineering',
    Year: 'TY',
    Phone: '',
    Email: ''
  });

  const departments = [
    'Computer Engineering',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Biomedical Engineering',
    'Civil Engineering'
  ];

  const years = ['FY', 'SY', 'TY', 'Final Year'];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to load student profiles.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      Name: '',
      Department: 'Computer Engineering',
      Year: 'TY',
      Phone: '',
      Email: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s) => {
    setEditingStudent(s);
    setFormData({
      Name: s.Name,
      Department: s.Department || 'Computer Engineering',
      Year: s.Year || 'TY',
      Phone: s.Phone || '',
      Email: s.Email || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.Student_ID, formData);
        setAlertInfo({ type: 'success', message: `Student ${formData.Name} updated.` });
      } else {
        await createStudent(formData);
        setAlertInfo({ type: 'success', message: `Student ${formData.Name} enrolled.` });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error saving student.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"?`)) return;
    try {
      await deleteStudent(id);
      setAlertInfo({ type: 'success', message: `Student ${name} deleted.` });
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Cannot delete student. Existing issue/booking records reference this student.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const filteredStudents = students.filter((s) => 
    s.Name.toLowerCase().includes(search.toLowerCase()) ||
    (s.Department && s.Department.toLowerCase().includes(search.toLowerCase())) ||
    (s.Email && s.Email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Student Directory</h2>
          <p className="page-description">Enrolled students eligible for borrowing sports gear and reserving campus facilities.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Register Student
        </button>
      </div>

      {alertInfo.message && (
        <Alert 
          type={alertInfo.type} 
          message={alertInfo.message} 
          onClose={() => setAlertInfo({ type: '', message: '' })} 
        />
      )}

      {/* Search Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search students by name, department, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control search-input"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading students...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.Student_ID}>
                      <td>#{s.Student_ID}</td>
                      <td>
                        <div className="cell-flex">
                          <GraduationCap size={16} className="text-blue" />
                          <span className="font-semibold">{s.Name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-tag">{s.Department}</span>
                      </td>
                      <td>
                        <span className="day-badge">{s.Year}</span>
                      </td>
                      <td>{s.Phone || '--'}</td>
                      <td>
                        <a href={`mailto:${s.Email}`} className="email-link">
                          {s.Email || '--'}
                        </a>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-inline">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="btn-icon btn-icon-edit"
                            title="Edit Student"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.Student_ID, s.Name)}
                            className="btn-icon btn-icon-delete"
                            title="Delete Student"
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
                      No students found matching "{search}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Register New Student'}
      >
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Aarav Sharma"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={formData.Department}
                onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-control"
                value={formData.Year}
                onChange={(e) => setFormData({ ...formData, Year: e.target.value })}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="10-digit mobile number"
                value={formData.Phone}
                onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="student@college.edu"
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingStudent ? 'Update Profile' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
