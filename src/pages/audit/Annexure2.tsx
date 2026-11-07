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
