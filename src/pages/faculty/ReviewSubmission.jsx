import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import TimelineStepper from '../../components/dashboard/TimelineStepper';
import MessageThread from '../../components/dashboard/MessageThread';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  Download,
  FileCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Share2,
  Clock,
  User,
  Building,
  Mail,
  Phone,
  FileText,
  History,
  Send,
  HelpCircle
} from 'lucide-react';

export default function ReviewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, role } = useAuth();
  const {
    getSubmissionById,
    updateSubmissionStatus,
    forwardSubmission,
    downloadDocument,
    facultyDirectory,
    getSubmissionActivity
  } = useDocuments();

  const submission = getSubmissionById(id);

  // Modal Dialog States
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject' | 'correction' | 'forward' | 'instructions'
  const [actionNotes, setActionNotes] = useState('');
  const [targetFacultyId, setTargetFacultyId] = useState('');
  const [signatureInstructions, setSignatureInstructions] = useState('');
  const [modalError, setModalError] = useState(null);

  if (!submission) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Submission Not Found</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '20px' }}>
          Could not locate document submission: <code>{id}</code>.
        </p>
        <Link to="/faculty/submissions" className="btn btn-primary">
          Back to Assigned Queue
        </Link>
      </div>
    );
  }

  const activities = getSubmissionActivity(submission.id);

  // Filter possible forwarding recipients (exclude current reviewer)
  const forwardRecipients = facultyDirectory.filter(f => f.id !== submission.assigned_faculty_id);

  // Execute Action
  const handleExecuteAction = (e) => {
    e.preventDefault();
    setModalError(null);

    if (modalType === 'reject') {
      if (!actionNotes.trim()) {
        setModalError('A rejection reason is strictly mandatory.');
        return;
      }
      updateSubmissionStatus(submission.id, 'rejected', actionNotes);
      setModalType(null);
      setActionNotes('');
    } else if (modalType === 'correction') {
      if (!actionNotes.trim()) {
        setModalError('Detailed correction instructions are required.');
        return;
      }
      updateSubmissionStatus(submission.id, 'correction_required', actionNotes);
      setModalType(null);
      setActionNotes('');
    } else if (modalType === 'approve') {
      updateSubmissionStatus(submission.id, 'approved', actionNotes, {
        physicalSignatureInstructions: signatureInstructions
      });
      setModalType(null);
      setActionNotes('');
      setSignatureInstructions('');
    } else if (modalType === 'forward') {
      if (!targetFacultyId) {
        setModalError('Please select a recipient authority.');
        return;
      }
      forwardSubmission(submission.id, targetFacultyId, actionNotes || 'Forwarded for secondary endorsement.');
      setModalType(null);
      setActionNotes('');
      setTargetFacultyId('');
    } else if (modalType === 'instructions') {
      if (!signatureInstructions.trim()) {
        setModalError('Please provide instructions.');
        return;
      }
      updateSubmissionStatus(submission.id, submission.status, 'Physical signature instructions updated.', {
        physicalSignatureInstructions: signatureInstructions
      });
      setModalType(null);
    }
  };

  return (
    <div>
      {/* Top Breadcrumb & Status */}
      <div className="page-header">
        <div className="page-title-group">
          <Link
            to="/faculty/submissions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--primary-600)',
              textDecoration: 'none',
              marginBottom: '8px'
            }}
          >
            <ArrowLeft size={14} /> Back to Assigned Queue
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>{submission.title}</h1>
            <span className="tracking-code">{submission.tracking_id}</span>
          </div>
          <p style={{ marginTop: '4px' }}>
            Document Type: <strong>{submission.document_type_name}</strong> • Submitted by {submission.student_name} ({submission.student_srn})
          </p>
        </div>

        <div className="page-actions">
          <button
            onClick={() => downloadDocument(submission)}
            className="btn btn-outline"
          >
            <Download size={14} /> Download Document File
          </button>
        </div>
      </div>

      {/* Reviewer Action Bar */}
      <div
        className="dashboard-card"
        style={{
          padding: '20px 24px',
          backgroundColor: '#ffffff',
          borderLeft: '4px solid var(--primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '26px'
        }}
      >
        <div>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '0.04em' }}>
            Reviewer Decision Bar
          </span>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '2px' }}>
            Current Document Status: <span style={{ textTransform: 'capitalize' }}>{submission.status.replace('_', ' ')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setModalType('approve');
              setActionNotes('');
              setModalError(null);
            }}
            className="btn btn-success"
          >
            <CheckCircle size={16} /> Approve & Advance
          </button>

          <button
            onClick={() => {
              setModalType('correction');
              setActionNotes('');
              setModalError(null);
            }}
            className="btn btn-outline"
            style={{ color: '#b45309', borderColor: '#fde68a' }}
          >
            <AlertCircle size={16} /> Request Correction
          </button>

          <button
            onClick={() => {
              setModalType('forward');
              setActionNotes('');
              setModalError(null);
            }}
            className="btn btn-outline"
          >
            <Share2 size={16} /> Forward to Authority
          </button>

          <button
            onClick={() => {
              setModalType('reject');
              setActionNotes('');
              setModalError(null);
            }}
            className="btn btn-danger"
          >
            <XCircle size={16} /> Reject Submission
          </button>
        </div>
      </div>

      {/* Main Reviewer Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Student Details + File + Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 2' }}>
          {/* Student Info Card */}
          <div className="dashboard-card">
            <div className="card-header-bar">
              <h2>Student & Document Dossier</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <PriorityBadge priority={submission.priority} />
                <StatusBadge status={submission.status} />
              </div>
            </div>

            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Student Name</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '2px' }}>
                    {submission.student_name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Registration (SRN)</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '2px', fontFamily: 'monospace' }}>
                    {submission.student_srn}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Department & Branch</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '2px' }}>
                    {submission.department_name} ({submission.branch_name || 'General'})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700, textTransform: 'uppercase' }}>Target Deadline</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: submission.deadline ? 'var(--gray-900)' : 'var(--gray-400)', marginTop: '2px' }}>
                    {submission.deadline ? new Date(submission.deadline).toLocaleDateString() : 'None set'}
                  </div>
                </div>
              </div>

              {submission.message_to_faculty && (
                <div style={{ padding: '14px 18px', backgroundColor: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Student Message / Context
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--gray-800)', lineHeight: 1.5 }}>
                    "{submission.message_to_faculty}"
                  </p>
                </div>
              )}

              {/* Uploaded File Item */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <FileText size={30} color="var(--primary-600)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--gray-900)' }}>
                      {submission.file?.file_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                      Version v{submission.file?.version || 1} • {(submission.file?.file_size / 1024 / 1024).toFixed(2)} MB • {submission.file?.file_type}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => downloadDocument(submission)}
                  className="btn btn-primary btn-sm"
                >
                  <Download size={14} /> Download & Inspect
                </button>
              </div>

              {/* Physical Signature Requirement */}
              {submission.requires_physical_signature && (
                <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#0369a1' }}>
                    <strong>Physical Signature Required:</strong>{' '}
                    {submission.physical_signature_instructions || 'No instructions provided yet.'}
                  </div>
                  <button
                    onClick={() => {
                      setSignatureInstructions(submission.physical_signature_instructions || '');
                      setModalType('instructions');
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '12px' }}
                  >
                    Edit Instructions
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Stepper Card */}
          <div className="dashboard-card">
            <div className="card-header-bar">
              <h2>Approval Stages & Decisions</h2>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                Active Reviewer: <strong>{submission.current_reviewer_name}</strong>
              </span>
            </div>

            <div className="card-body">
              <TimelineStepper
                stages={submission.approval_stages}
                currentStageIndex={submission.current_stage_index}
                currentReviewer={submission.current_reviewer_name}
              />
            </div>
          </div>

          {/* Activity Logs Card */}
          <div className="dashboard-card">
            <div className="card-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--gray-500)" />
                <h2>Submission Audit History</h2>
              </div>
            </div>

            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activities.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      fontSize: '13px',
                      borderBottom: '1px solid var(--gray-100)',
                      paddingBottom: '10px'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-500)', marginTop: '5px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-800)' }}>
                        <strong>{act.action}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                          {new Date(act.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ color: 'var(--gray-600)', marginTop: '2px' }}>
                        By {act.actor_name} ({act.actor_role}): {act.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Communication Thread */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dashboard-card" style={{ height: '620px', display: 'flex', flexDirection: 'column' }}>
            <MessageThread
              submissionId={submission.id}
              recipientName={submission.student_name}
            />
          </div>
        </div>
      </div>

      {/* Decision Modals */}
      {/* 1. Approve Modal */}
      <Modal
        isOpen={modalType === 'approve'}
        onClose={() => setModalType(null)}
        title="Approve Document Submission"
      >
        <form onSubmit={handleExecuteAction}>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
            Confirm approval of <strong>{submission.title}</strong> by {submission.student_name}.
            This will advance the workflow to the next approval stage or complete it.
          </p>

          <div className="form-group">
            <label className="form-label">Reviewer Approval Comments (Optional)</label>
            <textarea
              className="form-control"
              placeholder="e.g. Verified enrolment, credits and attendance requirements. Approved."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={3}
            />
          </div>

          {submission.requires_physical_signature && (
            <div className="form-group">
              <label className="form-label">Physical Signature Instructions for Student</label>
              <textarea
                className="form-control"
                placeholder="e.g. Please visit SOCIT Room 304 on Thursday between 2-4 PM for physical sign-off."
                value={signatureInstructions}
                onChange={(e) => setSignatureInstructions(e.target.value)}
                rows={2}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalType(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Confirm Approval
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Request Correction Modal */}
      <Modal
        isOpen={modalType === 'correction'}
        onClose={() => setModalType(null)}
        title="Request Correction from Student"
      >
        <form onSubmit={handleExecuteAction}>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
            Specify exactly what corrections or additional documentation are needed from <strong>{submission.student_name}</strong>.
          </p>

          {modalError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '13px' }}>
              {modalError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Correction Instructions <span className="required">*</span>
            </label>
            <textarea
              className="form-control"
              placeholder="e.g. Please attach the official company offer letter with stipend details, and resubmit."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalType(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-warning" style={{ backgroundColor: '#d97706', color: 'white' }}>
              Send Correction Request
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Reject Modal */}
      <Modal
        isOpen={modalType === 'reject'}
        onClose={() => setModalType(null)}
        title="Reject Document Submission"
      >
        <form onSubmit={handleExecuteAction}>
          <p style={{ fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>
            Warning: Rejecting this submission will stop the workflow. A mandatory explanation must be provided to the student.
          </p>

          {modalError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '13px' }}>
              {modalError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Mandatory Rejection Reason <span className="required">*</span>
            </label>
            <textarea
              className="form-control"
              placeholder="Provide a clear academic or administrative justification for the rejection..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalType(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Forward Modal */}
      <Modal
        isOpen={modalType === 'forward'}
        onClose={() => setModalType(null)}
        title="Forward to Another University Authority"
      >
        <form onSubmit={handleExecuteAction}>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
            Transfer review responsibility of <strong>{submission.title}</strong> to another designated faculty member, HOD, or Director.
          </p>

          {modalError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '13px' }}>
              {modalError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Select Forwarding Recipient <span className="required">*</span>
            </label>
            <select
              className="form-control"
              value={targetFacultyId}
              onChange={(e) => setTargetFacultyId(e.target.value)}
              required
            >
              <option value="">-- Select Recipient Authority --</option>
              {forwardRecipients.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.designation} ({f.department_name || 'REVA'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Forwarding Endorsement Note</label>
            <textarea
              className="form-control"
              placeholder="e.g. Endorsed by Class Coordinator. Attendance is verified at 89%. Forwarded for HOD clearance."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalType(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Forward Document
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Physical Signature Instructions Modal */}
      <Modal
        isOpen={modalType === 'instructions'}
        onClose={() => setModalType(null)}
        title="Update Physical Signature Instructions"
      >
        <form onSubmit={handleExecuteAction}>
          <div className="form-group">
            <label className="form-label">Instructions for In-Person Physical Signature</label>
            <textarea
              className="form-control"
              placeholder="Specify room number, office hours, and what physical paperwork to bring..."
              value={signatureInstructions}
              onChange={(e) => setSignatureInstructions(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setModalType(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Instructions
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

