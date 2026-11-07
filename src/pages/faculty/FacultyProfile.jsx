import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Building, MapPin, ShieldCheck, CheckCircle } from 'lucide-react';

export default function FacultyProfile() {
  const { profile } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Faculty Profile & Credentials</h1>
          <p>
            Official university faculty directory listing, contact information, and role authorization.
          </p>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
            alt="Faculty Avatar"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-100)' }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--gray-900)' }}>
                {profile?.full_name || 'Dr. Priya Rao'}
              </h2>
              <span style={{ fontSize: '12px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                FACULTY REVIEWER
              </span>
            </div>

            <div style={{ fontSize: '14px', color: 'var(--primary-700)', fontWeight: 600, marginTop: '4px' }}>
              {profile?.designation || 'Class Coordinator / Assistant Professor'}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--success-700)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
              <ShieldCheck size={14} /> Authorized University Signatory: REVA University
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              <Mail size={14} /> Official Academic Email
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '6px' }}>
              {profile?.email || 'priya.rao.demo@reva.edu.in'}
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-500)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
              <Phone size={14} /> Office Extension / Contact
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '6px' }}>
              {profile?.phone || '+91 94481 12345'}
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
              <MapPin size={14} /> Office Location
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '6px' }}>
              {profile?.office_location || 'SOCIT Block, Room 304'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

