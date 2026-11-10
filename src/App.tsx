import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import AuditorDashboard from './pages/AuditorDashboard';
import AuditManagerDashboard from './pages/AuditManagerDashboard';
import BranchDashboard from './pages/BranchDashboard';
import CreateProgram from './pages/CreateProgram';
import Branches from './pages/Branches';
import Users from './pages/Users';
import AuditForm from './pages/audit/AuditForm';
import BranchReply from './pages/BranchReply';
import ReportPrint from './pages/audit/ReportPrint.tsx';

function HomeRedirect() {
  const { profile } = useAuth();
  if (!profile) return null;

  if (profile.role === 'auditor') {
    return <AuditorDashboard />;
  }
  if (profile.role === 'audit_manager' || profile.role === 'admin') {
    return <AuditManagerDashboard />;
  }
  if (
    ['branch_manager', 'area_manager', 'regional_manager', 'sales_head', 'director'].includes(
      profile.role
    )
  ) {
    return <BranchDashboard />;
  }
  return (
    <div className="bg-white rounded-xl border p-8">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Welcome, {profile.full_name}</h1>
      <p className="text-gray-500 mb-4">
        Role: <strong>{profile.role.replace('_', ' ')}</strong>
      </p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reports/:id/print" element={<ReportPrint />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route path="programs/new" element={<CreateProgram />} />
        <Route path="branches" element={<Branches />} />
        <Route path="users" element={<Users />} />
        <Route path="my-audits/new" element={<AuditForm />} />
        <Route path="my-audits/:id" element={<AuditForm />} />
        <Route path="reports" element={<BranchDashboard />} />
        <Route path="pending-replies" element={<BranchDashboard />} />
        <Route path="reports/:id/reply" element={<BranchReply />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
