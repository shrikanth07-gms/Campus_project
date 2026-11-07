// =====================================================================
// CampusFlow: Mock & Seed Data (REVA University, Bengaluru)
// Clearly labelled demonstration data for testing & offline evaluation.
// =====================================================================

export const DEMO_COLLEGE = {
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  name: "REVA University",
  slug: "reva",
  code: "REVA-BLR",
  address: "Rukmini Knowledge Park, Kattigenahalli, Yelahanka",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  website: "https://www.reva.edu.in",
  is_active: true
};

export const DEMO_DEPARTMENTS = [
  {
    id: "dept-1",
    college_id: DEMO_COLLEGE.id,
    name: "School of Computing & Information Technology",
    code: "SOCIT"
  },
  {
    id: "dept-2",
    college_id: DEMO_COLLEGE.id,
    name: "School of Electronics & Communication Engineering",
    code: "ECE"
  },
  {
    id: "dept-3",
    college_id: DEMO_COLLEGE.id,
    name: "School of Mechanical Engineering",
    code: "MECH"
  },
  {
    id: "dept-4",
    college_id: DEMO_COLLEGE.id,
    name: "School of Management Studies",
    code: "SOM"
  }
];

export const DEMO_BRANCHES = [
  {
    id: "branch-1",
    department_id: "dept-1",
    college_id: DEMO_COLLEGE.id,
    name: "Computer Science and Engineering",
    code: "CSE"
  },
  {
    id: "branch-2",
    department_id: "dept-1",
    college_id: DEMO_COLLEGE.id,
    name: "Artificial Intelligence & Data Science",
    code: "AI-DS"
  },
  {
    id: "branch-3",
    department_id: "dept-2",
    college_id: DEMO_COLLEGE.id,
    name: "Electronics & Communication Engineering",
    code: "ECE"
  },
  {
    id: "branch-4",
    department_id: "dept-3",
    college_id: DEMO_COLLEGE.id,
    name: "Mechanical Engineering",
    code: "MECH"
  },
  {
    id: "branch-5",
    department_id: "dept-4",
    college_id: DEMO_COLLEGE.id,
    name: "Master of Business Administration",
    code: "MBA"
  }
];

export const DEMO_FACULTY = [
  {
    id: "fac-1",
    college_id: DEMO_COLLEGE.id,
    name: "Dr. Priya Rao (Demo Faculty)",
    email: "priya.rao.demo@reva.edu.in",
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    designation: "Class Coordinator / Assistant Professor",
    office_location: "SOCIT Block, 3rd Floor, Room 304",
    is_available: true,
    is_verified: true
  },
  {
    id: "fac-2",
    college_id: DEMO_COLLEGE.id,
    name: "Dr. Suresh Kumar (Demo HOD)",
    email: "suresh.kumar.demo@reva.edu.in",
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    designation: "Head of Department (HOD)",
    office_location: "SOCIT Block, Ground Floor, Room 101",
    is_available: true,
    is_verified: true
  },
  {
    id: "fac-3",
    college_id: DEMO_COLLEGE.id,
    name: "Dr. Ramesh Chandra (Demo Director)",
    email: "ramesh.chandra.demo@reva.edu.in",
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    designation: "Director - School of CIT",
    office_location: "Administrative Block, Floor 2, Director Suite",
    is_available: true,
    is_verified: true
  },
  {
    id: "fac-4",
    college_id: DEMO_COLLEGE.id,
    name: "Prof. Ananya Sen (Demo Faculty)",
    email: "ananya.sen.demo@reva.edu.in",
    department_id: "dept-2",
    department_name: "School of Electronics & Communication Engineering",
    branch_id: "branch-3",
    designation: "Class Coordinator - ECE",
    office_location: "ECE Block, 2nd Floor, Room 208",
    is_available: true,
    is_verified: true
  },
  {
    id: "fac-5",
    college_id: DEMO_COLLEGE.id,
    name: "Mr. Vinay Murthy (Demo Admin)",
    email: "admin.office.demo@reva.edu.in",
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    designation: "Administrative Officer",
    office_location: "Student Affairs Centre, Counter 4",
    is_available: true,
    is_verified: true
  }
];

export const DEMO_DOCUMENT_TYPES = [
  {
    id: "doc-type-1",
    college_id: DEMO_COLLEGE.id,
    name: "Bonafide Certificate",
    code: "BONAFIDE",
    description: "Official certificate confirming student enrolment and active semester status.",
    default_priority: "this_week",
    requires_physical_signature: false,
    default_workflow_stages: ["Class Coordinator Review", "Academic Office Endorsement", "Digital Seal Issuance"]
  },
  {
    id: "doc-type-2",
    college_id: DEMO_COLLEGE.id,
    name: "No Objection Certificate (NOC)",
    code: "NOC",
    description: "Required for off-campus internships, corporate training, hackathons, or student exchange programs.",
    default_priority: "urgent",
    requires_physical_signature: true,
    default_workflow_stages: ["Class Coordinator Review", "HOD Endorsement", "Director Clearance"]
  },
  {
    id: "doc-type-3",
    college_id: DEMO_COLLEGE.id,
    name: "Internship Approval",
    code: "INTERNSHIP",
    description: "Approval for 6th/8th semester industry internships, attendance dispensation, and stipend verification.",
    default_priority: "urgent",
    requires_physical_signature: false,
    default_workflow_stages: ["Internship Mentor Review", "HOD Approval", "Final Clearance"]
  },
  {
    id: "doc-type-4",
    college_id: DEMO_COLLEGE.id,
    name: "Scholarship Documents",
    code: "SCHOLARSHIP",
    description: "Endorsement for state/national scholarship applications, income certificate verifications, and fee fee waivers.",
    default_priority: "this_week",
    requires_physical_signature: true,
    default_workflow_stages: ["Class Coordinator", "HOD Verification", "Director Final Approval"]
  },
  {
    id: "doc-type-5",
    college_id: DEMO_COLLEGE.id,
    name: "Fee-related Documents",
    code: "FEE_DOC",
    description: "Instalment fee approvals, receipt endorsements, and exam fee clearance slips.",
    default_priority: "this_month",
    requires_physical_signature: false,
    default_workflow_stages: ["Accounts Officer Review", "Administrative Officer Clearance"]
  },
  {
    id: "doc-type-6",
    college_id: DEMO_COLLEGE.id,
    name: "Project Approval",
    code: "PROJECT",
    description: "Capstone / Major Project synopsis approval, guide allocation sign-off, and lab resource requisitions.",
    default_priority: "this_week",
    requires_physical_signature: false,
    default_workflow_stages: ["Project Guide Review", "HOD Evaluation"]
  },
  {
    id: "doc-type-7",
    college_id: DEMO_COLLEGE.id,
    name: "Leave Application",
    code: "LEAVE",
    description: "Medical or personal leave approval exceeding 3 days with supporting certificates.",
    default_priority: "urgent",
    requires_physical_signature: false,
    default_workflow_stages: ["Class Coordinator Review", "HOD Approval"]
  },
  {
    id: "doc-type-8",
    college_id: DEMO_COLLEGE.id,
    name: "Academic Documents & Transcripts",
    code: "ACADEMIC",
    description: "Provisional grade cards, medium of instruction letters, and semester transcripts verification.",
    default_priority: "this_week",
    requires_physical_signature: false,
    default_workflow_stages: ["Exam Cell Review", "Registrar Approval"]
  }
];

export const DEMO_PRESET_USERS = {
  student: {
    id: "user-student-1",
    email: "aarav.sharma@reva.edu.in",
    full_name: "Aarav Sharma",
    role: "student",
    srn: "R21EN102",
    phone: "+91 98765 43210",
    college_id: DEMO_COLLEGE.id,
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    branch_name: "Computer Science and Engineering",
    semester: "6th Semester",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
  },
  faculty: {
    id: "user-faculty-1",
    email: "priya.rao.demo@reva.edu.in",
    full_name: "Dr. Priya Rao",
    role: "faculty",
    designation: "Class Coordinator / Assistant Professor",
    phone: "+91 94481 12345",
    college_id: DEMO_COLLEGE.id,
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    branch_name: "Computer Science and Engineering",
    office_location: "SOCIT Block, Room 304",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
  },
  hod: {
    id: "user-hod-1",
    email: "suresh.kumar.demo@reva.edu.in",
    full_name: "Dr. Suresh Kumar",
    role: "hod",
    designation: "Head of Department (HOD)",
    phone: "+91 98800 23456",
    college_id: DEMO_COLLEGE.id,
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    branch_name: "Computer Science and Engineering",
    office_location: "SOCIT Block, Room 101",
    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80"
  },
  director: {
    id: "user-director-1",
    email: "ramesh.chandra.demo@reva.edu.in",
    full_name: "Dr. Ramesh Chandra",
    role: "director",
    designation: "Director - School of CIT",
    phone: "+91 99001 34567",
    college_id: DEMO_COLLEGE.id,
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    office_location: "Admin Block, Director Suite",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80"
  },
  admin: {
    id: "user-admin-1",
    email: "admin.office.demo@reva.edu.in",
    full_name: "CampusFlow REVA Admin",
    role: "admin",
    designation: "Chief University Administrator",
    phone: "+91 80 4696 6966",
    college_id: DEMO_COLLEGE.id,
    department_id: "dept-1",
    department_name: "Central Administration",
    office_location: "Central Registrar Office",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  }
};

export const INITIAL_SUBMISSIONS = [
  {
    id: "sub-101",
    tracking_id: "CF-REVA-2026-001",
    college_id: DEMO_COLLEGE.id,
    student_id: DEMO_PRESET_USERS.student.id,
    student_name: DEMO_PRESET_USERS.student.full_name,
    student_email: DEMO_PRESET_USERS.student.email,
    student_srn: DEMO_PRESET_USERS.student.srn,
    student_branch: DEMO_PRESET_USERS.student.branch_name,
    student_phone: DEMO_PRESET_USERS.student.phone,
    document_type_id: "doc-type-2",
    document_type_name: "No Objection Certificate (NOC)",
    title: "NOC for Microsoft Summer Internship 2026",
    description: "Requesting NOC to attend full-time summer internship at Microsoft India Development Centre from June to August 2026.",
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    branch_name: "Computer Science and Engineering",
    assigned_faculty_id: "fac-1",
    assigned_faculty_name: "Dr. Priya Rao (Demo Faculty)",
    current_reviewer_id: DEMO_PRESET_USERS.faculty.id,
    current_reviewer_name: "Dr. Priya Rao",
    priority: "urgent",
    deadline: "2026-11-15T18:00:00Z",
    requires_physical_signature: true,
    status: "under_review",
    current_stage_index: 0,
    approval_stages: [
      { name: "Class Coordinator Review", role: "faculty", status: "in_progress", reviewer: "Dr. Priya Rao", timestamp: "2026-11-05T10:30:00Z" },
      { name: "HOD Endorsement", role: "hod", status: "pending", reviewer: "Dr. Suresh Kumar", timestamp: null },
      { name: "Director Clearance", role: "director", status: "pending", reviewer: "Dr. Ramesh Chandra", timestamp: null }
    ],
    file: {
      file_name: "Microsoft_Internship_Offer_Aarav.pdf",
      file_url: "#",
      file_size: 2450000,
      file_type: "application/pdf",
      version: 1,
      uploaded_at: "2026-11-05T09:15:00Z"
    },
    message_to_faculty: "Respected Ma'am, please find attached the official offer letter from Microsoft. The HR team requested the NOC by 15th November.",
    physical_signature_instructions: "Please visit SOCIT Room 304 between 2:00 PM and 4:00 PM on Thursday for original verification and physical endorsement.",
    created_at: "2026-11-05T09:15:00Z",
    updated_at: "2026-11-05T10:30:00Z"
  },
  {
    id: "sub-102",
    tracking_id: "CF-REVA-2026-002",
    college_id: DEMO_COLLEGE.id,
    student_id: DEMO_PRESET_USERS.student.id,
    student_name: DEMO_PRESET_USERS.student.full_name,
    student_email: DEMO_PRESET_USERS.student.email,
    student_srn: DEMO_PRESET_USERS.student.srn,
    student_branch: DEMO_PRESET_USERS.student.branch_name,
    student_phone: DEMO_PRESET_USERS.student.phone,
    document_type_id: "doc-type-1",
    document_type_name: "Bonafide Certificate",
    title: "Bonafide Certificate for National Passport Application",
    description: "Application for passport appointment renewal requiring current semester bonafide verification.",
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    branch_name: "Computer Science and Engineering",
    assigned_faculty_id: "fac-1",
    assigned_faculty_name: "Dr. Priya Rao (Demo Faculty)",
    current_reviewer_id: DEMO_PRESET_USERS.faculty.id,
    current_reviewer_name: "Dr. Priya Rao",
    priority: "this_week",
    deadline: "2026-11-20T17:00:00Z",
    requires_physical_signature: false,
    status: "approved",
    current_stage_index: 2,
    approval_stages: [
      { name: "Class Coordinator Review", role: "faculty", status: "approved", reviewer: "Dr. Priya Rao", timestamp: "2026-11-02T11:00:00Z" },
      { name: "Academic Office Endorsement", role: "admin", status: "approved", reviewer: "Mr. Vinay Murthy", timestamp: "2026-11-03T15:20:00Z" },
      { name: "Digital Seal Issuance", role: "admin", status: "approved", reviewer: "System", timestamp: "2026-11-03T16:00:00Z" }
    ],
    file: {
      file_name: "Bonafide_Application_Passport_Aarav.pdf",
      file_url: "#",
      file_size: 1120000,
      file_type: "application/pdf",
      version: 1,
      uploaded_at: "2026-11-01T14:20:00Z"
    },
    approved_file_url: "#",
    message_to_faculty: "Requesting bonafide certificate with official fee paid confirmation for Passport Seva Kendra verification.",
    created_at: "2026-11-01T14:20:00Z",
    updated_at: "2026-11-03T16:00:00Z"
  },
  {
    id: "sub-103",
    tracking_id: "CF-REVA-2026-003",
    college_id: DEMO_COLLEGE.id,
    student_id: DEMO_PRESET_USERS.student.id,
    student_name: DEMO_PRESET_USERS.student.full_name,
    student_email: DEMO_PRESET_USERS.student.email,
    student_srn: DEMO_PRESET_USERS.student.srn,
    student_branch: DEMO_PRESET_USERS.student.branch_name,
    student_phone: DEMO_PRESET_USERS.student.phone,
    document_type_id: "doc-type-6",
    document_type_name: "Project Approval",
    title: "AI Healthcare Diagnostics Capstone Synopsis",
    description: "Capstone major project proposal on Automated Chest X-Ray Anomaly Detection using Deep Ensembles.",
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    branch_name: "Computer Science and Engineering",
    assigned_faculty_id: "fac-1",
    assigned_faculty_name: "Dr. Priya Rao (Demo Faculty)",
    current_reviewer_id: DEMO_PRESET_USERS.faculty.id,
    current_reviewer_name: "Dr. Priya Rao",
    priority: "this_week",
    deadline: "2026-11-12T17:00:00Z",
    requires_physical_signature: false,
    status: "correction_required",
    current_stage_index: 0,
    correction_notes: "Please include the dataset citations (NIH ChestX-ray14) and specify the ethical clearance parameters in Section 4. Resubmit the revised PDF.",
    approval_stages: [
      { name: "Project Guide Review", role: "faculty", status: "correction_required", reviewer: "Dr. Priya Rao", timestamp: "2026-11-04T16:45:00Z" },
      { name: "HOD Evaluation", role: "hod", status: "pending", reviewer: "Dr. Suresh Kumar", timestamp: null }
    ],
    file: {
      file_name: "Capstone_Synopsis_Draft_v1.pdf",
      file_url: "#",
      file_size: 3200000,
      file_type: "application/pdf",
      version: 1,
      uploaded_at: "2026-11-03T18:00:00Z"
    },
    message_to_faculty: "Respected Guide, here is our preliminary team synopsis for approval before the Phase 1 presentation.",
    created_at: "2026-11-03T18:00:00Z",
    updated_at: "2026-11-04T16:45:00Z"
  },
  {
    id: "sub-104",
    tracking_id: "CF-REVA-2026-004",
    college_id: DEMO_COLLEGE.id,
    student_id: DEMO_PRESET_USERS.student.id,
    student_name: DEMO_PRESET_USERS.student.full_name,
    student_email: DEMO_PRESET_USERS.student.email,
    student_srn: DEMO_PRESET_USERS.student.srn,
    student_branch: DEMO_PRESET_USERS.student.branch_name,
    student_phone: DEMO_PRESET_USERS.student.phone,
    document_type_id: "doc-type-4",
    document_type_name: "Scholarship Documents",
    title: "Post-Matric National Scholarship Endorsement",
    description: "Endorsement of NSP renewal application form and annual attendance confirmation.",
    department_id: "dept-1",
    department_name: "School of Computing & Information Technology",
    branch_id: "branch-1",
    branch_name: "Computer Science and Engineering",
    assigned_faculty_id: "fac-2",
    assigned_faculty_name: "Dr. Suresh Kumar (Demo HOD)",
    current_reviewer_id: DEMO_PRESET_USERS.hod.id,
    current_reviewer_name: "Dr. Suresh Kumar",
    priority: "this_month",
    deadline: "2026-11-30T17:00:00Z",
    requires_physical_signature: true,
    status: "forwarded",
    current_stage_index: 1,
    approval_stages: [
      { name: "Class Coordinator Verification", role: "faculty", status: "approved", reviewer: "Dr. Priya Rao", timestamp: "2026-11-04T10:00:00Z" },
      { name: "HOD Verification", role: "hod", status: "in_progress", reviewer: "Dr. Suresh Kumar", timestamp: "2026-11-05T12:00:00Z" },
      { name: "Director Final Approval", role: "director", status: "pending", reviewer: "Dr. Ramesh Chandra", timestamp: null }
    ],
    file: {
      file_name: "NSP_Scholarship_Form_Aarav.pdf",
      file_url: "#",
      file_size: 1850000,
      file_type: "application/pdf",
      version: 1,
      uploaded_at: "2026-11-04T08:30:00Z"
    },
    message_to_faculty: "Forwarded from Class Coordinator with verified 89% aggregate attendance for HOD approval.",
    created_at: "2026-11-04T08:30:00Z",
    updated_at: "2026-11-05T12:00:00Z"
  }
];

export const INITIAL_MESSAGES = [
  {
    id: "msg-1",
    submission_id: "sub-101",
    sender_id: DEMO_PRESET_USERS.student.id,
    sender_name: "Aarav Sharma",
    sender_role: "student",
    message_text: "Good morning Ma'am. I have submitted the Microsoft NOC application. Please let me know if any other document is needed.",
    created_at: "2026-11-05T09:20:00Z",
    is_internal: false
  },
  {
    id: "msg-2",
    submission_id: "sub-101",
    sender_id: DEMO_PRESET_USERS.faculty.id,
    sender_name: "Dr. Priya Rao",
    sender_role: "faculty",
    message_text: "Hello Aarav, congratulations on the offer. I am reviewing the terms. Since physical signature is required by the deanery, please visit the SOCIT office on Thursday between 2-4 PM.",
    created_at: "2026-11-05T10:35:00Z",
    is_internal: false
  },
  {
    id: "msg-3",
    submission_id: "sub-103",
    sender_id: DEMO_PRESET_USERS.faculty.id,
    sender_name: "Dr. Priya Rao",
    sender_role: "faculty",
    message_text: "Aarav, the proposal looks solid conceptually, but please add the benchmark metrics and ethical declaration in Section 4 as noted. Resubmit once updated.",
    created_at: "2026-11-04T16:47:00Z",
    is_internal: false
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    user_id: DEMO_PRESET_USERS.student.id,
    title: "Document Under Review",
    message: "Dr. Priya Rao started reviewing your 'NOC for Microsoft Summer Internship 2026'.",
    link: "/student/submissions/sub-101",
    type: "status_changed",
    is_read: false,
    created_at: "2026-11-05T10:30:00Z"
  },
  {
    id: "notif-2",
    user_id: DEMO_PRESET_USERS.student.id,
    title: "Correction Requested",
    message: "Correction needed on 'AI Healthcare Diagnostics Capstone Synopsis'. Check reviewer feedback.",
    link: "/student/submissions/sub-103",
    type: "correction_needed",
    is_read: false,
    created_at: "2026-11-04T16:45:00Z"
  },
  {
    id: "notif-3",
    user_id: DEMO_PRESET_USERS.student.id,
    title: "Document Approved 🎉",
    message: "Your 'Bonafide Certificate for National Passport Application' has received final approval.",
    link: "/student/submissions/sub-102",
    type: "status_changed",
    is_read: true,
    created_at: "2026-11-03T16:00:00Z"
  },
  {
    id: "notif-4",
    user_id: DEMO_PRESET_USERS.faculty.id,
    title: "New Submission Assigned",
    message: "Aarav Sharma submitted 'NOC for Microsoft Summer Internship 2026' with Urgent priority.",
    link: "/faculty/submissions/sub-101",
    type: "submission_created",
    is_read: false,
    created_at: "2026-11-05T09:15:00Z"
  }
];

export const INITIAL_ACTIVITY_LOGS = [
  {
    id: "act-1",
    submission_id: "sub-101",
    actor_id: DEMO_PRESET_USERS.student.id,
    actor_name: "Aarav Sharma",
    actor_role: "student",
    action: "Document Submitted",
    details: "Submitted with file Microsoft_Internship_Offer_Aarav.pdf (Urgent priority).",
    created_at: "2026-11-05T09:15:00Z"
  },
  {
    id: "act-2",
    submission_id: "sub-101",
    actor_id: DEMO_PRESET_USERS.faculty.id,
    actor_name: "Dr. Priya Rao",
    actor_role: "faculty",
    action: "Status Updated: Under Review",
    details: "Started stage: Class Coordinator Review. Physical verification requested.",
    created_at: "2026-11-05T10:30:00Z"
  },
  {
    id: "act-3",
    submission_id: "sub-103",
    actor_id: DEMO_PRESET_USERS.faculty.id,
    actor_name: "Dr. Priya Rao",
    actor_role: "faculty",
    action: "Correction Requested",
    details: "Requested inclusion of dataset citations and ethical clearance parameters.",
    created_at: "2026-11-04T16:45:00Z"
  }
];

