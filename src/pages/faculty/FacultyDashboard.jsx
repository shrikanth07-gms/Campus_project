import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  Check,
  Send,
  Calendar,
  Search,
  Filter,
  Phone,
  Mail,
  User,
  GraduationCap,
  XCircle,
  FileText,
  Download,
  AlertCircle,
  Share2,
  ExternalLink,
  Flame
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user, profile, role } = useAuth();
  const {
    submissions,
    updateSubmissionStatus,
    downloadDocument,
    forwardSubmission,
    facultyDirectory
  } = useDocuments();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Action Modals State
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'physical_sig' | 'preview'
  const [actionReason, setActionReason] = useState('');
  const [physicalInstructions, setPhysicalInstructions] = useState('');
  const [modalError, setModalError] = useState(null);

  // Filter submissions assigned to this logged-in reviewer / authority
  const assigned = useMemo(() => {
    return submissions.filter((s) => {
      // 1. Direct reviewer ID match
      if (s.current_reviewer_id === user?.id) return true;

      // 2. Assigned faculty directory ID match
      if (s.assigned_faculty_id && facultyDirectory.some(f => f.id === s.assigned_faculty_id && f.user_id === user?.id)) {
        return true;
      }

      // 3. Name fallback for demo personas
      const myLastName = profile?.full_name?.split(' ')[1] || '';
      if (myLastName && (s.assigned_faculty_name?.includes(myLastName) || s.current_reviewer_name?.includes(myLastName))) {
        return true;
      }

      // 4. Role-based fallback for demo personas (HOD / Director view department submissions)
      if (role === 'hod' && s.department_id === profile?.department_id) return true;
      if (role === 'director') return true;
      if (role === 'admin') return true;
      if (role === 'faculty') return true; // allow testing

      return false;
    });
  }, [submissions, user, profile, role, facultyDirectory]);

  // Priority weight for sorting: Urgent = 1, This Week = 2, This Month = 3
  const getPriorityWeight = (priority) => {
    if (priority === 'urgent') return 1;
    if (priority === 'this_week') return 2;
    return 3;
  };

  // Sort by priority (Urgent first), then by earliest deadline
  const sortedAndFiltered = useMemo(() => {
    return assigned
      .filter((sub) => {
        const matchesSearch =
          sub.title.toLowerCase().includes(search.toLowerCase()) ||
          sub.student_name.toLowerCase().includes(search.toLowerCase()) ||
          sub.student_srn.toLowerCase().includes(search.toLowerCase()) ||
          sub.tracking_id.toLowerCase().includes(search.toLowerCase()) ||
          (sub.student_branch && sub.student_branch.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'pending' && ['submitted', 'under_review'].includes(sub.status)) ||
          (statusFilter === 'in_progress' && ['in_progress', 'forwarded'].includes(sub.status)) ||
          (statusFilter === 'approved' && ['approved', 'completed'].includes(sub.status)) ||
          (statusFilter === 'rejected' && ['rejected', 'correction_required'].includes(sub.status)) ||
          sub.status === statusFilter;

        const matchesPriority = priorityFilter === 'all' || sub.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        // First sort by priority weight
        const weightA = getPriorityWeight(a.priority);
        const weightB = getPriorityWeight(b.priority);
        if (weightA !== weightB) {
          return weightA - weightB;
        }

        // Then sort by deadline (earliest deadline first)
        if (a.deadline && b.deadline) {
          return new Date(a.deadline) - new Date(b.deadline);
        }
        if (a.deadline && !b.deadline) return -1;
        if (!a.deadline && b.deadline) return 1;

        // Finally sort by created_at descending
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [assigned, search, statusFilter, priorityFilter]);

  // Statistics
  const totalCount = assigned.length;
  const urgentCount = assigned.filter(s => s.priority === 'urgent' && !['approved', 'completed', 'rejected'].includes(s.status)).length;
  const pendingCount = assigned.filter(s => ['submitted', 'under_review'].includes(s.status)).length;
  const inProgressCount = assigned.filter(s => s.status === 'in_progress').length;
  const approvedCount = assigned.filter(s => ['approved', 'completed'].includes(s.status)).length;

  // Action Handlers
  const handleMarkInProgress = (sub) => {
    updateSubmissionStatus(sub.id, 'in_progress', 'Review started by assigned authority.');
  };

  const handleOpenApproveModal = (sub) => {
    setSelectedSub(sub);
    setActionReason('');
    setModalError(null);
    setModalType('approve');
  };

  const handleConfirmApprove = () => {
    if (!selectedSub) return;
    updateSubmissionStatus(selectedSub.id, 'approved', actionReason || 'Document requirements verified and approved.');
    setModalType(null);
    setSelectedSub(null);
  };

  const handleOpenRejectModal = (sub) => {
    setSelectedSub(sub);
    setActionReason('');
    setModalError(null);
    setModalType('reject');
  };

  const handleConfirmReject = () => {
    if (!actionReason.trim()) {
      setModalError('Please enter a mandatory rejection reason to notify the student.');
      return;
    }
    updateSubmissionStatus(selectedSub.id, 'rejected', actionReason);
    setModalType(null);
    setSelectedSub(null);
  };

  const handleOpenPhysicalSigModal = (sub) => {
    setSelectedSub(sub);
    setPhysicalInstructions(
      sub.physical_signature_instructions ||
      `Please visit ${profile?.office_location || 'Faculty Room'} on Tuesday or Thursday between 2:00 PM and 4:00 PM with your original documents for physical wet signature.`
    );
    setModalType('physical_sig');
  };

  const handleConfirmPhysicalSig = () => {
    if (!physicalInstructions.trim()) {
      setModalError('Please specify physical signature instructions.');
      return;
    }
    updateSubmissionStatus(selectedSub.id, 'under_review', 'Physical signature requested.', {
      requiresPhysicalSignature: true,
      physicalSignatureInstructions: physicalInstructions
    });
    setModalType(null);
    setSelectedSub(null);
  };

  return (
    <div>
      {/* Top Welcome Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Faculty & Reviewer Dashboard</h1>
          <p>
            Welcome, <strong>{profile?.full_name || 'Dr. Priya Rao'}</strong> ({profile?.designation || 'Class Coordinator'}). Review incoming documents, verify student credentials, and manage approval stages.
          </p>
        </div>

        <div className="page-actions">
          <Link to="/faculty/submissions" className="btn btn-outline">
            Full Submissions Table
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Total Assigned</div>
            <div className="stat-value">{totalCount}</div>
            <div className="stat-subtext">Active student documents</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <FileCheck size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Urgent Priority</div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{urgentCount}</div>
            <div className="stat-subtext">Immediate action required</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-red">
            <Flame size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Pending Inspection</div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-subtext">Awaiting initial review</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-yellow">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgressCount}</div>
            <div className="stat-subtext">Multi-stage pipeline</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-purple">
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{approvedCount}</div>
            <div className="stat-subtext">Signed & cleared</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="dashboard-card" style={{ padding: '18px 24px', marginBottom: '22px' }}>
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
              placeholder="Search by student name, SRN, tracking ID, or document title..."
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
              <option value="rejected">Rejected / Invalid</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent First</option>
              <option value="this_week">🟡 This Week</option>
              <option value="this_month">🟢 This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incoming Submissions Cards List (Sorted by Priority & Deadline) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {sortedAndFiltered.length === 0 ? (
          <div className="dashboard-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-400)' }}>
            <FileCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', margin: 0 }}>No assigned submissions matching your current filters.</p>
          </div>
        ) : (
          sortedAndFiltered.map((sub) => {
            const isUrgent = sub.priority === 'urgent';
            const isDeadlinePassed = sub.deadline && new Date(sub.deadline) < new Date() && !['approved', 'completed', 'rejected'].includes(sub.status);

            return (
              <div
                key={sub.id}
                className="dashboard-card"
                style={{
                  padding: '24px',
                  marginBottom: 0,
                  borderLeft: isUrgent ? '5px solid #ef4444' : (sub.priority === 'this_week' ? '5px solid #f59e0b' : '5px solid #10b981'),
                  transition: 'box-shadow 0.2s',
                  position: 'relative'
                }}
              >
                {/* Header Row: Tracking ID + Tags + Current Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="tracking-code">{sub.tracking_id}</span>
                    <PriorityBadge priority={sub.priority} />
                    <StatusBadge status={sub.status} />

                    {sub.requires_physical_signature && (
                      <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                        Physical Signature Requested
                      </span>
                    )}

                    {isDeadlinePassed && (
                      <span style={{ fontSize: '11px', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        Overdue
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} />
                    Submitted: {new Date(sub.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Document Title & Description */}
                <div style={{ marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-900)', margin: '0 0 6px' }}>
                    {sub.title}
                  </h2>
                  <div style={{ fontSize: '13px', color: 'var(--primary-700)', fontWeight: 600 }}>
                    Category: {sub.document_type_name}
                  </div>
                  {sub.description && (
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: '6px 0 0', lineHeight: 1.5 }}>
                      {sub.description}
                    </p>
                  )}
                </div>

                {/* Student Metadata Box (Name, SRN, Branch, Phone, Email) */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="var(--primary-600)" />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Student Name</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)' }}>{sub.student_name}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <GraduationCap size={16} color="var(--primary-600)" />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Registration (SRN)</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', fontFamily: 'monospace' }}>
                        {sub.student_srn || 'R21EN102'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={16} color="var(--primary-600)" />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Branch & Dept</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gray-800)' }}>
                        {sub.student_branch || sub.branch_name || 'CSE'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="var(--primary-600)" />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Phone Contact</div>
                      <a href={`tel:${sub.student_phone || '+919876543210'}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-700)', textDecoration: 'none' }}>
                        {sub.student_phone || '+91 98765 43210'}
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} color="var(--primary-600)" />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Email</div>
                      <a href={`mailto:${sub.student_email}`} style={{ fontSize: '13px', color: 'var(--gray-700)', textDecoration: 'none' }}>
                        {sub.student_email}
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color={isDeadlinePassed ? '#dc2626' : 'var(--primary-600)'} />
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Target Deadline</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: isDeadlinePassed ? '#dc2626' : 'var(--gray-900)' }}>
                        {sub.deadline ? new Date(sub.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'No strict deadline'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student's Initial Message / Note if present */}
                {sub.message_to_faculty && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#92400e' }}>
                    <strong>Note from Student:</strong> "{sub.message_to_faculty}"
                  </div>
                )}

                {/* Footer Action Row: Document Preview & Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  {/* Document Preview Link */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="var(--primary-600)" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-800)' }}>
                      {sub.file?.file_name || 'Document.pdf'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setModalType('preview');
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      <Eye size={13} /> Preview Document
                    </button>
                    <button
                      onClick={() => downloadDocument(sub)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      title="Download document"
                    >
                      <Download size={13} />
                    </button>
                  </div>

                  {/* Action Buttons: In Progress, Approve, Mark Invalid/Reject, Request Physical Signature */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* a) In Progress */}
                    {sub.status === 'submitted' && (
                      <button
                        onClick={() => handleMarkInProgress(sub)}
                        className="btn btn-outline btn-sm"
                        style={{ color: '#0369a1', borderColor: '#bae6fd', backgroundColor: '#f0f9ff' }}
                        title="Mark status as In Progress"
                      >
                        <Clock size={14} /> In Progress
                      </button>
                    )}

                    {/* b) Approve */}
                    <button
                      onClick={() => handleOpenApproveModal(sub)}
                      className="btn btn-success btn-sm"
                      disabled={['approved', 'completed'].includes(sub.status)}
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>

                    {/* c) Mark Invalid / Reject */}
                    <button
                      onClick={() => handleOpenRejectModal(sub)}
                      className="btn btn-danger btn-sm"
                      disabled={['rejected'].includes(sub.status)}
                    >
                      <XCircle size={14} /> Mark Invalid / Reject
                    </button>

                    {/* d) Request Physical Signature */}
                    <button
                      onClick={() => handleOpenPhysicalSigModal(sub)}
                      className="btn btn-outline btn-sm"
                      style={{ borderColor: '#bae6fd', color: '#0369a1' }}
                    >
                      <FileCheck size={14} /> Physical Signature
                    </button>

                    {/* Full Review Link */}
                    <Link
                      to={`/faculty/submissions/${sub.id}`}
                      className="btn btn-primary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      Full Details <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================= */}
      {/* ACTION MODALS */}
      {/* ============================================================= */}

      {/* 1. APPROVE MODAL */}
      <Modal
        isOpen={modalType === 'approve'}
        onClose={() => setModalType(null)}
        title="Approve Document Submission"
      >
        <div style={{ padding: '4px 0' }}>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
            Are you sure you want to approve <strong>{selectedSub?.title}</strong> for <strong>{selectedSub?.student_name}</strong>?
            The student will be notified immediately.
          </p>

          <div className="form-group">
            <label className="form-label">Reviewer Endorsement Comments (Optional)</label>
            <textarea
              className="form-control"
              placeholder="e.g. Verified enrolment, requirements met. Approved."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalType(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-success" onClick={handleConfirmApprove}>
              <CheckCircle2 size={15} /> Confirm Approval
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. MARK INVALID / REJECT MODAL */}
      <Modal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType(null)}
        title="Mark Invalid / Reject Document"
      >
        <div style={{ padding: '4px 0' }}>
          <p style={{ fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>
            Please enter the justification for rejecting or invalidating this document. This reason will be sent to <strong>{selectedSub?.student_name}</strong>.
          </p>

          {modalError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '13px' }}>
              {modalError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Mandatory Reason for Invalidation / Rejection <span className="required">*</span>
            </label>
            <textarea
              className="form-control"
              placeholder="Specify the issue (e.g. Missing official stamp, wrong semester dates, incorrect fee receipt attached)..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalType(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleConfirmReject}>
              <XCircle size={15} /> Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. REQUEST PHYSICAL SIGNATURE MODAL */}
      <Modal
        isOpen={modalType === 'physical_sig'}
        onClose={() => setModalType(null)}
        title="Request Physical Wet Signature"
      >
        <div style={{ padding: '4px 0' }}>
          {/* Prominent Student Contact Card for calling/messaging */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              marginBottom: '18px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px' }}>
              Student Contact Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#1e3a8a' }}>
              <div><strong>Name:</strong> {selectedSub?.student_name}</div>
              <div><strong>SRN:</strong> {selectedSub?.student_srn || 'R21EN102'}</div>
              <div>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${selectedSub?.student_phone}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                  {selectedSub?.student_phone || '+91 98765 43210'}
                </a>
              </div>
              <div>
                <strong>Email:</strong> {selectedSub?.student_email}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '14px' }}>
            Instruct the student where and when to visit for in-person physical verification and signature.
          </p>

          <div className="form-group">
            <label className="form-label">
              In-Person Instructions & Visiting Hours <span className="required">*</span>
            </label>
            <textarea
              className="form-control"
              value={physicalInstructions}
              onChange={(e) => setPhysicalInstructions(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalType(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirmPhysicalSig}>
              Send Physical Signature Request
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={modalType === 'preview'}
        onClose={() => setModalType(null)}
        title={`Document Preview: ${selectedSub?.file?.file_name || 'Document'}`}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div
            style={{
              padding: '30px',
              backgroundColor: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              marginBottom: '20px'
            }}
          >
            <FileText size={48} color="var(--primary-600)" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: 'var(--gray-900)' }}>
              {selectedSub?.file?.file_name || 'Document_Attachment.pdf'}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '0 0 16px' }}>
              Category: {selectedSub?.document_type_name} • Student: {selectedSub?.student_name} ({selectedSub?.student_srn})
            </p>

            <button
              onClick={() => selectedSub && downloadDocument(selectedSub)}
              className="btn btn-primary"
            >
              <Download size={15} /> Download & Verify File
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setModalType(null)}
          >
            Close Preview
          </button>
        </div>
      </Modal>
    </div>
  );
}

