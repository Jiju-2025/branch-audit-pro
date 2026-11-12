import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';
import { Save, Send, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import Annexure1 from './Annexure1.tsx';
import Annexure2 from './Annexure2.tsx';

const DESIGNATIONS = [
  'Customer Relation Executive',
  'Assistant Manager',
  'Branch Manager',
  'Chief Branch Manager',
];

function YesNoNA({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="border rounded-md px-2 py-1.5 text-sm min-w-[90px]">
      <option value="">—</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
      <option value="NA">NA</option>
    </select>
  );
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

const defaultRegisters = [
  'Muster roll Register', 'Cash Book', 'Key Register/Key movement Register', 'Official Visitors Register',
  'Staff Movement Register', 'Assets Register', 'Safe Cash Movement Register', 'Stamp Register',
  'Security Register/ Gold loan movement Register', 'KYC Register And KYC File', 'Denomination Register',
  'Branch Inspection and Audit File', 'Bank-reconciliation File', 'Cheque Utilization Register',
  'Cash in Transit Register', 'Daily transaction summary', 'Complaints Register', 'Circular File',
  'GL Security Cover register', 'Overdue followup register',
].map((name, i) => ({ s_no: i + 1, name, irregularities: '', remarks: '' }));

const defaultFormData = {
  branch_contact_designation: '',
  branch_contact_name: '',
  abm_name: '',
  higher_authority_designation: '',
  higher_authority_name: '',
  area_manager_name: '',
  period_covered_from: '',
  period_covered_to: '',
  verification_from: '',
  verification_to: '',
  man_days_taken: '',
  staff: [] as any[],
  cash_physical: '',
  cash_system: '',
  cash_questions: [
    { q: '1. Cash denomination sheet and cash book are properly maintained and updated?', a: '', remarks: '' },
    { q: '2. Excess cash is accounted properly on the same day?', a: '', remarks: '' },
    { q: '3. System and physical cash balance difference is recorded and reported to HO?', a: '', remarks: '' },
    { q: '4. Cash holding is within the prescribed limit? (Rs.200000)', a: '', remarks: '' },
    { q: '5. Whether cash kept as joint reserve is properly recorded and maintained?', a: '', remarks: '' },
    { q: '6. Any Unaccounted gold/cash held by branch in safe?', a: '', remarks: '' },
  ],
  bank_questions: [
    { q: '1. Cancelled cheques are kept in the branch?', a: '', remarks: '' },
    { q: '2. Unused cheque/blank leaves are verified serially?', a: '', remarks: '' },
    { q: '3. Bank reconciliation statements are prepared as per stipulations?', a: '', remarks: '' },
    { q: '4. Bank balance holding is within the prescribed limit?', a: '', remarks: '' },
    { q: '5. Whether cheque utilization register maintained properly?', a: '', remarks: '' },
  ],
  safe_questions: [
    { q: 'a) Whether any unauthorized items are kept in the safe room?', a: '', remarks: '' },
    { q: 'b) Keys of the strong room are kept under personal custody?', a: '', remarks: '' },
    { q: 'c) Almirah / Strong safe are kept closed during office hours?', a: '', remarks: '' },
    { q: 'd) Whether joint custody operations followed properly?', a: '', remarks: '' },
    { q: 'e) Any previous irregularities pending?', a: '', remarks: '' },
  ],
  registers: defaultRegisters,
  general_points: [
    { q: '1. Whether all Tube lights & Timer in glow sign board is working?', a: '', remarks: '' },
    { q: '2. Whether the Direction boards are fixed outside the premises?', a: '', remarks: '' },
    { q: '3. Whether all furniture/Door locks/Handles working properly?', a: '', remarks: '' },
    { q: '4. Whether Electrical Switch/All lights/Fans/AC working properly?', a: '', remarks: '' },
    { q: '5. Branch opens in time and proper cleaning done?', a: '', remarks: '' },
    { q: '7. Weighing Machine working condition?', a: '', remarks: '' },
    { q: '10. Fire Extinguisher Installed?', a: '', remarks: '' },
    { q: '12. Whether All staff wear ID card?', a: '', remarks: '' },
    { q: '15. Burglar alarm Installed?', a: '', remarks: '' },
  ],
  general_observations: '',
  docs_verified_count: 0,
  docs_discrepancies: 0,
  annex2_packets_verified: 20,
  annex2_pending_irregularities: '',
  grading: {
    cash_maintenance: { max: 10, achieved: 0 },
    bank_brs: { max: 10, achieved: 0 },
    registers: { max: 15, achieved: 0 },
    documentation: { max: 10, achieved: 0 },
    premises: { max: 5, achieved: 0 },
  },
  annex1: {} as Record<string, any[]>,
  hospital_notes: '',
  vouchers_notes: '',
  annex1_pending_irregularities: '',
  annex2: {} as Record<string, any[]>,
  annex2_header: {} as Record<string, string>,
  annex2_general_points: '',
  annex2_closed_irregularities: '',
  annex2_total_recovery: '',
};
export default function AuditForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('program');
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().slice(0, 10));
  const [formData, setFormData] = useState<any>(defaultFormData);
  const [status, setStatus] = useState<'draft' | 'submitted'>('draft');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(!!id);
  const [remarks, setRemarks] = useState<any[]>([]);

  useEffect(() => {
    loadBranches();
    if (id) loadReport(id);
  }, [id]);

  const loadBranches = async () => {
          try {
        const remRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.report_remarks
        );
        console.log('ALL REMARKS COUNT', remRes.documents.length);
        console.log('ALL REMARKS', remRes.documents);
        console.log('LOOKING FOR reportId', reportId);

        const profileRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.profiles);
        const profileMap: Record<string, any> = {};
        profileRes.documents.forEach((p: any) => {
          profileMap[p.$id] = p;
        });

        const matched = remRes.documents.filter((r: any) => {
          const rid = String(r.report_id || r.reportId || '');
          return rid === String(reportId) || rid.includes(String(reportId)) || String(reportId).includes(rid);
        });

        console.log('MATCHED', matched.length, matched);

        setRemarks(
          matched.map((r: any) => ({
            ...r,
            user: profileMap[r.user_id],
          }))
        );
      } catch (e) {
        console.error('REMARKS ERROR', e);
        setRemarks([]);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const updateField = (path: string, value: any) => {
    setFormData((prev: any) => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const updateArrayItem = (arrayName: string, index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const arr = [...(prev[arrayName] || [])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [arrayName]: arr };
    });
  };

  const addStaff = () => {
    setFormData((prev: any) => ({
      ...prev,
      staff: [...(prev.staff || []), { name: '', employee_code: '', designation: '', doj: '', remarks: '' }],
    }));
  };

  const removeStaff = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      staff: prev.staff.filter((_: any, i: number) => i !== index),
    }));
  };

  const addRegister = () => {
    setFormData((prev: any) => {
      const list = [...(prev.registers || [])];
      list.push({ s_no: list.length + 1, name: '', irregularities: '', remarks: '' });
      return { ...prev, registers: list };
    });
  };

  const removeRegister = (index: number) => {
    setFormData((prev: any) => {
      const list = prev.registers
        .filter((_: any, i: number) => i !== index)
        .map((r: any, i: number) => ({ ...r, s_no: i + 1 }));
      return { ...prev, registers: list };
    });
  };

  const saveReport = async (submit = false) => {
    if (!branchId) {
      setMessage('Please select a Branch');
      return;
    }
    setSaving(true);
    setMessage('');

    const payload: any = {
      branch_id: branchId,
      auditor_id: profile!.id,
      audit_date: auditDate,
      form_data: JSON.stringify(formData),
      status: submit ? 'submitted' : 'draft',
    };
    if (programId) payload.program_id = programId;
    if (submit) {
      payload.submitted_at = new Date().toISOString();
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 10);
      payload.branch_reply_deadline = deadline.toISOString();
    }

    try {
      if (id) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.audit_reports, id, payload);
      } else {
        const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.audit_reports, ID.unique(), payload);
        navigate(`/my-audits/${doc.$id}`, { replace: true });
      }
      setMessage(submit ? 'Report submitted successfully!' : 'Draft saved successfully');
      if (submit) setStatus('submitted');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('Error: ' + (err.message || 'Failed to save'));
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isReadOnly = status === 'submitted';
    return (
    <div className="max-w-5xl mx-auto space-y-5 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 bg-gray-50 z-10 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{id ? 'Edit Audit Report' : 'New Audit Report'}</h1>
            <p className="text-xs text-gray-500">
              Status: <span className="font-medium">{status}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isReadOnly && id && (
            <a
              href={`/reports/${id}/print`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Print / PDF
            </a>
          )}
          {!isReadOnly && (
            <>
              <button onClick={() => saveReport(false)} disabled={saving} className="inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-lg text-sm font-medium">
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button onClick={() => saveReport(true)} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Send className="w-4 h-4" /> Submit Report
              </button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
          {message}
        </div>
      )}

      <Section title="Branch & Audit Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Branch *</label>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2.5">
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.branch_name} ({b.branch_code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Audit Date</label>
            <input type="date" value={auditDate} onChange={(e) => setAuditDate(e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch Contact Designation</label>
            <select value={formData.branch_contact_designation || ''} onChange={(e) => updateField('branch_contact_designation', e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2.5">
              <option value="">Select Designation</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Chief Branch Manager">Chief Branch Manager</option>
              <option value="ABM">ABM</option>
              <option value="Customer Relation Executive">Customer Relation Executive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch Contact Name</label>
            <input
              value={formData.branch_contact_name || formData.abm_name || ''}
              onChange={(e) => {
                updateField('branch_contact_name', e.target.value);
                updateField('abm_name', e.target.value);
              }}
              disabled={isReadOnly}
              className="w-full border rounded-lg px-3 py-2.5"
              placeholder="Type name manually"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Higher Authority Designation</label>
            <select value={formData.higher_authority_designation || ''} onChange={(e) => updateField('higher_authority_designation', e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2.5">
              <option value="">Select Designation</option>
              <option value="Area Manager">Area Manager</option>
              <option value="Regional Manager">Regional Manager</option>
              <option value="Sales Head">Sales Head</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Higher Authority Name</label>
            <input
              value={formData.higher_authority_name || formData.area_manager_name || ''}
              onChange={(e) => {
                updateField('higher_authority_name', e.target.value);
                updateField('area_manager_name', e.target.value);
              }}
              disabled={isReadOnly}
              className="w-full border rounded-lg px-3 py-2.5"
              placeholder="Type name manually"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Audit Period From</label>
            <input type="date" value={formData.period_covered_from || ''} onChange={(e) => updateField('period_covered_from', e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Audit Period To</label>
            <input type="date" value={formData.period_covered_to || ''} onChange={(e) => updateField('period_covered_to', e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Verification From</label>
            <input type="date" value={formData.verification_from || ''} onChange={(e) => onVerificationChange('verification_from', e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Verification To</label>
            <input type="date" value={formData.verification_to || ''} onChange={(e) => onVerificationChange('verification_to', e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Days Taken for Audit</label>
            <input type="text" value={formData.man_days_taken || ''} readOnly className="w-full border rounded-lg px-3 py-2.5 bg-gray-50" placeholder="Auto calculated" />
          </div>
        </div>
      </Section>

      <Section title="Staff Details">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Emp Code</th>
                <th className="text-left px-3 py-2">Designation</th>
                <th className="text-left px-3 py-2">Remarks</th>
                {!isReadOnly && <th></th>}
              </tr>
            </thead>
            <tbody>
              {(formData.staff || []).map((s: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1.5"><input value={s.name} onChange={(e) => updateArrayItem('staff', i, 'name', e.target.value)} disabled={isReadOnly} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-2 py-1.5"><input value={s.employee_code} onChange={(e) => updateArrayItem('staff', i, 'employee_code', e.target.value)} disabled={isReadOnly} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-2 py-1.5">
                    <select value={s.designation || ''} onChange={(e) => updateArrayItem('staff', i, 'designation', e.target.value)} disabled={isReadOnly} className="w-full border rounded px-2 py-1">
                      <option value="">Select</option>
                      {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5"><input value={s.remarks} onChange={(e) => updateArrayItem('staff', i, 'remarks', e.target.value)} disabled={isReadOnly} className="w-full border rounded px-2 py-1" /></td>
                  {!isReadOnly && (
                    <td><button type="button" onClick={() => removeStaff(i)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isReadOnly && (
          <button type="button" onClick={addStaff} className="mt-2 text-sm text-blue-600 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        )}
      </Section>

      <Section title="Cash Verification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Physical Balance (A)</label>
            <input type="number" value={formData.cash_physical} onChange={(e) => updateField('cash_physical', e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">System / Day book (B)</label>
            <input type="number" value={formData.cash_system} onChange={(e) => updateField('cash_system', e.target.value)} disabled={isReadOnly} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="space-y-3">
          {(formData.cash_questions || []).map((item: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-3">
              <div className="flex-1 text-sm">{item.q}</div>
              <YesNoNA value={item.a} onChange={(v) => updateArrayItem('cash_questions', i, 'a', v)} disabled={isReadOnly} />
              <input placeholder="Remarks" value={item.remarks} onChange={(e) => updateArrayItem('cash_questions', i, 'remarks', e.target.value)} disabled={isReadOnly} className="border rounded-md px-2 py-1.5 text-sm flex-1" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Bank and Cheque Verification" defaultOpen={false}>
        <div className="space-y-3">
          {(formData.bank_questions || []).map((item: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-3">
              <div className="flex-1 text-sm">{item.q}</div>
              <YesNoNA value={item.a} onChange={(v) => updateArrayItem('bank_questions', i, 'a', v)} disabled={isReadOnly} />
              <input placeholder="Remarks" value={item.remarks} onChange={(e) => updateArrayItem('bank_questions', i, 'remarks', e.target.value)} disabled={isReadOnly} className="border rounded-md px-2 py-1.5 text-sm flex-1" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Safe Room Maintenance" defaultOpen={false}>
        <div className="space-y-3">
          {(formData.safe_questions || []).map((item: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-3">
              <div className="flex-1 text-sm">{item.q}</div>
              <YesNoNA value={item.a} onChange={(v) => updateArrayItem('safe_questions', i, 'a', v)} disabled={isReadOnly} />
              <input placeholder="Remarks" value={item.remarks} onChange={(e) => updateArrayItem('safe_questions', i, 'remarks', e.target.value)} disabled={isReadOnly} className="border rounded-md px-2 py-1.5 text-sm flex-1" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Maintenance of Registers / Files" defaultOpen={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-2 py-2 w-10">#</th>
                <th className="text-left px-2 py-2">Register / File</th>
                <th className="text-left px-2 py-2">Irregularities</th>
                <th className="text-left px-2 py-2">Remarks</th>
                {!isReadOnly && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody>
              {(formData.registers || []).map((r: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1.5 text-gray-400">{r.s_no}</td>
                  <td className="px-2 py-1.5"><input value={r.name} onChange={(e) => updateArrayItem('registers', i, 'name', e.target.value)} disabled={isReadOnly} className="w-full border rounded px-2 py-1 font-medium" placeholder="Register name" /></td>
                  <td className="px-2 py-1.5"><input value={r.irregularities} onChange={(e) => updateArrayItem('registers', i, 'irregularities', e.target.value)} disabled={isReadOnly} className="w-full border rounded px-2 py-1" /></td>
                  <td className="px-2 py-1.5"><input value={r.remarks} onChange={(e) => updateArrayItem('registers', i, 'remarks', e.target.value)} disabled={isReadOnly} className="w-full border rounded px-2 py-1" /></td>
                  {!isReadOnly && (
                    <td><button type="button" onClick={() => removeRegister(i)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isReadOnly && (
          <button type="button" onClick={addRegister} className="mt-2 text-sm text-blue-600 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Register / File
          </button>
        )}
      </Section>

      <Section title="General Points" defaultOpen={false}>
        <div className="space-y-3">
          {(formData.general_points || []).map((item: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-3">
              <div className="flex-1 text-sm">{item.q}</div>
              <YesNoNA value={item.a} onChange={(v) => updateArrayItem('general_points', i, 'a', v)} disabled={isReadOnly} />
              <input placeholder="Remarks" value={item.remarks} onChange={(e) => updateArrayItem('general_points', i, 'remarks', e.target.value)} disabled={isReadOnly} className="border rounded-md px-2 py-1.5 text-sm flex-1" />
            </div>
          ))}
        </div>
      </Section>

      <Section title="General Observations" defaultOpen={false}>
        <textarea value={formData.general_observations} onChange={(e) => updateField('general_observations', e.target.value)} disabled={isReadOnly} rows={4} className="w-full border rounded-lg px-3 py-2" placeholder="Write any general observations..." />
      </Section>

      <Section title="Annexure 1 – Documents Verification" defaultOpen={false}>
        <Annexure1
          data={formData.annex1 || {}}
          onChange={(key, rows) => {
            setFormData((prev: any) => ({
              ...prev,
              annex1: { ...(prev.annex1 || {}), [key]: rows },
            }));
          }}
          hospitalNotes={formData.hospital_notes || ''}
          vouchersNotes={formData.vouchers_notes || ''}
          pendingIrregularities={formData.annex1_pending_irregularities || ''}
          onFieldChange={(field, value) => updateField(field, value)}
          readOnly={isReadOnly}
        />
      </Section>

      <Section title="Annexure 2 – Revenue Loss" defaultOpen={false}>
        <Annexure2
          header={formData.annex2_header || {}}
          data={formData.annex2 || {}}
          onHeaderChange={(field, value) => {
            setFormData((prev: any) => ({
              ...prev,
              annex2_header: { ...(prev.annex2_header || {}), [field]: value },
            }));
          }}
          onChange={(key, rows) => {
            setFormData((prev: any) => ({
              ...prev,
              annex2: { ...(prev.annex2 || {}), [key]: rows },
            }));
          }}
          generalPoints={formData.annex2_general_points || ''}
          pendingIrregularities={formData.annex2_pending_irregularities || ''}
          closedIrregularities={formData.annex2_closed_irregularities || ''}
          totalRecovery={formData.annex2_total_recovery || ''}
          onFieldChange={(field, value) => updateField(field, value)}
          readOnly={isReadOnly}
        />
      </Section>

      <Section title="Grading" defaultOpen={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Parameter</th>
                <th className="text-left px-3 py-2">Max</th>
                <th className="text-left px-3 py-2">Achieved</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'cash_maintenance', label: 'Cash Maintenance' },
                { key: 'bank_brs', label: 'Bank Balance / BRS' },
                { key: 'registers', label: 'Registers / Files' },
                { key: 'documentation', label: 'Documentation' },
                { key: 'premises', label: 'Branch Premises' },
              ].map((item) => (
                <tr key={item.key} className="border-t">
                  <td className="px-3 py-2">{item.label}</td>
                  <td className="px-3 py-2 text-gray-500">{formData.grading?.[item.key]?.max ?? 0}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={formData.grading?.[item.key]?.achieved ?? 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setFormData((prev: any) => ({
                          ...prev,
                          grading: {
                            ...prev.grading,
                            [item.key]: { ...prev.grading[item.key], achieved: val },
                          },
                        }));
                      }}
                      disabled={isReadOnly}
                      className="w-24 border rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Branch / Management Remarks" defaultOpen={true}>
        {remarks.length === 0 ? (
          <p className="text-sm text-gray-400">No remarks or branch reply yet.</p>
        ) : (
          <div className="space-y-3">
            {remarks.map((r: any) => (
              <div key={r.$id || r.id} className="border rounded-lg p-3 bg-slate-50">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-1">
                  <span className="font-semibold text-gray-800">{r.user?.full_name || 'User'}</span>
                  <span className="uppercase bg-gray-200 px-1.5 py-0.5 rounded">{(r.role || '').replace('_', ' ')}</span>
                  <span>{r.$createdAt ? new Date(r.$createdAt).toLocaleString() : ''}</span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{r.remark_text}</p>
                {r.action_taken && (
                  <p className="text-sm text-teal-800 mt-1">
                    <strong>Action taken:</strong> {r.action_taken}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {status === 'submitted' && id && (
          <a href={`/reports/${id}/reply`} className="inline-block mt-3 text-sm text-teal-600 hover:underline">
            Open reply page →
          </a>
        )}
      </Section>

      {!isReadOnly && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 flex justify-end gap-3 z-20">
          <button onClick={() => saveReport(false)} disabled={saving} className="inline-flex items-center gap-2 bg-white border px-5 py-2.5 rounded-lg text-sm font-medium">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={() => saveReport(true)} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
            <Send className="w-4 h-4" /> {saving ? 'Saving...' : 'Submit Report'}
          </button>
        </div>
      )}
    </div>
  );
}


