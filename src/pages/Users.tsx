import React, { useEffect, useState } from 'react';
import { account, databases, DATABASE_ID, COLLECTIONS, ID } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import type { Profile, Branch, UserRole } from '../types';
import { ROLE_LABELS } from '../lib/utils';
import { Plus, Users as UsersIcon, X, Save, Eye, EyeOff } from 'lucide-react';

const ROLES: UserRole[] = [
  'admin', 'audit_manager', 'auditor', 'branch_manager',
  'area_manager', 'regional_manager', 'sales_head', 'director',
];

export default function Users() {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    employee_code: '',
    phone: '',
    role: 'auditor' as UserRole,
    branch_id: '',
    password: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.profiles),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.branches),
      ]);
      setUsers(usersRes.documents.map((doc: any) => ({
        id: doc.$id,
        full_name: doc.full_name,
        email: doc.email,
        employee_code: doc.employee_code,
        phone: doc.phone,
        role: doc.role,
        branch_id: doc.branch_id,
        must_change_password: doc.must_change_password,
        is_active: doc.is_active,
      })));
      setBranches(branchesRes.documents.map((doc: any) => ({
        id: doc.$id,
        branch_code: doc.branch_code,
        branch_name: doc.branch_name,
        region: doc.region,
        is_active: doc.is_active,
      })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setForm({
      full_name: '', email: '', employee_code: '', phone: '',
      role: 'auditor', branch_id: '', password: '',
    });
    setError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Create Auth user
      const newUser = await account.create(ID.unique(), form.email, form.password, form.full_name);

      // Create profile document with same ID
      await databases.createDocument(DATABASE_ID, COLLECTIONS.profiles, newUser.$id, {
        full_name: form.full_name,
        email: form.email,
        employee_code: form.employee_code || null,
        phone: form.phone || null,
        role: form.role,
        branch_id: form.branch_id || null,
        must_change_password: true,
        is_active: true,
      });

      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm">Create and manage system users</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Emp Code</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{u.full_name}</td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">{u.employee_code || '-'}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-lg">Create New User</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email (Login ID) *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Code</label>
                  <input value={form.employee_code} onChange={(e) => setForm({ ...form, employee_code: e.target.value })} className="w-full border rounded-lg px-3 py-2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role *</label>
                  <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full border rounded-lg px-3 py-2.5">
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temporary Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">User must change this password on first login.</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  <Save className="w-4 h-4" /> {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
