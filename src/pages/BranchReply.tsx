import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '../lib/appwrite';
import { useAuth } from '../context/AuthContext';
import { formatDate, daysRemaining } from '../lib/utils';
import { ArrowLeft, Send, MessageSquare, Clock, AlertTriangle } from 'lucide-react';

export default function BranchReply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) loadReport(id);
  }, [id]);

  const loadReport = async (reportId: string) => {
    setLoading(true);
    try {
      const [rep, remRes, branchRes, profileRes] = await Promise.all([
        databases.getDocument(DATABASE_ID, COLLECTIONS.audit_reports, reportId),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.report_remarks),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.branches),
        databases.listDocuments(DATABASE_ID, COLLECTIONS.profiles),
      ]);

      const branchMap: Record<string, any> = {};
      branchRes.documents.forEach((b: any) => { branchMap[b.$id] = b; });
      const profileMap: Record<string, any> = {};
      profileRes.documents.forEach((p: any) => { profileMap[p.$id] = p; });

      setReport({
        ...rep,
        id: rep.$id,
        branch: branchMap[rep.branch_id],
        auditor: profileMap[rep.auditor_id],
      });
      setRemarks(
        remRes.documents
          .filter((r: any) => r.report_id === reportId)
          .map((r: any) => ({
            ...r,
            id: r.$id,
            user: profileMap[r.user_id],
          }))
      );
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const submitReply = async () => {
    if (!replyText.trim() || !report || !profile) return;
    setSaving(true);
    setMessage('');

    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.report_remarks, ID.unique(), {
        report_id: report.id,
        user_id: profile.id,
        role: profile.role,
        remark_text: replyText,
        action_taken: actionTaken || null,
      });

      await databases.updateDocument(DATABASE_ID, COLLECTIONS.audit_reports, report.id, {
        status: 'branch_replied',
        branch_replied_at: new Date().toISOString(),
      });

      setMessage('Reply submitted successfully');
      setReplyText('');
      setActionTaken('');
      loadReport(report.id);
    } catch (err: any) {
      setMessage('Error: ' + (err.message || 'Failed to submit'));
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

  if (!report) {
    return <div className="p-8 text-center text-gray-500">Report not found</div>;
  }

  const days = daysRemaining(report.branch_reply_deadline);
  const isOverdue = days !== null && days < 0;
  const canReply = profile?.role === 'branch_manager' || profile?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Audit Report – {report.branch?.branch_name}
          </h1>
          <p className="text-sm text-gray-500">
            Submitted: {formatDate(report.submitted_at)} | Auditor: {report.auditor?.full_name}
          </p>
        </div>
      </div>

      {report.status === 'submitted' && (
        <div className={`rounded-lg p-4 flex items-center gap-3 ${isOverdue ? 'bg-orange-50 text-orange-800' : 'bg-blue-50 text-blue-800'}`}>
          {isOverdue ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          <div>
            {isOverdue
              ? `Reply is overdue by ${Math.abs(days!)} days`
              : `${days} days remaining to reply (Deadline: ${formatDate(report.branch_reply_deadline)})`}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold mb-3">Report Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Audit Date</div>
            <div className="font-medium">{formatDate(report.audit_date)}</div>
          </div>
          <div>
            <div className="text-gray-500">Status</div>
            <div className="font-medium capitalize">{(report.status || '').replace('_', ' ')}</div>
          </div>
          <div>
            <div className="text-gray-500">Branch</div>
            <div className="font-medium">{report.branch?.branch_code}</div>
          </div>
        </div>
        <div className="mt-4">
          <Link to={`/my-audits/${report.id}`} className="text-blue-600 text-sm hover:underline">
            View full report →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-5 py-3.5 border-b font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Remarks & Replies
        </div>
        <div className="p-5 space-y-4">
          {remarks.length === 0 && (
            <p className="text-gray-400 text-sm">No remarks yet.</p>
          )}
          {remarks.map((r) => (
            <div key={r.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{r.user?.full_name || 'User'}</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{r.role}</span>
                <span className="text-gray-400 text-xs">{formatDate(r.$createdAt)}</span>
              </div>
              <p className="mt-1 text-gray-700">{r.remark_text}</p>
              {r.action_taken && (
                <p className="mt-1 text-sm text-green-700">
                  <strong>Action:</strong> {r.action_taken}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {canReply && report.status === 'submitted' && (
        <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold">Submit Branch Reply</h2>
          {message && (
            <div className={`text-sm px-3 py-2 rounded-lg ${message.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Explanation / Remarks *</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Explain the findings and your response..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Action Taken / Planned</label>
            <textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="What corrective actions have been / will be taken?"
            />
          </div>
          <button
            onClick={submitReply}
            disabled={saving || !replyText.trim()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            {saving ? 'Submitting...' : 'Submit Reply'}
          </button>
        </div>
      )}
    </div>
  );
}
