import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { formatDate, STATUS_COLORS } from '../lib/utils';
import {
  Calendar,
  Plus,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';

export default function AuditManagerDashboard() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [progRes, repRes, branchRes, profileRes] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COLLECTIONS.audit_programs),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.audit_reports),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.branches),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.profiles),
      ]);

      const branchMap: Record<string, any> = {};
      branchRes.documents.forEach((b: any) => { branchMap[b.$id] = b; });
      const profileMap: Record<string, any> = {};
      profileRes.documents.forEach((p: any) => { profileMap[p.$id] = p; });

      setPrograms(
        progRes.documents
          .map((p: any) => ({
            ...p,
            id: p.$id,
            branch: branchMap[p.branch_id],
            auditor: profileMap[p.auditor_id],
          }))
          .sort((a: any, b: any) => (b.planned_date || '').localeCompare(a.planned_date || ''))
      );
      setReports(
        repRes.documents
          .map((r: any) => ({
            ...r,
            id: r.$id,
            branch: branchMap[r.branch_id],
            auditor: profileMap[r.auditor_id],
          }))
          .sort((a: any, b: any) => (b.$updatedAt || '').localeCompare(a.$updatedAt || ''))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scheduled = programs.filter((p) => p.status === 'scheduled').length;
  const inProgress = programs.filter((p) => p.status === 'in_progress').length;
  const completed = programs.filter((p) => p.status === 'completed').length;
  const drafts = reports.filter((r) => r.status === 'draft').length;
  const submitted = reports.filter((r) => r.status === 'submitted' || r.status === 'branch_replied').length;

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
          <h1 className="text-2xl font-bold text-gray-900">Audit Manager Dashboard</h1>
          <p className="text-gray-500 text-sm">Schedule & monitor audit programs</p>
        </div>
        <Link
          to="/programs/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Audit Program
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Scheduled" value={scheduled} icon={Calendar} color="text-indigo-600" />
        <StatCard label="In Progress" value={inProgress} icon={Clock} color="text-orange-600" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} color="text-green-600" />
        <StatCard label="Draft Reports" value={drafts} icon={FileText} color="text-yellow-600" />
        <StatCard label="Submitted" value={submitted} icon={Users} color="text-blue-600" />
      </div>

      {/* Submitted Reports */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Submitted / Branch Replied Reports
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Branch</th>
                <th className="text-left px-5 py-3 font-medium">Auditor</th>
                <th className="text-left px-5 py-3 font-medium">Audit Date</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports
                .filter((r) => r.status === 'submitted' || r.status === 'branch_replied' || r.status === 'closed')
                .map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">
                      {r.branch?.branch_name}
                      <span className="text-xs text-gray-400 ml-1">({r.branch?.branch_code})</span>
                    </td>
                    <td className="px-5 py-3">{r.auditor?.full_name || '-'}</td>
                    <td className="px-5 py-3">{formatDate(r.audit_date)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/my-audits/${r.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                      >
                        <Eye className="w-4 h-4" /> Open
                      </Link>
                    </td>
                  </tr>
                ))}
              {reports.filter((r) => r.status === 'submitted' || r.status === 'branch_replied' || r.status === 'closed').length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No submitted reports yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Programs */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Recent Audit Programs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Branch</th>
                <th className="text-left px-5 py-3 font-medium">Auditor</th>
                <th className="text-left px-5 py-3 font-medium">Planned Date</th>
                <th className="text-left px-5 py-3 font-medium">Period</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {programs.slice(0, 10).map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">
                    {p.branch?.branch_name}
                    <span className="text-xs text-gray-400 ml-1">({p.branch?.branch_code})</span>
                  </td>
                  <td className="px-5 py-3">{p.auditor?.full_name || '-'}</td>
                  <td className="px-5 py-3">{formatDate(p.planned_date)}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {formatDate(p.period_from)} – {formatDate(p.period_to)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || 'bg-gray-100'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No audit programs yet. Create the first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
