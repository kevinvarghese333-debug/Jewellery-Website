import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { AppointmentRecord, GoogleSheetsConfig } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.warn('Firestore Appointment Notice:', JSON.stringify(errInfo));
}

const LOCAL_STORAGE_APPOINTMENTS_KEY = 'kavitha_lead_appointments_v1';
const LOCAL_STORAGE_SHEETS_CONFIG_KEY = 'kavitha_google_sheets_config_v1';

// Default initial demo/starter leads for rich display
const INITIAL_DEMO_LEADS: AppointmentRecord[] = [
  {
    id: 'apt-kv-8901',
    name: 'Ananya Sundaram',
    phone: '9847123456',
    email: 'ananya.sundaram@gmail.com',
    city: 'Kochi',
    location: 'Cherai Showroom',
    type: 'showroom',
    date: '2026-08-28',
    time: '11:30 AM',
    selectedProductId: 'prod-02',
    selectedProductName: 'Royal Kasavu Heritage Haar (22K)',
    selectedProductPurity: '22K/916',
    notes: 'Looking for matching bridal set for wedding in October. Wants in-person purity testing.',
    status: 'NEW',
    source: 'pdp_view',
    createdAt: '2026-08-25T09:30:00.000Z',
    staffNotes: 'VIP bridal inquiry - assign senior stylist Lakshmi',
    syncedToGoogleSheets: true
  },
  {
    id: 'apt-kv-8902',
    name: 'Dr. Vishnu Nambiar',
    phone: '9447890123',
    email: 'dr.vishnu.n@hospital.org',
    city: 'Dubai (NRI - Thrissur origin)',
    location: 'Video Call (WhatsApp / Meet)',
    type: 'video',
    date: '2026-08-29',
    time: '04:30 PM',
    selectedProductId: 'prod-01',
    selectedProductName: 'Temple Divine Lakshmi Kasu Mala',
    selectedProductPurity: '22K/916',
    notes: 'NRI client inquiring about international insured courier and BIS Hallmark certificate verification.',
    status: 'CONTACTED',
    source: 'website_modal',
    createdAt: '2026-08-24T14:15:00.000Z',
    staffNotes: 'WhatsApp message sent with HD video call invite link.',
    syncedToGoogleSheets: true
  },
  {
    id: 'apt-kv-8903',
    name: 'Meera Radhakrishnan',
    phone: '9745678901',
    email: 'meera.radha@yahoo.co.in',
    city: 'North Paravur',
    location: 'Cherai Showroom',
    type: 'showroom',
    date: '2026-08-26',
    time: '02:30 PM',
    notes: 'Interested in old gold 100% value exchange for traditional Nagas kadas.',
    status: 'CONFIRMED',
    source: 'locations_page',
    createdAt: '2026-08-23T11:00:00.000Z',
    staffNotes: 'Confirmed appointment. Reserved private suite 2.',
    syncedToGoogleSheets: true
  }
];

export function getStoredAppointments(): AppointmentRecord[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_LEADS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_APPOINTMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local appointments:', e);
  }
  // Initialize with starter leads
  saveStoredAppointments(INITIAL_DEMO_LEADS);
  return INITIAL_DEMO_LEADS;
}

export function saveStoredAppointments(appointments: AppointmentRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error('Error saving local appointments:', e);
  }
}

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  if (typeof window === 'undefined') {
    return {
      webhookUrl: '',
      sheetName: 'Kavitha Leads & Appointments',
      autoSync: true
    };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SHEETS_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return {
    webhookUrl: '',
    sheetName: 'Kavitha Leads & Appointments',
    autoSync: true
  };
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_SHEETS_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Save new Appointment Lead to Firestore and sync with Google Sheets
 */
export async function saveAppointmentLead(
  leadData: Omit<AppointmentRecord, 'id' | 'createdAt' | 'status'> & { id?: string }
): Promise<AppointmentRecord> {
  const id = leadData.id || `apt-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const createdAt = new Date().toISOString();

  const newAppointment: AppointmentRecord = {
    ...leadData,
    id,
    status: 'NEW',
    createdAt,
    syncedToGoogleSheets: false
  };

  // 1. Save to Local Storage immediately for zero-latency response
  const existing = getStoredAppointments();
  const updatedList = [newAppointment, ...existing.filter(a => a.id !== id)];
  saveStoredAppointments(updatedList);

  // 2. Persist to Firestore /appointments/{id}
  try {
    const appDocRef = doc(db, 'appointments', id);
    await setDoc(appDocRef, {
      ...newAppointment,
      serverTime: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `appointments/${id}`);
  }

  // 3. Dispatch to Google Sheets if configured
  const sheetsConfig = getGoogleSheetsConfig();
  if (sheetsConfig.webhookUrl && sheetsConfig.autoSync) {
    try {
      const syncSuccess = await sendLeadToGoogleSheetsWebhook(newAppointment, sheetsConfig.webhookUrl);
      if (syncSuccess) {
        newAppointment.syncedToGoogleSheets = true;
        const syncedList = getStoredAppointments().map(a => a.id === id ? { ...a, syncedToGoogleSheets: true } : a);
        saveStoredAppointments(syncedList);
      }
    } catch (e) {
      console.warn('Google Sheets auto-sync notice:', e);
    }
  }

  return newAppointment;
}

/**
 * Update an existing Appointment Status / Staff Notes
 */
export async function updateAppointmentStatusInDb(
  id: string,
  status: AppointmentRecord['status'],
  staffNotes?: string
): Promise<void> {
  const existing = getStoredAppointments();
  const updated = existing.map(a => {
    if (a.id === id) {
      return {
        ...a,
        status,
        staffNotes: staffNotes !== undefined ? staffNotes : a.staffNotes,
        updatedAt: new Date().toISOString()
      };
    }
    return a;
  });
  saveStoredAppointments(updated);

  try {
    const appDocRef = doc(db, 'appointments', id);
    await updateDoc(appDocRef, {
      status,
      ...(staffNotes !== undefined ? { staffNotes } : {}),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
  }
}

/**
 * Delete an Appointment record
 */
export async function deleteAppointmentFromDb(id: string): Promise<void> {
  const existing = getStoredAppointments();
  const updated = existing.filter(a => a.id !== id);
  saveStoredAppointments(updated);

  try {
    const appDocRef = doc(db, 'appointments', id);
    await deleteDoc(appDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
  }
}

/**
 * Real-time Firestore subscriber for Appointments collection
 */
export function subscribeToAppointments(
  onUpdate: (appointments: AppointmentRecord[]) => void
): () => void {
  try {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudLeads: AppointmentRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            cloudLeads.push({
              id: d.id,
              name: data.name || '',
              phone: data.phone || '',
              email: data.email || '',
              city: data.city || '',
              location: data.location || 'Cherai Showroom',
              type: data.type || 'showroom',
              date: data.date || '',
              time: data.time || '',
              selectedProductId: data.selectedProductId,
              selectedProductName: data.selectedProductName,
              selectedProductImage: data.selectedProductImage,
              selectedProductPurity: data.selectedProductPurity,
              notes: data.notes || '',
              status: data.status || 'NEW',
              source: data.source || 'website',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt,
              staffNotes: data.staffNotes || '',
              syncedToGoogleSheets: data.syncedToGoogleSheets
            });
          });

          // Merge cloud with local demo leads so user always sees data
          const mergedMap = new Map<string, AppointmentRecord>();
          cloudLeads.forEach(l => mergedMap.set(l.id, l));
          getStoredAppointments().forEach(l => {
            if (!mergedMap.has(l.id)) mergedMap.set(l.id, l);
          });

          const combined = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          saveStoredAppointments(combined);
          onUpdate(combined);
        } else {
          // Fallback to local
          onUpdate(getStoredAppointments());
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'appointments');
        onUpdate(getStoredAppointments());
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'appointments');
    onUpdate(getStoredAppointments());
    return () => {};
  }
}

/**
 * Dispatch lead payload directly to Google Apps Script / Google Sheets Webhook
 */
export async function sendLeadToGoogleSheetsWebhook(
  lead: AppointmentRecord,
  webhookUrl: string
): Promise<boolean> {
  if (!webhookUrl || !webhookUrl.startsWith('http')) return false;

  const payload = {
    timestamp: new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    leadId: lead.id,
    name: lead.name,
    phone: `+91 ${lead.phone}`,
    email: lead.email || '',
    city: lead.city || '',
    location: lead.location,
    consultationType: lead.type === 'video' ? 'Live Video Call' : 'Showroom Private Visit',
    preferredDate: lead.date,
    preferredTime: lead.time,
    productInterest: lead.selectedProductName ? `${lead.selectedProductName} (${lead.selectedProductPurity || '22K'})` : 'General Jewellery Consultation',
    customerNotes: lead.notes || '',
    status: lead.status,
    source: lead.source,
    staffNotes: lead.staffNotes || ''
  };

  try {
    // We send using no-cors or standard POST for Google Apps Script Web Apps
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.error('Error sending lead to Google Sheets webhook:', err);
    return false;
  }
}

/**
 * Download or Export all leads as CSV ready for Google Sheets & Excel
 */
export function exportAppointmentsToCSV(appointments: AppointmentRecord[]): void {
  const headers = [
    'Lead ID',
    'Date Created',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'City / Location',
    'Showroom / Meeting Point',
    'Consultation Type',
    'Preferred Date',
    'Preferred Time',
    'Product Interest',
    'Purity',
    'Customer Notes',
    'Lead Status',
    'Lead Source',
    'Staff Notes'
  ];

  const rows = appointments.map(a => [
    `"${a.id}"`,
    `"${new Date(a.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}"`,
    `"${(a.name || '').replace(/"/g, '""')}"`,
    `"+91 ${a.phone}"`,
    `"${(a.email || '').replace(/"/g, '""')}"`,
    `"${(a.city || '').replace(/"/g, '""')}"`,
    `"${(a.location || '').replace(/"/g, '""')}"`,
    `"${a.type === 'video' ? 'Live Video Call' : 'Cherai Showroom Visit'}"`,
    `"${a.date}"`,
    `"${a.time}"`,
    `"${(a.selectedProductName || 'General Consultation').replace(/"/g, '""')}"`,
    `"${a.selectedProductPurity || '22K/916'}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`,
    `"${a.status}"`,
    `"${a.source}"`,
    `"${(a.staffNotes || '').replace(/"/g, '""')}"`
  ]);

  const csvString = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kavitha_jewellery_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Return ready-to-use Google Apps Script code for Google Sheets integration
 */
export function getGoogleAppsScriptTemplate(): string {
  return `/**
 * Kavitha Jewellery - Automated Google Sheets Lead Collection Webhook
 * 
 * SETUP INSTRUCTIONS (Takes 1 minute):
 * 1. In your Google Sheet, click Extensions > Apps Script
 * 2. Delete any existing code and paste this entire script.
 * 3. Click "Deploy" > "New deployment"
 * 4. Select type: "Web app"
 * 5. Set "Execute as": "Me"
 * 6. Set "Who has access": "Anyone" (allows Kavitha Jewellery website to send leads)
 * 7. Click "Deploy", authorize access, and COPY the Web app URL.
 * 8. Paste that Web App URL into the Kavitha Jewellery Admin Dashboard > Google Sheets Settings!
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Lead ID",
        "Customer Name",
        "Phone Number",
        "Email",
        "City / Region",
        "Showroom / Location",
        "Consultation Type",
        "Preferred Date",
        "Preferred Time",
        "Product Interest",
        "Customer Request Notes",
        "Status",
        "Source",
        "Staff Notes"
      ]);
      
      // Style header row with Kavitha Burgundy & Gold
      var headerRange = sheet.getRange(1, 1, 1, 15);
      headerRange.setBackground("#370617");
      headerRange.setFontColor("#C7E24E");
      headerRange.setFontWeight("bold");
    }

    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.leadId || "",
      data.name || "",
      data.phone || "",
      data.email || "",
      data.city || "",
      data.location || "Cherai Showroom",
      data.consultationType || "Video Call",
      data.preferredDate || "",
      data.preferredTime || "",
      data.productInterest || "General Inquiry",
      data.customerNotes || "",
      data.status || "NEW",
      data.source || "Website",
      data.staffNotes || ""
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Kavitha Jewellery Google Sheets Lead Webhook is active and listening.");
}
`;
}
