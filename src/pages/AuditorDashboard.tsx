import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { formatDate, daysRemaining, STATUS_COLORS } from '../lib/utils';
import type { AuditProgram, AuditReport } from '../types';
import { Calendar, FileText, Clock, CheckCircle2, AlertTriangle, Plus, ArrowRight } from 'lucide-react';

export default function AuditorDashboard() {
  const { profile } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [progRes, repRes, branchRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.audit_programs, [
          Query.equal('auditor_id', profile!.id),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.audit_reports, [
          Query.equal('auditor_id', profile!.id),
        ]),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.branches),
      ]);

      const branchMap: Record<string, any> = {};
      branchRes.documents.forEach((b: any) => { branchMap[b.$id] = b; });

      setPrograms(progRes.documents.map((p: any) => ({
        ...p,
        id: p.$id,
        branch: branchMap[p.branch_id],
      })));
      setReports(repRes.documents.map((r: any) => ({
        ...r,
        id: r.$id,
        branch: branchMap[r.branch_id],
      })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayDue = programs.filter(p => p.planned_date === today && p.status === 'scheduled');
  const upcoming = programs.filter(p => p.planned_date > today && p.status === 'scheduled');
  const drafts = reports.filter(r => r.status === 'draft');
  const submitted = reports.filter(r => r.status === 'submitted');
  const pendingReply = submitted.filter(r => {
    const days = daysRemaining(r.branch_reply_deadline);
    return days !== null && days >= 0;
  });
  const overdueReply = submitted.filter(r => {
    const days = daysRemaining(r.branch_reply_deadline);
    return days !== null && days < 0;
  });
  const completed = reports.filter(r => r.status === 'branch_replied' || r.status === 'closed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your audit dashboard</p>
        </div>
        <Link to="/my-audits/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus className="w-4 h-4" /> Start New Audit
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl p-4 bg-red-50 text-red-700"><div className="text-2xl font-bold">{todayDue.length}</div><div className="text-xs mt-1">Due Today</div></div>
        <div className="rounded-xl p-4 bg-indigo-50 text-indigo-700"><div className="text-2xl font-bold">{upcoming.length}</div><div className="text-xs mt-1">Upcoming</div></div>
        <div className="rounded-xl p-4 bg-yellow-50 text-yellow-700"><div className="text-2xl font-bold">{drafts.length}</div><div className="text-xs mt-1">Drafts</div></div>
        <div className="rounded-xl p-4 bg-blue-50 text-blue-700"><div className="text-2xl font-bold">{pendingReply.length}</div><div className="text-xs mt-1">Pending Reply</div></div>
        <div className="rounded-xl p-4 bg-orange-50 text-orange-700"><div className="text-2xl font-bold">{overdueReply.length}</div><div className="text-xs mt-1">Overdue Reply</div></div>
        <div className="rounded-xl p-4 bg-green-50 text-green-700"><div className="text-2xl font-bold">{completed.length}</div><div className="text-xs mt-1">Completed</div></div>
      </div>

      {todayDue.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-3.5 border-b font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" /> Audits Due Today</div>
          <div className="p-4 space-y-2">
            {todayDue.map(p => (
              <div key={p.id} className="flex items-center justify-between border border-red-200 rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">{p.branch?.branch_name} ({p.branch?.branch_code})</div>
                  <div className="text-sm text-gray-500">Planned: {formatDate(p.planned_date)}</div>
                </div>
                <Link to={`/my-audits/new?program=${p.id}`} className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1">
                  Start <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {drafts.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-3.5 border-b font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Draft Reports</div>
          <div className="p-4 space-y-2">
            {drafts.map(r => (
              <div key={r.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">{r.branch?.branch_name} ({r.branch?.branch_code})</div>
                  <div className="text-sm text-gray-500">Last updated: {formatDate(r.$updatedAt)}</div>
                </div>
                <Link to={`/my-audits/${r.id}`} className="text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-md">Continue</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-3.5 border-b font-semibold">Upcoming Programs</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2 px-4">Branch</th><th className="pb-2">Date</th><th className="pb-2">Status</th></tr></thead>
              <tbody>
                {upcoming.slice(0, 8).map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2.5 px-4 font-medium">{p.branch?.branch_name}</td>
                    <td className="py-2.5">{formatDate(p.planned_date)}</td>
                    <td className="py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
