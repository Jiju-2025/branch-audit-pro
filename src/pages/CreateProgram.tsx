import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import type { Branch, Profile } from '../types';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateProgram() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [auditors, setAuditors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    branch_id: '',
    auditor_id: '',
    planned_date: '',
    period_from: '',
    period_to: '',
    man_days: '1',
    remarks: '',
  });

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const [bRes, aRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.branches),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.profiles),
      ]);
      setBranches(bRes.documents.filter((d: any) => d.is_active !== false).map((d: any) => ({
        id: d.$id, branch_code: d.branch_code, branch_name: d.branch_name, region: d.region, is_active: true
      })));
      setAuditors(aRes.documents.filter((d: any) => d.role === 'auditor' && d.is_active !== false).map((d: any) => ({
        id: d.$id, full_name: d.full_name, email: d.email, role: d.role, must_change_password: false, is_active: true
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.audit_programs, ID.unique(), {
        branch_id: form.branch_id,
        auditor_id: form.auditor_id,
        planned_date: form.planned_date,
        period_from: form.period_from || null,
        period_to: form.period_to || null,
        man_days: parseFloat(form.man_days) || 1,
        status: 'scheduled',
        remarks: form.remarks || null,
        created_by: profile?.id || null,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create program');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold text-gray-900">Create Audit Program</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
          <select name="branch_id" value={form.branch_id} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2.5">
            <option value="">Select Branch</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.branch_name} ({b.branch_code})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Auditor *</label>
          <select name="auditor_id" value={form.auditor_id} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2.5">
            <option value="">Select Auditor</option>
            {auditors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planned Date *</label>
            <input type="date" name="planned_date" value={form.planned_date} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Man Days</label>
            <input type="number" name="man_days" value={form.man_days} onChange={handleChange} step="0.5" min="0.5" className="w-full border rounded-lg px-3 py-2.5" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period From</label>
            <input type="date" name="period_from" value={form.period_from} onChange={handleChange} className="w-full border rounded-lg px-3 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period To</label>
            <input type="date" name="period_to" value={form.period_to} onChange={handleChange} className="w-full border rounded-lg px-3 py-2.5" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea name="remarks" value={form.remarks} onChange={handleChange} rows={3} className="w-full border rounded-lg px-3 py-2.5" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2.5 border rounded-lg text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Create Program'}
          </button>
        </div>
      </form>
    </div>
  );
}
