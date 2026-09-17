import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, 
  Plus, 
  Building2, 
  Clock, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { 
  getBookings, 
  createBooking, 
  updateBooking, 
  deleteBooking, 
  getStudents, 
  getFacilities 
} from '../api/api';

export default function FacilityBooking() {
  const [bookings, setBookings] = useState([]);
  const [students, setStudents] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Student_ID: '',
    Facility_ID: '',
    Date: new Date().toISOString().split('T')[0],
    Start_Time: '16:00',
    End_Time: '17:30',
    Purpose: '',
    Status: 'Confirmed'
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [bookingData, studentData, facilityData] = await Promise.all([
        getBookings(),
        getStudents(),
        getFacilities()
      ]);
      setBookings(bookingData);
      setStudents(studentData);
      setFacilities(facilityData);
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to load booking information.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      Student_ID: students.length > 0 ? students[0].Student_ID : '',
      Facility_ID: facilities.length > 0 ? facilities[0].Facility_ID : '',
      Date: new Date().toISOString().split('T')[0],
      Start_Time: '16:00',
      End_Time: '17:30',
      Purpose: '',
      Status: 'Confirmed'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBooking(formData);
      setAlertInfo({ type: 'success', message: 'Facility booked successfully.' });
      setIsModalOpen(false);
      loadAll();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error creating facility booking.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  const handleStatusChange = async (booking, newStatus) => {
    try {
      await updateBooking(booking.Booking_ID, { ...booking, Status: newStatus });
      setAlertInfo({ type: 'success', message: `Booking #${booking.Booking_ID} marked as ${newStatus}.` });
      loadAll();
    } catch (err) {
      console.error(err);
      setAlertInfo({ type: 'error', message: 'Failed to update booking status.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to cancel and delete Booking #${id}?`)) return;
    try {
      await deleteBooking(id);
      setAlertInfo({ type: 'success', message: `Booking #${id} deleted.` });
      loadAll();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Could not delete booking.';
      setAlertInfo({ type: 'error', message: msg });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sports Facility Booking</h2>
          <p className="page-description">Reserve college badminton courts, cricket nets, football turfs, and track schedules.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={18} /> Book Facility
        </button>
      </div>

      {alertInfo.message && (
        <Alert 
          type={alertInfo.type} 
          message={alertInfo.message} 
          onClose={() => setAlertInfo({ type: '', message: '' })} 
        />
      )}

      {/* Bookings Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Facility</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr key={b.Booking_ID}>
                      <td>#{b.Booking_ID}</td>
                      <td>
                        <div className="font-semibold">{b.Student_Name}</div>
                        <div className="text-muted text-xs">{b.Student_Department}</div>
                      </td>
                      <td>
                        <div className="font-semibold">{b.Facility_Name}</div>
                        <div className="text-muted text-xs">{b.Facility_Location} ({b.Facility_Type})</div>
                      </td>
                      <td>{b.Date}</td>
                      <td>
                        <span className="badge-time">
                          <Clock size={12} /> {b.Start_Time.slice(0, 5)} - {b.End_Time.slice(0, 5)}
                        </span>
                      </td>
                      <td>{b.Purpose || <span className="text-muted italic">General practice</span>}</td>
                      <td>
                        <span className={`status-pill status-${b.Status.toLowerCase()}`}>
                          {b.Status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-inline">
                          {b.Status === 'Confirmed' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(b, 'Completed')}
                                className="btn-icon text-emerald"
                                title="Mark as Completed"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(b, 'Cancelled')}
                                className="btn-icon text-rose"
                                title="Cancel Booking"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(b.Booking_ID)}
                            className="btn-icon btn-icon-delete"
                            title="Delete Booking Record"
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
                      No facility bookings currently registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Facility Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reserve a Sports Facility"
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
              <option value="">-- Select Student --</option>
              {students.map((s) => (
                <option key={s.Student_ID} value={s.Student_ID}>
                  {s.Name} ({s.Department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Sports Facility *</label>
            <select
              required
              className="form-control"
              value={formData.Facility_ID}
              onChange={(e) => setFormData({ ...formData, Facility_ID: e.target.value })}
            >
              <option value="">-- Select Facility --</option>
              {facilities.map((f) => (
                <option key={f.Facility_ID} value={f.Facility_ID} disabled={f.Status === 'Maintenance'}>
                  {f.Facility_Name} ({f.Type} - {f.Location}) {f.Status === 'Maintenance' ? '[In Maintenance]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Booking Date *</label>
            <input
              type="date"
              required
              className="form-control"
              value={formData.Date}
              onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                required
                className="form-control"
                value={formData.Start_Time}
                onChange={(e) => setFormData({ ...formData, Start_Time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                required
                className="form-control"
                value={formData.End_Time}
                onChange={(e) => setFormData({ ...formData, End_Time: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Purpose / Event</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Inter-college badminton trials / team drills"
              value={formData.Purpose}
              onChange={(e) => setFormData({ ...formData, Purpose: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
