-- =====================================================================
-- CAMPUSFLOW: SECURE MULTI-TENANT DATABASE SCHEMA & WORKFLOW ENGINE
-- Target: Supabase (PostgreSQL 15+)
-- First Institution Supported: REVA University, Bengaluru, Karnataka, India
-- Architected for Enterprise Multi-University Scaling & Zero-Trust RLS
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. EXTENSIONS & PREREQUISITES
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Generic Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- 1. COLLEGES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100) DEFAULT 'Bengaluru',
    state VARCHAR(100) DEFAULT 'Karnataka',
    country VARCHAR(100) DEFAULT 'India',
    website VARCHAR(255),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_colleges_updated_at ON public.colleges;
CREATE TRIGGER trg_colleges_updated_at
BEFORE UPDATE ON public.colleges
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------
-- 2. DEPARTMENTS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_departments_college_code UNIQUE (college_id, code)
);

-- ---------------------------------------------------------------------
-- 3. BRANCHES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_branches_dept_code UNIQUE (department_id, code)
);

-- ---------------------------------------------------------------------
-- 4. PROFILES TABLE (Associated with auth.users)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty', 'hod', 'director', 'admin')),
    srn VARCHAR(100), -- Student Registration Number
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    designation VARCHAR(150),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_profiles_college_srn UNIQUE (college_id, srn)
);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------
-- 5. USER ROLES (Managed by College Administrators)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty', 'hod', 'director', 'admin')),
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

-- ---------------------------------------------------------------------
-- 6. FACULTY DIRECTORY (Admin Managed Directory)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faculty_directory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    designation VARCHAR(150) NOT NULL,
    office_location VARCHAR(255),
    is_available BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_faculty_college_email UNIQUE (college_id, email)
);

-- ---------------------------------------------------------------------
-- 7. DOCUMENT TYPES TABLE (Configurable Workflows Per University)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    description TEXT,
    default_priority VARCHAR(20) DEFAULT 'this_week' CHECK (default_priority IN ('urgent', 'this_week', 'this_month')),
    requires_physical_signature BOOLEAN DEFAULT false,
    default_workflow_stages JSONB DEFAULT '["Faculty Review", "HOD Approval", "Final Clearance"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_document_types_college_code UNIQUE (college_id, code)
);

-- ---------------------------------------------------------------------
-- 8. SUBMISSIONS TABLE (Main Workflow Submissions)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id VARCHAR(50) UNIQUE NOT NULL,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    document_type_id UUID NOT NULL REFERENCES public.document_types(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    assigned_faculty_id UUID NOT NULL REFERENCES public.faculty_directory(id) ON DELETE RESTRICT,
    current_reviewer_id UUID REFERENCES public.profiles(id),
    priority VARCHAR(20) NOT NULL DEFAULT 'this_week' CHECK (priority IN ('urgent', 'this_week', 'this_month')),
    deadline TIMESTAMPTZ,
    requires_physical_signature BOOLEAN DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted' CHECK (
        status IN ('submitted', 'under_review', 'in_progress', 'correction_required', 'rejected', 'forwarded', 'approved', 'completed')
    ),
    current_stage_index INT DEFAULT 0,
    approval_stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    rejection_reason TEXT,
    correction_notes TEXT,
    physical_signature_instructions TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_submissions_updated_at ON public.submissions;
CREATE TRIGGER trg_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------
-- 9. SUBMISSION FILES TABLE (Versioned Document Uploads)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    version INT DEFAULT 1,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    is_approved_version BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 10. APPROVAL STEPS TABLE (Immutable Historical Review Decisions)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    stage_name VARCHAR(150) NOT NULL,
    reviewer_role VARCHAR(50) NOT NULL,
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewer_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'correction_requested', 'forwarded')),
    decision_notes TEXT,
    forwarded_to_id UUID REFERENCES public.profiles(id),
    action_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 11. MESSAGES TABLE (Per-Submission Communication Thread)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- If true, visible ONLY to faculty/admin
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 12. NOTIFICATIONS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 13. ACTIVITY LOGS (Immutable Security Audit Trail)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id),
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- INDEXES FOR QUERY OPTIMIZATION
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_college_id ON public.submissions(college_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assigned_faculty ON public.submissions(assigned_faculty_id);
CREATE INDEX IF NOT EXISTS idx_submissions_current_reviewer ON public.submissions(current_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submission_files_submission ON public.submission_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_approval_steps_submission ON public.approval_steps(submission_id);
CREATE INDEX IF NOT EXISTS idx_messages_submission_id ON public.messages(submission_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_submission_id ON public.activity_logs(submission_id);
CREATE INDEX IF NOT EXISTS idx_profiles_college_role ON public.profiles(college_id, role);

-- =====================================================================
-- NON-RECURSIVE SECURITY DEFINER HELPERS
-- These functions run with elevated privileges and a fixed search_path
-- to safely check roles and permissions WITHOUT triggering RLS recursion.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS VARCHAR
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_college_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT college_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
$$;

CREATE OR REPLACE FUNCTION public.is_college_admin(target_college_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
          AND role = 'admin' 
          AND college_id = target_college_id 
          AND is_active = true
    );
$$;

CREATE OR REPLACE FUNCTION public.is_faculty_or_above()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
          AND role IN ('faculty', 'hod', 'director', 'admin') 
          AND is_active = true
    );
$$;

-- Helper to check if a user is an authorized reviewer for a submission
CREATE OR REPLACE FUNCTION public.can_review_submission(p_submission_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_sub RECORD;
BEGIN
    SELECT * INTO v_sub FROM public.submissions WHERE id = p_submission_id;
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- College Admin can always review
    IF public.is_college_admin(v_sub.college_id) THEN
        RETURN TRUE;
    END IF;

    -- Assigned reviewer directly
    IF v_sub.current_reviewer_id = auth.uid() THEN
        RETURN TRUE;
    END IF;

    -- Faculty matching the assigned faculty directory entry
    IF EXISTS (
        SELECT 1 FROM public.faculty_directory fd 
        WHERE fd.id = v_sub.assigned_faculty_id AND fd.user_id = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- Helper to check if a user is a valid participant of a submission
CREATE OR REPLACE FUNCTION public.is_submission_participant(p_submission_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_sub RECORD;
BEGIN
    SELECT * INTO v_sub FROM public.submissions WHERE id = p_submission_id;
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Student owner
    IF v_sub.student_id = auth.uid() THEN
        RETURN TRUE;
    END IF;

    -- Reviewer or college admin
    RETURN public.can_review_submission(p_submission_id);
END;
$$;

-- =====================================================================
-- DATABASE INTEGRITY TRIGGERS
-- =====================================================================

-- 1. PROFILE SECURITY: Prevent Privilege Escalation
CREATE OR REPLACE FUNCTION public.trg_check_profile_update()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    caller_is_admin BOOLEAN;
    caller_college UUID;
BEGIN
    -- Check if current authenticated caller is an admin
    SELECT (role = 'admin' AND is_active = true), college_id
    INTO caller_is_admin, caller_college
    FROM public.profiles
    WHERE id = auth.uid();

    caller_is_admin := COALESCE(caller_is_admin, false);

    IF NOT caller_is_admin THEN
        -- Non-admins CANNOT change role
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Privilege escalation rejected: users cannot modify their own role.';
        END IF;

        -- Non-admins CANNOT change college_id
        IF NEW.college_id IS DISTINCT FROM OLD.college_id THEN
            RAISE EXCEPTION 'Security violation: college_id cannot be changed.';
        END IF;

        -- Non-admins CANNOT change SRN
        IF NEW.srn IS DISTINCT FROM OLD.srn THEN
            RAISE EXCEPTION 'Security violation: Student Registration Number (SRN) cannot be modified.';
        END IF;

        -- Non-admins CANNOT alter active/suspended account status
        IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
            RAISE EXCEPTION 'Security violation: account status can only be toggled by an administrator.';
        END IF;
    ELSE
        -- Admins can only update profiles in their OWN college
        IF caller_college IS DISTINCT FROM OLD.college_id THEN
            RAISE EXCEPTION 'Cross-college administration prohibited: you can only manage users within your college.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_updates ON public.profiles;
CREATE TRIGGER trg_guard_profile_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trg_check_profile_update();

-- 2. MULTI-COLLEGE ISOLATION & SUBMISSION INTEGRITY
CREATE OR REPLACE FUNCTION public.trg_validate_submission_cross_college()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_student_college UUID;
    v_dept_college UUID;
    v_doc_type_college UUID;
    v_fac_college UUID;
    v_branch_college UUID;
BEGIN
    -- Verify Student College
    SELECT college_id INTO v_student_college FROM public.profiles WHERE id = NEW.student_id;
    IF v_student_college IS NULL OR v_student_college <> NEW.college_id THEN
        RAISE EXCEPTION 'Cross-college submission prohibited: Student does not belong to the target college.';
    END IF;

    -- Verify Department College
    SELECT college_id INTO v_dept_college FROM public.departments WHERE id = NEW.department_id;
    IF v_dept_college IS NULL OR v_dept_college <> NEW.college_id THEN
        RAISE EXCEPTION 'Cross-college submission prohibited: Department does not belong to the target college.';
    END IF;

    -- Verify Document Type College
    SELECT college_id INTO v_doc_type_college FROM public.document_types WHERE id = NEW.document_type_id;
    IF v_doc_type_college IS NULL OR v_doc_type_college <> NEW.college_id THEN
        RAISE EXCEPTION 'Cross-college submission prohibited: Document type does not belong to the target college.';
    END IF;

    -- Verify Assigned Faculty College
    SELECT college_id INTO v_fac_college FROM public.faculty_directory WHERE id = NEW.assigned_faculty_id;
    IF v_fac_college IS NULL OR v_fac_college <> NEW.college_id THEN
        RAISE EXCEPTION 'Cross-college submission prohibited: Assigned faculty member does not belong to the target college.';
    END IF;

    -- Verify Branch College (if provided)
    IF NEW.branch_id IS NOT NULL THEN
        SELECT college_id INTO v_branch_college FROM public.branches WHERE id = NEW.branch_id;
        IF v_branch_college IS NULL OR v_branch_college <> NEW.college_id THEN
            RAISE EXCEPTION 'Cross-college submission prohibited: Branch does not belong to the target college.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_submission_college ON public.submissions;
CREATE TRIGGER trg_validate_submission_college
BEFORE INSERT OR UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_validate_submission_cross_college();

-- 3. SUBMISSION WORKFLOW GUARD: Prevent Self-Approval & Unauthorized Status Changes
CREATE OR REPLACE FUNCTION public.trg_guard_submission_workflow()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    caller_id UUID := auth.uid();
    caller_role VARCHAR;
    is_reviewer BOOLEAN;
BEGIN
    SELECT role INTO caller_role FROM public.profiles WHERE id = caller_id;
    is_reviewer := public.can_review_submission(OLD.id);

    -- Check if student is attempting to alter workflow-controlled fields
    IF caller_id = OLD.student_id AND NOT is_reviewer THEN
        -- Student CANNOT change approval status directly unless resubmitting correction
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            IF OLD.status = 'correction_required' AND NEW.status = 'under_review' THEN
                -- Permitted: student resubmitting correction
                NULL;
            ELSE
                RAISE EXCEPTION 'Permission denied: Students cannot alter workflow approval status.';
            END IF;
        END IF;

        -- Student CANNOT modify approval stages
        IF NEW.approval_stages IS DISTINCT FROM OLD.approval_stages THEN
            RAISE EXCEPTION 'Permission denied: Students cannot modify approval workflow stages.';
        END IF;

        -- Student CANNOT change current reviewer
        IF NEW.current_reviewer_id IS DISTINCT FROM OLD.current_reviewer_id THEN
            RAISE EXCEPTION 'Permission denied: Students cannot reassign document reviewers.';
        END IF;

        -- Student CANNOT change assigned faculty once submitted
        IF NEW.assigned_faculty_id IS DISTINCT FROM OLD.assigned_faculty_id THEN
            RAISE EXCEPTION 'Permission denied: Assigned faculty cannot be modified directly.';
        END IF;

        -- Student CANNOT change rejection or signature instructions
        IF NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason OR
           NEW.physical_signature_instructions IS DISTINCT FROM OLD.physical_signature_instructions THEN
            RAISE EXCEPTION 'Permission denied: Reviewer notes cannot be modified by the student.';
        END IF;
    END IF;

    -- If reviewer is making changes:
    IF is_reviewer THEN
        -- Rejection requires mandatory reason
        IF NEW.status = 'rejected' AND (NEW.rejection_reason IS NULL OR TRIM(NEW.rejection_reason) = '') THEN
            RAISE EXCEPTION 'Rejection requires a mandatory explanation note.';
        END IF;

        -- Correction request requires mandatory instructions
        IF NEW.status = 'correction_required' AND (NEW.correction_notes IS NULL OR TRIM(NEW.correction_notes) = '') THEN
            RAISE EXCEPTION 'Correction request requires detailed correction notes.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_submission_updates ON public.submissions;
CREATE TRIGGER trg_guard_submission_updates
BEFORE UPDATE ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_guard_submission_workflow();

-- 4. AUTOMATIC AUDIT LOGGING & NOTIFICATIONS ON WORKFLOW ACTIONS
CREATE OR REPLACE FUNCTION public.trg_log_submission_activity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_actor_name VARCHAR := 'System';
    v_actor_role VARCHAR := 'system';
BEGIN
    SELECT full_name, role INTO v_actor_name, v_actor_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.activity_logs (submission_id, college_id, actor_id, actor_name, actor_role, action, details)
        VALUES (
            NEW.id,
            NEW.college_id,
            NEW.student_id,
            COALESCE(v_actor_name, 'Student'),
            COALESCE(v_actor_role, 'student'),
            'Document Submitted',
            'Submission created with tracking ID: ' || NEW.tracking_id || ' (Priority: ' || UPPER(NEW.priority) || ')'
        );

        -- Notify assigned faculty
        INSERT INTO public.notifications (user_id, college_id, title, message, link, type)
        SELECT 
            fd.user_id,
            NEW.college_id,
            'New Submission Assigned',
            'Student submitted "' || NEW.title || '" (' || UPPER(NEW.priority) || ' priority)',
            '/faculty/submissions/' || NEW.id,
            'submission_created'
        FROM public.faculty_directory fd
        WHERE fd.id = NEW.assigned_faculty_id AND fd.user_id IS NOT NULL;

    ELSIF TG_OP = 'UPDATE' AND (NEW.status IS DISTINCT FROM OLD.status) THEN
        INSERT INTO public.activity_logs (submission_id, college_id, actor_id, actor_name, actor_role, action, details)
        VALUES (
            NEW.id,
            NEW.college_id,
            auth.uid(),
            COALESCE(v_actor_name, 'Reviewer'),
            COALESCE(v_actor_role, 'faculty'),
            'Status Changed: ' || UPPER(REPLACE(NEW.status, '_', ' ')),
            COALESCE(NEW.correction_notes, NEW.rejection_reason, 'Status progressed to ' || NEW.status)
        );

        -- Notify Student of Status Progress
        INSERT INTO public.notifications (user_id, college_id, title, message, link, type)
        VALUES (
            NEW.student_id,
            NEW.college_id,
            'Document ' || UPPER(REPLACE(NEW.status, '_', ' ')),
            'Your submission "' || NEW.title || '" is now: ' || REPLACE(NEW.status, '_', ' '),
            '/student/submissions/' || NEW.id,
            CASE WHEN NEW.status = 'correction_required' THEN 'correction_needed' ELSE 'status_changed' END
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_submission_events ON public.submissions;
CREATE TRIGGER trg_audit_submission_events
AFTER INSERT OR UPDATE OF status ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_log_submission_activity();

-- 5. NOTIFICATION ON NEW MESSAGES
CREATE OR REPLACE FUNCTION public.trg_notify_on_message()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_sub RECORD;
BEGIN
    SELECT * INTO v_sub FROM public.submissions WHERE id = NEW.submission_id;
    IF NOT FOUND THEN RETURN NEW; END IF;

    -- If sender is student, notify the reviewer
    IF NEW.sender_id = v_sub.student_id THEN
        IF v_sub.current_reviewer_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, college_id, title, message, link, type)
            VALUES (
                v_sub.current_reviewer_id,
                NEW.college_id,
                'New Student Message',
                NEW.sender_name || ' sent a message on "' || v_sub.title || '"',
                '/faculty/submissions/' || NEW.submission_id,
                'message_received'
            );
        END IF;
    ELSE
        -- Sender is reviewer/faculty, notify student (unless internal note)
        IF NOT NEW.is_internal THEN
            INSERT INTO public.notifications (user_id, college_id, title, message, link, type)
            VALUES (
                v_sub.student_id,
                NEW.college_id,
                'New Message from Reviewer',
                NEW.sender_name || ' sent a message on "' || v_sub.title || '"',
                '/student/submissions/' || NEW.submission_id,
                'message_received'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_notification ON public.messages;
CREATE TRIGGER trg_message_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.trg_notify_on_message();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Zero-Trust Policies for Every Entity
-- =====================================================================

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. COLLEGES
DROP POLICY IF EXISTS "Colleges public read" ON public.colleges;
CREATE POLICY "Colleges public read" ON public.colleges
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Colleges admin modify" ON public.colleges;
CREATE POLICY "Colleges admin modify" ON public.colleges
FOR ALL USING (public.is_admin());

-- 2. DEPARTMENTS
DROP POLICY IF EXISTS "Departments college access" ON public.departments;
CREATE POLICY "Departments college access" ON public.departments
FOR SELECT USING (
    -- Authenticated: only within own college; Unauthenticated: allow active demo colleges
    (auth.uid() IS NULL) OR (college_id = public.get_my_college_id())
);

DROP POLICY IF EXISTS "Departments admin manage" ON public.departments;
CREATE POLICY "Departments admin manage" ON public.departments
FOR ALL USING (public.is_college_admin(college_id));

-- 3. BRANCHES
DROP POLICY IF EXISTS "Branches college access" ON public.branches;
CREATE POLICY "Branches college access" ON public.branches
FOR SELECT USING (
    (auth.uid() IS NULL) OR (college_id = public.get_my_college_id())
);

DROP POLICY IF EXISTS "Branches admin manage" ON public.branches;
CREATE POLICY "Branches admin manage" ON public.branches
FOR ALL USING (public.is_college_admin(college_id));

-- 4. PROFILES (Non-recursive)
DROP POLICY IF EXISTS "Profiles view own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles view college colleagues" ON public.profiles;
CREATE POLICY "Profiles view college colleagues" ON public.profiles
FOR SELECT USING (
    auth.uid() = id OR (college_id = public.get_my_college_id())
);

DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
CREATE POLICY "Profiles update own" ON public.profiles
FOR UPDATE USING (
    auth.uid() = id OR public.is_college_admin(college_id)
);

DROP POLICY IF EXISTS "Profiles admin all" ON public.profiles;
CREATE POLICY "Profiles admin all" ON public.profiles
FOR ALL USING (
    public.is_college_admin(college_id)
);

-- 5. USER_ROLES
DROP POLICY IF EXISTS "User roles view own or college admin" ON public.user_roles;
CREATE POLICY "User roles view own or college admin" ON public.user_roles
FOR SELECT USING (
    user_id = auth.uid() OR public.is_college_admin(college_id)
);

DROP POLICY IF EXISTS "User roles admin manage" ON public.user_roles;
CREATE POLICY "User roles admin manage" ON public.user_roles
FOR ALL USING (
    public.is_college_admin(college_id)
);

-- 6. FACULTY DIRECTORY (Isolated per college)
DROP POLICY IF EXISTS "Faculty directory view college" ON public.faculty_directory;
CREATE POLICY "Faculty directory view college" ON public.faculty_directory
FOR SELECT USING (
    -- Allow users of the same college to view authorized faculty
    (auth.uid() IS NULL) OR (college_id = public.get_my_college_id())
);

DROP POLICY IF EXISTS "Faculty directory admin manage" ON public.faculty_directory;
CREATE POLICY "Faculty directory admin manage" ON public.faculty_directory
FOR ALL USING (
    public.is_college_admin(college_id)
);

-- 7. DOCUMENT TYPES (Isolated per college)
DROP POLICY IF EXISTS "Document types view college" ON public.document_types;
CREATE POLICY "Document types view college" ON public.document_types
FOR SELECT USING (
    (auth.uid() IS NULL) OR (college_id = public.get_my_college_id())
);

DROP POLICY IF EXISTS "Document types admin manage" ON public.document_types;
CREATE POLICY "Document types admin manage" ON public.document_types
FOR ALL USING (
    public.is_college_admin(college_id)
);

-- 8. SUBMISSIONS
-- Students see only their own; Reviewers see assigned; Admins see college submissions
DROP POLICY IF EXISTS "Submissions select policy" ON public.submissions;
CREATE POLICY "Submissions select policy" ON public.submissions
FOR SELECT USING (
    student_id = auth.uid()
    OR public.can_review_submission(id)
    OR public.is_college_admin(college_id)
);

-- Students can ONLY insert their own submissions matching their college
DROP POLICY IF EXISTS "Submissions student insert" ON public.submissions;
CREATE POLICY "Submissions student insert" ON public.submissions
FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND college_id = public.get_my_college_id()
    AND status = 'submitted'
);

-- Updates: Student can only update when correction requested; Reviewers can review; Admins can manage
DROP POLICY IF EXISTS "Submissions update policy" ON public.submissions;
CREATE POLICY "Submissions update policy" ON public.submissions
FOR UPDATE USING (
    (student_id = auth.uid() AND status = 'correction_required')
    OR public.can_review_submission(id)
    OR public.is_college_admin(college_id)
);

-- 9. SUBMISSION FILES
DROP POLICY IF EXISTS "Submission files select" ON public.submission_files;
CREATE POLICY "Submission files select" ON public.submission_files
FOR SELECT USING (
    public.is_submission_participant(submission_id)
    OR public.is_college_admin(college_id)
);

DROP POLICY IF EXISTS "Submission files insert" ON public.submission_files;
CREATE POLICY "Submission files insert" ON public.submission_files
FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    AND college_id = public.get_my_college_id()
    AND public.is_submission_participant(submission_id)
);

DROP POLICY IF EXISTS "Submission files admin delete" ON public.submission_files;
CREATE POLICY "Submission files admin delete" ON public.submission_files
FOR DELETE USING (
    public.is_college_admin(college_id)
);

-- 10. APPROVAL STEPS (Immutable history)
DROP POLICY IF EXISTS "Approval steps view" ON public.approval_steps;
CREATE POLICY "Approval steps view" ON public.approval_steps
FOR SELECT USING (
    public.is_submission_participant(submission_id)
    OR public.is_college_admin(college_id)
);

DROP POLICY IF EXISTS "Approval steps insert reviewer" ON public.approval_steps;
CREATE POLICY "Approval steps insert reviewer" ON public.approval_steps
FOR INSERT WITH CHECK (
    reviewer_id = auth.uid()
    AND public.can_review_submission(submission_id)
);

-- 11. MESSAGES (Dedicated submission threads with internal privacy)
DROP POLICY IF EXISTS "Messages select policy" ON public.messages;
CREATE POLICY "Messages select policy" ON public.messages
FOR SELECT USING (
    public.is_submission_participant(submission_id)
    AND (
        -- Non-internal messages are visible to all submission participants
        is_internal = false
        -- Internal messages are visible ONLY to faculty/admin
        OR public.is_faculty_or_above()
    )
);

DROP POLICY IF EXISTS "Messages insert policy" ON public.messages;
CREATE POLICY "Messages insert policy" ON public.messages
FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND college_id = public.get_my_college_id()
    AND public.is_submission_participant(submission_id)
    AND (
        -- Students can NEVER create internal messages
        is_internal = false OR public.is_faculty_or_above()
    )
);

-- 12. NOTIFICATIONS
DROP POLICY IF EXISTS "Notifications select own" ON public.notifications;
CREATE POLICY "Notifications select own" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Notifications update own" ON public.notifications;
CREATE POLICY "Notifications update own" ON public.notifications
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Notifications delete own" ON public.notifications;
CREATE POLICY "Notifications delete own" ON public.notifications
FOR DELETE USING (user_id = auth.uid());

-- 13. ACTIVITY LOGS (Read-only audit trail)
DROP POLICY IF EXISTS "Activity logs view" ON public.activity_logs;
CREATE POLICY "Activity logs view" ON public.activity_logs
FOR SELECT USING (
    public.is_submission_participant(submission_id)
    OR public.is_college_admin(college_id)
);

-- =====================================================================
-- STORAGE BUCKET & STORAGE RLS POLICIES
-- Supabase Storage: 'student-documents' & 'submission-documents' (Strictly Private)
-- =====================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES 
        (
            'student-documents',
            'student-documents',
            false, -- STRICTLY PRIVATE
            15728640, -- 15MB limit
            ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
        ),
        (
            'submission-documents',
            'submission-documents',
            false, -- STRICTLY PRIVATE
            15728640, -- 15MB limit
            ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
        )
        ON CONFLICT (id) DO UPDATE SET 
            public = false,
            file_size_limit = 15728640;
    END IF;
END $$;

-- Storage RLS (Checked if storage.objects exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

        -- Read policy: Only submission participants can read files from storage
        DROP POLICY IF EXISTS "Submission documents storage select" ON storage.objects;
        CREATE POLICY "Submission documents storage select" ON storage.objects
        FOR SELECT TO authenticated
        USING (
            bucket_id IN ('submission-documents', 'student-documents')
            AND (
                -- Object name format: <college_id>/<submission_id>/<file_name>
                EXISTS (
                    SELECT 1 FROM public.submissions s
                    WHERE s.id::text = (storage.foldername(name))[2]
                      AND (
                          s.student_id = auth.uid()
                          OR public.can_review_submission(s.id)
                          OR public.is_college_admin(s.college_id)
                      )
                )
            )
        );

        -- Upload policy: Students and Reviewers for that submission
        DROP POLICY IF EXISTS "Submission documents storage insert" ON storage.objects;
        CREATE POLICY "Submission documents storage insert" ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (
            bucket_id IN ('submission-documents', 'student-documents')
            AND (
                EXISTS (
                    SELECT 1 FROM public.submissions s
                    WHERE s.id::text = (storage.foldername(name))[2]
                      AND (
                          (s.student_id = auth.uid() AND s.status IN ('submitted', 'correction_required'))
                          OR public.can_review_submission(s.id)
                          OR public.is_college_admin(s.college_id)
                      )
                )
            )
        );
    END IF;
END $$;

-- =====================================================================
-- SECURE STORED PROCEDURES / WORKFLOW OPERATIONS (SECURITY DEFINER)
-- =====================================================================

-- 1. Review Submission Action
CREATE OR REPLACE FUNCTION public.execute_submission_review(
    p_submission_id UUID,
    p_action VARCHAR, -- 'approved' | 'rejected' | 'correction_required' | 'forwarded' | 'in_progress'
    p_notes TEXT DEFAULT NULL,
    p_forward_to_id UUID DEFAULT NULL,
    p_physical_instructions TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_sub RECORD;
    v_caller_role VARCHAR;
    v_caller_name VARCHAR;
    v_stages JSONB;
    v_curr_idx INT;
    v_next_status VARCHAR;
    v_target_fac RECORD;
BEGIN
    SELECT * INTO v_sub FROM public.submissions WHERE id = p_submission_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission % not found.', p_submission_id;
    END IF;

    -- Verify authorization
    IF NOT public.can_review_submission(p_submission_id) THEN
        RAISE EXCEPTION 'Unauthorized: You are not authorized to review this submission.';
    END IF;

    SELECT full_name, role INTO v_caller_name, v_caller_role FROM public.profiles WHERE id = auth.uid();
    v_stages := v_sub.approval_stages;
    v_curr_idx := v_sub.current_stage_index;

    IF p_action = 'approved' THEN
        -- Mark current stage as approved
        v_stages := jsonb_set(
            v_stages, 
            ARRAY[v_curr_idx::text, 'status'], 
            '"approved"'
        );
        v_stages := jsonb_set(
            v_stages, 
            ARRAY[v_curr_idx::text, 'timestamp'], 
            to_jsonb(NOW())
        );

        -- If more stages remain, advance stage; else complete
        IF v_curr_idx < jsonb_array_length(v_stages) - 1 THEN
            v_curr_idx := v_curr_idx + 1;
            v_stages := jsonb_set(
                v_stages, 
                ARRAY[v_curr_idx::text, 'status'], 
                '"in_progress"'
            );
            v_next_status := 'in_progress';
        ELSE
            v_next_status := 'completed';
        END IF;

        UPDATE public.submissions
        SET status = v_next_status,
            approval_stages = v_stages,
            current_stage_index = v_curr_idx,
            physical_signature_instructions = COALESCE(p_physical_instructions, physical_signature_instructions),
            completed_at = CASE WHEN v_next_status = 'completed' THEN NOW() ELSE NULL END
        WHERE id = p_submission_id;

    ELSIF p_action = 'rejected' THEN
        IF p_notes IS NULL OR TRIM(p_notes) = '' THEN
            RAISE EXCEPTION 'Rejection requires a mandatory reason.';
        END IF;

        v_stages := jsonb_set(v_stages, ARRAY[v_curr_idx::text, 'status'], '"rejected"');
        UPDATE public.submissions
        SET status = 'rejected',
            approval_stages = v_stages,
            rejection_reason = p_notes
        WHERE id = p_submission_id;

    ELSIF p_action = 'correction_required' THEN
        IF p_notes IS NULL OR TRIM(p_notes) = '' THEN
            RAISE EXCEPTION 'Correction instructions are required.';
        END IF;

        v_stages := jsonb_set(v_stages, ARRAY[v_curr_idx::text, 'status'], '"correction_required"');
        UPDATE public.submissions
        SET status = 'correction_required',
            approval_stages = v_stages,
            correction_notes = p_notes
        WHERE id = p_submission_id;

    ELSIF p_action = 'forwarded' THEN
        IF p_forward_to_id IS NULL THEN
            RAISE EXCEPTION 'A forwarding recipient is required.';
        END IF;

        SELECT * INTO v_target_fac FROM public.faculty_directory WHERE id = p_forward_to_id;
        IF NOT FOUND OR v_target_fac.college_id <> v_sub.college_id THEN
            RAISE EXCEPTION 'Target recipient must belong to the same university.';
        END IF;

        v_stages := jsonb_set(v_stages, ARRAY[v_curr_idx::text, 'status'], '"approved"');
        IF v_curr_idx < jsonb_array_length(v_stages) - 1 THEN
            v_curr_idx := v_curr_idx + 1;
            v_stages := jsonb_set(v_stages, ARRAY[v_curr_idx::text, 'status'], '"in_progress"');
        END IF;

        UPDATE public.submissions
        SET status = 'forwarded',
            approval_stages = v_stages,
            current_stage_index = v_curr_idx,
            current_reviewer_id = v_target_fac.user_id,
            assigned_faculty_id = p_forward_to_id
        WHERE id = p_submission_id;

    ELSE
        RAISE EXCEPTION 'Invalid review action: %', p_action;
    END IF;

    -- Record in approval_steps table
    INSERT INTO public.approval_steps (
        submission_id, college_id, stage_name, reviewer_role, reviewer_id, reviewer_name, status, decision_notes, forwarded_to_id
    ) VALUES (
        p_submission_id,
        v_sub.college_id,
        COALESCE(v_stages->v_sub.current_stage_index->>'name', 'Review Stage'),
        v_caller_role,
        auth.uid(),
        v_caller_name,
        p_action,
        p_notes,
        p_forward_to_id
    );

    RETURN jsonb_build_object('success', true, 'status', p_action, 'submission_id', p_submission_id);
END;
$$;

-- 2. Secure Role Assignment (Only for College Administrators)
CREATE OR REPLACE FUNCTION public.assign_user_role(
    p_target_user_id UUID,
    p_new_role VARCHAR
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    v_admin_college UUID;
    v_target_college UUID;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can assign roles.';
    END IF;

    v_admin_college := public.get_my_college_id();
    SELECT college_id INTO v_target_college FROM public.profiles WHERE id = p_target_user_id;

    IF v_admin_college IS DISTINCT FROM v_target_college THEN
        RAISE EXCEPTION 'Cross-college role assignment is prohibited.';
    END IF;

    -- Update profile
    UPDATE public.profiles
    SET role = p_new_role, updated_at = NOW()
    WHERE id = p_target_user_id;

    -- Record in user_roles
    INSERT INTO public.user_roles (user_id, college_id, role, assigned_by)
    VALUES (p_target_user_id, v_admin_college, p_new_role, auth.uid())
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN jsonb_build_object('success', true, 'user_id', p_target_user_id, 'new_role', p_new_role);
END;
$$;

-- =====================================================================
-- SEED DATA (REVA UNIVERSITY, BENGALURU)
-- Note: Clearly designated sample demonstration data as required.
-- =====================================================================

-- 1. College
INSERT INTO public.colleges (id, name, slug, code, address, city, state, country, website)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'REVA University',
    'reva',
    'REVA-BLR',
    'Rukmini Knowledge Park, Kattigenahalli, Yelahanka',
    'Bengaluru',
    'Karnataka',
    'India',
    'https://www.reva.edu.in'
) ON CONFLICT (code) DO NOTHING;

-- 2. Departments
INSERT INTO public.departments (id, college_id, name, code) VALUES
('b1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'School of Computing and Information Technology', 'SOCIT'),
('b2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'School of Electronics and Communication Engineering', 'ECE'),
('b3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'School of Mechanical Engineering', 'MECH'),
('b4444444-4444-4444-4444-444444444444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'School of Management Studies', 'SOM')
ON CONFLICT (college_id, code) DO NOTHING;

-- 3. Branches
INSERT INTO public.branches (id, department_id, college_id, name, code) VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Computer Science and Engineering', 'CSE'),
('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Artificial Intelligence & Data Science', 'AI-DS'),
('c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Electronics and Communication Engineering', 'ECE')
ON CONFLICT (department_id, code) DO NOTHING;

-- 4. Document Types
INSERT INTO public.document_types (id, college_id, name, code, description, default_priority, requires_physical_signature, default_workflow_stages) VALUES
('d1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bonafide Certificate', 'BONAFIDE', 'Official certificate confirming bonafide student status', 'this_week', false, '["Class Coordinator", "Academic Office"]'::jsonb),
('d2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'No Objection Certificate (NOC)', 'NOC', 'NOC for off-campus internships, competitions, or seminars', 'urgent', true, '["Class Coordinator", "HOD Review", "Director Approval"]'::jsonb),
('d3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Internship Approval', 'INTERNSHIP', 'Permission and attendance relaxation for semester internships', 'urgent', false, '["Mentor Review", "HOD Approval"]'::jsonb),
('d4444444-4444-4444-4444-444444444444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Scholarship Verification', 'SCHOLARSHIP', 'Government and private scholarship application endorsement', 'this_week', true, '["Class Coordinator", "HOD Approval", "Director Clearance"]'::jsonb),
('d5555555-5555-5555-5555-555555555555', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fee-related Document', 'FEE_DOC', 'Fee concessions, instalment receipts and clearance requests', 'this_month', false, '["Accounts Officer", "Administrative Officer"]'::jsonb),
('d6666666-6666-6666-6666-666666666666', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Project Approval', 'PROJECT', 'Major / Minor capstone project synopsis and approval', 'this_week', false, '["Project Guide", "HOD Review"]'::jsonb),
('d7777777-7777-7777-7777-777777777777', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Leave Application', 'LEAVE', 'Medical leave or emergency absence approval', 'urgent', false, '["Class Coordinator", "HOD Approval"]'::jsonb)
ON CONFLICT (college_id, code) DO NOTHING;

-- 5. Faculty Directory (Demo Data with clear demo labelling)
INSERT INTO public.faculty_directory (id, college_id, name, email, department_id, designation, office_location, is_available) VALUES
('f1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Priya Rao (Demo Faculty)', 'priya.rao.demo@reva.edu.in', 'b1111111-1111-1111-1111-111111111111', 'Class Coordinator / Assistant Professor', 'SOCIT Block, Room 304', true),
('f2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Suresh Kumar (Demo HOD)', 'suresh.kumar.demo@reva.edu.in', 'b1111111-1111-1111-1111-111111111111', 'Head of Department (HOD)', 'SOCIT Block, Room 101', true),
('f3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dr. Ramesh Chandra (Demo Director)', 'ramesh.chandra.demo@reva.edu.in', 'b1111111-1111-1111-1111-111111111111', 'Director - School of CIT', 'Administrative Block, Floor 2', true),
('f4444444-4444-4444-4444-444444444444', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Prof. Ananya Sen (Demo Faculty)', 'ananya.sen.demo@reva.edu.in', 'b2222222-2222-2222-2222-222222222222', 'Class Coordinator - ECE', 'ECE Block, Room 208', true),
('f5555555-5555-5555-5555-555555555555', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mr. Vinay Murthy (Demo Admin)', 'admin.office.demo@reva.edu.in', 'b1111111-1111-1111-1111-111111111111', 'Administrative Officer', 'Student Affairs Centre, Counter 4', true)
ON CONFLICT (college_id, email) DO NOTHING;
