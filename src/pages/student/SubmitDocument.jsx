import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';
import {
  FilePlus,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  X
} from 'lucide-react';

export default function SubmitDocument() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { departments, branches, facultyDirectory, documentTypes, createSubmission } = useDocuments();

  // Form State
  const [title, setTitle] = useState('');
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [assignedFacultyId, setAssignedFacultyId] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('this_week');
  const [requiresPhysicalSignature, setRequiresPhysicalSignature] = useState(false);

  // Status & Validation
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Prepopulate from query parameters if coming from Faculty Directory
  useEffect(() => {
    const prefillFacultyId = searchParams.get('facultyId');
    if (prefillFacultyId) {
      const foundFac = facultyDirectory.find(f => f.id === prefillFacultyId);
      if (foundFac) {
        setAssignedFacultyId(foundFac.id);
        if (foundFac.department_id) setDepartmentId(foundFac.department_id);
        if (foundFac.branch_id) setBranchId(foundFac.branch_id);
      }
    } else if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  }, [searchParams, facultyDirectory, departments]);

  // Handle Document Type change: auto-configure default priority & signature requirements
  const handleDocTypeChange = (e) => {
    const typeId = e.target.value;
    setDocumentTypeId(typeId);
    const selected = documentTypes.find(d => d.id === typeId);
    if (selected) {
      if (selected.default_priority) setPriority(selected.default_priority);
      if (selected.requires_physical_signature !== undefined) {
        setRequiresPhysicalSignature(selected.requires_physical_signature);
      }
    }
  };

  // Filter branches and faculty based on selected department
  const filteredBranches = branches.filter(b => !departmentId || b.department_id === departmentId);
  const filteredFaculty = facultyDirectory.filter(f => !departmentId || f.department_id === departmentId);

  // Handle File Input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setFileError(null);
    if (!selectedFile) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('Invalid file format. Please upload PDF, DOC, DOCX, JPG, or PNG.');
      return;
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (selectedFile.size > maxSize) {
      setFileError('File size exceeds the 15MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Document title is required.');
      return;
    }
    if (!documentTypeId) {
      setError('Please select a document type.');
      return;
    }
    if (!departmentId) {
      setError('Please select the receiving department.');
      return;
    }
    if (!assignedFacultyId) {
      setError('Please select an authorized faculty member or authority.');
      return;
    }
    if (!file) {
      setError('Please attach the required document file.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createSubmission({
        title,
        documentTypeId,
        description,
        departmentId,
        branchId,
        assignedFacultyId,
        file,
        message,
        deadline,
        priority,
        requiresPhysicalSignature
      });

      setIsSubmitting(false);
      navigate(`/student/submissions/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit document. Please check your inputs.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Top Header */}
      <div className="page-header">
        <div className="page-title-group">
          <Link to="/student" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--primary-600)', textDecoration: 'none', marginBottom: '8px' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1>Submit Document for Approval</h1>
          <p>
            Create an independent submission with tracking, deadline, priority, and direct faculty routing.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', color: '#b91c1c', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="dashboard-card" style={{ padding: '30px' }}>
        {/* Section 1: Document Details */}
        <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '18px' }}>
            1. Document Classification
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">
                Document Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. NOC for Microsoft Summer Internship 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Document Type <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={documentTypeId}
                onChange={handleDocTypeChange}
                required
              >
                <option value="">-- Select Document Type --</option>
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Purpose / Description</label>
            <textarea
              className="form-control"
              placeholder="Provide context regarding this document request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Section 2: Department & Authority Routing */}
        <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '18px' }}>
            2. Routing & Receiving Authority
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">
                Department <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setBranchId('');
                  setAssignedFacultyId('');
                }}
                required
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Branch / Specialization</label>
              <select
                className="form-control"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                <option value="">-- Select Branch (Optional) --</option>
                {filteredBranches.map((br) => (
                  <option key={br.id} value={br.id}>
                    {br.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Select Faculty / Authority <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={assignedFacultyId}
                onChange={(e) => setAssignedFacultyId(e.target.value)}
                required
              >
                <option value="">-- Select Faculty / Reviewer --</option>
                {filteredFaculty.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} — {fac.designation}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Priority, Deadline & Physical Signature */}
        <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '18px' }}>
            3. Workflow Priority & Requirements
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="urgent">🔴 Urgent (Immediate Attention)</option>
                <option value="this_week">🟡 This Week (Normal Processing)</option>
                <option value="this_month">🟢 This Month (Standard Routine)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Completion Deadline</label>
              <input
                type="date"
                className="form-control"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Signature Required?</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', height: '44px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="sigRequired"
                    checked={requiresPhysicalSignature === true}
                    onChange={() => setRequiresPhysicalSignature(true)}
                  />
                  Yes (In-person)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="sigRequired"
                    checked={requiresPhysicalSignature === false}
                    onChange={() => setRequiresPhysicalSignature(false)}
                  />
                  No (Digital Only)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: File Upload & Initial Message */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '18px' }}>
            4. Attach Document & Message
          </h3>

          <div className="form-group">
            <label className="form-label">
              Upload Document File <span className="required">*</span>
            </label>

            {!file ? (
              <label className="file-dropzone" style={{ display: 'block' }}>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="dropzone-icon">
                  <UploadCloud size={28} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--gray-800)' }}>
                  Click to browse or drag and drop your file here
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '6px' }}>
                  Supported formats: PDF, DOCX, DOC, JPG, PNG (Max: 15MB)
                </div>
              </label>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: 'var(--primary-50)',
                  border: '1px solid var(--primary-100)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileCheck size={24} color="var(--primary-600)" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gray-900)' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Document'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger-500)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {fileError && (
              <div style={{ fontSize: '12px', color: 'var(--danger-500)', marginTop: '6px' }}>
                {fileError}
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Message / Note to Faculty Reviewer</label>
            <textarea
              className="form-control"
              placeholder="Add any specific context, urgency reasons, or instructions for the faculty member..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px', borderTop: '1px solid var(--gray-200)', paddingTop: '20px' }}>
          <Link to="/student" className="btn btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ minWidth: '160px' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Document'}
          </button>
        </div>
      </form>
    </div>
  );
}

