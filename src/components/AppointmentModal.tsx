import React, { useState } from 'react';
import { Product } from '../types';
import { Logo } from './Logo';
import { saveAppointmentLead } from '../data/appointmentService';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: Product | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
}) => {
  const [type, setType] = useState<'video' | 'showroom'>('video');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState('11:30 AM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      const saved = await saveAppointmentLead({
        name: name.trim(),
        phone: phone.trim().replace(/\D/g, ''),
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        location: type === 'showroom' ? 'Cherai Showroom, Ernakulam' : 'Live Video Call (WhatsApp / Google Meet)',
        type,
        date,
        time,
        selectedProductId: selectedProduct?.id,
        selectedProductName: selectedProduct?.name,
        selectedProductImage: selectedProduct?.images?.main,
        selectedProductPurity: selectedProduct?.purityBadge,
        notes: notes.trim() || undefined,
        source: selectedProduct ? 'pdp_view' : 'website_modal'
      });

      setSubmittedLeadId(saved.id);
    } catch (err) {
      console.error('Error saving appointment:', err);
      // Even if cloud fails, fallback ID is generated
      setSubmittedLeadId(`apt-${Date.now().toString().slice(-4)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedLeadId(null);
    setName('');
    setPhone('');
    setEmail('');
    setCity('');
    setNotes('');
    onClose();
  };

  // Google Calendar Link generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(
      type === 'video' 
        ? 'Kavitha Jewellery - Live Gold Video Consultation' 
        : 'Kavitha Jewellery - Cherai Flagship Showroom Visit'
    );
    const details = encodeURIComponent(
      `Appointment with Kavitha Jewellery Specialist.\nReference ID: ${submittedLeadId}\nProduct Interest: ${selectedProduct ? selectedProduct.name : 'Heritage 22K/18K Jewellery'}\nShowroom Helpline: +91 98765 43210`
    );
    const location = encodeURIComponent(
      type === 'showroom'
        ? 'Kavitha Jewellery, Kavitha Shopping Complex, Devasomnada, Cherai, Ernakulam, Kerala 683514'
        : 'WhatsApp Video Call / Google Meet'
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const getWhatsAppMessageUrl = () => {
    const msg = encodeURIComponent(
      `Hello Kavitha Jewellery! I have booked a ${type === 'video' ? 'Live Video Call' : 'Showroom Visit'} (Ref: ${submittedLeadId}) for ${date} at ${time}. My name is ${name}. Please share the consultation details.`
    );
    return `https://wa.me/919876543210?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 bg-[#1C1410]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#fff8f7] border-2 border-[#B88A44]/50 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8">
        <button
          onClick={resetForm}
          className="absolute top-4 right-4 text-[#847375] hover:text-[#370617] p-1.5 rounded-full hover:bg-[#f2e5e6] transition-colors focus:ring-2 focus:ring-[#370617]"
          aria-label="Close Appointment Modal"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {!submittedLeadId ? (
          <div>
            {/* Header with Logo */}
            <div className="flex items-center gap-3.5 mb-5 border-b border-[#d7c1c4] pb-4">
              <Logo variant="mark-only" size="sm" />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B88A44] font-extrabold font-sans block">
                  1-ON-1 MASTER CONSULTATION
                </span>
                <h3 className="font-serif-display text-xl sm:text-2xl text-[#370617] font-bold">
                  {type === 'video' ? 'Book Live HD Video Call' : 'Private Showroom Visit'}
                </h3>
                <p className="font-sans text-xs text-[#524346] mt-0.5">
                  Inspect 22K 916 BIS purity certificates and weight scales with a senior specialist.
                </p>
              </div>
            </div>

            {/* Selected Product Banner if viewing from PDP */}
            {selectedProduct && (
              <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#B88A44]/35 flex gap-3 items-center mb-4 shadow-xs">
                <img
                  src={selectedProduct.images.main}
                  alt={selectedProduct.name}
                  className="w-12 h-12 object-cover rounded-lg bg-[#fef0f1] border border-[#d7c1c4]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9.5px] uppercase font-sans tracking-widest text-[#B88A44] font-bold block">
                    Product for Consultation
                  </span>
                  <h4 className="font-serif-display text-xs sm:text-sm text-[#370617] font-bold truncate">
                    {selectedProduct.name}
                  </h4>
                  <span className="text-[10px] text-[#524346] font-data">
                    {selectedProduct.purityBadge} • {selectedProduct.weightGrams}g
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Consultation Type Selector */}
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-wider font-bold text-[#370617] mb-1.5">
                  Choose Consultation Format
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setType('video')}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      type === 'video'
                        ? 'bg-[#370617] text-[#FAF6F0] border-[#370617] shadow-sm'
                        : 'bg-white border-[#d7c1c4] text-[#524346] hover:bg-[#f2e5e6]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base text-[#D4AF6A]">videocam</span>
                    <span>Live Video Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('showroom')}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      type === 'showroom'
                        ? 'bg-[#370617] text-[#FAF6F0] border-[#370617] shadow-sm'
                        : 'bg-white border-[#d7c1c4] text-[#524346] hover:bg-[#f2e5e6]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base text-[#D4AF6A]">storefront</span>
                    <span>Cherai Showroom</span>
                  </button>
                </div>

                {type === 'showroom' && (
                  <div className="mt-2 p-2.5 bg-[#FAF6F0] rounded-xl border border-[#B88A44]/30 text-[11px] text-[#524346] flex items-start gap-2 animate-fadeIn">
                    <span className="material-symbols-outlined text-sm text-[#B88A44] shrink-0 mt-0.5">location_on</span>
                    <div>
                      <strong className="text-[#370617] block font-bold">Kavitha Jewellery Flagship Atelier</strong>
                      <span>Kavitha Shopping Complex, Devasomnada, Cherai, Ernakulam, Kerala 683514</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider font-bold text-[#370617] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sundaram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider font-bold text-[#370617] mb-1">
                    WhatsApp Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98471 23456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617] font-medium"
                  />
                </div>
              </div>

              {/* Email & City / Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider font-bold text-[#370617] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider font-bold text-[#370617] mb-1">
                    Your City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kochi / Dubai / Thrissur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617]"
                  />
                </div>
              </div>

              {/* Date & Slot */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider font-bold text-[#370617] mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider font-bold text-[#370617] mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617] font-medium"
                  >
                    <option>10:30 AM - Morning Slot</option>
                    <option>11:30 AM - Morning Slot</option>
                    <option>02:30 PM - Afternoon Slot</option>
                    <option>04:30 PM - Evening Slot</option>
                    <option>06:30 PM - Evening Slot</option>
                  </select>
                </div>
              </div>

              {/* Special Requests / Notes */}
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-wider font-bold text-[#370617] mb-1">
                  Specific Requirements or Bridal Budget (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inquiring about matching temple bridal necklace set or 100% old gold exchange"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] py-3 rounded-xl font-sans text-xs uppercase tracking-widest font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking Consultation...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base text-[#D4AF6A]">event_available</span>
                    <span>Confirm Appointment Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center py-4 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-[#370617] text-[#C7E24E] rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#B88A44] font-extrabold block">
                LEAD REF: {submittedLeadId}
              </span>
              <h3 className="font-serif-display text-2xl text-[#370617] font-bold mt-1">
                Consultation Reserved!
              </h3>
              <p className="font-sans text-xs text-[#524346] max-w-sm mx-auto mt-2 leading-relaxed">
                Thank you, <strong className="text-[#370617]">{name}</strong>. Our senior jewellery specialist has received your request for <strong>{date} at {time}</strong> ({type === 'video' ? 'Live HD Video Call' : 'Cherai Showroom Private Suite'}).
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#B88A44]/30 space-y-2.5 text-xs text-left max-w-sm mx-auto">
              <div className="flex items-center justify-between text-[#370617] font-semibold pb-2 border-b border-[#d7c1c4]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#B88A44]">contact_phone</span>
                  <span>Direct Specialist WhatsApp</span>
                </span>
                <span className="font-data text-[#1F7A52] font-bold">+91 98765 43210</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={getWhatsAppMessageUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#1F7A52] hover:bg-[#186241] text-white py-2.5 px-3 rounded-xl text-center font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>WhatsApp Specialist</span>
                </a>

                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] py-2.5 px-3 rounded-xl text-center font-sans text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <span className="material-symbols-outlined text-base text-[#D4AF6A]">calendar_today</span>
                  <span>Add to Google Cal</span>
                </a>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="bg-[#FAF6F0] text-[#370617] border border-[#d7c1c4] px-7 py-2.5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#f2e5e6] transition-colors mt-2"
            >
              Return to Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
