import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  AlertCircle,
  Clock,
  User,
  Building,
  CheckCircle,
  FileText,
  UploadCloud,
  History,
  MessageSquare
} from 'lucide-react';

export default function SubmissionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    getSubmissionById,
    downloadDocument,
    resubmitCorrectedDocument,
    getSubmissionActivity
  } = useDocuments();

  const submission = getSubmissionById(id);

  // Correction Modal State
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionFile, setCorrectionFile] = useState(null);
  const [correctionNote, setCorrectionNote] = useState('');
  const [correctionError, setCorrectionError] = useState(null);

  if (!submission) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Submission Not Found</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '20px' }}>
          We could not locate a submission with ID: <code>{id}</code>.
        </p>
        <Link to="/student/submissions" className="btn btn-primary">
          Back to My Submissions
        </Link>
      </div>
    );
  }

  const activities = getSubmissionActivity(submission.id);
  const isApproved = ['approved', 'completed'].includes(submission.status);
  const isCorrectionNeeded = submission.status === 'correction_required';

  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    if (!correctionFile) {
      setCorrectionError('Please attach the revised document file.');
      return;
    }

    resubmitCorrectedDocument(submission.id, correctionFile, correctionNote);
    setShowCorrectionModal(false);
    setCorrectionFile(null);
    setCorrectionNote('');
  };

  return (
    <div>
      {/* Top Breadcrumb & Actions */}
      <div className="page-header">
        <div className="page-title-group">
          <Link
            to="/student/submissions"
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
            <ArrowLeft size={14} /> Back to My Submissions
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>{submission.title}</h1>
            <span className="tracking-code">{submission.tracking_id}</span>
          </div>
          <p style={{ marginTop: '4px' }}>
            Submitted on {new Date(submission.created_at).toLocaleDateString()} to {submission.assigned_faculty_name} ({submission.department_name})
          </p>
        </div>

        <div className="page-actions">
          <button
            onClick={() => downloadDocument(submission)}
            className="btn btn-primary"
          >
            <Download size={15} /> Download Document Receipt
          </button>
        </div>
      </div>

      {/* Correction Alert Banner */}
      {isCorrectionNeeded && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: '280px' }}>
            <AlertCircle size={24} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#92400e', fontWeight: 700 }}>
                Correction Requested by Reviewer
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: 1.5 }}>
                {submission.correction_notes || 'Please review the comments from faculty and resubmit the updated document.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCorrectionModal(true)}
            className="btn btn-warning"
            style={{ backgroundColor: '#d97706', color: 'white', fontWeight: 600 }}
          >
            <UploadCloud size={16} /> Upload Corrected Document
          </button>
        </div>
      )}

      {/* Physical Signature Alert */}
      {submission.requires_physical_signature && (
        <div
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <FileCheck size={22} color="#0284c7" />
          <div style={{ fontSize: '14px', color: '#0369a1' }}>
            <strong>Physical Signature Requirement:</strong>{' '}
            {submission.physical_signature_instructions || 'This document requires an in-person physical signature. Reviewer instructions will appear here.'}
          </div>
        </div>
      )}

      {/* Main Grid: Details + Timeline + Chat */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Details & Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 2' }}>
          {/* Metadata Card */}
          <div className="dashboard-card">
            <div className="card-header-bar">
              <h2>Submission Overview</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <PriorityBadge priority={submission.priority} />
                <StatusBadge status={submission.status} />
              </div>
            </div>

            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>Document Type</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '2px' }}>
                    {submission.document_type_name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>Assigned Authority</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '2px' }}>
                    {submission.assigned_faculty_name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>Department & Branch</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)', marginTop: '2px' }}>
                    {submission.department_name} ({submission.branch_name || 'General'})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 600 }}>Target Deadline</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: submission.deadline ? 'var(--gray-900)' : 'var(--gray-400)', marginTop: '2px' }}>
                    {submission.deadline ? new Date(submission.deadline).toLocaleDateString() : 'No hard deadline'}
                  </div>
                </div>
              </div>

              {submission.description && (
                <div style={{ background: 'var(--gray-50)', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-600)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Purpose Description
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-800)', lineHeight: 1.5 }}>
                    {submission.description}
                  </div>
                </div>
              )}

              {/* Uploaded File Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  background: 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <FileText size={28} color="var(--primary-600)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-900)' }}>
                      {submission.file?.file_name || 'Document_Attachment.pdf'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                      Version v{submission.file?.version || 1} • {(submission.file?.file_size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(submission.file?.uploaded_at || submission.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => downloadDocument(submission)}
                  className="btn btn-outline btn-sm"
                >
                  <Download size={14} /> Download File
                </button>
              </div>
            </div>
          </div>

          {/* Workflow Stepper Card */}
          <div className="dashboard-card">
            <div className="card-header-bar">
              <h2>Approval Workflow Progress</h2>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                Current Reviewer: <strong>{submission.current_reviewer_name || submission.assigned_faculty_name}</strong>
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

          {/* Activity Log Audit Trail */}
          <div className="dashboard-card">
            <div className="card-header-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--gray-500)" />
                <h2>Activity Audit Trail</h2>
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

        {/* Right Column: Direct Messaging Thread */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dashboard-card" style={{ height: '620px', display: 'flex', flexDirection: 'column' }}>
            <MessageThread
              submissionId={submission.id}
              recipientName={submission.assigned_faculty_name}
            />
          </div>
        </div>
      </div>

      {/* Upload Corrected Version Modal */}
      <Modal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        title="Upload Corrected Document Version"
      >
        <form onSubmit={handleCorrectionSubmit}>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
            Upload the updated file addressing reviewer feedback for <strong>{submission.title}</strong>.
          </p>

          {correctionError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '13px' }}>
              {correctionError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Select Revised Document <span className="required">*</span>
            </label>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setCorrectionFile(e.target.files[0])}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes on what was revised</label>
            <textarea
              className="form-control"
              placeholder="e.g. Added the requested ethical clearance declaration in Section 4..."
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowCorrectionModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Revised Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

