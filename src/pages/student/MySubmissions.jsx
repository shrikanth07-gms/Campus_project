import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import {
  Search,
  Filter,
  FilePlus,
  Eye,
  Download,
  Calendar,
  Clock,
  ArrowUpDown
} from 'lucide-react';

export default function MySubmissions() {
  const { user } = useAuth();
  const { submissions, downloadDocument } = useDocuments();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const studentSubmissions = submissions.filter(
    (s) => s.student_id === user?.id || s.student_email === user?.email
  );

  const filtered = studentSubmissions.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      sub.tracking_id.toLowerCase().includes(search.toLowerCase()) ||
      sub.assigned_faculty_name.toLowerCase().includes(search.toLowerCase()) ||
      sub.document_type_name.toLowerCase().includes(search.toLowerCase());

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
          <h1>My Submissions</h1>
          <p>
            Track each submitted document independently with live approval stages and activity logs.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/student/submit" className="btn btn-primary">
            <FilePlus size={16} /> Submit New Document
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="dashboard-card" style={{ padding: '18px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by title, tracking ID, or faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending / Under Review</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved / Completed</option>
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

      {/* Submissions Table */}
      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submission ID</th>
                <th>Document Name</th>
                <th>Submitted To</th>
                <th>Submission Date</th>
                <th>Deadline</th>
                <th>Priority</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                    No submissions matched your query.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span className="tracking-code">{sub.tracking_id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{sub.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                        {sub.document_type_name} {sub.requires_physical_signature && '• (Physical Sig.)'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gray-800)' }}>
                        {sub.assigned_faculty_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                        {sub.department_name}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>
                        {new Date(sub.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {sub.deadline ? (
                        <div style={{ fontSize: '12px', color: new Date(sub.deadline) < new Date() ? 'var(--danger-700)' : 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
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
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link to={`/student/submissions/${sub.id}`} className="btn btn-outline btn-sm">
                          <Eye size={13} /> View
                        </Link>
                        {['approved', 'completed'].includes(sub.status) && (
                          <button
                            onClick={() => downloadDocument(sub)}
                            className="btn btn-success btn-sm"
                            title="Download verified document receipt"
                          >
                            <Download size={13} />
                          </button>
                        )}
                      </div>
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

