import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS, Query } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import { formatDate, STATUS_COLORS } from '../lib/utils';
import { FileText, Eye, MessageSquare, Clock } from 'lucide-react';

export default function BranchDashboard() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [profile?.id]);

  const load = async () => {
    if (!profile?.branch_id && profile?.role === 'branch_manager') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const isAll = ['admin', 'audit_manager', 'director', 'sales_head', 'regional_manager', 'area_manager'].includes(profile?.role || '');
      let reportsRes;

      if (isAll) {
        reportsRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.audit_reports);
      } else if (profile?.branch_id) {
        reportsRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.audit_reports, [
          Query.equal('branch_id', profile.branch_id),
        ]);
      } else {
        reportsRes = { documents: [] };
      }

      const branchRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.branches);
      const profileRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.profiles);

      const branchMap: Record<string, any> = {};
      branchRes.documents.forEach((b: any) => { branchMap[b.$id] = b; });
      const profileMap: Record<string, any> = {};
      profileRes.documents.forEach((p: any) => { profileMap[p.$id] = p; });

      if (profile?.branch_id) setBranch(branchMap[profile.branch_id]);

      const list = reportsRes.documents
        .filter((r: any) => ['submitted', 'branch_replied', 'closed'].includes(r.status))
        .map((r: any) => ({
          ...r,
          id: r.$id,
          branch: branchMap[r.branch_id],
          auditor: profileMap[r.auditor_id],
        }))
        .sort((a: any, b: any) => (b.submitted_at || b.$updatedAt || '').localeCompare(a.submitted_at || a.$updatedAt || ''));

      setReports(list);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const daysLeft = (deadline: string) => {
    if (!deadline) return null;
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return d;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const title =
    profile?.role === 'branch_manager'
      ? `Branch Reports${branch ? ` – ${branch.branch_name}` : ''}`
      : 'All Submitted Reports';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm">View and reply to audit reports</p>
      </div>

      {profile?.role === 'branch_manager' && !profile?.branch_id && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
          Your account is not linked to a branch. Ask Admin to set branch_id on your profile in Appwrite.
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Submitted Reports ({reports.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Branch</th>
                <th className="text-left px-5 py-3 font-medium">Auditor</th>
                <th className="text-left px-5 py-3 font-medium">Audit Date</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Reply deadline</th>
                <th className="text-left px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const left = daysLeft(r.branch_reply_deadline);
                return (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">
                      {r.branch?.branch_name}
                      <span className="text-xs text-gray-400 ml-1">({r.branch?.branch_code})</span>
                    </td>
                    <td className="px-5 py-3">{r.auditor?.full_name || '—'}</td>
                    <td className="px-5 py-3">{formatDate(r.audit_date)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {r.branch_reply_deadline ? (
                        <span className={`inline-flex items-center gap-1 text-xs ${left !== null && left < 0 ? 'text-red-600' : left !== null && left <= 3 ? 'text-amber-600' : 'text-gray-600'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(r.branch_reply_deadline)}
                          {left !== null && (left < 0 ? ' (overdue)' : ` (${left}d left)`)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/my-audits/${r.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm">
                          <Eye className="w-4 h-4" /> View
                        </Link>
                        {profile?.role === 'branch_manager' && r.status === 'submitted' && (
                          <Link to={`/reports/${r.id}/reply`} className="inline-flex items-center gap-1 text-teal-600 hover:underline text-sm">
                            <MessageSquare className="w-4 h-4" /> Reply
                          </Link>
                        )}
                        <a href={`/reports/${r.id}/print`} target="_blank" rel="noreferrer" className="text-gray-600 hover:underline text-sm">
                          PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    No submitted reports found for you.
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
