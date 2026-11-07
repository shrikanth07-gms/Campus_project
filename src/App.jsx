import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DocumentProvider } from './context/DocumentContext';

// Layouts & Guards
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import CollegeLogin from './pages/public/CollegeLogin';

// Student Pages
import StudentOverview from './pages/student/StudentOverview';
import SubmitDocument from './pages/student/SubmitDocument';
import MySubmissions from './pages/student/MySubmissions';
import SubmissionDetails from './pages/student/SubmissionDetails';
import FacultyDirectoryPage from './pages/student/FacultyDirectoryPage';
import NotificationsPage from './pages/student/NotificationsPage';
import StudentProfile from './pages/student/StudentProfile';

// Faculty Pages
import FacultyOverview from './pages/faculty/FacultyOverview';
import AssignedSubmissions from './pages/faculty/AssignedSubmissions';
import ReviewSubmission from './pages/faculty/ReviewSubmission';
import FacultyProfile from './pages/faculty/FacultyProfile';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import FacultyManagement from './pages/admin/FacultyManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import WorkflowConfig from './pages/admin/WorkflowConfig';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <DocumentProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/college/reva" element={<CollegeLogin />} />

              {/* Student Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <StudentOverview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/submit"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <SubmitDocument />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/submissions"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <MySubmissions />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/submissions/:id"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <SubmissionDetails />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/faculty"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <FacultyDirectoryPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/notifications"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <NotificationsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <DashboardLayout>
                      <StudentProfile />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Faculty Routes */}
              <Route
                path="/faculty"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'hod', 'director']}>
                    <DashboardLayout>
                      <FacultyOverview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/submissions"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'hod', 'director']}>
                    <DashboardLayout>
                      <AssignedSubmissions />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/submissions/:id"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'hod', 'director']}>
                    <DashboardLayout>
                      <ReviewSubmission />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/notifications"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'hod', 'director']}>
                    <DashboardLayout>
                      <NotificationsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty/profile"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'hod', 'director']}>
                    <DashboardLayout>
                      <FacultyProfile />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <AdminOverview />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <UserManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/faculty"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <FacultyManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <DepartmentManagement />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/workflows"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <WorkflowConfig />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DocumentProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
