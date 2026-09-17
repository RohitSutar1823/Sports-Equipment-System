import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  Trash2, 
  Edit, 
  BookOpen, 
  User, 
  Filter 
} from 'lucide-react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { 
  getLectureSchedules, 
  createLectureSchedule, 
  updateLectureSchedule, 
  deleteLectureSchedule, 
  getStudents 
} from '../api/api';

export default function LectureSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState('All');
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    Student_ID: '',
    Day: 'Monday',
    Subject: '',
    Start_Time: '09:00',
    End_Time: '11:00'
  });

  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedData, studentData] = await Promise.all([
        getLectureSchedules(),
        getStudents()
      ]);
      setSchedules(schedData);
      setStudents(studentData);
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to load lecture schedules.' });
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
      Student_ID: students.length > 0 ? students[0].Student_ID : '',
      Day: 'Monday',
      Subject: '',
      Start_Time: '09:00',
      End_Time: '11:00'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      Student_ID: item.Student_ID,
      Day: item.Day || 'Monday',
      Subject: item.Subject,
      Start_Time: item.Start_Time ? item.Start_Time.slice(0, 5) : '09:00',
      End_Time: item.End_Time ? item.End_Time.slice(0, 5) : '11:00'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateLectureSchedule(editingItem.Schedule_ID, formData);
        setAlertInfo({ type: 'success', message: 'Lecture schedule updated.' });
      } else {
        await createLectureSchedule(formData);
        setAlertInfo({ type: 'success', message: 'Lecture schedule added.' });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error saving lecture schedule.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this schedule entry?`)) return;
    try {
      await deleteLectureSchedule(id);
      setAlertInfo({ type: 'success', message: 'Lecture schedule deleted.' });
      loadData();
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to delete schedule.' });
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    if (dayFilter === 'All') return true;
    return s.Day === dayFilter;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Lecture Schedules</h2>
          <p className="page-description">Manage student academic timetables to verify sports activity conflicts (LECTURE_SCHEDULE entity).</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Add Lecture Schedule
        </button>
      </div>

      {alertInfo.message && (
        <Alert 
          type={alertInfo.type} 
          message={alertInfo.message} 
          onClose={() => setAlertInfo({ type: '', message: '' })} 
        />
      )}

      {/* Day Filter */}
      <div className="filters-bar">
        <div className="category-select-wrapper">
          <Filter size={16} className="filter-icon" />
          <select 
            value={dayFilter} 
            onChange={(e) => setDayFilter(e.target.value)}
            className="form-control select-input"
          >
            {daysOfWeek.map((d) => (
              <option key={d} value={d}>{d === 'All' ? 'All Days' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading lecture schedules...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Schedule ID</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Day</th>
                  <th>Subject</th>
                  <th>Class Hours</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((s) => (
                    <tr key={s.Schedule_ID}>
                      <td>#{s.Schedule_ID}</td>
                      <td>
                        <div className="font-semibold">{s.Student_Name}</div>
                      </td>
                      <td>
                        <span className="badge-tag">{s.Student_Department}</span>
                      </td>
                      <td>
                        <span className="day-badge">{s.Day}</span>
                      </td>
                      <td>
                        <div className="cell-flex">
                          <BookOpen size={16} className="text-blue" />
                          <span className="font-semibold">{s.Subject}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-time">
                          <Clock size={12} /> {s.Start_Time ? s.Start_Time.slice(0, 5) : '--'} - {s.End_Time ? s.End_Time.slice(0, 5) : '--'}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-inline">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="btn-icon btn-icon-edit"
                            title="Edit Schedule"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.Schedule_ID)}
                            className="btn-icon btn-icon-delete"
                            title="Delete Schedule"
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
                      No lecture schedule entries found for "{dayFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Lecture Schedule' : 'Add Lecture Schedule'}
      >
        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group">
            <label className="form-label">Student *</label>
            <select
              required
              className="form-control"
              value={formData.Student_ID}
              onChange={(e) => setFormData({ ...formData, Student_ID: e.target.value })}
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.Student_ID} value={s.Student_ID}>
                  {s.Name} ({s.Department} - {s.Year})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Day *</label>
              <select
                className="form-control"
                value={formData.Day}
                onChange={(e) => setFormData({ ...formData, Day: e.target.value })}
              >
                {daysOfWeek.filter(d => d !== 'All').map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Database Management Systems"
                value={formData.Subject}
                onChange={(e) => setFormData({ ...formData, Subject: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.Start_Time}
                onChange={(e) => setFormData({ ...formData, Start_Time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.End_Time}
                onChange={(e) => setFormData({ ...formData, End_Time: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update Schedule' : 'Add Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
