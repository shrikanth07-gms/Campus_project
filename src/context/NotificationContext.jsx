import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_NOTIFICATIONS } from '../services/mockData';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('campusflow_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
        return;
      } catch {
        // fallback
      }
    }
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.setItem('campusflow_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  }, []);

  const saveNotifications = (newList) => {
    setNotifications(newList);
    localStorage.setItem('campusflow_notifications', JSON.stringify(newList));
  };

  const addNotification = ({ title, message, link, type = 'info', targetUserId = null, targetRole = null }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      user_id: targetUserId || user?.id,
      target_role: targetRole,
      title,
      message,
      link,
      type,
      is_read: false,
      created_at: new Date().toISOString()
    };
    const updated = [newNotif, ...notifications];
    saveNotifications(updated);
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    saveNotifications(updated);
  };

  // Filter notifications relevant to current user/role
  const userNotifications = notifications.filter(n => {
    if (n.user_id && user && n.user_id === user.id) return true;
    if (n.target_role && role === n.target_role) return true;
    if (!n.user_id && !n.target_role) return true;
    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        allNotifications: notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

