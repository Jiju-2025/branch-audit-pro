import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string | Date | null) {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function daysRemaining(deadline?: string | null) {
  if (!deadline) return null;
  const end = new Date(deadline);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  audit_manager: 'Audit Manager',
  auditor: 'Auditor',
  branch_manager: 'Branch Manager',
  area_manager: 'Area Manager',
  regional_manager: 'Regional Manager',
  sales_head: 'Sales Head',
  director: 'Director',
};

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  submitted: 'bg-blue-100 text-blue-800',
  branch_replied: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
