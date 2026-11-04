# BranchAudit Pro

Internal Audit Management System for Gold Loan / NBFC / Finance Companies & Societies.

## Features

- Role-based access (Admin, Audit Manager, Auditor, Branch Manager, AM, RM, Sales Head, Director)
- Admin creates users with temporary password → forced change on first login
- Audit Manager creates Audit Programs (schedule Branch + Auditor + Date)
- Auditor Dashboard with Due Today, Drafts, Pending Reply (10-day countdown)
- Save Draft / Resume later
- Clone previous month report
- Yes/No/NA dropdowns + Remarks
- File attachments for evidence
- Branch reply workflow (10 days)
- Higher-level remarks
- Export to PDF / Excel
- Company name & Branch master (editable by Admin)

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend / Auth / DB: Supabase (PostgreSQL + Auth + Storage)
- Hosting: Netlify

## Setup Instructions

### 1. Create Supabase Project

1. Go to https://supabase.com → New Project
2. Note down **Project URL** and **anon public** key

### 2. Run Database Schema

1. In Supabase Dashboard → SQL Editor
2. Copy the entire content of `supabase/schema.sql`
3. Run it

### 3. Create Storage Bucket (for attachments)

1. Supabase → Storage → New bucket
2. Name: `audit-attachments`
3. Make it private

### 4. Local Development

```bash
cd branch-audit-pro
cp .env.example .env
# Edit .env and paste your Supabase URL + anon key

npm install
npm run dev
```

### 5. Create First Admin User

1. In Supabase → Authentication → Users → Add user (email + password)
2. Copy the User UUID
3. Go to SQL Editor and run:

```sql
INSERT INTO profiles (id, full_name, email, role, must_change_password, is_active)
VALUES (
  'PASTE-USER-UUID-HERE',
  'System Admin',
  'admin@yourcompany.com',
  'admin',
  false,
  true
);
```

### 6. Deploy to Netlify

1. Push code to GitHub
2. Connect repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

## Current Progress

- Database schema complete
- Authentication + Forced password change
- Role-based layout & navigation
- Auditor Dashboard (Due Today, Drafts, 10-day countdown)
- Audit Manager Dashboard
- Create Audit Program
- Routing & Protected routes

## Next Modules

- Admin: Manage Branches + Create Users
- Full Audit Report form (all Excel sections)
- Clone previous report
- Branch Manager reply screen
- PDF / Excel export
