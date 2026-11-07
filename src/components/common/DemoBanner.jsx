import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, Database, Zap } from 'lucide-react';

export default function DemoBanner() {
  const { role, profile, switchDemoUser, isSupabaseMode } = useAuth();

  return (
    <div className="demo-persona-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isSupabaseMode ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#34d399', fontWeight: 600 }}>
            <Database size={15} /> Supabase Live
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#60a5fa', fontWeight: 600 }}>
            <Zap size={15} /> Interactive Demo Mode (REVA University)
          </span>
        )}
        <span style={{ color: '#94a3b8' }}>•</span>
        <span style={{ color: '#cbd5e1' }}>
          Active Persona: <strong>{profile?.full_name || 'User'}</strong> ({profile?.designation || role.toUpperCase()})
        </span>
      </div>

      <div className="demo-persona-actions">
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Switch Persona:</span>
        <button
          className={`demo-persona-btn ${role === 'student' ? 'active' : ''}`}
          onClick={() => switchDemoUser('student')}
        >
          👨‍🎓 Student
        </button>
        <button
          className={`demo-persona-btn ${role === 'faculty' ? 'active' : ''}`}
          onClick={() => switchDemoUser('faculty')}
        >
          👩‍🏫 Faculty
        </button>
        <button
          className={`demo-persona-btn ${role === 'hod' ? 'active' : ''}`}
          onClick={() => switchDemoUser('hod')}
        >
          👨‍💼 HOD
        </button>
        <button
          className={`demo-persona-btn ${role === 'director' ? 'active' : ''}`}
          onClick={() => switchDemoUser('director')}
        >
          🏛️ Director
        </button>
        <button
          className={`demo-persona-btn ${role === 'admin' ? 'active' : ''}`}
          onClick={() => switchDemoUser('admin')}
        >
          🛡️ Admin
        </button>
      </div>
    </div>
  );
}

