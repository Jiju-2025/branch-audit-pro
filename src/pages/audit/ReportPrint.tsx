import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';
import { Printer, ArrowLeft } from 'lucide-react';

const COMPANY_NAME = 'UNIBHARATH CORP KISSAN PRODUCER COMPANY';
const COMPANY_ADDRESS = 'TM PROPERTIES ,ACHUTHAMENON ROAD,PUNKUNNAM,THRISSUR';

export default function ReportPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [auditor, setAuditor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    try {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.audit_reports, id!);
      const formData = typeof doc.form_data === 'string' ? JSON.parse(doc.form_data) : doc.form_data || {};
      setReport({ ...doc, formData });

      try {
        const b = await databases.getDocument(DATABASE_ID, COLLECTIONS.branches, doc.branch_id);
        setBranch(b);
      } catch {}
      try {
        const a = await databases.getDocument(DATABASE_ID, COLLECTIONS.profiles, doc.auditor_id);
        setAuditor(a);
      } catch {}
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return <div className="p-8 text-center text-red-600">Report not found</div>;
  }

  const fd = report.formData || {};
  const isSubmitted = report.status === 'submitted' || report.status === 'branch_replied' || report.status === 'closed';

  if (!isSubmitted) {
    return (
      <div className="p-8 text-center">
        <p className="text-amber-700 mb-4">PDF / Print is available only after the report is submitted.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 underline">Go back</button>
      </div>
    );
  }

  const yn = (v: string) => v || '—';
    return (
    <div className="min-h-screen bg-gray-100">
      <div className="print:hidden sticky top-0 z-20 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto my-6 bg-white shadow-lg print:shadow-none print:my-0 print:max-w-none">
        <style>{`
          @media print {
            body { background: white !important; }
            .print\\:hidden { display: none !important; }
            @page { margin: 12mm; }
          }
        `}</style>

        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-8 py-6 print:bg-teal-700">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wide uppercase">{COMPANY_NAME}</h1>
            <p className="text-sm mt-1 opacity-90">{COMPANY_ADDRESS}</p>
            <div className="mt-4 inline-block bg-white/20 rounded-lg px-4 py-1.5 text-sm font-semibold">
              INTERNAL AUDIT REPORT
            </div>
          </div>
        </div>

        <div className="px-8 py-4 border-b bg-slate-50 grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Branch:</span> <strong>{branch?.branch_name} ({branch?.branch_code})</strong></div>
          <div><span className="text-gray-500">Audit Date:</span> <strong>{report.audit_date}</strong></div>
          <div><span className="text-gray-500">Auditor:</span> <strong>{auditor?.full_name || '—'}</strong></div>
          <div><span className="text-gray-500">Status:</span> <strong className="uppercase">{report.status?.replace('_', ' ')}</strong></div>
          <div><span className="text-gray-500">Period:</span> <strong>{fd.period_covered_from || '—'} to {fd.period_covered_to || '—'}</strong></div>
          <div><span className="text-gray-500">Verification:</span> <strong>{fd.verification_from || '—'} to {fd.verification_to || '—'}</strong></div>
          <div><span className="text-gray-500">Days Taken:</span> <strong>{fd.man_days_taken || '—'}</strong></div>
          <div><span className="text-gray-500">Branch Contact:</span> <strong>{fd.branch_contact_designation} – {fd.branch_contact_name || fd.abm_name}</strong></div>
          <div className="col-span-2"><span className="text-gray-500">Higher Authority:</span> <strong>{fd.higher_authority_designation} – {fd.higher_authority_name || fd.area_manager_name}</strong></div>
        </div>

        <div className="px-8 py-6 space-y-6 text-sm">
          <Section title="Staff Details">
            {(fd.staff || []).length === 0 ? <p className="text-gray-400">No staff recorded</p> : (
              <table className="w-full border text-xs">
                <thead className="bg-teal-50"><tr>
                  <th className="border px-2 py-1 text-left">Name</th>
                  <th className="border px-2 py-1 text-left">Emp Code</th>
                  <th className="border px-2 py-1 text-left">Designation</th>
                  <th className="border px-2 py-1 text-left">Remarks</th>
                </tr></thead>
                <tbody>
                  {(fd.staff || []).map((s: any, i: number) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{s.name}</td>
                      <td className="border px-2 py-1">{s.employee_code}</td>
                      <td className="border px-2 py-1">{s.designation}</td>
                      <td className="border px-2 py-1">{s.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="Cash Verification">
            <p>Physical: <strong>{fd.cash_physical || '—'}</strong> &nbsp;|&nbsp; System: <strong>{fd.cash_system || '—'}</strong></p>
            <table className="w-full border text-xs mt-2">
              <thead className="bg-teal-50"><tr><th className="border px-2 py-1 text-left">Question</th><th className="border px-2 py-1">Ans</th><th className="border px-2 py-1 text-left">Remarks</th></tr></thead>
              <tbody>
                {(fd.cash_questions || []).map((q: any, i: number) => (
                  <tr key={i}><td className="border px-2 py-1">{q.q}</td><td className="border px-2 py-1 text-center">{yn(q.a)}</td><td className="border px-2 py-1">{q.remarks}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Bank and Cheque Verification">
            <table className="w-full border text-xs">
              <thead className="bg-teal-50"><tr><th className="border px-2 py-1 text-left">Question</th><th className="border px-2 py-1">Ans</th><th className="border px-2 py-1 text-left">Remarks</th></tr></thead>
              <tbody>
                {(fd.bank_questions || []).map((q: any, i: number) => (
                  <tr key={i}><td className="border px-2 py-1">{q.q}</td><td className="border px-2 py-1 text-center">{yn(q.a)}</td><td className="border px-2 py-1">{q.remarks}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Safe Room Maintenance">
            <table className="w-full border text-xs">
              <thead className="bg-teal-50"><tr><th className="border px-2 py-1 text-left">Question</th><th className="border px-2 py-1">Ans</th><th className="border px-2 py-1 text-left">Remarks</th></tr></thead>
              <tbody>
                {(fd.safe_questions || []).map((q: any, i: number) => (
                  <tr key={i}><td className="border px-2 py-1">{q.q}</td><td className="border px-2 py-1 text-center">{yn(q.a)}</td><td className="border px-2 py-1">{q.remarks}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="Maintenance of Registers / Files">
            <table className="w-full border text-xs">
              <thead className="bg-teal-50"><tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1 text-left">Register / File</th>
                <th className="border px-2 py-1 text-left">Irregularities</th>
                <th className="border px-2 py-1 text-left">Remarks</th>
              </tr></thead>
              <tbody>
                {(fd.registers || []).map((r: any, i: number) => (
                  <tr key={i}><td className="border px-2 py-1 text-center">{r.s_no}</td><td className="border px-2 py-1">{r.name}</td><td className="border px-2 py-1">{r.irregularities}</td><td className="border px-2 py-1">{r.remarks}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section title="General Points">
            <table className="w-full border text-xs">
              <thead className="bg-teal-50"><tr><th className="border px-2 py-1 text-left">Question</th><th className="border px-2 py-1">Ans</th><th className="border px-2 py-1 text-left">Remarks</th></tr></thead>
              <tbody>
                {(fd.general_points || []).map((q: any, i: number) => (
                  <tr key={i}><td className="border px-2 py-1">{q.q}</td><td className="border px-2 py-1 text-center">{yn(q.a)}</td><td className="border px-2 py-1">{q.remarks}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          {fd.general_observations && (
            <Section title="General Observations">
              <p className="whitespace-pre-wrap">{fd.general_observations}</p>
            </Section>
          )}

          <Section title="Annexure 1 – Documents Verification">
            {fd.hospital_notes && <p><strong>Hospital Application:</strong> {fd.hospital_notes}</p>}
            {fd.vouchers_notes && <p><strong>Vouchers:</strong> {fd.vouchers_notes}</p>}
            {fd.annex1_pending_irregularities && <p><strong>Pending Irregularities:</strong> {fd.annex1_pending_irregularities}</p>}
          </Section>

          <Section title="Annexure 2 – Revenue Loss">
            {fd.annex2_header && (
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>Gold Loan Outstanding: <strong>{fd.annex2_header.gold_loan_outstanding || '—'}</strong></div>
                <div>Packets verified: <strong>{fd.annex2_header.packets_verified || '—'}</strong></div>
                <div>Total Packets: <strong>{fd.annex2_header.total_packets || '—'}</strong></div>
                <div>Last visit: <strong>{fd.annex2_header.date_last_visit || '—'}</strong></div>
              </div>
            )}
            {fd.annex2_pending_irregularities && <p><strong>Pending:</strong> {fd.annex2_pending_irregularities}</p>}
            {fd.annex2_closed_irregularities && <p><strong>Closed:</strong> {fd.annex2_closed_irregularities}</p>}
            {fd.annex2_total_recovery && <p><strong>Total Recovery:</strong> {fd.annex2_total_recovery}</p>}
          </Section>

          <Section title="Grading">
            <table className="w-full border text-xs max-w-md">
              <thead className="bg-teal-50"><tr><th className="border px-2 py-1 text-left">Parameter</th><th className="border px-2 py-1">Max</th><th className="border px-2 py-1">Achieved</th></tr></thead>
              <tbody>
                {['cash_maintenance', 'bank_brs', 'registers', 'documentation', 'premises'].map((k) => (
                  <tr key={k}>
                    <td className="border px-2 py-1 capitalize">{k.replace('_', ' ')}</td>
                    <td className="border px-2 py-1 text-center">{fd.grading?.[k]?.max ?? 0}</td>
                    <td className="border px-2 py-1 text-center">{fd.grading?.[k]?.achieved ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <div className="border-2 border-teal-600 rounded-lg p-4 text-xs leading-relaxed bg-teal-50/50">
            <p className="font-semibold text-teal-900 mb-2">DECLARATION</p>
            <p>
              Certified that the contents of the report are true and prepared after due verification of the systems / books of accounts / registers etc.
              and information gathered from the discussions made with the branch officials. Wherever possible, spot rectifications of the irregularities
              have been made then and there. Copy of the irregularity report has been handed over to the branch manager for proper follow up and rectification.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-10 pb-6">
            <div className="text-center">
              <div className="border-b border-gray-400 h-12 mb-2"></div>
              <p className="font-semibold text-sm">Name & Signature of Auditor</p>
              <p className="text-xs text-gray-600 mt-1">{auditor?.full_name || ''}</p>
              <p className="text-xs text-gray-500 mt-3">Date: _______________</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-400 h-12 mb-2"></div>
              <p className="font-semibold text-sm">Name & Signature of BM / ABM / CRE</p>
              <p className="text-xs text-gray-600 mt-1">{fd.branch_contact_name || fd.abm_name || ''}</p>
              <p className="text-xs text-gray-500 mt-1">{fd.branch_contact_designation || ''}</p>
              <p className="text-xs text-gray-500 mt-3">Date: _______________</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-8 py-3 text-center text-xs text-gray-500 border-t">
          Generated by BranchAudit Pro • Confidential – For internal use only
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-teal-800 border-b-2 border-teal-500 pb-1 mb-2 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}
