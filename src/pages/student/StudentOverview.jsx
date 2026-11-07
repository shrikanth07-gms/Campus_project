import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { useNotifications } from '../../context/NotificationContext';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  FilePlus,
  ArrowRight,
  Calendar,
  Users,
  Eye,
  Bell
} from 'lucide-react';

export default function StudentOverview() {
  const { user, profile } = useAuth();
  const { submissions } = useDocuments();
  const { notifications } = useNotifications();

  // Filter submissions for current student
  const studentSubmissions = submissions.filter(
    (s) => s.student_id === user?.id || s.student_email === user?.email
  );

  const total = studentSubmissions.length;
  const pending = studentSubmissions.filter(s => ['submitted', 'under_review'].includes(s.status)).length;
  const inProgress = studentSubmissions.filter(s => ['in_progress', 'forwarded'].includes(s.status)).length;
  const approved = studentSubmissions.filter(s => ['approved', 'completed'].includes(s.status)).length;
  const issues = studentSubmissions.filter(s => ['correction_required', 'rejected'].includes(s.status)).length;

  // Upcoming deadlines
  const upcomingDeadlines = studentSubmissions
    .filter(s => s.deadline && !['approved', 'completed', 'rejected'].includes(s.status))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <div>
      {/* Welcome Banner */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Student Dashboard</h1>
          <p>
            Welcome back, <strong>{profile?.full_name || 'Student'}</strong> (SRN: {profile?.srn || 'R21EN102'}). Track approvals and submit documents online.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/student/submit" className="btn btn-primary">
            <FilePlus size={16} /> Submit New Document
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Total Submissions</div>
            <div className="stat-value">{total}</div>
            <div className="stat-subtext">Across all academic terms</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <FileText size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value">{pending}</div>
            <div className="stat-subtext">Awaiting initial inspection</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-yellow">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgress}</div>
            <div className="stat-subtext">Multi-stage endorsement</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-purple">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{approved}</div>
            <div className="stat-subtext">Ready for download</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Action Needed</div>
            <div className="stat-value">{issues}</div>
            <div className="stat-subtext">Corrections or feedback</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-red">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Submissions & Deadlines */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Recent Submissions Table */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header-bar">
            <h2>Recent Submissions</h2>
            <Link to="/student/submissions" className="btn btn-outline btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Document Title</th>
                  <th>Submitted To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-400)' }}>
                      No submissions found. Click "Submit New Document" to begin.
                    </td>
                  </tr>
                ) : (
                  studentSubmissions.slice(0, 5).map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <span className="tracking-code">{sub.tracking_id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{sub.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{sub.document_type_name}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{sub.assigned_faculty_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{sub.department_name}</div>
                      </td>
                      <td>
                        <PriorityBadge priority={sub.priority} />
                      </td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                      <td>
                        <Link to={`/student/submissions/${sub.id}`} className="btn btn-outline btn-sm">
                          <Eye size={13} /> View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Deadlines & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upcoming Deadlines */}
          <div className="dashboard-card">
            <div className="card-header-bar">
              <h2>Upcoming Deadlines</h2>
              <Calendar size={16} color="var(--gray-500)" />
            </div>
            <div className="card-body" style={{ padding: '16px' }}>
              {upcomingDeadlines.length === 0 ? (
                <p style={{ color: 'var(--gray-400)', fontSize: '13px', textAlign: 'center', margin: '14px 0' }}>
                  No imminent document deadlines.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingDeadlines.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px',
                        background: 'var(--gray-50)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--gray-900)' }}>
                          {item.title}
                        </span>
                        <PriorityBadge priority={item.priority} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--danger-700)', marginTop: '6px' }}>
                        <Clock size={13} />
                        Deadline: {new Date(item.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Submit Prompt */}
          <div
            className="dashboard-card"
            style={{
              background: 'linear-gradient(135deg, #1e40af, #2563eb)',
              color: 'white',
              border: 'none',
              padding: '24px'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>Need an Official Document?</h3>
            <p style={{ fontSize: '13px', color: '#dbeafe', margin: '0 0 16px', lineHeight: 1.5 }}>
              Avoid queues and paperwork. Submit bonafide requests, NOCs, scholarship endorsements, and approvals directly to faculty online.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/student/submit" className="btn" style={{ background: 'white', color: '#1e40af', fontWeight: 700 }}>
                Start Submission
              </Link>
              <Link to="/student/faculty" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                Find Faculty
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

