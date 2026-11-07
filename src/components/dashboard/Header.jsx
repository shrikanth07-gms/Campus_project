import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Menu,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function Header({ onToggleSidebar }) {
  const { role, profile, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notificationsBasePath = role === 'student' ? '/student/notifications' : '/faculty/notifications';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-university-pill">
          <span className="dot"></span>
          <span>REVA University Portal</span>
        </div>
      </div>

      <div className="header-right">
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="header-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="View notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="header-badge-count">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '340px',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--gray-200)',
                zIndex: 50,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--gray-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--gray-900)' }}>
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--primary-600)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 4).map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.link || '#'}
                      onClick={() => {
                        markAsRead(notif.id);
                        setShowNotifications(false);
                      }}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--gray-100)',
                        textDecoration: 'none',
                        backgroundColor: notif.is_read ? 'white' : '#f0f7ff',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--gray-900)' }}>
                          {notif.title}
                        </span>
                        {!notif.is_read && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-600)' }} />
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                        {notif.message}
                      </p>
                    </Link>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: '10px',
                  textAlign: 'center',
                  background: 'var(--gray-50)',
                  borderTop: '1px solid var(--gray-100)'
                }}
              >
                <Link
                  to={notificationsBasePath}
                  onClick={() => setShowNotifications(false)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--primary-700)',
                    textDecoration: 'none'
                  }}
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Quick Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'none',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            <img
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={profile?.full_name || 'Profile'}
              style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)' }}>
              {profile?.full_name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={14} color="var(--gray-500)" />
          </button>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '200px',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--gray-200)',
                zIndex: 50,
                padding: '6px'
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--gray-100)', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)' }}>{profile?.full_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{profile?.email}</div>
              </div>

              <Link
                to={role === 'student' ? '/student/profile' : (['faculty', 'hod', 'director'].includes(role) ? '/faculty/profile' : '/admin')}
                onClick={() => setShowUserMenu(false)}
                className="sidebar-nav-item"
                style={{ padding: '8px 10px', fontSize: '13px' }}
              >
                Profile Settings
              </Link>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="sidebar-nav-item"
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--danger-500)',
                  padding: '8px 10px',
                  fontSize: '13px'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

