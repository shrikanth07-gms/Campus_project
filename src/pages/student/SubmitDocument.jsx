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
  ArrowLeft,
  X,
  User,
  Shield,
  Building,
  GitBranch,
  Send,
  Flame,
  CalendarDays
} from 'lucide-react';

export default function SubmitDocument() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const {
    departments,
    branches,
    facultyDirectory,
    documentTypes,
    getFacultyForBranch,
    createSubmission
  } = useDocuments();

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
  const [priority, setPriority] = useState('this_week'); // 'urgent' | 'this_week' | 'this_month'
  const [requiresPhysicalSignature, setRequiresPhysicalSignature] = useState(false);

  // Status & Validation
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Initialize department & branch defaults
  useEffect(() => {
    const prefillFacultyId = searchParams.get('facultyId');
    if (prefillFacultyId) {
      const foundFac = facultyDirectory.find(f => f.id === prefillFacultyId);
      if (foundFac) {
        setAssignedFacultyId(foundFac.id);
        if (foundFac.department_id) setDepartmentId(foundFac.department_id);
        if (foundFac.branch_id) setBranchId(foundFac.branch_id);
      }
    } else {
      if (departments.length > 0 && !departmentId) {
        setDepartmentId(departments[0].id);
      }
    }
  }, [searchParams, facultyDirectory, departments]);

  // When department changes, default to first branch of that department if available
  useEffect(() => {
    if (departmentId) {
      const deptsBranches = branches.filter(b => b.department_id === departmentId);
      if (deptsBranches.length > 0 && (!branchId || !deptsBranches.some(b => b.id === branchId))) {
        setBranchId(deptsBranches[0].id);
      }
    }
  }, [departmentId, branches]);

  // 1. Dynamic Branch & Faculty Filtering
  const availableBranches = branches.filter(b => !departmentId || b.department_id === departmentId);
  const availableFaculty = getFacultyForBranch(branchId, departmentId);

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
    if (!branchId) {
      setError('Please select your academic branch.');
      return;
    }
    if (!assignedFacultyId) {
      setError('Please select an authorized faculty member, HOD, or Director.');
      return;
    }
    if (!file) {
      setError('Please attach the required document file (PDF or DOCX).');
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
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Top Header */}
      <div className="page-header">
        <div className="page-title-group">
          <Link
            to="/student"
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
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1>Submit Document for University Approval</h1>
          <p>
            Route academic documents to authorized Faculty, HODs, and Directors at REVA University.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            color: '#b91c1c',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="dashboard-card" style={{ padding: '30px' }}>
        {/* Section 1: Document Classification */}
        <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilePlus size={18} color="var(--primary-600)" />
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
                Document Category / Type <span className="required">*</span>
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
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Purpose / Description</label>
            <textarea
              className="form-control"
              placeholder="State the academic purpose or context of this document..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Section 2: Dynamic Branch & Faculty Selection */}
        <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="var(--primary-600)" />
            2. Department, Branch & Recipient Authority
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                Select Department / School <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
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
              <label className="form-label">
                Select Academic Branch <span className="required">*</span>
              </label>
              <select
                className="form-control"
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setAssignedFacultyId('');
                }}
                required
              >
                <option value="">-- Select Branch --</option>
                {availableBranches.map((br) => (
                  <option key={br.id} value={br.id}>
                    {br.name} ({br.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recipient Authority Dropdown */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Select Recipient Authority (Faculty, HOD, Director) <span className="required">*</span>
            </label>
            <select
              className="form-control"
              value={assignedFacultyId}
              onChange={(e) => setAssignedFacultyId(e.target.value)}
              required
            >
              <option value="">-- Select Registered Authority for this Branch --</option>
              {availableFaculty.map((fac) => {
                let roleTag = '[Faculty]';
                if (fac.designation?.toLowerCase().includes('director') || fac.role === 'director') roleTag = '[Director]';
                else if (fac.designation?.toLowerCase().includes('hod') || fac.designation?.toLowerCase().includes('head') || fac.role === 'hod') roleTag = '[HOD]';
                else if (fac.designation?.toLowerCase().includes('coordinator')) roleTag = '[Class Coordinator]';

                return (
                  <option key={fac.id} value={fac.id}>
                    {roleTag} {fac.name} — {fac.designation} ({fac.office_location || 'Campus'})
                  </option>
                );
              })}
            </select>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '6px' }}>
              Populated dynamically based on your branch and department selection.
            </div>
          </div>
        </div>

        {/* Section 3: Priority Tagging & Individual Deadline Picker */}
        <div style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--primary-600)" />
            3. Submission Priority & Deadline
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Priority Selector with Visual Tags */}
            <div className="form-group">
              <label className="form-label">
                Priority Level <span className="required">*</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${priority === 'urgent' ? '#ef4444' : '#e2e8f0'}`,
                    backgroundColor: priority === 'urgent' ? '#fef2f2' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="priorityRadio"
                    value="urgent"
                    checked={priority === 'urgent'}
                    onChange={() => setPriority('urgent')}
                  />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#dc2626',
                      backgroundColor: '#fee2e2',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #fca5a5'
                    }}
                  >
                    <Flame size={13} /> URGENT (Red tag)
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Time-sensitive action</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${priority === 'this_week' ? '#f59e0b' : '#e2e8f0'}`,
                    backgroundColor: priority === 'this_week' ? '#fffbeb' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="priorityRadio"
                    value="this_week"
                    checked={priority === 'this_week'}
                    onChange={() => setPriority('this_week')}
                  />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#d97706',
                      backgroundColor: '#fef3c7',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #fde68a'
                    }}
                  >
                    <Clock size={13} /> THIS WEEK (Yellow tag)
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Standard processing</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1.5px solid ${priority === 'this_month' ? '#10b981' : '#e2e8f0'}`,
                    backgroundColor: priority === 'this_month' ? '#ecfdf5' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="priorityRadio"
                    value="this_month"
                    checked={priority === 'this_month'}
                    onChange={() => setPriority('this_month')}
                  />
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#15803d',
                      backgroundColor: '#dcfce7',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #86efac'
                    }}
                  >
                    <CalendarDays size={13} /> THIS MONTH (Green tag)
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Routine request</span>
                </label>
              </div>
            </div>

            {/* Individual Datetime Deadline Picker */}
            <div className="form-group">
              <label className="form-label">
                Required Completion Deadline (Datetime)
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '6px' }}>
                Specify target date and time for review completion.
              </div>

              {/* Physical Signature Option */}
              <div style={{ marginTop: '20px' }}>
                <label className="form-label">Physical In-Person Signature</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', height: '40px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sigOption"
                      checked={requiresPhysicalSignature === true}
                      onChange={() => setRequiresPhysicalSignature(true)}
                    />
                    Yes (Physical verification required)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="sigOption"
                      checked={requiresPhysicalSignature === false}
                      onChange={() => setRequiresPhysicalSignature(false)}
                    />
                    No (Digital clearance only)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: File Upload & Initial Message */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={18} color="var(--primary-600)" />
            4. Document File Upload & Initial Message
          </h3>

          <div className="form-group">
            <label className="form-label">
              Upload Document File (PDF / DOCX) <span className="required">*</span>
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
                  Click to select file or drag and drop your document here
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '6px' }}>
                  Uploaded to private bucket <strong>student-documents</strong> (PDF, DOCX, DOC, JPG, PNG up to 15MB)
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
                  <FileCheck size={26} color="var(--primary-600)" />
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
            <label className="form-label">
              Initial Message / Note to Faculty Recipient
            </label>
            <textarea
              className="form-control"
              placeholder="State any specific guidelines, urgency justifications, or queries for the recipient..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
              This will automatically initiate the private message thread in the <code>messages</code> table.
            </div>
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
            style={{ minWidth: '180px' }}
          >
            {isSubmitting ? (
              <span>Submitting Document...</span>
            ) : (
              <>
                <Send size={15} /> Submit for Approval
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
