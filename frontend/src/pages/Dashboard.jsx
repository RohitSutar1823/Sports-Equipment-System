import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Repeat, 
  CalendarCheck2, 
  ReceiptIndianRupee, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Users,
  Building2,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Alert from '../components/Alert';
import { getDashboardStats } from '../api/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load dashboard data. Please verify that the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Sports Equipment System Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Executive Dashboard</h2>
          <p className="page-description">Overview of college sports equipment inventory, loans, facility bookings, and student fines.</p>
        </div>
        <button onClick={loadStats} className="btn btn-outline btn-sm">
          Refresh Data
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Summary Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Equipment"
          value={stats?.totalEquipmentUnits ?? 0}
          subtitle={`${stats?.availableEquipmentUnits ?? 0} available for issue`}
          icon={Dumbbell}
          color="blue"
        />
        <StatCard
          title="Currently Issued"
          value={stats?.itemsCurrentlyIssued ?? 0}
          subtitle={`${stats?.activeIssuesCount ?? 0} active loan records`}
          icon={Repeat}
          color="amber"
        />
        <StatCard
          title="Active Bookings"
          value={stats?.activeBookings ?? 0}
          subtitle="Confirmed facility reservations"
          icon={CalendarCheck2}
          color="emerald"
        />
        <StatCard
          title="Pending Fines"
          value={`₹${stats?.pendingFinesAmount ? Number(stats.pendingFinesAmount).toFixed(2) : '0.00'}`}
          subtitle={`${stats?.pendingFinesCount ?? 0} unpaid penalties`}
          icon={ReceiptIndianRupee}
          color="rose"
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="quick-metrics-bar">
        <div className="metric-item">
          <Users size={18} className="text-blue" />
          <span>Registered Students: <strong>{stats?.totalStudents ?? 0}</strong></span>
        </div>
        <div className="metric-item">
          <Building2 size={18} className="text-emerald" />
          <span>Sports Facilities: <strong>{stats?.totalFacilities ?? 0}</strong></span>
        </div>
        <div className="metric-item">
          <Wrench size={18} className="text-amber" />
          <span>Pending Maintenance: <strong>{stats?.pendingMaintenance ?? 0}</strong></span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="quick-actions-card">
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-buttons-wrapper">
          <Link to="/issues" className="btn btn-primary">
            <Repeat size={16} /> Issue Equipment
          </Link>
          <Link to="/bookings" className="btn btn-secondary">
            <CalendarCheck2 size={16} /> Book Facility
          </Link>
          <Link to="/equipment" className="btn btn-outline">
            <Dumbbell size={16} /> Add Equipment
          </Link>
          <Link to="/maintenance" className="btn btn-outline">
            <Wrench size={16} /> Log Maintenance
          </Link>
          <Link to="/fines" className="btn btn-outline">
            <ReceiptIndianRupee size={16} /> Review Fines
          </Link>
        </div>
      </div>

      {/* Recent Activity Grids */}
      <div className="dashboard-columns">
        {/* Left Column: Recent Issues */}
        <div className="card">
          <div className="card-header-with-link">
            <h3 className="card-title">Recent Equipment Loans</h3>
            <Link to="/issues" className="view-all-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Equipment</th>
                  <th>Qty</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentIssues?.length > 0 ? (
                  stats.recentIssues.map((item) => (
                    <tr key={item.Issue_ID}>
                      <td><strong>{item.Student_Name}</strong></td>
                      <td>{item.Equipment_Name}</td>
                      <td><span className="badge-number">{item.Quantity}</span></td>
                      <td>{item.Issue_Date}</td>
                      <td>
                        <span className={`status-pill status-${item.Status === 'Issued' ? 'issued' : 'returned'}`}>
                          {item.Status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-cell">No recent equipment issues recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Bookings & Fines */}
        <div className="dashboard-column-stack">
          <div className="card">
            <div className="card-header-with-link">
              <h3 className="card-title">Recent Facility Bookings</h3>
              <Link to="/bookings" className="view-all-link">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Facility</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentBookings?.length > 0 ? (
                    stats.recentBookings.map((b) => (
                      <tr key={b.Booking_ID}>
                        <td><strong>{b.Student_Name}</strong></td>
                        <td>{b.Facility_Name}</td>
                        <td>{b.Date} ({b.Start_Time.slice(0, 5)} - {b.End_Time.slice(0, 5)})</td>
                        <td>
                          <span className={`status-pill status-${b.Status.toLowerCase()}`}>
                            {b.Status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-cell">No recent bookings.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header-with-link">
              <h3 className="card-title">Recent Fines</h3>
              <Link to="/fines" className="view-all-link">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Equipment</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentFines?.length > 0 ? (
                    stats.recentFines.map((f) => (
                      <tr key={f.Fine_ID}>
                        <td><strong>{f.Student_Name}</strong></td>
                        <td>{f.Equipment_Name}</td>
                        <td className="text-rose font-bold">₹{Number(f.Amount).toFixed(2)}</td>
                        <td>
                          <span className={`status-pill status-${f.Status.toLowerCase()}`}>
                            {f.Status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-cell">No recorded fines.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
