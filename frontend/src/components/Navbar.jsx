import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Repeat, 
  CalendarCheck2, 
  Wrench, 
  ReceiptIndianRupee, 
  GraduationCap, 
  CalendarDays,
  Shield
} from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/equipment', label: 'Equipment', icon: Dumbbell },
    { to: '/issues', label: 'Issue / Return', icon: Repeat },
    { to: '/bookings', label: 'Facility Booking', icon: CalendarCheck2 },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/fines', label: 'Fines', icon: ReceiptIndianRupee },
    { to: '/schedules', label: 'Lecture Schedules', icon: CalendarDays },
    { to: '/students', label: 'Students', icon: GraduationCap }
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-top">
        <div className="brand">
          <div className="brand-icon">
            <Shield size={26} color="#ffffff" />
          </div>
          <div>
            <h1 className="brand-title">Sports Equipment Management System</h1>
            <span className="brand-subtitle">College DBMS Mini Project • MySQL + Express + React</span>
          </div>
        </div>
        <div className="navbar-badge">
          <span className="status-pill status-active">MySQL 8.0 Connected</span>
        </div>
      </div>

      <nav className="navbar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
