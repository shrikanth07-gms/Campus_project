import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/college/reva" replace />;
  }

  // If specific roles are required, verify access
  if (allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(role) || 
      (allowedRoles.includes('faculty') && ['faculty', 'hod', 'director'].includes(role));
    
    if (!isAllowed) {
      if (role === 'student') return <Navigate to="/student" replace />;
      if (['faculty', 'hod', 'director'].includes(role)) return <Navigate to="/faculty" replace />;
      if (role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/college/reva" replace />;
    }
  }

  return children;
}

