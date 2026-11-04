import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../lib/utils';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  ClipboardList,
  MessageSquare,
  Shield,
} from 'lucide-react';

export default function MainLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const role = profile?.role || 'auditor';

  // Navigation items based on role
  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'audit_manager', 'auditor', 'branch_manager', 'area_manager', 'regional_manager', 'sales_head', 'director'],
    },
    {
      label: 'Audit Programs',
      path: '/programs',
      icon: Calendar,
      roles: ['admin', 'audit_manager'],
    },
    {
      label: 'My Audits',
      path: '/my-audits',
      icon: ClipboardList,
      roles: ['auditor'],
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: FileText,
      roles: ['admin', 'audit_manager', 'branch_manager', 'area_manager', 'regional_manager', 'sales_head', 'director'],
    },
    {
      label: 'Pending Replies',
      path: '/pending-replies',
      icon: MessageSquare,
      roles: ['branch_manager'],
    },
    {
      label: 'Branches',
      path: '/branches',
      icon: Building2,
      roles: ['admin'],
    },
    {
      label: 'Users',
      path: '/users',
      icon: Users,
      roles: ['admin'],
    },
    {
      label: 'Company Settings',
      path: '/settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">BranchAudit Pro</div>
              <div className="text-xs text-slate-400">{ROLE_LABELS[role]}</div>
            </div>
            <button
              className="ml-auto lg:hidden text-slate-400"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User info + Logout */}
          <div className="px-4 py-4 border-t border-slate-700">
            <div className="text-sm font-medium truncate">{profile?.full_name}</div>
            <div className="text-xs text-slate-400 truncate mb-3">
              {profile?.employee_code || profile?.email}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-gray-800">BranchAudit Pro</span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
