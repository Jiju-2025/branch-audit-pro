import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { formatDate, daysRemaining, STATUS_COLORS } from '../lib/utils';
import { Calendar, FileText, Clock, CheckCircle2, AlertTriangle, Plus, ArrowRight, Eye } from 'lucide-react';

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
      branchRes.documents.forEach((b: any) => {
        branchMap[b.$id] = b;
      });

      setPrograms(
        progRes.documents.map((p: any) => ({
          ...p,
          id: p.$id,
          branch: branchMap[p.branch_id],
        }))
      );
      setReports(
        repRes.documents.map((r: any) => ({
          ...r,
          id: r.$id,
          branch: branchMap[r.branch_id],
        }))
      );
    } catch (err) {
      console.error(err);
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

  const today = new Date().toISOString().slice(0, 10);
  const todayDue = programs.filter((p) => p.planned_date === today && p.status === 'scheduled');
  const upcoming = programs.filter((p) => p.planned_date > today && p.status === 'scheduled');
  const drafts = reports.filter((r) => r.status === 'draft');
  const submittedReports = reports.filter((r) =>
    ['submitted', 'branch_replied', 'closed'].includes(r.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditor Dashboard</h1>
          <p className="text-gray-500 text-sm">Your programs and reports</p>
        </div>
        <Link
          to="/my-audits/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Report
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500">Today due</div>
          <div className="text-2xl font-bold">{todayDue.length}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500">Drafts</div>
          <div className="text-2xl font-bold text-yellow-600">{drafts.length}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500">Submitted</div>
          <div className="text-2xl font-bold text-blue-600">{submittedReports.length}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-xs text-gray-500">Upcoming</div>
          <div className="text-2xl font-bold">{upcoming.length}</div>
        </div>
      </div>

      {todayDue.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-3.5 border-b font-semibold flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" /> Due Today
          </div>
          <div className="p-4 space-y-2">
            {todayDue.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">
                    {p.branch?.branch_name} ({p.branch?.branch_code})
                  </div>
                  <div className="text-sm text-gray-500">Planned: {formatDate(p.planned_date)}</div>
                </div>
                <Link
                  to={`/my-audits/new?program=${p.id}`}
                  className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1"
                >
                  Start <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {drafts.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-3.5 border-b font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" /> Draft Reports
          </div>
          <div className="p-4 space-y-2">
            {drafts.map((r) => (
              <div key={r.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                <div>
                  <div className="font-medium">
                    {r.branch?.branch_name} ({r.branch?.branch_code})
                  </div>
                  <div className="text-sm text-gray-500">Last updated: {formatDate(r.$updatedAt)}</div>
                </div>
                <Link to={`/my-audits/${r.id}`} className="text-sm bg-yellow-500 text-white px-3 py-1.5 rounded-md">
                  Continue
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> My Submitted Reports ({submittedReports.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Branch</th>
                <th className="text-left px-5 py-3 font-medium">Audit Date</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Reply deadline</th>
                <th className="text-left px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {submittedReports.map((r) => {
                const days = daysRemaining(r.branch_reply_deadline);
                return (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">
                      {r.branch?.branch_name}
                      <span className="text-xs text-gray-400 ml-1">({r.branch?.branch_code})</span>
                    </td>
                    <td className="px-5 py-3">{formatDate(r.audit_date)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}>
                        {(r.status || '').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {r.branch_reply_deadline ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            days !== null && days < 0
                              ? 'text-red-600'
                              : days !== null && days <= 3
                              ? 'text-amber-600'
                              : 'text-gray-600'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(r.branch_reply_deadline)}
                          {days !== null && (days < 0 ? ' (overdue)' : ` (${days}d left)`)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/my-audits/${r.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          <Eye className="w-4 h-4" /> View / Remarks
                        </Link>
                        <a
                          href={`/reports/${r.id}/print`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-600 hover:underline text-sm"
                        >
                          PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {submittedReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    No submitted reports yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="px-5 py-3.5 border-b font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming Programs
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 px-4">Branch</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.slice(0, 8).map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2.5 px-4 font-medium">{p.branch?.branch_name}</td>
                    <td className="py-2.5">{formatDate(p.planned_date)}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ''}`}>
                        {p.status}
                      </span>
                    </td>
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
