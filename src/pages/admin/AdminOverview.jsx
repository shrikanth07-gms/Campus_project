import { useDocuments } from '../../context/DocumentContext';
import {
  BarChart3,
  TrendingUp,
  FileCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Users,
  Calendar,
  Layers
} from 'lucide-react';

export default function AdminOverview() {
  const { submissions, departments, documentTypes, facultyDirectory } = useDocuments();

  const total = submissions.length;
  const approved = submissions.filter(s => ['approved', 'completed'].includes(s.status)).length;
  const pending = submissions.filter(s => ['submitted', 'under_review', 'in_progress', 'forwarded'].includes(s.status)).length;
  const rejected = submissions.filter(s => s.status === 'rejected').length;
  const correction = submissions.filter(s => s.status === 'correction_required').length;

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Breakdown by Department
  const deptStats = departments.map((dept) => {
    const count = submissions.filter(s => s.department_id === dept.id).length;
    return {
      name: dept.name,
      code: dept.code,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });

  // Breakdown by Document Type
  const docTypeStats = documentTypes.map((dt) => {
    const count = submissions.filter(s => s.document_type_id === dt.id).length;
    return {
      name: dt.name,
      code: dt.code,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0
    };
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>University Analytics & Workflow Performance</h1>
          <p>
            RoutePulse Central Administration — REVA University, Bengaluru. Real-time document velocity, approval rates, and department throughput.
          </p>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Total Submissions</div>
            <div className="stat-value">{total}</div>
            <div className="stat-subtext">Across 4 university schools</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Layers size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Approval Rate</div>
            <div className="stat-value">{approvalRate}%</div>
            <div className="stat-subtext">{approved} approved successfully</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Active Workflows</div>
            <div className="stat-value">{pending}</div>
            <div className="stat-subtext">Under review or forwarded</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-yellow">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Avg. Turnaround Time</div>
            <div className="stat-value">1.4 Days</div>
            <div className="stat-subtext">72% faster than paper process</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-purple">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Correction Loops</div>
            <div className="stat-value">{correction}</div>
            <div className="stat-subtext">Revisions requested</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-red">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Department Volume Distribution */}
        <div className="dashboard-card">
          <div className="card-header-bar">
            <h2>Submissions by Academic School</h2>
            <Building size={18} color="var(--gray-400)" />
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {deptStats.map((d) => (
                <div key={d.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{d.name} ({d.code})</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{d.count} ({d.pct}%)</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(d.pct, 5)}%`,
                        backgroundColor: 'var(--primary-600)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Type Distribution */}
        <div className="dashboard-card">
          <div className="card-header-bar">
            <h2>Document Category Volume</h2>
            <BarChart3 size={18} color="var(--gray-400)" />
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {docTypeStats.map((dt) => (
                <div key={dt.code}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{dt.name}</span>
                    <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{dt.count} docs</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--gray-100)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.max(dt.pct, 4)}%`,
                        backgroundColor: '#10b981',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

