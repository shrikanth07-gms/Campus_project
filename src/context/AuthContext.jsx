import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { DEMO_PRESET_USERS, DEMO_COLLEGE } from '../services/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check if Supabase credentials are functional
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
      // Offline / LocalStorage Demo Mode
      loadStoredDemoUser();
      setLoading(false);
    }
  }, []);

  const fetchSupabaseProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.warn('Error fetching Supabase profile, falling back:', err.message);
    }
  };

  const loadStoredDemoUser = () => {
    const saved = localStorage.getItem('campusflow_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setProfile(parsed);
        return;
      } catch {
        localStorage.removeItem('campusflow_current_user');
      }
    }
    // Default to student persona for instant testability
    const defaultStudent = DEMO_PRESET_USERS.student;
    setUser(defaultStudent);
    setProfile(defaultStudent);
    localStorage.setItem('campusflow_current_user', JSON.stringify(defaultStudent));
  };

  // Student Registration
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
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        // LocalStorage mock registration
        const newStudent = {
          id: `student-${Date.now()}`,
          email,
          full_name: fullName,
          role: 'student',
          srn,
          branch_name: branch,
          phone,
          college_id: DEMO_COLLEGE.id,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          created_at: new Date().toISOString()
        };

        // Save into registered students list
        const storedStudents = JSON.parse(localStorage.getItem('campusflow_registered_students') || '[]');
        storedStudents.push({ ...newStudent, password });
        localStorage.setItem('campusflow_registered_students', JSON.stringify(storedStudents));

        setUser(newStudent);
        setProfile(newStudent);
        localStorage.setItem('campusflow_current_user', JSON.stringify(newStudent));
        setLoading(false);
        return { success: true, user: newStudent };
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Login
  const login = async (email, password, expectedRole = null) => {
    setAuthError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        setUser(data.user);
        await fetchSupabaseProfile(data.user.id);
        setLoading(false);
        return { success: true };
      } else {
        // Demo Mode Check: check preset users or registered students
        const allPresets = Object.values(DEMO_PRESET_USERS);
        const registered = JSON.parse(localStorage.getItem('campusflow_registered_students') || '[]');
        const candidate = [...allPresets, ...registered].find(u => u.email.toLowerCase() === email.toLowerCase());

        if (candidate) {
          if (expectedRole && expectedRole !== candidate.role && !(expectedRole === 'faculty' && ['faculty', 'hod', 'director'].includes(candidate.role))) {
            throw new Error(`This portal is for ${expectedRole} access. Your account has role: ${candidate.role}`);
          }
          setUser(candidate);
          setProfile(candidate);
          localStorage.setItem('campusflow_current_user', JSON.stringify(candidate));
          setLoading(false);
          return { success: true };
        } else {
          // Allow demo login with any matching email or throw clear error
          throw new Error('Invalid email or password. Use one of the Demo Presets or registered credentials.');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Quick switch demo user persona (Student, Faculty, HOD, Director, Admin)
  const switchDemoUser = (roleKey) => {
    const selected = DEMO_PRESET_USERS[roleKey];
    if (selected) {
      setUser(selected);
      setProfile(selected);
      localStorage.setItem('campusflow_current_user', JSON.stringify(selected));
    }
  };

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('campusflow_current_user');
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    role: profile?.role || user?.role || 'student',
    loading,
    authError,
    login,
    registerStudent,
    logout,
    switchDemoUser,
    isSupabaseMode: isSupabaseConfigured
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

