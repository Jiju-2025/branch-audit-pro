import React, { useEffect, useState } from 'react';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '../lib/appwrite';
import type { Branch } from '../types';
import { Plus, Pencil, Building2, X, Save } from 'lucide-react';

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({
    branch_code: '',
    branch_name: '',
    region: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.branches);
      setBranches(
        res.documents.map((doc: any) => ({
          id: doc.$id,
          branch_code: doc.branch_code,
          branch_name: doc.branch_name,
          region: doc.region,
          address: doc.address,
          is_active: doc.is_active ?? true,
        }))
      );
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ branch_code: '', branch_name: '', region: '', address: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({
      branch_code: b.branch_code,
      branch_name: b.branch_name,
      region: b.region || '',
      address: b.address || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editing) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.branches, editing.id, {
          branch_code: form.branch_code,
          branch_name: form.branch_name,
          region: form.region || null,
          address: form.address || null,
        });
      } else {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.branches, ID.unique(), {
          branch_code: form.branch_code,
          branch_name: form.branch_name,
          region: form.region || null,
          address: form.address || null,
          is_active: true,
        });
      }
      setShowModal(false);
      loadBranches();
    } catch (err: any) {
      setError(err.message || 'Error saving branch');
    }
    setSaving(false);
  };

  const toggleActive = async (b: Branch) => {
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.branches, b.id, {
        is_active: !b.is_active,
      });
      loadBranches();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-500 text-sm">Manage all branch master data</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Branch
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
                  <th className="text-left px-5 py-3 font-medium">Branch Code</th>
                  <th className="text-left px-5 py-3 font-medium">Branch Name</th>
                  <th className="text-left px-5 py-3 font-medium">Region</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-medium">{b.branch_code}</td>
                    <td className="px-5 py-3">{b.branch_name}</td>
                    <td className="px-5 py-3 text-gray-500">{b.region || '-'}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(b)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {b.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => openEdit(b)} className="text-blue-600 hover:text-blue-800 p-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      No branches yet. Add your first branch.
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold text-lg">{editing ? 'Edit Branch' : 'Add Branch'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Code *</label>
                <input required value={form.branch_code} onChange={(e) => setForm({ ...form, branch_code: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 outline-none" placeholder="e.g. 031" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                <input required value={form.branch_name} onChange={(e) => setForm({ ...form, branch_name: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 outline-none" placeholder="e.g. Guruvayur" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2.5 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
