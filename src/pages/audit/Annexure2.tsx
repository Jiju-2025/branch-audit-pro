import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

type Row = Record<string, string>;

interface TableConfig {
  key: string;
  title: string;
  columns: { key: string; label: string }[];
}

const IRREGULARITY_TABLES: TableConfig[] = [
  {
    key: 'spurious',
    title: '1. Spurious cases',
    columns: [
      { key: 'gl_no', label: 'GL No' },
      { key: 'date', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'gross_weight', label: 'Gross Weight' },
      { key: 'net_weight', label: 'Net Weight' },
      { key: 'weight_spurious', label: 'Weight of Spurious' },
      { key: 'excess_amt', label: 'Excess Amt Paid' },
      { key: 'item', label: 'Item' },
      { key: 'date_detection', label: 'Date of detection' },
      { key: 'appraised_by', label: 'Appraised by (ID)' },
      { key: 'sanctioned_by', label: 'Sanctioned By (ID)' },
    ],
  },
  {
    key: 'low_purity',
    title: '2. Low purity cases – 21 K',
    columns: [
      { key: 'gl_no', label: 'GL No' },
      { key: 'date', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'gross_weight', label: 'Gross Weight' },
      { key: 'net_weight', label: 'Net Weight' },
      { key: 'weight_less_purity', label: 'Weight of Less purity' },
      { key: 'excess_amt', label: 'Excess Amt Paid' },
      { key: 'item', label: 'Item' },
      { key: 'date_detection', label: 'Date of detection' },
      { key: 'appraised_by', label: 'Appraised by (ID)' },
      { key: 'sanctioned_by', label: 'Sanctioned By (ID)' },
    ],
  },
  {
    key: 'gross_weight_diff',
    title: '3. Gross Weight Difference / Excess Weight Taken',
    columns: [
      { key: 'gl_no', label: 'GL No' },
      { key: 'date', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'gross_weight', label: 'Gross Weight' },
      { key: 'actual_gross', label: 'Actual Gross Weight' },
      { key: 'weight_diff', label: 'Gross Weight Difference' },
      { key: 'excess_amt', label: 'Excess Amt Paid' },
      { key: 'item', label: 'Item' },
      { key: 'date_detection', label: 'Date of detection' },
      { key: 'appraised_by', label: 'Appraised by (ID)' },
      { key: 'sanctioned_by', label: 'Sanctioned By (ID)' },
    ],
  },
  {
    key: 'insufficient_weight',
    title: '4. Insufficient Weight Deduction',
    columns: [
      { key: 'gl_no', label: 'GL No' },
      { key: 'date', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'gross_weight', label: 'Gross Weight' },
      { key: 'net_weight', label: 'Net Weight' },
      { key: 'weight_more', label: 'Weight More to be deduct' },
      { key: 'excess_amt', label: 'Excess Amt Paid' },
      { key: 'item', label: 'Item' },
      { key: 'date_detection', label: 'Date of detection' },
      { key: 'appraised_by', label: 'Appraised by (ID)' },
      { key: 'sanctioned_by', label: 'Sanctioned By (ID)' },
    ],
  },
  {
    key: 'kt18',
    title: '5. 18KT Cases',
    columns: [
      { key: 'gl_no', label: 'GL No' },
      { key: 'date', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'gross_weight', label: 'Gross Weight' },
      { key: 'net_weight', label: 'Net Weight' },
      { key: 'weight_18kt', label: 'Weight of 18KT' },
      { key: 'amt_paid', label: 'Amt Paid' },
      { key: 'item', label: 'Item' },
      { key: 'date_detection', label: 'Date of detection' },
      { key: 'appraised_by', label: 'Appraised by (ID)' },
      { key: 'sanctioned_by', label: 'Sanctioned By (ID)' },
    ],
  },
  {
    key: 'non_acceptable',
    title: '6. Non-acceptable Items',
    columns: [
      { key: 'gl_no', label: 'GL No' },
      { key: 'date', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'gross_weight', label: 'Gross Weight' },
      { key: 'net_weight', label: 'Net Weight' },
      { key: 'weight_non', label: 'Weight of Nonacceptable item' },
      { key: 'amt_paid', label: 'Amt Paid' },
      { key: 'item', label: 'Item' },
      { key: 'date_detection', label: 'Date of detection' },
      { key: 'appraised_by', label: 'Appraised by (ID)' },
      { key: 'sanctioned_by', label: 'Sanctioned By (ID)' },
    ],
  },
  {
    key: 'outstanding_limit',
    title: '7. Outstanding limit exceeded cases',
    columns: [
      { key: 'gl_no', label: 'GL No' },
      { key: 'date', label: 'Date' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'gross_weight', label: 'Gross Weight' },
      { key: 'net_weight', label: 'Net Weight' },
      { key: 'total_amt_paid', label: 'Total Amt Paid' },
    ],
  },
];
const EXPENSE_TABLES: TableConfig[] = [
  {
    key: 'expense_ta_da',
    title: 'A. Ineligible TA/DA paid',
    columns: [
      { key: 'tran_date', label: 'Tran Date' },
      { key: 'head_name', label: 'Head Name' },
      { key: 'narration', label: 'Narration' },
      { key: 'amount', label: 'Amount' },
      { key: 'actual_amount', label: 'Actual Amount' },
      { key: 'recovery_amount', label: 'Recovery Amount' },
    ],
  },
  {
    key: 'expense_suspense',
    title: 'B. Suspense account entries outstanding more than one week',
    columns: [
      { key: 'tran_date', label: 'Tran Date' },
      { key: 'head_name', label: 'Head Name' },
      { key: 'narration', label: 'Narration' },
      { key: 'amount', label: 'Amount' },
    ],
  },
  {
    key: 'expense_unauth',
    title: 'C. Any Unauthorised Expenses incurred',
    columns: [
      { key: 'tran_date', label: 'Tran Date' },
      { key: 'head_name', label: 'Head Name' },
      { key: 'narration', label: 'Narration' },
      { key: 'amount', label: 'Amount' },
      { key: 'actual_amount', label: 'Actual Amount' },
      { key: 'recovery_amount', label: 'Recovery Amount' },
    ],
  },
  {
    key: 'expense_monthly_limit',
    title: 'D. Monthly Limit exceed Cases',
    columns: [
      { key: 'month', label: 'Month' },
      { key: 'head_name', label: 'Head Name' },
      { key: 'debit', label: 'Debit' },
      { key: 'approval_required', label: 'Approval Required' },
    ],
  },
  {
    key: 'expense_bill_missing',
    title: 'E. Bill Missing Cases',
    columns: [
      { key: 'account_head', label: 'Account head' },
      { key: 'date', label: 'Date' },
      { key: 'narration', label: 'Narration' },
      { key: 'amount', label: 'Amount' },
      { key: 'bill_missing', label: 'Bill Missing' },
    ],
  },
  {
    key: 'expense_without_approval',
    title: 'F. Without Approval Cases',
    columns: [
      { key: 'trans_date', label: 'Trans.Date' },
      { key: 'account_head', label: 'Account Head Name' },
      { key: 'amount', label: 'Amount' },
      { key: 'approval_required', label: 'Approval Required' },
      { key: 'remarks', label: 'Remarks' },
    ],
  },
];

function emptyRow(columns: { key: string }[]): Row {
  const row: Row = {};
  columns.forEach((c) => { row[c.key] = ''; });
  return row;
}

interface Props {
  header: Record<string, string>;
  data: Record<string, Row[]>;
  onHeaderChange: (field: string, value: string) => void;
  onChange: (key: string, rows: Row[]) => void;
  generalPoints: string;
  pendingIrregularities: string;
  closedIrregularities: string;
  totalRecovery: string;
  onFieldChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export default function Annexure2({
  header,
  data,
  onHeaderChange,
  onChange,
  generalPoints,
  pendingIrregularities,
  closedIrregularities,
  totalRecovery,
  onFieldChange,
  readOnly,
}: Props) {
  const addRow = (tableKey: string, columns: { key: string }[]) => {
    const rows = [...(data[tableKey] || [])];
    rows.push(emptyRow(columns));
    onChange(tableKey, rows);
  };

  const removeRow = (tableKey: string, index: number) => {
    onChange(tableKey, (data[tableKey] || []).filter((_, i) => i !== index));
  };

  const updateCell = (tableKey: string, index: number, colKey: string, value: string) => {
    const rows = [...(data[tableKey] || [])];
    rows[index] = { ...rows[index], [colKey]: value };
    onChange(tableKey, rows);
  };

  const renderTable = (table: TableConfig) => (
    <div key={table.key} className="border rounded-lg overflow-hidden">
      <div className="bg-slate-100 px-3 py-2 text-sm font-medium">{table.title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {table.columns.map((c) => (
                <th key={c.key} className="text-left px-2 py-1.5 font-medium whitespace-nowrap">{c.label}</th>
              ))}
              {!readOnly && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {(data[table.key] || []).map((row, i) => (
              <tr key={i} className="border-t">
                {table.columns.map((c) => (
                  <td key={c.key} className="px-1 py-1">
                    <input
                      value={row[c.key] || ''}
                      onChange={(e) => updateCell(table.key, i, c.key, e.target.value)}
                      disabled={readOnly}
                      className="w-full border rounded px-1.5 py-1 min-w-[80px]"
                    />
                  </td>
                ))}
                {!readOnly && (
                  <td>
                    <button type="button" onClick={() => removeRow(table.key, i)} className="text-red-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {(data[table.key] || []).length === 0 && (
              <tr>
                <td colSpan={table.columns.length + (readOnly ? 0 : 1)} className="px-3 py-3 text-gray-400 text-center text-xs">
                  No rows. Click Add Row.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <button type="button" onClick={() => addRow(table.key, table.columns)} className="m-2 text-xs text-blue-600 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Row
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-teal-800 border-b-2 border-teal-500 pb-1">
        ANNEXURE 2 – REVENUE LOSS
      </h3>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-semibold text-amber-900">
        1. GOLD PACKET VERIFICATION
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Gold Loan Outstanding</label>
          <input value={header.gold_loan_outstanding || ''} onChange={(e) => onHeaderChange('gold_loan_outstanding', e.target.value)} disabled={readOnly} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Date of Last visit</label>
          <input type="date" value={header.date_last_visit || ''} onChange={(e) => onHeaderChange('date_last_visit', e.target.value)} disabled={readOnly} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Total Packets</label>
          <input value={header.total_packets || ''} onChange={(e) => onHeaderChange('total_packets', e.target.value)} disabled={readOnly} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Number of packets verified</label>
          <input value={header.packets_verified || '20'} onChange={(e) => onHeaderChange('packets_verified', e.target.value)} disabled={readOnly} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Period covered From</label>
          <input type="date" value={header.period_from || ''} onChange={(e) => onHeaderChange('period_from', e.target.value)} disabled={readOnly} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Period covered To</label>
          <input type="date" value={header.period_to || ''} onChange={(e) => onHeaderChange('period_to', e.target.value)} disabled={readOnly} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm font-semibold text-teal-900">
        GL SECURITY COVER VERIFICATION
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-amber-50">
            <tr>
              <th className="text-left px-2 py-2">Description</th>
              <th className="text-left px-2 py-2">As per records</th>
              <th className="text-left px-2 py-2">As per actual verification</th>
              <th className="text-left px-2 py-2">Shortage Observed (Qty)</th>
              <th className="text-left px-2 py-2">Excess observed (Qty)</th>
              <th className="text-left px-2 py-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-2 py-2 font-medium">GL Security Cover</td>
              {['gl_as_per_records', 'gl_as_per_actual', 'gl_shortage', 'gl_excess', 'gl_remarks'].map((k) => (
                <td key={k} className="px-1 py-1">
                  <input value={header[k] || ''} onChange={(e) => onHeaderChange(k, e.target.value)} disabled={readOnly} className="w-full border rounded px-1.5 py-1" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm font-semibold text-teal-900">
        FRESH IRREGULARITIES
      </div>
      {IRREGULARITY_TABLES.map(renderTable)}

      <div className="border rounded-lg p-3 space-y-2">
        <div className="text-sm font-medium bg-teal-50 text-teal-900 px-2 py-1 rounded">GENERAL POINTS</div>
        <textarea value={generalPoints} onChange={(e) => onFieldChange('annex2_general_points', e.target.value)} disabled={readOnly} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="border rounded-lg p-3 space-y-2">
        <div className="text-sm font-medium bg-teal-50 text-teal-900 px-2 py-1 rounded">PENDING IRREGULARITIES</div>
        <textarea value={pendingIrregularities} onChange={(e) => onFieldChange('annex2_pending_irregularities', e.target.value)} disabled={readOnly} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="border rounded-lg p-3 space-y-2">
        <div className="text-sm font-medium bg-teal-50 text-teal-900 px-2 py-1 rounded">RELEASED / CLOSED IRREGULARITIES</div>
        <textarea value={closedIrregularities} onChange={(e) => onFieldChange('annex2_closed_irregularities', e.target.value)} disabled={readOnly} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm font-semibold text-teal-900">
        EXPENSE VERIFICATION
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Total recovery amount</label>
        <input value={totalRecovery} onChange={(e) => onFieldChange('annex2_total_recovery', e.target.value)} disabled={readOnly} className="w-full max-w-xs border rounded-lg px-3 py-2 text-sm mt-1" />
      </div>
      {EXPENSE_TABLES.map(renderTable)}

      <div className="border-2 border-slate-300 rounded-lg p-4 text-sm text-center text-gray-700 bg-slate-50">
        <p className="font-medium">AUDIT COMPLETION REPORT</p>
        <p className="mt-2 text-xs">
          THIS IS TO CERTIFY THAT A TOTAL NUMBER OF ({header.packets_verified || '20'}) GL PACKETS WERE RECEIVED FOR VERIFICATION
          AND VERIFIED AND RETURNED THE SAME NUMBER OF PACKETS TO THE AUTHORISED STAFF WITHOUT ANY SHORTAGE OR DAMAGE.
          A COPY OF THIS REPORT HAS BEEN HANDED OVER TO BRANCH MANAGER. THE IRREGULARITIES HAVE BEEN DISCUSSED WITH THE BRANCH MANAGER AND STAFF.
        </p>
      </div>
    </div>
  );
}
