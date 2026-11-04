// =====================================================
// BranchAudit Pro - TypeScript Types
// =====================================================

export type UserRole =
  | 'admin'
  | 'audit_manager'
  | 'auditor'
  | 'branch_manager'
  | 'area_manager'
  | 'regional_manager'
  | 'sales_head'
  | 'director';

export type ProgramStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ReportStatus = 'draft' | 'submitted' | 'branch_replied' | 'closed';

export interface CompanySettings {
  id: string;
  company_name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  updated_at?: string;
}

export interface Branch {
  id: string;
  branch_code: string;
  branch_name: string;
  region?: string;
  address?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Profile {
  id: string;
  employee_code?: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  branch_id?: string;
  must_change_password: boolean;
  is_active: boolean;
  created_at?: string;
  branch?: Branch;
}

export interface AuditProgram {
  id: string;
  branch_id: string;
  auditor_id: string;
  planned_date: string;
  period_from?: string;
  period_to?: string;
  man_days?: number;
  status: ProgramStatus;
  remarks?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  branch?: Branch;
  auditor?: Profile;
}

export interface AuditReport {
  id: string;
  program_id?: string;
  branch_id: string;
  auditor_id: string;
  audit_date?: string;
  region?: string;
  branch_opening_date?: string;
  abm_name?: string;
  abm_since?: string;
  area_manager_name?: string;
  area_manager_emp_code?: string;
  audit_officials?: string;
  verification_from?: string;
  verification_to?: string;
  man_days_taken?: number;
  period_covered_from?: string;
  period_covered_to?: string;
  last_audit_date?: string;
  status: ReportStatus;
  submitted_at?: string;
  branch_reply_deadline?: string;
  branch_replied_at?: string;
  form_data: Record<string, any>;
  grading_data: Record<string, any>;
  total_marks?: number;
  achieved_marks?: number;
  grade?: string;
  cloned_from_id?: string;
  created_at?: string;
  updated_at?: string;
  branch?: Branch;
  auditor?: Profile;
  program?: AuditProgram;
}

export interface ReportRemark {
  id: string;
  report_id: string;
  user_id: string;
  role: UserRole;
  remark_text: string;
  action_taken?: string;
  created_at: string;
  user?: Profile;
}

export interface Attachment {
  id: string;
  report_id: string;
  section?: string;
  finding_key?: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
}

export interface YesNoNAItem {
  question: string;
  answer: 'Yes' | 'No' | 'NA' | '';
  remarks?: string;
}

export interface StaffDetail {
  name: string;
  employee_code: string;
  designation: string;
  doj: string;
  remarks?: string;
}

export interface OutstandingProduct {
  product: string;
  accounts_current: number;
  amount_current: number;
  accounts_last: number;
  amount_last: number;
  accounts_added: number;
  amount_added: number;
}

export interface RegisterItem {
  s_no: number;
  name: string;
  irregularities?: string;
  remarks?: string;
  branch_rectification?: string;
}
