import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PRESET_USERS, DEMO_COLLEGE } from '../../services/mockData';
import {
  GraduationCap,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Hash,
  Phone,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function CollegeLogin() {
  const navigate = useNavigate();
  const { login, registerStudent, switchDemoUser, role } = useAuth();

  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'faculty'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' (student only)

  // Student Login Form
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Student Registration Form
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSrn, setRegSrn] = useState('');
  const [regBranch, setRegBranch] = useState('Computer Science and Engineering');
  const [regPhone, setRegPhone] = useState('');

  // Faculty / Admin Login Form
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Quick Demo Login Handler
  const handleQuickDemo = (roleKey) => {
    switchDemoUser(roleKey);
    if (roleKey === 'student') navigate('/student');
    else if (['faculty', 'hod', 'director'].includes(roleKey)) navigate('/faculty');
    else if (roleKey === 'admin') navigate('/admin');
  };

  // Student Login Submit
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = studentEmail || DEMO_PRESET_USERS.student.email;
    const password = studentPassword || 'password';

    const res = await login(email, password, 'student');
    setLoading(false);

    if (res.success) {
      navigate('/student');
    } else {
      setError(res.error || 'Student login failed.');
    }
  };

  // Student Register Submit
  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!regFullName || !regEmail || !regPassword || !regSrn) {
      setError('Please fill in all required registration fields.');
      return;
    }

    setLoading(true);
    const res = await registerStudent({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      srn: regSrn,
      branch: regBranch,
      phone: regPhone
    });
    setLoading(false);

    if (res.success) {
      navigate('/student');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  // Faculty Login Submit
  const handleFacultyLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = facultyEmail || DEMO_PRESET_USERS.faculty.email;
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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f4f7fc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Top Brand Bar */}
      <div style={{ width: '100%', maxWidth: '580px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--primary-600)',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Back to CampusFlow Home
        </Link>

        <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>
          REVA Institutional Portal
        </span>
      </div>

      {/* Main Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 15px 35px rgba(20, 38, 74, 0.08)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* University Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)',
            padding: '28px 24px',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}
          >
            <GraduationCap size={32} color="#ffffff" />
          </div>

          <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800 }}>
            {DEMO_COLLEGE.name}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#bfdbfe' }}>
            {DEMO_COLLEGE.address}, {DEMO_COLLEGE.city}, {DEMO_COLLEGE.state}
          </p>
        </div>

        {/* Portal Type Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            onClick={() => {
              setActiveTab('student');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: activeTab === 'student' ? 'white' : 'transparent',
              borderBottom: activeTab === 'student' ? '3px solid #2563eb' : 'none',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'student' ? '#1d4ed8' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Student Portal
          </button>

          <button
            onClick={() => {
              setActiveTab('faculty');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: activeTab === 'faculty' ? 'white' : 'transparent',
              borderBottom: activeTab === 'faculty' ? '3px solid #2563eb' : 'none',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'faculty' ? '#1d4ed8' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Faculty & Admin Access
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* STUDENT TAB */}
          {activeTab === 'student' && (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`btn btn-sm ${authMode === 'login' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                >
                  Student Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`btn btn-sm ${authMode === 'register' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1 }}
                >
                  Register as Student
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleStudentLogin}>
                  <div className="form-group">
                    <label className="form-label">REVA College Email / Username</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="aarav.sharma@reva.edu.in"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                    disabled={loading}
                  >
                    {loading ? 'Authenticating...' : 'Sign In as Student'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleStudentRegister}>
                  <div className="form-group">
                    <label className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Aarav Sharma"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">
                        Student Registration No. (SRN) <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. R21EN102"
                        value={regSrn}
                        onChange={(e) => setRegSrn(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Branch</label>
                      <select
                        className="form-control"
                        value={regBranch}
                        onChange={(e) => setRegBranch(e.target.value)}
                      >
                        <option value="Computer Science and Engineering">CSE</option>
                        <option value="Artificial Intelligence & Data Science">AI-DS</option>
                        <option value="Electronics & Communication Engineering">ECE</option>
                        <option value="Mechanical Engineering">Mechanical</option>
                        <option value="Master of Business Administration">MBA</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      College Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@reva.edu.in"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Password <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Create secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Create Student Account'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* FACULTY & ADMIN TAB */}
          {activeTab === 'faculty' && (
            <div>
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  color: '#92400e',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  marginBottom: '18px',
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Authorized University Signatories:</strong> Faculty and administrator accounts are provisioned and authorized by university administrators. Self-registration is restricted.
                </span>
              </div>

              <form onSubmit={handleFacultyLogin}>
                <div className="form-group">
                  <label className="form-label">Faculty / Institutional Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="priya.rao.demo@reva.edu.in"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Institutional Access Key / Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter authorized password"
                    value={facultyPassword}
                    onChange={(e) => setFacultyPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', marginTop: '10px' }}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Sign In as Faculty / Admin'}
                </button>
              </form>
            </div>
          )}

          {/* Quick Demo Access Bar */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
              <Zap size={14} color="#2563eb" /> Instant 1-Click Demo Login
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', textAlign: 'left', padding: '8px' }}
              >
                <div>👨‍🎓 <strong>Aarav</strong></div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Student</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('faculty')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', textAlign: 'left', padding: '8px' }}
              >
                <div>👩‍🏫 <strong>Dr. Priya</strong></div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Faculty</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('hod')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', textAlign: 'left', padding: '8px' }}
              >
                <div>👨‍💼 <strong>Dr. Suresh</strong></div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>HOD</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('director')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', textAlign: 'left', padding: '8px' }}
              >
                <div>🏛️ <strong>Dr. Ramesh</strong></div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Director</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', textAlign: 'left', padding: '8px' }}
              >
                <div>🛡️ <strong>Admin</strong></div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Administrator</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

