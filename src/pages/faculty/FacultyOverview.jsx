import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Check,
  Send,
  Calendar
} from 'lucide-react';

export default function FacultyOverview() {
  const { user, profile, role } = useAuth();
  const { submissions } = useDocuments();

  // Submissions assigned to this faculty or where they are current reviewer
  const assigned = submissions.filter(
    (s) =>
      s.assigned_faculty_name?.includes(profile?.full_name?.split(' ')[1] || 'Rao') ||
      s.current_reviewer_id === user?.id ||
      s.current_reviewer_name?.includes(profile?.full_name?.split(' ')[1] || 'Rao') ||
      ['faculty', 'hod', 'director'].includes(role) // demo convenience
  );

  const total = assigned.length;
  const pendingReview = assigned.filter(s => ['submitted', 'under_review'].includes(s.status)).length;
  const inProgress = assigned.filter(s => ['in_progress', 'forwarded'].includes(s.status)).length;
  const approved = assigned.filter(s => ['approved', 'completed'].includes(s.status)).length;
  const overdue = assigned.filter(
    s => s.deadline && new Date(s.deadline) < new Date() && !['approved', 'completed', 'rejected'].includes(s.status)
  ).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Reviewer Dashboard</h1>
          <p>
            Welcome, <strong>{profile?.full_name || 'Dr. Priya Rao'}</strong> ({profile?.designation || 'Faculty'}). Review student documents, approve workflows, and provide feedback.
          </p>
        </div>

        <div className="page-actions">
          <Link to="/faculty/submissions" className="btn btn-primary">
            <FileCheck size={16} /> View Assigned Queue ({pendingReview})
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Total Assigned</div>
            <div className="stat-value">{total}</div>
            <div className="stat-subtext">All active & past documents</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <FileCheck size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value">{pendingReview}</div>
            <div className="stat-subtext">Action required</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-yellow">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgress}</div>
            <div className="stat-subtext">Multi-stage pipeline</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-purple">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{approved}</div>
            <div className="stat-subtext">Signed & cleared</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Overdue Alerts</div>
            <div className="stat-value">{overdue}</div>
            <div className="stat-subtext">Past target deadline</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-red">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Urgent Action Queue Table */}
      <div className="dashboard-card">
        <div className="card-header-bar">
          <h2>Assigned Documents Requiring Action</h2>
          <Link to="/faculty/submissions" className="btn btn-outline btn-sm">
            View All Submissions <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Student Name & SRN</th>
                <th>Document Title</th>
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Review</th>
              </tr>
            </thead>
            <tbody>
              {assigned.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--gray-400)' }}>
                    No assigned documents currently in queue.
                  </td>
                </tr>
              ) : (
                assigned.slice(0, 5).map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span className="tracking-code">{sub.tracking_id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{sub.student_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                        {sub.student_srn} • {sub.student_branch}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{sub.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                        {sub.document_type_name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>
                        {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={sub.priority} />
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/faculty/submissions/${sub.id}`} className="btn btn-primary btn-sm">
                        <Eye size={13} /> Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

