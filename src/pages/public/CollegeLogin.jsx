import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PRESET_USERS, DEMO_COLLEGE } from '../../services/mockData';
import {
  GraduationCap, ArrowLeft, CheckCircle, AlertCircle, ShieldAlert, Zap, Eye, EyeOff
} from 'lucide-react';

export default function CollegeLogin() {
  const navigate = useNavigate();
  const { login, registerStudent, switchDemoUser } = useAuth();

  const [activeTab, setActiveTab] = useState('student');
  const [authMode, setAuthMode] = useState('login');

  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSrn, setRegSrn] = useState('');
  const [regBranch, setRegBranch] = useState('Computer Science and Engineering');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);

  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');
  const [showFacPw, setShowFacPw] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const validatePassword = (pw) => (pw.length < 6 ? 'Password must be at least 6 characters.' : null);

  const switchToLoginTab = (prefillEmail = '') => {
    setAuthMode('login');
    if (prefillEmail) setStudentEmail(prefillEmail);
    setRegFullName(''); setRegEmail(''); setRegPassword(''); setRegSrn(''); setRegPhone('');
    setRegBranch('Computer Science and Engineering');
  };

  const handleQuickDemo = (roleKey) => {
    switchDemoUser(roleKey);
    if (roleKey === 'student') navigate('/student');
    else if (['faculty', 'hod', 'director'].includes(roleKey)) navigate('/faculty');
    else if (roleKey === 'admin') navigate('/admin');
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError(null); setSuccessMsg(null); setLoading(true);

    const email = studentEmail.trim() || DEMO_PRESET_USERS.student.email;
    const password = studentPassword || 'password';

    const res = await login(email, password, 'student');
    setLoading(false);

    if (res.success) {
      navigate('/student');
    } else {
      setError(res.error || 'Student login failed. Check your email and password.');
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setError(null); setSuccessMsg(null);

    if (!regFullName.trim()) { setError('Full name is required.'); return; }
    if (!regSrn.trim()) { setError('Student Registration Number (SRN) is required.'); return; }
    if (!regEmail.trim()) { setError('College email address is required.'); return; }
    if (!regPassword) { setError('Password is required.'); return; }

    const pwErr = validatePassword(regPassword);
    if (pwErr) { setError(pwErr); return; }
    if (!regEmail.includes('@')) { setError('Enter a valid email address.'); return; }

    setLoading(true);
    const res = await registerStudent({
      fullName: regFullName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      srn: regSrn.trim().toUpperCase(),
      branch: regBranch,
      phone: regPhone.trim()
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Account created for ${regFullName.trim().split(' ')[0]}! Sign in below with your registered email.`);
      switchToLoginTab(res.prefillEmail || regEmail.trim().toLowerCase());
    } else {
      const raw = res.error || '';
      if (raw.includes('already registered') || raw.includes('already exists')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(raw || 'Registration failed. Please try again.');
      }
    }
  };

  const handleFacultyLogin = async (e) => {
    e.preventDefault();
    setError(null); setSuccessMsg(null); setLoading(true);

    const email = facultyEmail.trim() || DEMO_PRESET_USERS.faculty.email;
    const password = facultyPassword || 'password';

    const res = await login(email, password, 'faculty');
    setLoading(false);

    if (res.success) {
      navigate('/faculty');
    } else {
      setError(res.error || 'Faculty authentication failed.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f7fc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '580px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to RoutePulse Home
        </Link>
        <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>REVA Institutional Portal</span>
      </div>

      <div style={{ width: '100%', maxWidth: '580px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 15px 35px rgba(20, 38, 74, 0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', padding: '28px 24px', color: 'white', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <GraduationCap size={32} color="#ffffff" />
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800 }}>{DEMO_COLLEGE.name}</h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#bfdbfe' }}>{DEMO_COLLEGE.address}, {DEMO_COLLEGE.city}, {DEMO_COLLEGE.state}</p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button onClick={() => { setActiveTab('student'); setError(null); }} style={{ flex: 1, padding: '14px', border: 'none', background: activeTab === 'student' ? 'white' : 'transparent', borderBottom: activeTab === 'student' ? '3px solid #2563eb' : 'none', fontWeight: 700, fontSize: '14px', color: activeTab === 'student' ? '#1d4ed8' : '#64748b', cursor: 'pointer' }}>
            Student Portal
          </button>
          <button onClick={() => { setActiveTab('faculty'); setError(null); }} style={{ flex: 1, padding: '14px', border: 'none', background: activeTab === 'faculty' ? 'white' : 'transparent', borderBottom: activeTab === 'faculty' ? '3px solid #2563eb' : 'none', fontWeight: 700, fontSize: '14px', color: activeTab === 'faculty' ? '#1d4ed8' : '#64748b', cursor: 'pointer' }}>
            Faculty & Admin Access
          </button>
        </div>

        <div style={{ padding: '28px' }}>
          {successMsg && (
            <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <div><div style={{ fontWeight: 700, marginBottom: '2px' }}>Account Created Successfully! 🎉</div><div>{successMsg}</div></div>
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}

          {activeTab === 'student' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button type="button" onClick={() => { setAuthMode('login'); setError(null); setSuccessMsg(null); }} className={`btn btn-sm ${authMode === 'login' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>Student Login</button>
                <button type="button" onClick={() => { setAuthMode('register'); setError(null); setSuccessMsg(null); }} className={`btn btn-sm ${authMode === 'register' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }}>Register as Student</button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleStudentLogin} noValidate>
                  <div className="form-group">
                    <label className="form-label">REVA College Email</label>
                    <input type="email" className="form-control" placeholder="aarav.sharma@reva.edu.in" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showLoginPw ? 'text' : 'password'} className="form-control" placeholder="Enter your password" value={studentPassword} onChange={(e) => setStudentPassword(e.target.value)} style={{ paddingRight: '44px' }} />
                      <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }} tabIndex={-1}>{showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>{loading ? 'Authenticating…' : 'Sign In as Student'}</button>
                </form>
              ) : (
                <form onSubmit={handleStudentRegister} noValidate>
                  <div className="form-group">
                    <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="text" className="form-control" placeholder="e.g. Aarav Sharma" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">SRN <span style={{ color: '#ef4444' }}>*</span></label>
                      <input type="text" className="form-control" placeholder="e.g. R21EN102" value={regSrn} onChange={(e) => setRegSrn(e.target.value.toUpperCase())} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Branch</label>
                      <select className="form-control" value={regBranch} onChange={(e) => setRegBranch(e.target.value)}>
                        <option value="Computer Science and Engineering">CSE</option>
                        <option value="Artificial Intelligence & Data Science">AI-DS</option>
                        <option value="Electronics and Communication Engineering">ECE</option>
                        <option value="Mechanical Engineering">Mechanical</option>
                        <option value="Master of Business Administration">MBA</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">College Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <input type="email" className="form-control" placeholder="name@reva.edu.in" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" placeholder="+91 98765 43210" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input type={showRegPw ? 'text' : 'password'} className="form-control" placeholder="Min 6 characters" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} style={{ paddingRight: '44px' }} />
                      <button type="button" onClick={() => setShowRegPw(!showRegPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }} tabIndex={-1}>{showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>{loading ? 'Creating account…' : 'Create Student Account'}</button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'faculty' && (
            <div>
              <form onSubmit={handleFacultyLogin} noValidate>
                <div className="form-group">
                  <label className="form-label">Faculty / Institutional Email</label>
                  <input type="email" className="form-control" placeholder="priya.rao.demo@reva.edu.in" value={facultyEmail} onChange={(e) => setFacultyEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Institutional Access Key / Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showFacPw ? 'text' : 'password'} className="form-control" placeholder="Enter authorized password" value={facultyPassword} onChange={(e) => setFacultyPassword(e.target.value)} style={{ paddingRight: '44px' }} />
                    <button type="button" onClick={() => setShowFacPw(!showFacPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }} tabIndex={-1}>{showFacPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>{loading ? 'Verifying…' : 'Sign In as Faculty / Admin'}</button>
              </form>
            </div>
          )}

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}><Zap size={14} color="#2563eb" /> Instant 1-Click Demo Login</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              {[{ key: 'student', emoji: '👨‍🎓', name: 'Aarav', label: 'Student' }, { key: 'faculty', emoji: '👩‍🏫', name: 'Dr. Priya', label: 'Faculty' }, { key: 'hod', emoji: '👨‍💼', name: 'Dr. Suresh', label: 'HOD' }, { key: 'director', emoji: '🏛️', name: 'Dr. Ramesh', label: 'Director' }, { key: 'admin', emoji: '🛡️', name: 'Admin', label: 'Admin' }].map(({ key, emoji, name, label }) => (
                <button key={key} type="button" onClick={() => handleQuickDemo(key)} className="btn btn-outline btn-sm" style={{ fontSize: '11px', textAlign: 'left', padding: '8px' }}>
                  <div>{emoji} <strong>{name}</strong></div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}