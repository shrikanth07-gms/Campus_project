import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Award, Building, BookOpen, ShieldCheck } from 'lucide-react';

export default function StudentProfile() {
  const { user, profile } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Student Profile</h1>
          <p>
            Your registered academic identity and student records on RoutePulse.
          </p>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
            alt="Profile Avatar"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-100)' }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--gray-900)' }}>
                {profile?.full_name || 'Aarav Sharma'}
              </h2>
              <span style={{ fontSize: '12px', background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                STUDENT
              </span>
            </div>

            <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '4px' }}>
              Student Registration Number (SRN): <strong>{profile?.srn || 'R21EN102'}</strong>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--success-700)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
              <ShieldCheck size={14} /> Verified Enrolment: REVA University
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              <Mail size={14} /> Official Email
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '6px' }}>
              {profile?.email || 'student@reva.edu.in'}
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              <Phone size={14} /> Contact Number
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '6px' }}>
              {profile?.phone || '+91 98765 43210'}
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              <Building size={14} /> Department
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '6px' }}>
              {profile?.department_name || 'School of Computing & Information Technology'}
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              <BookOpen size={14} /> Branch / Programme
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '6px' }}>
              {profile?.branch_name || 'B.Tech in Computer Science and Engineering'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

