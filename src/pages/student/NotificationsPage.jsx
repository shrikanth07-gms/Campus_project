import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Check, Clock, AlertCircle, FileCheck, ArrowRight } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Notification Center</h1>
          <p>
            Stay updated on review progress, requests for corrections, forwards, and completed approvals.
          </p>
        </div>

        {unreadCount > 0 && (
          <div className="page-actions">
            <button onClick={markAllAsRead} className="btn btn-outline btn-sm">
              <Check size={14} /> Mark All as Read
            </button>
          </div>
        )}
      </div>

      <div className="dashboard-card">
        {notifications.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-400)' }}>
            <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p>No notifications at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--gray-100)',
                  backgroundColor: notif.is_read ? 'white' : '#f0f7ff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: notif.type === 'correction_needed' ? '#fef3c7' : 'var(--primary-100)',
                      color: notif.type === 'correction_needed' ? '#b45309' : 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {notif.type === 'correction_needed' ? <AlertCircle size={18} /> : <FileCheck size={18} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)' }}>
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span style={{ fontSize: '11px', background: 'var(--primary-600)', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                          NEW
                        </span>
                      )}
                    </div>

                    <p style={{ margin: '4px 0 8px', fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.4 }}>
                      {notif.message}
                    </p>

                    <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                      {new Date(notif.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={() => markAsRead(notif.id)}
                      className="btn btn-outline btn-sm"
                    >
                      View <ArrowRight size={13} />
                    </Link>
                  )}
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

