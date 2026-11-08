import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { DEMO_PRESET_USERS, DEMO_COLLEGE } from '../services/mockData';

const AuthContext = createContext(null);

// Map branch name → seed UUID for the profiles upsert
const BRANCH_NAME_TO_ID = {
  'Computer Science and Engineering': 'c1111111-1111-1111-1111-111111111111',
  'Artificial Intelligence & Data Science': 'c2222222-2222-2222-2222-222222222222',
  'Electronics and Communication Engineering': 'c3333333-3333-3333-3333-333333333333',
  'Mechanical Engineering': 'c4444444-4444-4444-4444-444444444444',
  'Master of Business Administration': 'c5555555-5555-5555-5555-555555555555',
};

const BRANCH_NAME_TO_DEPT = {
  'Computer Science and Engineering': 'b1111111-1111-1111-1111-111111111111',
  'Artificial Intelligence & Data Science': 'b1111111-1111-1111-1111-111111111111',
  'Electronics and Communication Engineering': 'b2222222-2222-2222-2222-222222222222',
  'Mechanical Engineering': 'b3333333-3333-3333-3333-333333333333',
  'Master of Business Administration': 'b4444444-4444-4444-4444-444444444444',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchSupabaseProfile(session.user.id);
        } else {
          loadStoredDemoUser();
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchSupabaseProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      loadStoredDemoUser();
      setLoading(false);
    }
  }, []);

  const fetchSupabaseProfile = async (userId, fallbackMeta = null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        return data;
      }

      if (fallbackMeta) {
        const healed = await upsertProfile(userId, fallbackMeta);
        if (healed) { setProfile(healed); return healed; }
      }
      return null;
    } catch (err) {
      console.warn('Error fetching Supabase profile:', err.message);
      return null;
    }
  };

  const upsertProfile = async (userId, { email, full_name, srn, branch, phone, role = 'student' }) => {
    const branchId = BRANCH_NAME_TO_ID[branch] || null;
    const deptId = BRANCH_NAME_TO_DEPT[branch] || 'b1111111-1111-1111-1111-111111111111';

    const payload = {
      id: userId,
      college_id: DEMO_COLLEGE.id,
      full_name: full_name || email.split('@')[0],
      email: email,
      srn: srn || null,
      phone: phone || null,
      role: role,
      branch_id: branchId,
      department_id: deptId,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Profile upsert error:', error.message);
      return null;
    }
    return data;
  };

  const loadStoredDemoUser = () => {
    const saved = localStorage.getItem('routepulse_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setProfile(parsed);
        return;
      } catch {
        localStorage.removeItem('routepulse_current_user');
      }
    }
    const defaultStudent = DEMO_PRESET_USERS.student;
    setUser(defaultStudent);
    setProfile(defaultStudent);
    localStorage.setItem('routepulse_current_user', JSON.stringify(defaultStudent));
  };

  const registerStudent = async ({ fullName, email, password, srn, branch, phone }) => {
    setAuthError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              srn,
              branch,
              phone,
              role: 'student',
              college_id: DEMO_COLLEGE.id
            }
          }
        });
        if (error) throw error;

        if (data.user) {
          await upsertProfile(data.user.id, {
            email,
            full_name: fullName,
            srn,
            branch,
            phone,
            role: 'student'
          });
        }

        setLoading(false);
        return { success: true, user: data.user, prefillEmail: email };
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password, expectedRole = null) => {
    setAuthError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        setUser(data.user);
        const meta = data.user.user_metadata || {};
        const fetched = await fetchSupabaseProfile(data.user.id, {
          email: data.user.email,
          full_name: meta.full_name || data.user.email.split('@')[0],
          srn: meta.srn || null,
          branch: meta.branch || 'Computer Science and Engineering',
          phone: meta.phone || null,
          role: meta.role || 'student',
        });

        const resolvedRole = fetched?.role || meta.role || 'student';
        if (expectedRole && expectedRole !== resolvedRole &&
          !(expectedRole === 'faculty' && ['faculty', 'hod', 'director'].includes(resolvedRole))) {
          await supabase.auth.signOut();
          throw new Error(`This portal requires ${expectedRole} access. Your account role is: ${resolvedRole}`);
        }

        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const switchDemoUser = (roleKey) => {
    const selected = DEMO_PRESET_USERS[roleKey];
    if (selected) {
      setUser(selected);
      setProfile(selected);
      localStorage.setItem('routepulse_current_user', JSON.stringify(selected));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) await supabase.auth.signOut();
    localStorage.removeItem('routepulse_current_user');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, role: profile?.role || user?.role || 'student',
      loading, authError, login, registerStudent, logout, switchDemoUser,
      isSupabaseMode: isSupabaseConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}