-- Migration: 20261106_security_fixes.sql
-- Applies zero-trust RLS policies, anti-privilege escalation triggers, 
-- multi-college isolation, storage policies, and secure workflow functions.

-- 1. Create Helper Functions (Non-recursive SECURITY DEFINER)
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

CREATE OR REPLACE FUNCTION public.can_review_submission(p_submission_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_sub RECORD;
BEGIN
    SELECT * INTO v_sub FROM public.submissions WHERE id = p_submission_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF public.is_college_admin(v_sub.college_id) THEN RETURN TRUE; END IF;
    IF v_sub.current_reviewer_id = auth.uid() THEN RETURN TRUE; END IF;
    IF EXISTS (
        SELECT 1 FROM public.faculty_directory fd 
        WHERE fd.id = v_sub.assigned_faculty_id AND fd.user_id = auth.uid()
    ) THEN RETURN TRUE; END IF;
    RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_submission_participant(p_submission_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_sub RECORD;
BEGIN
    SELECT * INTO v_sub FROM public.submissions WHERE id = p_submission_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF v_sub.student_id = auth.uid() THEN RETURN TRUE; END IF;
    RETURN public.can_review_submission(p_submission_id);
END;
$$;

-- 2. Constraints
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS uq_departments_college_code;
ALTER TABLE public.departments ADD CONSTRAINT uq_departments_college_code UNIQUE (college_id, code);

ALTER TABLE public.branches DROP CONSTRAINT IF EXISTS uq_branches_dept_code;
ALTER TABLE public.branches ADD CONSTRAINT uq_branches_dept_code UNIQUE (department_id, code);

ALTER TABLE public.document_types DROP CONSTRAINT IF EXISTS uq_document_types_college_code;
ALTER TABLE public.document_types ADD CONSTRAINT uq_document_types_college_code UNIQUE (college_id, code);

ALTER TABLE public.faculty_directory DROP CONSTRAINT IF EXISTS uq_faculty_college_email;
ALTER TABLE public.faculty_directory ADD CONSTRAINT uq_faculty_college_email UNIQUE (college_id, email);

-- 3. Triggers for Security & Anti-Privilege Escalation
CREATE OR REPLACE FUNCTION public.trg_check_profile_update()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    caller_is_admin BOOLEAN;
    caller_college UUID;
BEGIN
    SELECT (role = 'admin' AND is_active = true), college_id
    INTO caller_is_admin, caller_college
    FROM public.profiles
    WHERE id = auth.uid();

    caller_is_admin := COALESCE(caller_is_admin, false);

    IF NOT caller_is_admin THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Privilege escalation rejected: users cannot modify their own role.';
        END IF;
        IF NEW.college_id IS DISTINCT FROM OLD.college_id THEN
            RAISE EXCEPTION 'Security violation: college_id cannot be changed.';
        END IF;
        IF NEW.srn IS DISTINCT FROM OLD.srn THEN
            RAISE EXCEPTION 'Security violation: SRN cannot be modified.';
        END IF;
        IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
            RAISE EXCEPTION 'Security violation: account status can only be modified by an administrator.';
        END IF;
    ELSE
        IF caller_college IS DISTINCT FROM OLD.college_id THEN
            RAISE EXCEPTION 'Cross-college administration prohibited.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_updates ON public.profiles;
CREATE TRIGGER trg_guard_profile_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trg_check_profile_update();

-- 4. Cross-College Submission Validation Trigger
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
    SELECT college_id INTO v_student_college FROM public.profiles WHERE id = NEW.student_id;
    IF v_student_college IS NULL OR v_student_college <> NEW.college_id THEN
        RAISE EXCEPTION 'Cross-college submission prohibited: Student does not belong to the target college.';
    END IF;

    SELECT college_id INTO v_dept_college FROM public.departments WHERE id = NEW.department_id;
    IF v_dept_college IS NULL OR v_dept_college <> NEW.college_id THEN
        RAISE EXCEPTION 'Cross-college submission prohibited: Department does not belong to the target college.';
    END IF;

    SELECT college_id INTO v_doc_type_college FROM public.document_types WHERE id = NEW.document_type_id;
    IF v_doc_type_college IS NULL OR v_doc_type_college <> NEW.college_id THEN
        RAISE EXCEPTION 'Cross-college submission prohibited: Document type does not belong to the target college.';
    END IF;

    SELECT college_id INTO v_fac_college FROM public.faculty_directory WHERE id = NEW.assigned_faculty_id;
    IF v_fac_college IS NULL OR v_fac_college <> NEW.college_id THEN
        RAISE EXCEPTION 'Cross-college submission prohibited: Assigned faculty does not belong to the target college.';
    END IF;

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

-- 5. Submission Workflow Guard Trigger
CREATE OR REPLACE FUNCTION public.trg_guard_submission_workflow()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
    caller_id UUID := auth.uid();
    is_reviewer BOOLEAN;
BEGIN
    is_reviewer := public.can_review_submission(OLD.id);

    IF caller_id = OLD.student_id AND NOT is_reviewer THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            IF OLD.status = 'correction_required' AND NEW.status = 'under_review' THEN
                NULL;
            ELSE
                RAISE EXCEPTION 'Permission denied: Students cannot alter workflow approval status.';
            END IF;
        END IF;

        IF NEW.approval_stages IS DISTINCT FROM OLD.approval_stages THEN
            RAISE EXCEPTION 'Permission denied: Students cannot modify approval workflow stages.';
        END IF;

        IF NEW.current_reviewer_id IS DISTINCT FROM OLD.current_reviewer_id THEN
            RAISE EXCEPTION 'Permission denied: Students cannot reassign document reviewers.';
        END IF;

        IF NEW.assigned_faculty_id IS DISTINCT FROM OLD.assigned_faculty_id THEN
            RAISE EXCEPTION 'Permission denied: Assigned faculty cannot be modified directly.';
        END IF;

        IF NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason OR
           NEW.physical_signature_instructions IS DISTINCT FROM OLD.physical_signature_instructions THEN
            RAISE EXCEPTION 'Permission denied: Reviewer notes cannot be modified by the student.';
        END IF;
    END IF;

    IF is_reviewer THEN
        IF NEW.status = 'rejected' AND (NEW.rejection_reason IS NULL OR TRIM(NEW.rejection_reason) = '') THEN
            RAISE EXCEPTION 'Rejection requires a mandatory explanation note.';
        END IF;

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

-- 6. Apply Updated RLS Policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User roles view own or college admin" ON public.user_roles;
CREATE POLICY "User roles view own or college admin" ON public.user_roles
FOR SELECT USING (user_id = auth.uid() OR public.is_college_admin(college_id));

DROP POLICY IF EXISTS "User roles admin manage" ON public.user_roles;
CREATE POLICY "User roles admin manage" ON public.user_roles
FOR ALL USING (public.is_college_admin(college_id));

-- Submissions RLS
DROP POLICY IF EXISTS "Submissions select policy" ON public.submissions;
CREATE POLICY "Submissions select policy" ON public.submissions
FOR SELECT USING (
    student_id = auth.uid()
    OR public.can_review_submission(id)
    OR public.is_college_admin(college_id)
);

DROP POLICY IF EXISTS "Submissions student insert" ON public.submissions;
CREATE POLICY "Submissions student insert" ON public.submissions
FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND college_id = public.get_my_college_id()
    AND status = 'submitted'
);

DROP POLICY IF EXISTS "Submissions update policy" ON public.submissions;
CREATE POLICY "Submissions update policy" ON public.submissions
FOR UPDATE USING (
    (student_id = auth.uid() AND status = 'correction_required')
    OR public.can_review_submission(id)
    OR public.is_college_admin(college_id)
);

-- Messages RLS
DROP POLICY IF EXISTS "Messages select policy" ON public.messages;
CREATE POLICY "Messages select policy" ON public.messages
FOR SELECT USING (
    public.is_submission_participant(submission_id)
    AND (
        is_internal = false
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
        is_internal = false OR public.is_faculty_or_above()
    )
);

-- Notifications RLS
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

-- Activity Logs RLS
DROP POLICY IF EXISTS "Activity logs view" ON public.activity_logs;
CREATE POLICY "Activity logs view" ON public.activity_logs
FOR SELECT USING (
    public.is_submission_participant(submission_id)
    OR public.is_college_admin(college_id)
);

