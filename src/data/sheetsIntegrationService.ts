/**
 * Google Sheets & Cloud Registration Integration Service
 * Pushes customer registration and OTP verification data:
 * (Full Name, Mobile Number, Date of Birth, Email, Timestamp)
 * to Google Sheets and persistent cloud store (Firestore + local audit ledger).
 */

import { db, collection, doc, setDoc } from '../lib/firebase';

export interface UserRegistrationRecord {
  id: string;
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  email: string;
  city?: string;
  registrationType: 'signup' | 'otp_verification' | 'onam_campaign' | 'phone_auth' | 'checkout_otp';
  timestamp: string;
  formattedTime: string;
  status: string;
  voucherCode?: string;
  syncedToGoogleSheet: boolean;
  syncedAt?: string;
}

const LOCAL_REGISTRATIONS_KEY = 'kavitha_user_registration_records_v1';
const PENDING_SYNC_QUEUE_KEY = 'kavitha_pending_sheets_sync_queue_v1';
const GOOGLE_SPREADSHEET_ID_KEY = 'kavitha_active_google_sheet_id';
const GOOGLE_ACCESS_TOKEN_KEY = 'kavitha_google_sheets_access_token';
const GOOGLE_TOKEN_EXPIRY_KEY = 'kavitha_google_sheets_token_expiry';

// Default standard sheet headers
export const SHEET_HEADERS = [
  'Timestamp (IST)',
  'Full Name',
  'Mobile Number',
  'Date of Birth',
  'Email Address',
  'City / Location',
  'Registration Source',
  'Verification Status',
];

/**
 * Retrieves all stored customer registrations
 */
export function getStoredRegistrationRecords(): UserRegistrationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_REGISTRATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading registration records:', e);
  }
  return [];
}

/**
 * Saves or updates a registration record locally
 */
export function saveLocalRegistrationRecord(record: UserRegistrationRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredRegistrationRecords();
    const existingIndex = current.findIndex((r) => r.mobile === record.mobile && r.id === record.id);
    let updated: UserRegistrationRecord[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...record };
    } else {
      updated = [record, ...current.filter((r) => !(r.mobile === record.mobile && r.registrationType === record.registrationType))];
    }

    localStorage.setItem(LOCAL_REGISTRATIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kavitha_registrations_updated', { detail: updated }));
  } catch (e) {
    console.error('Error saving registration record:', e);
  }
}

/**
 * Gets the configured Google Sheet ID
 */
export function getStoredSpreadsheetId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GOOGLE_SPREADSHEET_ID_KEY) || '1Kavitha_Patron_Registrations_Live_2026';
}

/**
 * Sets the active Google Sheet ID
 */
export function setStoredSpreadsheetId(sheetId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOOGLE_SPREADSHEET_ID_KEY, sheetId.trim());
}

/**
 * Gets cached Google OAuth access token if not expired
 */
export function getStoredGoogleAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
  const expiry = localStorage.getItem(GOOGLE_TOKEN_EXPIRY_KEY);
  if (token && expiry) {
    if (Date.now() < parseInt(expiry, 10)) {
      return token;
    }
  }
  return null;
}

/**
 * Stores Google OAuth access token
 */
export function saveGoogleAccessToken(token: string, expiresInSeconds = 3599): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, token);
  localStorage.setItem(GOOGLE_TOKEN_EXPIRY_KEY, (Date.now() + expiresInSeconds * 1000).toString());
}

/**
 * Main function: Record User Registration / OTP Verification
 * Automatically captures Full Name, Mobile, DOB, and pushes to:
 * 1. Local Persistent Ledger (Immediate)
 * 2. Firestore Cloud Database (Async)
 * 3. Google Sheets API v4 (Live Append if OAuth token / Sheet ID configured)
 */
export async function pushUserRegistrationToGoogleSheet(data: {
  fullName: string;
  mobile: string;
  dateOfBirth?: string;
  email?: string;
  city?: string;
  registrationType?: 'signup' | 'otp_verification' | 'onam_campaign' | 'phone_auth' | 'checkout_otp';
  status?: string;
  voucherCode?: string;
}): Promise<{
  success: boolean;
  record: UserRegistrationRecord;
  syncedToGoogleSheet: boolean;
  message: string;
}> {
  const cleanMobile = data.mobile.replace(/\D/g, '').slice(-10);
  const cleanName = data.fullName.trim() || `Patron (${cleanMobile.slice(-4)})`;
  const cleanDob = data.dateOfBirth?.trim() || 'Not Specified';
  const cleanEmail = data.email?.trim() || `${cleanMobile}@kavitha-patron.in`;
  const regType = data.registrationType || 'signup';
  const status = data.status || 'Verified & Active';

  const now = new Date();
  const formattedTime = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const record: UserRegistrationRecord = {
    id: `REG_${Date.now()}_${cleanMobile.slice(-4)}`,
    fullName: cleanName,
    mobile: cleanMobile,
    dateOfBirth: cleanDob,
    email: cleanEmail,
    city: data.city || 'Kerala, India',
    registrationType: regType,
    timestamp: now.toISOString(),
    formattedTime,
    status,
    voucherCode: data.voucherCode,
    syncedToGoogleSheet: false,
  };

  // 1. Immediate Local Storage Persistence
  saveLocalRegistrationRecord(record);

  // 2. Persistent Firestore Cloud Database Sync
  try {
    const docId = `reg_${cleanMobile}_${Date.now()}`;
    const regDocRef = doc(db, 'user_registrations', docId);
    setDoc(regDocRef, {
      ...record,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }, { merge: true }).catch((err) => {
      console.warn('[GoogleSheetsService] Firestore cloud sync notice:', err);
    });
  } catch (err) {
    console.warn('[GoogleSheetsService] Firestore sync error:', err);
  }

  // 3. Push to Google Sheets API v4
  const accessToken = getStoredGoogleAccessToken();
  const spreadsheetId = getStoredSpreadsheetId();

  if (accessToken && spreadsheetId) {
    const pushSuccess = await appendRowToGoogleSheet(record, spreadsheetId, accessToken);
    if (pushSuccess) {
      record.syncedToGoogleSheet = true;
      record.syncedAt = new Date().toISOString();
      saveLocalRegistrationRecord(record);
      return {
        success: true,
        record,
        syncedToGoogleSheet: true,
        message: `Registered & Synced to Google Sheet: ${spreadsheetId}`,
      };
    }
  }

  // If no Google token or append failed, queue for background sync
  queueForSheetsSync(record);

  return {
    success: true,
    record,
    syncedToGoogleSheet: false,
    message: 'Registered & Saved to Verified Cloud Audit Ledger',
  };
}

/**
 * Appends a row to a Google Spreadsheet via Google Sheets API v4
 */
export async function appendRowToGoogleSheet(
  record: UserRegistrationRecord,
  spreadsheetId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const rowValues = [
      record.formattedTime,
      record.fullName,
      `+91 ${record.mobile}`,
      record.dateOfBirth,
      record.email,
      record.city || 'Kerala, India',
      record.registrationType.toUpperCase(),
      record.status + (record.voucherCode ? ` [Voucher: ${record.voucherCode}]` : ''),
    ];

    const range = 'Sheet1!A:H';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (res.ok) {
      console.log('[GoogleSheetsService] Row successfully added to Google Sheet for:', record.mobile);
      return true;
    } else {
      const errorText = await res.text();
      console.warn('[GoogleSheetsService] Append error response:', errorText);
      return false;
    }
  } catch (err) {
    console.warn('[GoogleSheetsService] Network error pushing to Google Sheets:', err);
    return false;
  }
}

/**
 * Add un-synced record to pending sync queue
 */
function queueForSheetsSync(record: UserRegistrationRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(PENDING_SYNC_QUEUE_KEY);
    const queue: UserRegistrationRecord[] = raw ? JSON.parse(raw) : [];
    if (!queue.some((q) => q.id === record.id)) {
      queue.push(record);
      localStorage.setItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (e) {
    console.error('Error queuing for sheets sync:', e);
  }
}

/**
 * Flushes all pending registrations to Google Sheet once connected
 */
export async function flushPendingRegistrationsToGoogleSheet(
  accessToken?: string,
  customSpreadsheetId?: string
): Promise<{ total: number; synced: number }> {
  const token = accessToken || getStoredGoogleAccessToken();
  const sheetId = customSpreadsheetId || getStoredSpreadsheetId();

  if (!token || !sheetId) {
    return { total: 0, synced: 0 };
  }

  let pending: UserRegistrationRecord[] = [];
  try {
    const raw = localStorage.getItem(PENDING_SYNC_QUEUE_KEY);
    pending = raw ? JSON.parse(raw) : [];
  } catch {
    pending = [];
  }

  // Also check any unsynced in main storage
  const all = getStoredRegistrationRecords();
  const unsynced = all.filter((r) => !r.syncedToGoogleSheet);
  const combinedToSync = [...pending];
  for (const item of unsynced) {
    if (!combinedToSync.some((c) => c.id === item.id)) {
      combinedToSync.push(item);
    }
  }

  if (combinedToSync.length === 0) {
    return { total: 0, synced: 0 };
  }

  let syncedCount = 0;
  for (const record of combinedToSync) {
    const success = await appendRowToGoogleSheet(record, sheetId, token);
    if (success) {
      record.syncedToGoogleSheet = true;
      record.syncedAt = new Date().toISOString();
      saveLocalRegistrationRecord(record);
      syncedCount++;
    }
  }

  // Clear synced from queue
  const remaining = combinedToSync.filter((r) => !r.syncedToGoogleSheet);
  localStorage.setItem(PENDING_SYNC_QUEUE_KEY, JSON.stringify(remaining));

  return { total: combinedToSync.length, synced: syncedCount };
}

/**
 * Creates a brand new Google Sheet with pre-formatted headers and returns its Sheet ID
 */
export async function createNewRegistrationGoogleSheet(
  accessToken: string,
  title = 'Kavitha Jewellery - Patron Registrations & OTP Verifications (Live)'
): Promise<{ success: boolean; spreadsheetId?: string; spreadsheetUrl?: string; error?: string }> {
  try {
    const createUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    const res = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Sheet1',
              gridProperties: {
                frozenRowCount: 1,
              },
            },
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }

    const data = await res.json();
    const spreadsheetId = data.spreadsheetId;
    const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // Initialize header row
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/Sheet1!A1:H1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [SHEET_HEADERS],
        }),
      }
    );

    // Save as active sheet
    setStoredSpreadsheetId(spreadsheetId);

    // Flush any pending records immediately
    await flushPendingRegistrationsToGoogleSheet(accessToken, spreadsheetId);

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
    };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to create Google Sheet' };
  }
}

/**
 * Export all verified registration records as CSV for local download / spreadsheet backup
 */
export function exportRegistrationRecordsCsv(): void {
  const records = getStoredRegistrationRecords();
  if (records.length === 0) {
    alert('No customer registration records found yet.');
    return;
  }

  const rows = records.map((r) => [
    `"${r.formattedTime || r.timestamp}"`,
    `"${r.fullName.replace(/"/g, '""')}"`,
    `"+91 ${r.mobile}"`,
    `"${r.dateOfBirth}"`,
    `"${r.email}"`,
    `"${r.city || 'Kerala, India'}"`,
    `"${r.registrationType}"`,
    `"${r.status}${r.voucherCode ? ` (Voucher: ${r.voucherCode})` : ''}"`,
    r.syncedToGoogleSheet ? '"Synced to Google Sheet"' : '"Stored in Cloud Ledger"',
  ]);

  const csvHeaders = [...SHEET_HEADERS, 'Sync Status'];
  const csvContent =
    'data:text/csv;charset=utf-8,' + [csvHeaders.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `kavitha_jewellery_user_registrations_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
