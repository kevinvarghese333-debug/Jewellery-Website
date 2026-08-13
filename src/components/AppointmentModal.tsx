import React, { useState } from 'react';
import { Product } from '../types';

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
  const [date, setDate] = useState('2026-08-12');
  const [time, setTime] = useState('11:00 AM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-[#1C1410]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#fff8f7] border border-[#d7c1c4] rounded-lg max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
        <button
          onClick={() => { setSubmitted(false); onClose(); }}
          className="absolute top-4 right-4 text-[#847375] hover:text-[#370617] p-1 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-3 mb-4 border-b border-[#d7c1c4] pb-3">
              <span className="material-symbols-outlined text-[#B88A44] text-2xl">
                {type === 'video' ? 'videocam' : 'storefront'}
              </span>
              <div>
                <h3 className="font-serif-display text-xl text-[#370617] font-bold">
                  {type === 'video' ? 'Book Live Video Call' : 'Showroom Private Visit'}
                </h3>
                <p className="font-sans text-xs text-[#524346]">
                  Inspect gold purity, weight certificates, and craftsmanship 1-on-1.
                </p>
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-[#FAF6F0] p-2.5 rounded border border-[#b88a44]/30 flex gap-3 items-center mb-4">
                <img
                  src={selectedProduct.images.main}
                  alt={selectedProduct.name}
                  className="w-12 h-12 object-cover rounded bg-[#fef0f1]"
                />
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-[#B88A44] font-semibold">
                    Viewing Product
                  </span>
                  <h4 className="font-serif-display text-xs text-[#370617] font-bold">
                    {selectedProduct.name} ({selectedProduct.purityBadge})
                  </h4>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider font-semibold text-[#524346] mb-1">
                  Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('video')}
                    className={`py-2 px-3 text-xs font-semibold rounded border flex items-center justify-center gap-1.5 transition-colors ${
                      type === 'video'
                        ? 'bg-[#370617] text-white border-[#370617]'
                        : 'bg-white border-[#d7c1c4] text-[#524346] hover:bg-[#f2e5e6]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">videocam</span>
                    Video Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('showroom')}
                    className={`py-2 px-3 text-xs font-semibold rounded border flex items-center justify-center gap-1.5 transition-colors ${
                      type === 'showroom'
                        ? 'bg-[#370617] text-white border-[#370617]'
                        : 'bg-white border-[#d7c1c4] text-[#524346] hover:bg-[#f2e5e6]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">storefront</span>
                    T. Nagar Store
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans uppercase tracking-wider font-semibold text-[#524346] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sundaram"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#ffffff] border border-[#d7c1c4] rounded px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617]"
                />
              </div>

              <div>
                <label className="block text-xs font-sans uppercase tracking-wider font-semibold text-[#524346] mb-1">
                  Phone Number (for WhatsApp Invite)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#ffffff] border border-[#d7c1c4] rounded px-3 py-2 text-xs text-[#370617] focus:outline-none focus:border-[#370617]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider font-semibold text-[#524346] mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#ffffff] border border-[#d7c1c4] rounded px-2.5 py-1.5 text-xs text-[#370617] focus:outline-none focus:border-[#370617]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider font-semibold text-[#524346] mb-1">
                    Preferred Slot
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-[#ffffff] border border-[#d7c1c4] rounded px-2.5 py-1.5 text-xs text-[#370617] focus:outline-none focus:border-[#370617]"
                  >
                    <option>10:30 AM</option>
                    <option>11:30 AM</option>
                    <option>02:30 PM</option>
                    <option>04:30 PM</option>
                    <option>06:30 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#370617] text-white py-2.5 rounded font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors mt-2"
              >
                Confirm Appointment Request
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-[#FAF6F0] border border-[#B88A44] text-[#B88A44] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <h3 className="font-serif-display text-2xl text-[#370617] font-bold">
              Appointment Confirmed
            </h3>
            <p className="font-sans text-xs text-[#524346] max-w-xs mx-auto">
              Thank you, <strong className="text-[#370617]">{name}</strong>. Our senior jewellery specialist will send a WhatsApp confirmation & HD link to <strong className="text-[#370617]">{phone}</strong> for {date} at {time}.
            </p>
            <button
              onClick={() => { setSubmitted(false); onClose(); }}
              className="bg-[#370617] text-white px-6 py-2 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors mt-4"
            >
              Return to Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
