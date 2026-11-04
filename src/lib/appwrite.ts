import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('6ae59d3b0000e6a8d34d');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = '6ae59f79002e4b361f9b';
export const BUCKET_ID = 'audit-attachments';

// Collection / Table IDs
export const COLLECTIONS = {
  profiles: 'profiles',
  branches: 'branches',
  audit_programs: 'audit_programs',
  audit_reports: 'audit_reports',
  report_remarks: 'report_remarks',
};

export { ID, Query, client };
