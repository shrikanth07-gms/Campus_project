import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { Search, Filter, Eye, Clock, Mail } from 'lucide-react';

export default function AssignedSubmissions() {
  const { user, profile, role } = useAuth();
  const { submissions } = useDocuments();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const assigned = submissions.filter(
    (s) =>
      s.assigned_faculty_name?.includes(profile?.full_name?.split(' ')[1] || 'Rao') ||
      s.current_reviewer_id === user?.id ||
      s.current_reviewer_name?.includes(profile?.full_name?.split(' ')[1] || 'Rao') ||
      ['faculty', 'hod', 'director'].includes(role)
  );

  const filtered = assigned.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      sub.student_name.toLowerCase().includes(search.toLowerCase()) ||
      sub.student_srn.toLowerCase().includes(search.toLowerCase()) ||
      sub.tracking_id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && ['submitted', 'under_review'].includes(sub.status)) ||
      (statusFilter === 'in_progress' && ['in_progress', 'forwarded'].includes(sub.status)) ||
      (statusFilter === 'approved' && ['approved', 'completed'].includes(sub.status)) ||
      (statusFilter === 'issues' && ['correction_required', 'rejected'].includes(sub.status)) ||
      sub.status === statusFilter;

    const matchesPriority = priorityFilter === 'all' || sub.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Assigned Documents Queue</h1>
          <p>
            Review student document submissions, inspect attachments, verify requirements, and advance approval stages.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="dashboard-card" style={{ padding: '18px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by student name, SRN, document title, or tracking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="issues">Correction / Rejected</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="this_week">🟡 This Week</option>
              <option value="this_month">🟢 This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Assigned Table */}
      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Student Name</th>
                <th>SRN</th>
                <th>Branch</th>
                <th>Student Email</th>
                <th>Document Name</th>
                <th>Submitted Date</th>
                <th>Deadline</th>
                <th>Priority</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                    No assigned submissions found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span className="tracking-code">{sub.tracking_id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{sub.student_name}</div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--gray-700)' }}>
                        {sub.student_srn}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                        {sub.student_branch}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {sub.student_email}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{sub.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{sub.document_type_name}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {sub.deadline ? (
                        <div style={{ fontSize: '12px', color: new Date(sub.deadline) < new Date() ? 'var(--danger-700)' : 'var(--gray-600)' }}>
                          {new Date(sub.deadline).toLocaleDateString()}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>None</span>
                      )}
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

