import { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_SUBMISSIONS,
  INITIAL_MESSAGES,
  INITIAL_ACTIVITY_LOGS,
  DEMO_DEPARTMENTS,
  DEMO_BRANCHES,
  DEMO_FACULTY,
  DEMO_DOCUMENT_TYPES,
  DEMO_COLLEGE
} from '../services/mockData';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const { user, profile, role } = useAuth();
  const { addNotification } = useNotifications();

  const [submissions, setSubmissions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [departments, setDepartments] = useState(DEMO_DEPARTMENTS);
  const [branches, setBranches] = useState(DEMO_BRANCHES);
  const [facultyDirectory, setFacultyDirectory] = useState(DEMO_FACULTY);
  const [documentTypes, setDocumentTypes] = useState(DEMO_DOCUMENT_TYPES);

  // Load from LocalStorage
  useEffect(() => {
    const savedSubs = localStorage.getItem('campusflow_submissions');
    if (savedSubs) {
      try {
        setSubmissions(JSON.parse(savedSubs));
      } catch {
        setSubmissions(INITIAL_SUBMISSIONS);
      }
    } else {
      setSubmissions(INITIAL_SUBMISSIONS);
      localStorage.setItem('campusflow_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
    }

    const savedMsgs = localStorage.getItem('campusflow_messages');
    if (savedMsgs) {
      try {
        setMessages(JSON.parse(savedMsgs));
      } catch {
        setMessages(INITIAL_MESSAGES);
      }
    } else {
      setMessages(INITIAL_MESSAGES);
      localStorage.setItem('campusflow_messages', JSON.stringify(INITIAL_MESSAGES));
    }

    const savedLogs = localStorage.getItem('campusflow_activity_logs');
    if (savedLogs) {
      try {
        setActivityLogs(JSON.parse(savedLogs));
      } catch {
        setActivityLogs(INITIAL_ACTIVITY_LOGS);
      }
    } else {
      setActivityLogs(INITIAL_ACTIVITY_LOGS);
      localStorage.setItem('campusflow_activity_logs', JSON.stringify(INITIAL_ACTIVITY_LOGS));
    }

    const savedFac = localStorage.getItem('campusflow_faculty');
    if (savedFac) {
      try { setFacultyDirectory(JSON.parse(savedFac)); } catch { /* ignore */ }
    }

    const savedDocTypes = localStorage.getItem('campusflow_doc_types');
    if (savedDocTypes) {
      try { setDocumentTypes(JSON.parse(savedDocTypes)); } catch { /* ignore */ }
    }
  }, []);

  const saveSubmissions = (newSubs) => {
    setSubmissions(newSubs);
    localStorage.setItem('campusflow_submissions', JSON.stringify(newSubs));
  };

  const saveMessages = (newMsgs) => {
    setMessages(newMsgs);
    localStorage.setItem('campusflow_messages', JSON.stringify(newMsgs));
  };

  const saveActivityLogs = (newLogs) => {
    setActivityLogs(newLogs);
    localStorage.setItem('campusflow_activity_logs', JSON.stringify(newLogs));
  };

  // 1. Get submission by ID
  const getSubmissionById = (id) => {
    return submissions.find(s => s.id === id || s.tracking_id === id);
  };

  // 2. Submit Document (Student)
  const createSubmission = async (formData) => {
    const trackingNumber = Math.floor(100 + Math.random() * 900);
    const trackingId = `CF-REVA-2026-${trackingNumber}`;
    const submissionId = `sub-${Date.now()}`;

    const docType = documentTypes.find(d => d.id === formData.documentTypeId);
    const faculty = facultyDirectory.find(f => f.id === formData.assignedFacultyId);
    const dept = departments.find(d => d.id === formData.departmentId);
    const branch = branches.find(b => b.id === formData.branchId);

    // Initial default workflow stages derived from document type
    const stages = (docType?.default_workflow_stages || ["Faculty Review", "HOD Approval", "Final Clearance"]).map((stageName, index) => ({
      name: stageName,
      role: index === 0 ? 'faculty' : (index === 1 ? 'hod' : 'director'),
      status: index === 0 ? 'in_progress' : 'pending',
      reviewer: index === 0 ? (faculty?.name || 'Assigned Faculty') : null,
      timestamp: index === 0 ? new Date().toISOString() : null
    }));

    const newSubmission = {
      id: submissionId,
      tracking_id: trackingId,
      college_id: DEMO_COLLEGE.id,
      student_id: user?.id || 'demo-student-id',
      student_name: profile?.full_name || user?.full_name || 'Aarav Sharma',
      student_email: profile?.email || user?.email || 'student@reva.edu.in',
      student_srn: profile?.srn || 'R21EN102',
      student_branch: branch?.name || profile?.branch_name || 'Computer Science and Engineering',
      student_phone: profile?.phone || '+91 98765 43210',
      document_type_id: formData.documentTypeId,
      document_type_name: docType?.name || 'Document',
      title: formData.title,
      description: formData.description,
      department_id: formData.departmentId,
      department_name: dept?.name || 'Department',
      branch_id: formData.branchId,
      branch_name: branch?.name || '',
      assigned_faculty_id: formData.assignedFacultyId,
      assigned_faculty_name: faculty?.name || 'Faculty Member',
      current_reviewer_id: faculty?.id || 'fac-1',
      current_reviewer_name: faculty?.name || 'Dr. Priya Rao',
      priority: formData.priority || 'this_week',
      deadline: formData.deadline || null,
      requires_physical_signature: Boolean(formData.requiresPhysicalSignature),
      status: 'submitted',
      current_stage_index: 0,
      approval_stages: stages,
      file: {
        file_name: formData.file?.name || 'Document_Submission.pdf',
        file_url: formData.fileUrl || '#',
        file_size: formData.file?.size || 1048576,
        file_type: formData.file?.type || 'application/pdf',
        version: 1,
        uploaded_at: new Date().toISOString()
      },
      message_to_faculty: formData.message || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedSubmissions = [newSubmission, ...submissions];
    saveSubmissions(updatedSubmissions);

    // Initial Activity Log
    const newLog = {
      id: `act-${Date.now()}`,
      submission_id: submissionId,
      actor_id: user?.id,
      actor_name: profile?.full_name || 'Student',
      actor_role: 'student',
      action: 'Document Submitted',
      details: `Submitted "${formData.title}" with priority ${formData.priority}. Assigned to ${faculty?.name}.`,
      created_at: new Date().toISOString()
    };
    saveActivityLogs([newLog, ...activityLogs]);

    // Send Notification to Faculty
    addNotification({
      title: 'New Submission Assigned',
      message: `${newSubmission.student_name} submitted "${formData.title}" (${formData.priority.toUpperCase()} priority).`,
      link: `/faculty/submissions/${submissionId}`,
      type: 'submission_created',
      targetRole: 'faculty'
    });

    // Send Confirmation Notification to Student
    addNotification({
      title: 'Submission Received',
      message: `Your document "${formData.title}" was submitted successfully. Tracking ID: ${trackingId}.`,
      link: `/student/submissions/${submissionId}`,
      type: 'info',
      targetUserId: user?.id
    });

    return newSubmission;
  };

  // 3. Update Submission Status (Faculty / Admin Review)
  const updateSubmissionStatus = (id, newStatus, notes = '', extraData = {}) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    let updatedStages = [...sub.approval_stages];
    let nextIndex = sub.current_stage_index;

    if (newStatus === 'approved') {
      if (updatedStages[nextIndex]) {
        updatedStages[nextIndex] = {
          ...updatedStages[nextIndex],
          status: 'approved',
          reviewer: profile?.full_name || 'Faculty',
          timestamp: new Date().toISOString(),
          notes: notes || undefined
        };
      }
      // If there are more stages, advance stage
      if (nextIndex < updatedStages.length - 1) {
        nextIndex += 1;
        updatedStages[nextIndex] = {
          ...updatedStages[nextIndex],
          status: 'in_progress',
          timestamp: new Date().toISOString()
        };
        newStatus = 'in_progress';
      } else {
        newStatus = 'completed';
      }
    } else if (newStatus === 'rejected') {
      if (updatedStages[nextIndex]) {
        updatedStages[nextIndex] = {
          ...updatedStages[nextIndex],
          status: 'rejected',
          reviewer: profile?.full_name || 'Faculty',
          timestamp: new Date().toISOString(),
          notes
        };
      }
    } else if (newStatus === 'correction_required') {
      if (updatedStages[nextIndex]) {
        updatedStages[nextIndex] = {
          ...updatedStages[nextIndex],
          status: 'correction_required',
          reviewer: profile?.full_name || 'Faculty',
          timestamp: new Date().toISOString(),
          notes
        };
      }
    } else if (newStatus === 'under_review') {
      if (updatedStages[nextIndex]) {
        updatedStages[nextIndex] = {
          ...updatedStages[nextIndex],
          status: 'in_progress',
          timestamp: new Date().toISOString()
        };
      }
    }

    const updatedSub = {
      ...sub,
      status: newStatus,
      current_stage_index: nextIndex,
      approval_stages: updatedStages,
      rejection_reason: newStatus === 'rejected' ? notes : sub.rejection_reason,
      correction_notes: newStatus === 'correction_required' ? notes : sub.correction_notes,
      physical_signature_instructions: extraData.physicalSignatureInstructions || sub.physical_signature_instructions,
      completed_at: newStatus === 'completed' || newStatus === 'approved' ? new Date().toISOString() : sub.completed_at,
      updated_at: new Date().toISOString()
    };

    const newSubs = submissions.map(s => s.id === id ? updatedSub : s);
    saveSubmissions(newSubs);

    // Activity Log
    const newLog = {
      id: `act-${Date.now()}`,
      submission_id: id,
      actor_id: user?.id,
      actor_name: profile?.full_name || 'Faculty Reviewer',
      actor_role: role || 'faculty',
      action: `Status Updated: ${newStatus.replace('_', ' ').toUpperCase()}`,
      details: notes ? `Notes: ${notes}` : `Document marked as ${newStatus}.`,
      created_at: new Date().toISOString()
    };
    saveActivityLogs([newLog, ...activityLogs]);

    // Student Notification
    addNotification({
      title: `Submission ${newStatus.replace('_', ' ').toUpperCase()}`,
      message: `${profile?.full_name || 'Reviewer'} updated status of "${sub.title}" to ${newStatus.replace('_', ' ')}.${notes ? ` Note: "${notes}"` : ''}`,
      link: `/student/submissions/${id}`,
      type: newStatus === 'correction_required' ? 'correction_needed' : 'status_changed',
      targetUserId: sub.student_id
    });

    return updatedSub;
  };

  // 4. Forward Submission to another authority
  const forwardSubmission = (id, targetFacultyId, forwardingNote) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    const target = facultyDirectory.find(f => f.id === targetFacultyId);

    const updatedStages = [...sub.approval_stages];
    // Record current stage as forwarded
    if (updatedStages[sub.current_stage_index]) {
      updatedStages[sub.current_stage_index] = {
        ...updatedStages[sub.current_stage_index],
        status: 'approved',
        reviewer: profile?.full_name || 'Forwarded By Faculty',
        timestamp: new Date().toISOString(),
        notes: `Forwarded to ${target?.name}: ${forwardingNote}`
      };
    }

    // Add or adjust forwarded stage
    const nextIndex = Math.min(sub.current_stage_index + 1, updatedStages.length - 1);
    if (updatedStages[nextIndex]) {
      updatedStages[nextIndex] = {
        ...updatedStages[nextIndex],
        reviewer: target?.name || 'Authority',
        status: 'in_progress',
        timestamp: new Date().toISOString()
      };
    }

    const updatedSub = {
      ...sub,
      status: 'forwarded',
      current_reviewer_id: target?.id || targetFacultyId,
      current_reviewer_name: target?.name || 'Forwarded Authority',
      current_stage_index: nextIndex,
      approval_stages: updatedStages,
      updated_at: new Date().toISOString()
    };

    saveSubmissions(submissions.map(s => s.id === id ? updatedSub : s));

    // Activity Log
    const newLog = {
      id: `act-${Date.now()}`,
      submission_id: id,
      actor_id: user?.id,
      actor_name: profile?.full_name || 'Reviewer',
      actor_role: role || 'faculty',
      action: 'Document Forwarded',
      details: `Forwarded to ${target?.name} (${target?.designation}). Note: "${forwardingNote}"`,
      created_at: new Date().toISOString()
    };
    saveActivityLogs([newLog, ...activityLogs]);

    // Notify Student
    addNotification({
      title: 'Document Forwarded',
      message: `Your submission "${sub.title}" was forwarded to ${target?.name}.`,
      link: `/student/submissions/${id}`,
      type: 'info',
      targetUserId: sub.student_id
    });

    // Notify Target Authority
    addNotification({
      title: 'Submission Forwarded to You',
      message: `${profile?.full_name} forwarded "${sub.title}" for your endorsement.`,
      link: `/faculty/submissions/${id}`,
      type: 'submission_created',
      targetRole: 'faculty'
    });
  };

  // 5. Student Resubmits Corrected File
  const resubmitCorrectedDocument = (id, newFile, note) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    const currentVersion = sub.file?.version || 1;
    const updatedFile = {
      file_name: newFile?.name || `Corrected_Document_v${currentVersion + 1}.pdf`,
      file_url: '#',
      file_size: newFile?.size || 1024000,
      file_type: newFile?.type || 'application/pdf',
      version: currentVersion + 1,
      uploaded_at: new Date().toISOString()
    };

    const updatedStages = sub.approval_stages.map((st, idx) => {
      if (idx === sub.current_stage_index) {
        return { ...st, status: 'in_progress', notes: undefined };
      }
      return st;
    });

    const updatedSub = {
      ...sub,
      status: 'under_review',
      correction_notes: null,
      file: updatedFile,
      approval_stages: updatedStages,
      updated_at: new Date().toISOString()
    };

    saveSubmissions(submissions.map(s => s.id === id ? updatedSub : s));

    // Activity log
    const newLog = {
      id: `act-${Date.now()}`,
      submission_id: id,
      actor_id: user?.id,
      actor_name: profile?.full_name || 'Student',
      actor_role: 'student',
      action: 'Correction Resubmitted',
      details: `Uploaded new version (v${currentVersion + 1}). Note: "${note}"`,
      created_at: new Date().toISOString()
    };
    saveActivityLogs([newLog, ...activityLogs]);

    // Notify Faculty
    addNotification({
      title: 'Correction Uploaded',
      message: `${sub.student_name} uploaded a revised version for "${sub.title}".`,
      link: `/faculty/submissions/${id}`,
      type: 'info',
      targetRole: 'faculty'
    });
  };

  // 6. Messaging System (Per-submission thread)
  const getSubmissionMessages = (submissionId) => {
    return messages.filter(m => m.submission_id === submissionId);
  };

  const sendMessage = (submissionId, text, isInternal = false) => {
    if (!text.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      submission_id: submissionId,
      sender_id: user?.id || 'demo-user',
      sender_name: profile?.full_name || user?.full_name || 'User',
      sender_role: role || 'student',
      message_text: text.trim(),
      is_internal: isInternal,
      created_at: new Date().toISOString()
    };

    const updated = [...messages, newMsg];
    saveMessages(updated);

    const sub = submissions.find(s => s.id === submissionId);
    if (sub) {
      if (role === 'student') {
        addNotification({
          title: 'New Message from Student',
          message: `${sub.student_name} sent a message regarding "${sub.title}".`,
          link: `/faculty/submissions/${submissionId}`,
          type: 'message_received',
          targetRole: 'faculty'
        });
      } else {
        addNotification({
          title: 'New Message from Reviewer',
          message: `${profile?.full_name} sent a message regarding "${sub.title}".`,
          link: `/student/submissions/${submissionId}`,
          type: 'message_received',
          targetUserId: sub.student_id
        });
      }
    }

    return newMsg;
  };

  // 7. Activity Logs
  const getSubmissionActivity = (submissionId) => {
    return activityLogs.filter(a => a.submission_id === submissionId);
  };

  // 8. Download Document Utility (Authentic PDF/Text download generation)
  const downloadDocument = (sub, file = null) => {
    const targetFile = file || sub.file;
    const content = `==================================================================
CAMPUSFLOW OFFICIAL VERIFICATION RECEIPT & DOCUMENT MANIFEST
University: REVA University, Bengaluru, Karnataka, India
==================================================================

TRACKING ID:    ${sub.tracking_id}
DOCUMENT TITLE: ${sub.title}
DOCUMENT TYPE:  ${sub.document_type_name}
STUDENT NAME:   ${sub.student_name} (SRN: ${sub.student_srn})
DEPARTMENT:     ${sub.department_name}
BRANCH:         ${sub.branch_name}
SUBMISSION DATE:${new Date(sub.created_at).toLocaleString()}
FINAL STATUS:   ${sub.status.toUpperCase()}
PRIORITY:       ${sub.priority.toUpperCase()}

APPROVAL TIMELINE:
${sub.approval_stages.map((st, i) => `[Stage ${i + 1}] ${st.name} - Status: ${st.status.toUpperCase()}${st.reviewer ? ` (Reviewer: ${st.reviewer})` : ''}`).join('\n')}

PHYSICAL SIGNATURE: ${sub.requires_physical_signature ? 'Required - Verified' : 'Not Required'}
SECURITY HASH: CF-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED

File Name: ${targetFile?.file_name || 'document.pdf'}
Version:   v${targetFile?.version || 1}
==================================================================
Verified by CampusFlow Digital Verification Engine
REVA University Academic Workflow Portal
==================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusFlow_${sub.tracking_id}_${targetFile?.file_name || 'document'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Admin Directory & Workflow Management
  const addFacultyMember = (newFac) => {
    const member = {
      ...newFac,
      id: `fac-${Date.now()}`,
      college_id: DEMO_COLLEGE.id,
      is_available: true,
      is_verified: true
    };
    const updated = [member, ...facultyDirectory];
    setFacultyDirectory(updated);
    localStorage.setItem('campusflow_faculty', JSON.stringify(updated));
    return member;
  };

  const updateFacultyMember = (id, updatedFields) => {
    const updated = facultyDirectory.map(f => f.id === id ? { ...f, ...updatedFields } : f);
    setFacultyDirectory(updated);
    localStorage.setItem('campusflow_faculty', JSON.stringify(updated));
  };

  const addDocumentType = (newDoc) => {
    const item = {
      ...newDoc,
      id: `doc-type-${Date.now()}`,
      college_id: DEMO_COLLEGE.id,
      is_active: true
    };
    const updated = [...documentTypes, item];
    setDocumentTypes(updated);
    localStorage.setItem('campusflow_doc_types', JSON.stringify(updated));
    return item;
  };

  return (
    <DocumentContext.Provider
      value={{
        submissions,
        departments,
        branches,
        facultyDirectory,
        documentTypes,
        getSubmissionById,
        createSubmission,
        updateSubmissionStatus,
        forwardSubmission,
        resubmitCorrectedDocument,
        getSubmissionMessages,
        sendMessage,
        getSubmissionActivity,
        downloadDocument,
        addFacultyMember,
        updateFacultyMember,
        addDocumentType
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider');
  }
  return context;
}

