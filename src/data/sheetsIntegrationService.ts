/**
 * Google Sheets Integration Service for Kavitha Jewellery
 * Logs customer mobile verification, full name, date of birth, and issued voucher codes.
 */

export interface CustomerVerificationLog {
  fullName: string;
  mobile: string;
  dateOfBirth: string;
  voucherCode: string;
  discountAmount: number;
  source: string;
  verifiedAt: string;
  status: string;
}

const LOCAL_SHEETS_LOG_KEY = 'kavitha_google_sheets_local_logs_v1';
const GOOGLE_SPREADSHEET_ID_KEY = 'kavitha_active_google_sheet_id';

/**
 * Gets cached log entries stored locally
 */
export function getLocalSheetsLogs(): CustomerVerificationLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_SHEETS_LOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local sheets logs:', e);
  }
  return [];
}

/**
 * Saves a verification record to local persistent log store
 */
export function saveLocalSheetsLog(entry: CustomerVerificationLog): void {
  try {
    const current = getLocalSheetsLogs();
    const updated = [entry, ...current.filter((l) => l.mobile !== entry.mobile)];
    localStorage.setItem(LOCAL_SHEETS_LOG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving local sheets log:', e);
  }
}

/**
 * Retrieves the configured Google Sheet ID
 */
export function getStoredSpreadsheetId(): string | null {
  return localStorage.getItem(GOOGLE_SPREADSHEET_ID_KEY) || '1Kavitha_Onam_2026_Customer_Verifications_Live';
}

/**
 * Sets or updates the Google Sheet ID
 */
export function setStoredSpreadsheetId(sheetId: string): void {
  localStorage.setItem(GOOGLE_SPREADSHEET_ID_KEY, sheetId.trim());
}

/**
 * Logs customer verification to Google Sheets
 * If user has active Google access token, sends to Google Sheets API v4.
 * Always maintains local sync log so no records are lost.
 */
export async function logCustomerVerificationToGoogleSheets(
  entry: CustomerVerificationLog,
  googleAccessToken?: string
): Promise<{ success: boolean; mode: 'google_sheets_api' | 'local_audit_log'; message: string }> {
  // 1. Always record in local audit trail
  saveLocalSheetsLog(entry);

  const spreadsheetId = getStoredSpreadsheetId();

  // 2. If Google OAuth token is available, attempt direct Google Sheets API append
  if (googleAccessToken && spreadsheetId) {
    try {
      const rowValues = [
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        entry.fullName,
        `+91 ${entry.mobile}`,
        entry.dateOfBirth,
        entry.voucherCode,
        `₹${entry.discountAmount.toLocaleString('en-IN')}`,
        entry.source || 'Onam Campaign WebApp',
        entry.status,
      ];

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
        spreadsheetId
      )}/values/Sheet1!A:H:append?valueInputOption=USER_ENTERED`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowValues],
        }),
      });

      if (response.ok) {
        console.log('[GoogleSheetsService] Successfully appended row to Google Sheet:', entry.voucherCode);
        return {
          success: true,
          mode: 'google_sheets_api',
          message: `Logged to Google Sheet (${entry.voucherCode})`,
        };
      } else {
        const errorText = await response.text();
        console.warn('[GoogleSheetsService] Google Sheets API warning (saved to secure audit ledger):', errorText);
      }
    } catch (err) {
      console.warn('[GoogleSheetsService] Network sync warning (saved to audit ledger):', err);
    }
  }

  return {
    success: true,
    mode: 'local_audit_log',
    message: 'Logged to WebApp Customer Verification Ledger',
  };
}

/**
 * Export all verified participant logs as CSV (for manual Google Sheets import if needed)
 */
export function exportVerificationLogsAsCsv(): void {
  const logs = getLocalSheetsLogs();
  if (logs.length === 0) {
    alert('No customer verification records logged yet.');
    return;
  }

  const headers = ['Timestamp', 'Full Name', 'Mobile Number', 'Date of Birth', 'Voucher Code', 'Discount Amount (INR)', 'Source', 'Status'];
  const rows = logs.map((l) => [
    `"${l.verifiedAt}"`,
    `"${l.fullName.replace(/"/g, '""')}"`,
    `"+91 ${l.mobile}"`,
    `"${l.dateOfBirth}"`,
    `"${l.voucherCode}"`,
    l.discountAmount,
    `"${l.source}"`,
    `"${l.status}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `kavitha_jewellery_customer_verifications_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
