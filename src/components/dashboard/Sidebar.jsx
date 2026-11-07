import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  GraduationCap,
  LayoutDashboard,
  FilePlus,
  Files,
  Users,
  Bell,
  User,
  LogOut,
  FolderTree,
  Sliders,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { role, profile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const isStudent = role === 'student';
  const isFacultyRole = ['faculty', 'hod', 'director'].includes(role);
  const isAdmin = role === 'admin';

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <Link to="/" className="brand-link" title="RoutePulse — Fast, trackable approvals from submission to signature.">
          <div className="brand-badge-icon">
            <GraduationCap size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.15, fontSize: '18px', fontWeight: 800 }}>Route<span style={{ color: 'var(--primary-600)' }}>Pulse</span></span>
            <span style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 500, letterSpacing: '-0.2px' }}>
              Fast, trackable approvals
            </span>
          </div>
        </Link>
        <button
          className="mobile-menu-toggle"
          onClick={onClose}
          style={{ display: isOpen ? 'block' : 'none' }}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-user-card">
        <img
          src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
          alt={profile?.full_name || 'User avatar'}
          className="sidebar-user-avatar"
        />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{profile?.full_name || 'User'}</div>
          <span className="sidebar-user-role">
            {profile?.designation || role.toUpperCase()}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* STUDENT NAVIGATION */}
        {isStudent && (
          <>
            <div className="nav-section-title">Student Portal</div>
            <Link
              to="/student"
              className={`sidebar-nav-item ${isActive('/student') ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>
            <Link
              to="/student/submit"
              className={`sidebar-nav-item ${isActive('/student/submit') ? 'active' : ''}`}
              onClick={onClose}
            >
              <FilePlus size={18} />
              <span>Submit Document</span>
            </Link>
            <Link
              to="/student/submissions"
              className={`sidebar-nav-item ${isActive('/student/submissions') ? 'active' : ''}`}
              onClick={onClose}
            >
              <Files size={18} />
              <span>My Submissions</span>
            </Link>
            <Link
              to="/student/faculty"
              className={`sidebar-nav-item ${isActive('/student/faculty') ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>Faculty Directory</span>
            </Link>
            <Link
              to="/student/notifications"
              className={`sidebar-nav-item ${isActive('/student/notifications') ? 'active' : ''}`}
              onClick={onClose}
            >
              <Bell size={18} />
              <span>Notifications</span>
              {unreadCount > 0 && <span className="nav-count-badge">{unreadCount}</span>}
            </Link>
            <Link
              to="/student/profile"
              className={`sidebar-nav-item ${isActive('/student/profile') ? 'active' : ''}`}
              onClick={onClose}
            >
              <User size={18} />
              <span>My Profile</span>
            </Link>
          </>
        )}

        {/* FACULTY / HOD / DIRECTOR NAVIGATION */}
        {isFacultyRole && (
          <>
            <div className="nav-section-title">Reviewer Portal</div>
            <Link
              to="/faculty"
              className={`sidebar-nav-item ${isActive('/faculty') || isActive('/faculty/dashboard') ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Review Dashboard</span>
            </Link>
            <Link
              to="/faculty/submissions"
              className={`sidebar-nav-item ${isActive('/faculty/submissions') ? 'active' : ''}`}
              onClick={onClose}
            >
              <FileCheck size={18} />
              <span>Assigned Documents</span>
            </Link>
            <Link
              to="/faculty/notifications"
              className={`sidebar-nav-item ${isActive('/faculty/notifications') ? 'active' : ''}`}
              onClick={onClose}
            >
              <Bell size={18} />
              <span>Notifications</span>
              {unreadCount > 0 && <span className="nav-count-badge">{unreadCount}</span>}
            </Link>
            <Link
              to="/faculty/profile"
              className={`sidebar-nav-item ${isActive('/faculty/profile') ? 'active' : ''}`}
              onClick={onClose}
            >
              <User size={18} />
              <span>Faculty Profile</span>
            </Link>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {isAdmin && (
          <>
            <div className="nav-section-title">Administration</div>
            <Link
              to="/admin"
              className={`sidebar-nav-item ${isActive('/admin') ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} />
              <span>Analytics & Metrics</span>
            </Link>
            <Link
              to="/admin/users"
              className={`sidebar-nav-item ${isActive('/admin/users') ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={18} />
              <span>User Accounts</span>
            </Link>
            <Link
              to="/admin/faculty"
              className={`sidebar-nav-item ${isActive('/admin/faculty') ? 'active' : ''}`}
              onClick={onClose}
            >
              <ShieldCheck size={18} />
              <span>Faculty Directory</span>
            </Link>
            <Link
              to="/admin/departments"
              className={`sidebar-nav-item ${isActive('/admin/departments') ? 'active' : ''}`}
              onClick={onClose}
            >
              <FolderTree size={18} />
              <span>Departments & Branches</span>
            </Link>
            <Link
              to="/admin/workflows"
              className={`sidebar-nav-item ${isActive('/admin/workflows') ? 'active' : ''}`}
              onClick={onClose}
            >
              <Sliders size={18} />
              <span>Workflow & Document Types</span>
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={logout}
          className="sidebar-nav-item"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger-500)' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

