import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { supabase, isSupabaseConfigured, uploadStudentDocument } from '../services/supabase';
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
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------------------------
  // 1. Initial Data Loading (LocalStorage + Supabase sync)
  // -------------------------------------------------------------------
  useEffect(() => {
    // 1a. Load from local cache first for instant UI response
    const savedSubs = localStorage.getItem('routepulse_submissions') || localStorage.getItem('campusflow_submissions');
    if (savedSubs) {
      try { setSubmissions(JSON.parse(savedSubs)); } catch { setSubmissions(INITIAL_SUBMISSIONS); }
    } else {
      setSubmissions(INITIAL_SUBMISSIONS);
      localStorage.setItem('routepulse_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
    }

    const savedMsgs = localStorage.getItem('routepulse_messages') || localStorage.getItem('campusflow_messages');
    if (savedMsgs) {
      try { setMessages(JSON.parse(savedMsgs)); } catch { setMessages(INITIAL_MESSAGES); }
    } else {
      setMessages(INITIAL_MESSAGES);
      localStorage.setItem('routepulse_messages', JSON.stringify(INITIAL_MESSAGES));
    }

    const savedLogs = localStorage.getItem('routepulse_activity_logs') || localStorage.getItem('campusflow_activity_logs');
    if (savedLogs) {
      try { setActivityLogs(JSON.parse(savedLogs)); } catch { setActivityLogs(INITIAL_ACTIVITY_LOGS); }
    } else {
      setActivityLogs(INITIAL_ACTIVITY_LOGS);
      localStorage.setItem('routepulse_activity_logs', JSON.stringify(INITIAL_ACTIVITY_LOGS));
    }

    const savedFac = localStorage.getItem('routepulse_faculty') || localStorage.getItem('campusflow_faculty');
    if (savedFac) {
      try { setFacultyDirectory(JSON.parse(savedFac)); } catch { /* ignore */ }
    } else {
      setFacultyDirectory(DEMO_FACULTY);
    }

    const savedBranches = localStorage.getItem('routepulse_branches') || localStorage.getItem('campusflow_branches');
    if (savedBranches) {
      try { setBranches(JSON.parse(savedBranches)); } catch { /* ignore */ }
    } else {
      setBranches(DEMO_BRANCHES);
    }

    const savedDocTypes = localStorage.getItem('routepulse_doc_types') || localStorage.getItem('campusflow_doc_types');
    if (savedDocTypes) {
      try { setDocumentTypes(JSON.parse(savedDocTypes)); } catch { /* ignore */ }
    } else {
      setDocumentTypes(DEMO_DOCUMENT_TYPES);
    }

    // 1b. If Supabase is configured, fetch live database records
    if (isSupabaseConfigured && supabase) {
      fetchLiveDatabase();
      setupRealtimeSubscriptions();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch live tables from Supabase
  const fetchLiveDatabase = async () => {
    try {
      setLoading(true);
      // Fetch branches for REVA University
      const { data: branchData } = await supabase
        .from('branches')
        .select('*')
        .order('name');
      if (branchData && branchData.length > 0) setBranches(branchData);

      // Fetch faculty directory
      const { data: facData } = await supabase
        .from('faculty_directory')
        .select('*')
        .eq('is_available', true);
      if (facData && facData.length > 0) setFacultyDirectory(facData);

      // Fetch document types
      const { data: dtData } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true);
      if (dtData && dtData.length > 0) setDocumentTypes(dtData);

      // Fetch submissions
      const { data: subData } = await supabase
        .from('submissions')
        .select(`
          *,
          submission_files (*)
        `)
        .order('created_at', { ascending: false });
      if (subData && subData.length > 0) {
        setSubmissions(subData);
        localStorage.setItem('routepulse_submissions', JSON.stringify(subData));
      }

      // Fetch messages
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (msgData && msgData.length > 0) {
        setMessages(msgData);
        localStorage.setItem('routepulse_messages', JSON.stringify(msgData));
      }
    } catch (err) {
      console.warn('Live database fetch warning, running with cached data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // 2. Real-Time Supabase Subscriptions
  // -------------------------------------------------------------------
  const setupRealtimeSubscriptions = () => {
    if (!supabase || !isSupabaseConfigured) return;

    // Listen to changes in submissions table
    const subChannel = supabase
      .channel('public:submissions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSubmissions(prev => [payload.new, ...prev.filter(s => s.id !== payload.new.id)]);
          } else if (payload.eventType === 'UPDATE') {
            setSubmissions(prev => prev.map(s => s.id === payload.new.id ? { ...s, ...payload.new } : s));
          } else if (payload.eventType === 'DELETE') {
            setSubmissions(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Listen to changes in messages table
    const msgChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subChannel);
      supabase.removeChannel(msgChannel);
    };
  };

  const saveSubmissions = (newSubs) => {
    setSubmissions(newSubs);
    localStorage.setItem('routepulse_submissions', JSON.stringify(newSubs));
  };

  const saveMessages = (newMsgs) => {
    setMessages(newMsgs);
    localStorage.setItem('routepulse_messages', JSON.stringify(newMsgs));
  };

  const saveActivityLogs = (newLogs) => {
    setActivityLogs(newLogs);
    localStorage.setItem('routepulse_activity_logs', JSON.stringify(newLogs));
  };

  // -------------------------------------------------------------------
  // 3. Dynamic Faculty Filter by Branch (Faculty, HOD, Director)
  // -------------------------------------------------------------------
  const getFacultyForBranch = useCallback((branchId, departmentId = null) => {
    if (!branchId && !departmentId) return facultyDirectory;

    return facultyDirectory.filter((fac) => {
      // 1. Exact branch match
      if (branchId && fac.branch_id === branchId) return true;

      // 2. Department match for leadership (HOD, Director, Dean) who serve the whole department
      if (departmentId && fac.department_id === departmentId) {
        const isLeadership = fac.designation?.toLowerCase().includes('hod') ||
                             fac.designation?.toLowerCase().includes('head') ||
                             fac.designation?.toLowerCase().includes('director') ||
                             fac.role === 'hod' ||
                             fac.role === 'director';
        return isLeadership;
      }

      return false;
    });
  }, [facultyDirectory]);

  // 4. Get submission by ID
  const getSubmissionById = useCallback((id) => {
    return submissions.find(s => s.id === id || s.tracking_id === id);
  }, [submissions]);

  // -------------------------------------------------------------------
  // 5. Submit Document (Student Submission Flow)
  // -------------------------------------------------------------------
  const createSubmission = async (formData) => {
    const trackingNumber = Math.floor(100 + Math.random() * 900);
    const trackingId = `RP-REVA-2026-${trackingNumber}`;
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

    // Step A: Upload File to Supabase Private Bucket 'student-documents' (with fallback)
    let uploadedFileMeta = {
      file_name: formData.file?.name || 'Document_Submission.pdf',
      file_url: '#',
      file_size: formData.file?.size || 1048576,
      file_type: formData.file?.type || 'application/pdf',
      version: 1,
      uploaded_at: new Date().toISOString()
    };

    if (formData.file) {
      try {
        const uploadRes = await uploadStudentDocument(
          formData.file,
          DEMO_COLLEGE.id,
          submissionId
        );
        if (uploadRes?.success) {
          uploadedFileMeta = {
            file_name: uploadRes.file_name,
            file_url: uploadRes.file_url,
            file_size: uploadRes.file_size,
            file_type: uploadRes.file_type,
            storage_path: uploadRes.storage_path,
            version: 1,
            uploaded_at: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('Storage upload encountered an issue, using fallback:', err.message);
      }
    }

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
      description: formData.description || '',
      department_id: formData.departmentId,
      department_name: dept?.name || 'Department',
      branch_id: formData.branchId || null,
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
      file: uploadedFileMeta,
      message_to_faculty: formData.message || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Step B: If Supabase Live is connected, insert into database tables
    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Insert into submissions table
        await supabase.from('submissions').insert({
          id: submissionId,
          tracking_id: trackingId,
          college_id: DEMO_COLLEGE.id,
          student_id: user?.id,
          document_type_id: formData.documentTypeId,
          title: formData.title,
          description: formData.description,
          department_id: formData.departmentId,
          branch_id: formData.branchId || null,
          assigned_faculty_id: formData.assignedFacultyId,
          current_reviewer_id: faculty?.id,
          priority: formData.priority || 'this_week',
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          requires_physical_signature: Boolean(formData.requiresPhysicalSignature),
          status: 'submitted',
          approval_stages: stages
        });

        // 2. Insert into submission_files table
        await supabase.from('submission_files').insert({
          submission_id: submissionId,
          college_id: DEMO_COLLEGE.id,
          file_name: uploadedFileMeta.file_name,
          file_url: uploadedFileMeta.file_url,
          file_size: uploadedFileMeta.file_size,
          file_type: uploadedFileMeta.file_type,
          version: 1,
          uploaded_by: user?.id
        });

        // 3. Insert into messages table if initial message provided
        if (formData.message?.trim()) {
          await supabase.from('messages').insert({
            submission_id: submissionId,
            college_id: DEMO_COLLEGE.id,
            sender_id: user?.id,
            sender_name: profile?.full_name || 'Student',
            sender_role: 'student',
            message_text: formData.message.trim(),
            is_internal: false
          });
        }
      } catch (err) {
        console.warn('Supabase DB insert note:', err.message);
      }
    }

    // Step C: Update Local State & Storage
    const updatedSubmissions = [newSubmission, ...submissions];
    saveSubmissions(updatedSubmissions);

    // Initial Message Record in local state
    if (formData.message?.trim()) {
      const initialMsg = {
        id: `msg-${Date.now()}`,
        submission_id: submissionId,
        sender_id: user?.id || 'demo-student-id',
        sender_name: profile?.full_name || user?.full_name || 'Aarav Sharma',
        sender_role: 'student',
        message_text: formData.message.trim(),
        is_internal: false,
        created_at: new Date().toISOString()
      };
      saveMessages([...messages, initialMsg]);
    }

    // Initial Activity Log
    const newLog = {
      id: `act-${Date.now()}`,
      submission_id: submissionId,
      actor_id: user?.id,
      actor_name: profile?.full_name || 'Student',
      actor_role: 'student',
      action: 'Document Submitted',
      details: `Submitted "${formData.title}" (${formData.priority.toUpperCase()} priority). Assigned to ${faculty?.name}.`,
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

  // -------------------------------------------------------------------
  // 6. Update Submission Status (Faculty Actions: In Progress, Approve, Reject, Physical Sig)
  // -------------------------------------------------------------------
  const updateSubmissionStatus = async (id, newStatus, notes = '', extraData = {}) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    let updatedStages = [...sub.approval_stages];
    let nextIndex = sub.current_stage_index;

    if (newStatus === 'approved') {
      if (updatedStages[nextIndex]) {
        updatedStages[nextIndex] = {
          ...updatedStages[nextIndex],
          status: 'approved',
          reviewer: profile?.full_name || 'Faculty Reviewer',
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
          reviewer: profile?.full_name || 'Faculty Reviewer',
          timestamp: new Date().toISOString(),
          notes
        };
      }
    } else if (newStatus === 'in_progress') {
      if (updatedStages[nextIndex]) {
        updatedStages[nextIndex] = {
          ...updatedStages[nextIndex],
          status: 'in_progress',
          reviewer: profile?.full_name || 'Faculty Reviewer',
          timestamp: new Date().toISOString(),
          notes: notes || undefined
        };
      }
    } else if (newStatus === 'correction_required') {
      if (updatedStages[nextIndex]) {
        updatedStages[nextIndex] = {
          ...updatedStages[nextIndex],
          status: 'correction_required',
          reviewer: profile?.full_name || 'Faculty Reviewer',
          timestamp: new Date().toISOString(),
          notes
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
      requires_physical_signature: extraData.requiresPhysicalSignature !== undefined ? extraData.requiresPhysicalSignature : sub.requires_physical_signature,
      physical_signature_instructions: extraData.physicalSignatureInstructions || sub.physical_signature_instructions,
      completed_at: newStatus === 'completed' || newStatus === 'approved' ? new Date().toISOString() : sub.completed_at,
      updated_at: new Date().toISOString()
    };

    // Update Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('submissions')
          .update({
            status: newStatus,
            current_stage_index: nextIndex,
            approval_stages: updatedStages,
            rejection_reason: updatedSub.rejection_reason,
            correction_notes: updatedSub.correction_notes,
            requires_physical_signature: updatedSub.requires_physical_signature,
            physical_signature_instructions: updatedSub.physical_signature_instructions,
            completed_at: updatedSub.completed_at,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        // Record in approval_steps table
        await supabase.from('approval_steps').insert({
          submission_id: id,
          college_id: DEMO_COLLEGE.id,
          stage_name: updatedStages[nextIndex]?.name || 'Review Stage',
          reviewer_role: role || 'faculty',
          reviewer_id: user?.id,
          reviewer_name: profile?.full_name || 'Reviewer',
          status: newStatus,
          decision_notes: notes || null
        });
      } catch (err) {
        console.warn('Supabase status update note:', err.message);
      }
    }

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
      details: notes ? `Notes: ${notes}` : `Document marked as ${newStatus.replace('_', ' ')}.`,
      created_at: new Date().toISOString()
    };
    saveActivityLogs([newLog, ...activityLogs]);

    // Student Notification
    addNotification({
      title: `Submission ${newStatus.replace('_', ' ').toUpperCase()}`,
      message: `${profile?.full_name || 'Reviewer'} updated status of "${sub.title}" to ${newStatus.replace('_', ' ')}.${notes ? ` Note: "${notes}"` : ''}`,
      link: `/student/submissions/${id}`,
      type: newStatus === 'correction_required' ? 'correction_needed' : (newStatus === 'rejected' ? 'danger' : 'status_changed'),
      targetUserId: sub.student_id
    });

    return updatedSub;
  };

  // -------------------------------------------------------------------
  // 7. Forward Submission
  // -------------------------------------------------------------------
  const forwardSubmission = async (id, targetFacultyId, forwardingNote) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    const target = facultyDirectory.find(f => f.id === targetFacultyId);

    const updatedStages = [...sub.approval_stages];
    if (updatedStages[sub.current_stage_index]) {
      updatedStages[sub.current_stage_index] = {
        ...updatedStages[sub.current_stage_index],
        status: 'approved',
        reviewer: profile?.full_name || 'Forwarded By Faculty',
        timestamp: new Date().toISOString(),
        notes: `Forwarded to ${target?.name}: ${forwardingNote}`
      };
    }

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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('submissions')
          .update({
            status: 'forwarded',
            current_reviewer_id: target?.id || targetFacultyId,
            current_stage_index: nextIndex,
            approval_stages: updatedStages,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase forward note:', err.message);
      }
    }

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

    // Notifications
    addNotification({
      title: 'Document Forwarded',
      message: `Your submission "${sub.title}" was forwarded to ${target?.name}.`,
      link: `/student/submissions/${id}`,
      type: 'info',
      targetUserId: sub.student_id
    });

    addNotification({
      title: 'Submission Forwarded to You',
      message: `${profile?.full_name} forwarded "${sub.title}" for your endorsement.`,
      link: `/faculty/submissions/${id}`,
      type: 'submission_created',
      targetRole: 'faculty'
    });
  };

  // -------------------------------------------------------------------
  // 8. Student Resubmits Corrected File
  // -------------------------------------------------------------------
  const resubmitCorrectedDocument = async (id, newFile, note) => {
    const sub = submissions.find(s => s.id === id);
    if (!sub) return;

    const currentVersion = sub.file?.version || 1;
    let fileMeta = {
      file_name: newFile?.name || `Corrected_Document_v${currentVersion + 1}.pdf`,
      file_url: '#',
      file_size: newFile?.size || 1024000,
      file_type: newFile?.type || 'application/pdf',
      version: currentVersion + 1,
      uploaded_at: new Date().toISOString()
    };

    if (newFile) {
      try {
        const uploadRes = await uploadStudentDocument(newFile, DEMO_COLLEGE.id, id);
        if (uploadRes?.success) {
          fileMeta.file_url = uploadRes.file_url;
        }
      } catch (e) {
        console.warn('Resubmit upload fallback:', e.message);
      }
    }

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
      file: fileMeta,
      approval_stages: updatedStages,
      updated_at: new Date().toISOString()
    };

    saveSubmissions(submissions.map(s => s.id === id ? updatedSub : s));

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

    addNotification({
      title: 'Correction Uploaded',
      message: `${sub.student_name} uploaded a revised version for "${sub.title}".`,
      link: `/faculty/submissions/${id}`,
      type: 'info',
      targetRole: 'faculty'
    });
  };

  // -------------------------------------------------------------------
  // 9. Messaging System (Per-Submission Conversation Thread)
  // -------------------------------------------------------------------
  const getSubmissionMessages = useCallback((submissionId) => {
    return messages.filter(m => m.submission_id === submissionId);
  }, [messages]);

  const sendMessage = async (submissionId, text, isInternal = false) => {
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

    // Supabase insert if live
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').insert({
          submission_id: submissionId,
          college_id: DEMO_COLLEGE.id,
          sender_id: user?.id,
          sender_name: newMsg.sender_name,
          sender_role: newMsg.sender_role,
          message_text: newMsg.message_text,
          is_internal: isInternal
        });
      } catch (err) {
        console.warn('Supabase message insert note:', err.message);
      }
    }

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
        if (!isInternal) {
          addNotification({
            title: 'New Message from Reviewer',
            message: `${profile?.full_name} sent a message regarding "${sub.title}".`,
            link: `/student/submissions/${submissionId}`,
            type: 'message_received',
            targetUserId: sub.student_id
          });
        }
      }
    }

    return newMsg;
  };

  const getSubmissionActivity = useCallback((submissionId) => {
    return activityLogs.filter(a => a.submission_id === submissionId);
  }, [activityLogs]);

  // Download Document Receipt Utility
  const downloadDocument = (sub, file = null) => {
    const targetFile = file || sub.file;
    const content = `==================================================================
ROUTEPULSE OFFICIAL VERIFICATION RECEIPT & DOCUMENT MANIFEST
Fast, Trackable Approvals from Submission to Signature
University: REVA University, Bengaluru, Karnataka, India
==================================================================

TRACKING ID:    ${sub.tracking_id}
DOCUMENT TITLE: ${sub.title}
DOCUMENT TYPE:  ${sub.document_type_name}
STUDENT NAME:   ${sub.student_name} (SRN: ${sub.student_srn})
DEPARTMENT:     ${sub.department_name}
BRANCH:         ${sub.branch_name}
STUDENT PHONE:  ${sub.student_phone || 'N/A'}
SUBMISSION DATE:${new Date(sub.created_at).toLocaleString()}
FINAL STATUS:   ${sub.status.toUpperCase()}
PRIORITY:       ${sub.priority.toUpperCase()}

APPROVAL TIMELINE:
${sub.approval_stages.map((st, i) => `[Stage ${i + 1}] ${st.name} - Status: ${st.status.toUpperCase()}${st.reviewer ? ` (Reviewer: ${st.reviewer})` : ''}`).join('\n')}

PHYSICAL SIGNATURE: ${sub.requires_physical_signature ? 'Required' : 'Not Required'}
SECURITY HASH: RP-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED

File Name: ${targetFile?.file_name || 'document.pdf'}
Version:   v${targetFile?.version || 1}
==================================================================
Verified by RoutePulse Digital Verification Engine
REVA University Academic Workflow Portal
==================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RoutePulse_${sub.tracking_id}_${targetFile?.file_name || 'document'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DocumentContext.Provider
      value={{
        submissions,
        departments,
        branches,
        facultyDirectory,
        documentTypes,
        loading,
        getSubmissionById,
        getFacultyForBranch,
        createSubmission,
        updateSubmissionStatus,
        forwardSubmission,
        resubmitCorrectedDocument,
        getSubmissionMessages,
        sendMessage,
        getSubmissionActivity,
        downloadDocument
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
