import React, { useState, useEffect } from 'react';
import { AppointmentRecord, GoogleSheetsConfig } from '../types';
import { 
  getStoredAppointments, 
  subscribeToAppointments, 
  updateAppointmentStatusInDb, 
  deleteAppointmentFromDb, 
  saveAppointmentLead, 
  getGoogleSheetsConfig, 
  saveGoogleSheetsConfig, 
  sendLeadToGoogleSheetsWebhook, 
  exportAppointmentsToCSV, 
  getGoogleAppsScriptTemplate 
} from '../data/appointmentService';

export const AdminAppointmentsManager: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(getStoredAppointments());
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(getGoogleSheetsConfig());
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // UI Modals & Feedback
  const [showAppsScriptGuide, setShowAppsScriptGuide] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestMessage, setWebhookTestMessage] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [staffNoteDraft, setStaffNoteDraft] = useState<string>('');

  // Form State for Manual Walk-in / Phone Lead
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualType, setManualType] = useState<'video' | 'showroom'>('showroom');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [manualTime, setManualTime] = useState('11:30 AM');
  const [manualProduct, setManualProduct] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Subscribe to real-time Firestore database
  useEffect(() => {
    const unsubscribe = subscribeToAppointments((updated) => {
      setAppointments(updated);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, newStatus: AppointmentRecord['status']) => {
    await updateAppointmentStatusInDb(id, newStatus);
  };

  const handleSaveStaffNotes = async (id: string) => {
    await updateAppointmentStatusInDb(id, appointments.find(a => a.id === id)?.status || 'NEW', staffNoteDraft);
    setEditingNotesId(null);
  };

  const handleDeleteLead = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete consultation lead for "${name}"?`)) {
      await deleteAppointmentFromDb(id);
    }
  };

  const handleSaveSheetsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleSheetsConfig(sheetsConfig);
    setWebhookTestMessage('✓ Google Sheets Webhook settings saved successfully!');
    setTimeout(() => setWebhookTestMessage(null), 4000);
  };

  const handleTestWebhook = async () => {
    if (!sheetsConfig.webhookUrl) {
      setWebhookTestMessage('⚠️ Please enter your Google Apps Script Web App URL first.');
      return;
    }
    setIsTestingWebhook(true);
    setWebhookTestMessage(null);

    const testLead: AppointmentRecord = {
      id: `test-lead-${Date.now().toString().slice(-4)}`,
      name: 'Kavitha Test Inquiry',
      phone: '9876543210',
      email: 'test@kavithajewellery.com',
      city: 'Cherai, Ernakulam',
      location: 'Cherai Showroom',
      type: 'showroom',
      date: new Date().toISOString().slice(0, 10),
      time: '12:00 PM',
      selectedProductName: 'Test Gold Haram (916 BIS)',
      selectedProductPurity: '22K/916',
      notes: 'Test ping from Kavitha Jewellery Lead Management System',
      status: 'NEW',
      source: 'admin_test',
      createdAt: new Date().toISOString(),
      staffNotes: 'Automated test payload verification'
    };

    const success = await sendLeadToGoogleSheetsWebhook(testLead, sheetsConfig.webhookUrl);
    setIsTestingWebhook(false);
    if (success) {
      setWebhookTestMessage('✓ Ping sent successfully to Google Sheets! Check your sheet for the test row.');
    } else {
      setWebhookTestMessage('⚠️ Could not connect to Webhook URL. Ensure your Apps Script is deployed as Web App with access set to "Anyone".');
    }
  };

  const handleResyncSingleLead = async (lead: AppointmentRecord) => {
    if (!sheetsConfig.webhookUrl) {
      alert('Please configure a Google Sheets Webhook URL in the settings above first.');
      return;
    }
    const success = await sendLeadToGoogleSheetsWebhook(lead, sheetsConfig.webhookUrl);
    if (success) {
      await updateAppointmentStatusInDb(lead.id, lead.status);
      alert(`Lead ${lead.id} successfully synced to Google Sheets!`);
    } else {
      alert('Sync failed. Please check your Webhook URL.');
    }
  };

  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) return;

    setIsSubmittingManual(true);
    try {
      await saveAppointmentLead({
        name: manualName.trim(),
        phone: manualPhone.trim().replace(/\D/g, ''),
        email: manualEmail.trim() || undefined,
        city: manualCity.trim() || undefined,
        location: manualType === 'showroom' ? 'Cherai Showroom, Ernakulam' : 'Live Video Call (WhatsApp / Google Meet)',
        type: manualType,
        date: manualDate,
        time: manualTime,
        selectedProductName: manualProduct.trim() || undefined,
        notes: manualNotes.trim() || undefined,
        source: 'staff_manual_entry',
        staffNotes: 'Logged by showroom staff / reception'
      });

      setShowAddLeadModal(false);
      setManualName('');
      setManualPhone('');
      setManualEmail('');
      setManualCity('');
      setManualProduct('');
      setManualNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const copyAppsScriptToClipboard = () => {
    navigator.clipboard.writeText(getGoogleAppsScriptTemplate());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  // Filtered Leads
  const filteredAppointments = appointments.filter((apt) => {
    const matchStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const matchType = typeFilter === 'ALL' || apt.type === typeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || 
      (apt.name || '').toLowerCase().includes(q) ||
      (apt.phone || '').includes(q) ||
      (apt.email || '').toLowerCase().includes(q) ||
      (apt.city || '').toLowerCase().includes(q) ||
      (apt.selectedProductName || '').toLowerCase().includes(q) ||
      (apt.id || '').toLowerCase().includes(q);

    return matchStatus && matchType && matchQuery;
  });

  // Metrics
  const totalLeads = appointments.length;
  const newLeads = appointments.filter(a => a.status === 'NEW').length;
  const videoLeads = appointments.filter(a => a.type === 'video').length;
  const showroomLeads = appointments.filter(a => a.type === 'showroom').length;
  const confirmedLeads = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* 1. Google Sheets Integration Bar */}
      <div className="bg-[#20221C] border border-[#C7E24E]/40 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#4E4C4B]/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <span className="material-symbols-outlined text-2xl">table_chart</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">
                  DATABASE & LEAD INTEGRATION
                </span>
                <span className="bg-[#10B981]/20 text-[#10B981] text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-[#10B981]/30">
                  Firestore + Google Sheets
                </span>
              </div>
              <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">
                Google Sheets Lead Collection Engine
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowAppsScriptGuide(true)}
              className="bg-[#070A0D] hover:bg-[#370617] text-[#D4AF6A] border border-[#B88A44]/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">integration_instructions</span>
              <span>1-Click Apps Script Setup</span>
            </button>

            <button
              onClick={() => exportAppointmentsToCSV(appointments)}
              className="bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export to Google Sheets CSV</span>
            </button>
          </div>
        </div>

        {/* Webhook Configuration Form */}
        <form onSubmit={handleSaveSheetsConfig} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center text-xs">
          <div className="lg:col-span-6">
            <label className="block text-[#ECEAE2]/80 font-semibold mb-1">
              Google Apps Script Web App URL (for live lead pushes):
            </label>
            <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 focus-within:border-[#C7E24E]">
              <span className="material-symbols-outlined text-sm text-[#4E4C4B] mr-2">link</span>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={sheetsConfig.webhookUrl}
                onChange={(e) => setSheetsConfig({ ...sheetsConfig, webhookUrl: e.target.value })}
                className="w-full bg-transparent font-mono text-[11px] text-[#ECEAE2] focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-3 flex items-center gap-2 pt-4 lg:pt-0">
            <label className="flex items-center gap-2 cursor-pointer text-[#ECEAE2]/90 font-medium select-none">
              <input
                type="checkbox"
                checked={sheetsConfig.autoSync}
                onChange={(e) => setSheetsConfig({ ...sheetsConfig, autoSync: e.target.checked })}
                className="w-4 h-4 rounded text-[#C7E24E] focus:ring-[#C7E24E] bg-[#070A0D] border-[#4E4C4B]"
              />
              <span>Auto-dispatch leads live</span>
            </label>
          </div>

          <div className="lg:col-span-3 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] border border-[#B88A44]/40 py-2 rounded-xl font-bold uppercase tracking-wider transition-all"
            >
              Save URL
            </button>
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={isTestingWebhook}
              className="bg-[#070A0D] hover:bg-[#20221C] text-[#C7E24E] border border-[#C7E24E]/40 px-3 py-2 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-1"
              title="Send a sample test row to your Google Sheet"
            >
              {isTestingWebhook ? (
                <span className="w-3.5 h-3.5 border-2 border-[#C7E24E] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-sm">send</span>
              )}
              <span>Test Ping</span>
            </button>
          </div>
        </form>

        {webhookTestMessage && (
          <div className="p-2.5 rounded-xl bg-[#070A0D] border border-[#C7E24E]/40 text-xs text-[#C7E24E] font-medium animate-fadeIn flex items-center justify-between">
            <span>{webhookTestMessage}</span>
            <button onClick={() => setWebhookTestMessage(null)} className="text-[#ECEAE2]/60 hover:text-white text-xs ml-2">✕</button>
          </div>
        )}
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#20221C] p-4 rounded-2xl border border-[#4E4C4B]/50 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#ECEAE2]/60 font-semibold block">Total Inquiries</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data font-bold text-2xl text-[#ECEAE2]">{totalLeads}</span>
            <span className="text-[11px] text-[#10B981]">leads</span>
          </div>
        </div>

        <div className="bg-[#20221C] p-4 rounded-2xl border border-[#ba1a1a]/40 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#ff8080] font-semibold block">New & Uncontacted</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data font-bold text-2xl text-[#ff6b6b]">{newLeads}</span>
            <span className="text-[10px] bg-[#ba1a1a]/30 text-[#ff8080] px-1.5 py-0.5 rounded font-bold">Action Needed</span>
          </div>
        </div>

        <div className="bg-[#20221C] p-4 rounded-2xl border border-[#B88A44]/40 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#D4AF6A] font-semibold block">Live Video Calls</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data font-bold text-2xl text-[#D4AF6A]">{videoLeads}</span>
            <span className="text-[11px] text-[#ECEAE2]/60">slots</span>
          </div>
        </div>

        <div className="bg-[#20221C] p-4 rounded-2xl border border-[#4E4C4B]/50 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-[#ECEAE2]/60 font-semibold block">Cherai Showroom</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data font-bold text-2xl text-[#ECEAE2]">{showroomLeads}</span>
            <span className="text-[11px] text-[#ECEAE2]/60">visits</span>
          </div>
        </div>

        <div className="bg-[#20221C] p-4 rounded-2xl border border-[#C7E24E]/40 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase tracking-wider text-[#C7E24E] font-semibold block">Confirmed / Done</span>
          <div className="flex items-baseline gap-2">
            <span className="font-data font-bold text-2xl text-[#C7E24E]">{confirmedLeads}</span>
            <span className="text-[11px] text-[#C7E24E]/80">
              {totalLeads > 0 ? `${Math.round((confirmedLeads / totalLeads) * 100)}% conv` : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search, Filter & Add Lead Bar */}
      <div className="bg-[#20221C] p-4 rounded-2xl border border-[#4E4C4B] flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-[#4E4C4B]">search</span>
          <input
            type="text"
            placeholder="Search lead by Name, Mobile (+91), City, or Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl pl-9 pr-3 py-2 text-xs text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-[#ECEAE2]/50 hover:text-white text-xs">✕</button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#070A0D] border border-[#4E4C4B] text-xs text-[#ECEAE2] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C7E24E] font-medium"
          >
            <option value="ALL">All Statuses ({appointments.length})</option>
            <option value="NEW">New Inquiries</option>
            <option value="CONTACTED">Contacted</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#070A0D] border border-[#4E4C4B] text-xs text-[#ECEAE2] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C7E24E] font-medium"
          >
            <option value="ALL">All Formats</option>
            <option value="video">Live Video Calls</option>
            <option value="showroom">Cherai Showroom Visits</option>
          </select>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] border border-[#B88A44]/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm text-[#D4AF6A]">person_add</span>
            <span>Add Walk-in / Phone Lead</span>
          </button>
        </div>
      </div>

      {/* 4. Leads List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-[#20221C] border border-[#4E4C4B]/50 rounded-2xl p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#4E4C4B]">inbox</span>
            <h4 className="font-serif-display text-lg text-[#ECEAE2] font-bold">No consultation leads found</h4>
            <p className="font-sans text-xs text-[#ECEAE2]/60 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Try resetting your search filters.'
                : 'Customer inquiries submitted via the appointment modal will show up here in real time.'}
            </p>
          </div>
        ) : (
          filteredAppointments.map((lead) => {
            const isNew = lead.status === 'NEW';
            const isConfirmed = lead.status === 'CONFIRMED';
            const isCompleted = lead.status === 'COMPLETED';

            const statusColors: Record<string, string> = {
              NEW: 'bg-[#ba1a1a]/20 text-[#ff8080] border-[#ba1a1a]/50',
              CONTACTED: 'bg-[#B88A44]/20 text-[#D4AF6A] border-[#B88A44]/50',
              CONFIRMED: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50',
              COMPLETED: 'bg-[#C7E24E]/20 text-[#C7E24E] border-[#C7E24E]/50',
              CANCELLED: 'bg-[#4E4C4B]/40 text-[#ECEAE2]/60 border-[#4E4C4B]'
            };

            const whatsappMessage = encodeURIComponent(
              `Hello ${lead.name}, this is Lakshmi from Kavitha Jewellery Cherai regarding your appointment request for ${lead.date} at ${lead.time} (${lead.type === 'video' ? 'Live Video Consultation' : 'Showroom Visit'}). How can we assist with your jewellery selection today?`
            );

            return (
              <div
                key={lead.id}
                className={`bg-[#20221C] border rounded-2xl p-4 sm:p-5 transition-all space-y-3.5 shadow-md ${
                  isNew 
                    ? 'border-[#ff6b6b]/60 ring-1 ring-[#ff6b6b]/30' 
                    : isConfirmed 
                    ? 'border-[#10B981]/40' 
                    : 'border-[#4E4C4B]/60'
                }`}
              >
                {/* Top Row: Lead Meta & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#4E4C4B]/40 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-[10px] text-[#ECEAE2]/60 bg-[#070A0D] px-2 py-0.5 rounded border border-[#4E4C4B]">
                      REF: {lead.id}
                    </span>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusColors[lead.status] || statusColors.NEW}`}>
                      ● {lead.status}
                    </span>

                    <span className="bg-[#370617] text-[#D4AF6A] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#B88A44]/40 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">
                        {lead.type === 'video' ? 'videocam' : 'storefront'}
                      </span>
                      <span>{lead.type === 'video' ? 'Live Video Call' : 'Cherai Showroom'}</span>
                    </span>

                    {lead.syncedToGoogleSheets && (
                      <span className="text-[9.5px] text-[#10B981] flex items-center gap-0.5 font-semibold">
                        <span className="material-symbols-outlined text-xs">cloud_done</span>
                        <span>Google Sheet Synced</span>
                      </span>
                    )}
                  </div>

                  {/* Status Dropdown & Action Icons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 text-xs font-sans">
                      <span className="text-[10px] text-[#ECEAE2]/60 uppercase font-semibold">Status:</span>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as AppointmentRecord['status'])}
                        className="bg-[#070A0D] border border-[#4E4C4B] text-xs text-[#ECEAE2] rounded-lg px-2 py-1 font-bold focus:border-[#C7E24E]"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleResyncSingleLead(lead)}
                      title="Sync this row to Google Sheets"
                      className="p-1.5 text-[#ECEAE2]/60 hover:text-[#10B981] hover:bg-[#070A0D] rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">sync</span>
                    </button>

                    <button
                      onClick={() => handleDeleteLead(lead.id, lead.name)}
                      title="Delete Lead"
                      className="p-1.5 text-[#ECEAE2]/60 hover:text-[#ff6b6b] hover:bg-[#070A0D] rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

                {/* Lead Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Customer Info (4 cols) */}
                  <div className="md:col-span-4 space-y-1">
                    <h4 className="font-serif-display text-base font-bold text-[#ECEAE2] flex items-center gap-1.5">
                      <span>{lead.name}</span>
                    </h4>

                    <div className="flex items-center gap-1.5 text-[#C7E24E] font-mono font-bold">
                      <span className="material-symbols-outlined text-sm">call</span>
                      <span>+91 {lead.phone}</span>
                    </div>

                    {lead.email && (
                      <div className="flex items-center gap-1.5 text-[#ECEAE2]/70 truncate">
                        <span className="material-symbols-outlined text-sm">mail</span>
                        <span>{lead.email}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[#ECEAE2]/60">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      <span>{lead.city || lead.location}</span>
                    </div>
                  </div>

                  {/* Slot & Product Info (4 cols) */}
                  <div className="md:col-span-4 space-y-1.5 bg-[#070A0D] p-3 rounded-xl border border-[#4E4C4B]/40">
                    <div className="flex items-center gap-2 text-[#ECEAE2]">
                      <span className="material-symbols-outlined text-sm text-[#B88A44]">calendar_clock</span>
                      <span className="font-bold">{lead.date}</span>
                      <span className="text-[#C7E24E] font-semibold">@ {lead.time}</span>
                    </div>

                    {lead.selectedProductName ? (
                      <div className="text-[11px] text-[#D4AF6A] font-medium pt-1 border-t border-[#4E4C4B]/30 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-xs">diamond</span>
                        <span>Interested in: <strong>{lead.selectedProductName}</strong> ({lead.selectedProductPurity || '22K'})</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#ECEAE2]/60 pt-1 border-t border-[#4E4C4B]/30">
                        General Heritage Jewellery Consultation
                      </div>
                    )}

                    {lead.notes && (
                      <div className="text-[11px] text-[#ECEAE2]/80 italic pt-1 border-t border-[#4E4C4B]/30">
                        "{lead.notes}"
                      </div>
                    )}
                  </div>

                  {/* Staff Notes & Action Buttons (4 cols) */}
                  <div className="md:col-span-4 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#ECEAE2]/60 mb-1">
                        <span>Staff Internal Notes</span>
                        {editingNotesId !== lead.id && (
                          <button
                            onClick={() => {
                              setEditingNotesId(lead.id);
                              setStaffNoteDraft(lead.staffNotes || '');
                            }}
                            className="text-[#C7E24E] hover:underline"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {editingNotesId === lead.id ? (
                        <div className="space-y-1.5">
                          <textarea
                            rows={2}
                            value={staffNoteDraft}
                            onChange={(e) => setStaffNoteDraft(e.target.value)}
                            placeholder="Add notes e.g., Sent video call link, assigned to senior stylist..."
                            className="w-full bg-[#070A0D] border border-[#C7E24E] rounded-lg p-2 text-xs text-[#ECEAE2] focus:outline-none"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleSaveStaffNotes(lead.id)}
                              className="bg-[#C7E24E] text-[#070A0D] px-2.5 py-1 rounded text-[10px] font-bold"
                            >
                              Save Note
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="bg-[#4E4C4B] text-[#ECEAE2] px-2 py-1 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#ECEAE2]/80 bg-[#070A0D] p-2 rounded-lg border border-[#4E4C4B]/40 min-h-[38px]">
                          {lead.staffNotes || <span className="text-[#ECEAE2]/40 italic">No notes recorded yet</span>}
                        </p>
                      )}
                    </div>

                    {/* Quick Direct Customer Contact Buttons */}
                    <div className="flex gap-2 pt-1">
                      <a
                        href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-1.5 px-2.5 rounded-xl font-bold text-center flex items-center justify-center gap-1 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:+91${lead.phone.replace(/\D/g, '')}`}
                        className="flex-1 bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] border border-[#B88A44]/40 py-1.5 px-2.5 rounded-xl font-bold text-center flex items-center justify-center gap-1 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-sm text-[#D4AF6A]">call</span>
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Modal: 1-Click Google Apps Script Setup Guide */}
      {showAppsScriptGuide && (
        <div className="fixed inset-0 bg-[#070A0D]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#20221C] border-2 border-[#C7E24E] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative my-8 space-y-4">
            <button
              onClick={() => setShowAppsScriptGuide(false)}
              className="absolute top-4 right-4 text-[#ECEAE2]/60 hover:text-white p-1 rounded-full hover:bg-[#070A0D]"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3 border-b border-[#4E4C4B]/50 pb-3">
              <span className="material-symbols-outlined text-2xl text-[#C7E24E]">description</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C7E24E] tracking-wider block">INTEGRATION GUIDE</span>
                <h3 className="font-serif-display text-xl text-[#ECEAE2] font-bold">
                  Connect Kavitha Leads to Google Sheets
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#ECEAE2]/80 leading-relaxed font-sans">
              <p>Follow these 4 quick steps to receive every appointment lead into your Google Sheet in real time:</p>
              
              <ol className="list-decimal pl-4 space-y-1.5 text-[#ECEAE2]">
                <li>Open a new or existing <strong>Google Sheet</strong>.</li>
                <li>Go to menu <strong>Extensions &gt; Apps Script</strong>.</li>
                <li>Delete any placeholder code and paste the script below.</li>
                <li>Click <strong>Deploy &gt; New deployment &gt; Web app</strong>. Set <em>Execute as: Me</em>, <em>Who has access: Anyone</em>.</li>
                <li>Copy the generated <strong>Web App URL</strong> and paste it into the Webhook URL field above!</li>
              </ol>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center bg-[#070A0D] border-t border-x border-[#4E4C4B] px-3 py-1.5 rounded-t-xl text-[11px]">
                <span className="text-[#C7E24E] font-mono font-semibold">Google Apps Script (Code.gs)</span>
                <button
                  onClick={copyAppsScriptToClipboard}
                  className="bg-[#C7E24E] text-[#070A0D] font-bold px-2.5 py-0.5 rounded text-[10px] flex items-center gap-1 hover:bg-[#b0cc3d] transition-all"
                >
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>
              <pre className="bg-[#070A0D] border border-[#4E4C4B] rounded-b-xl p-3 text-[10px] font-mono text-[#ECEAE2] max-h-56 overflow-y-auto leading-relaxed">
                {getGoogleAppsScriptTemplate()}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAppsScriptGuide(false)}
                className="bg-[#C7E24E] text-[#070A0D] font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Add Manual Walk-in / Phone Lead */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-[#070A0D]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-[#20221C] border border-[#4E4C4B] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 space-y-4">
            <button
              onClick={() => setShowAddLeadModal(false)}
              className="absolute top-4 right-4 text-[#ECEAE2]/60 hover:text-white p-1 rounded-full hover:bg-[#070A0D]"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="border-b border-[#4E4C4B]/50 pb-3">
              <span className="text-[10px] uppercase font-bold text-[#C7E24E] tracking-wider block">
                SHOWROOM DESK LOG
              </span>
              <h3 className="font-serif-display text-xl text-[#ECEAE2] font-bold">
                Record Walk-in or Telephone Consultation
              </h3>
            </div>

            <form onSubmit={handleCreateManualLead} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#ECEAE2]/80 font-semibold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Menon"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                  />
                </div>
                <div>
                  <label className="block text-[#ECEAE2]/80 font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98471 23456"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#ECEAE2]/80 font-semibold mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                  />
                </div>
                <div>
                  <label className="block text-[#ECEAE2]/80 font-semibold mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Cherai / Ernakulam"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#ECEAE2]/80 font-semibold mb-1">Format</label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value as 'video' | 'showroom')}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-2.5 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                  >
                    <option value="showroom">Cherai Showroom</option>
                    <option value="video">Video Call</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#ECEAE2]/80 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-2 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                  />
                </div>
                <div>
                  <label className="block text-[#ECEAE2]/80 font-semibold mb-1">Time</label>
                  <select
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-2 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                  >
                    <option>10:30 AM</option>
                    <option>11:30 AM</option>
                    <option>02:30 PM</option>
                    <option>04:30 PM</option>
                    <option>06:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#ECEAE2]/80 font-semibold mb-1">Product of Interest</label>
                <input
                  type="text"
                  placeholder="e.g. Kasavu Bridal Haram, 22K Nagas Kada, Light-weight Diamond Ring"
                  value={manualProduct}
                  onChange={(e) => setManualProduct(e.target.value)}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                />
              </div>

              <div>
                <label className="block text-[#ECEAE2]/80 font-semibold mb-1">Staff Notes</label>
                <textarea
                  rows={2}
                  placeholder="Client visited store, requested 22K 916 BIS weight testing demonstration..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 text-[#ECEAE2] focus:outline-none focus:border-[#C7E24E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="bg-[#070A0D] border border-[#4E4C4B] text-[#ECEAE2] px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] font-bold px-5 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingManual ? 'Saving...' : 'Save & Sync Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
