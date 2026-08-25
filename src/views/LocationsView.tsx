import React from 'react';
import { ActiveView } from '../types';

interface LocationsViewProps {
  onNavigate: (view: ActiveView) => void;
  onOpenAppointmentModal: () => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  onNavigate,
  onOpenAppointmentModal,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-[#847375]">
        <button onClick={() => onNavigate('home')} className="hover:text-[#370617] hover:underline">
          Home
        </button>
        <span>/</span>
        <span className="text-[#370617] font-semibold">Flagship Showroom & Locations</span>
      </nav>

      <div className="border-b border-[#d7c1c4] pb-4">
        <span className="text-xs uppercase tracking-[0.22em] text-[#B88A44] font-semibold font-sans">
          FLAGSHIP ATELIER
        </span>
        <h1 className="font-serif-display text-3xl md:text-4xl text-[#370617] font-bold">
          Visit Our Heritage Showroom
        </h1>
        <p className="font-sans text-xs text-[#524346] mt-1">
          Experience private bridal viewing suites and master craftsman gold weighings in person.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Showroom Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#d7c1c4] overflow-hidden shadow-md p-6 space-y-6">
          <div className="relative h-64 rounded-xl overflow-hidden bg-[#1C1410]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNLh46ypsmeAoMzqbRHxfVzqKXiAeT3DJmOIqv2MYbjEHqIg4_zywoaO7nIkOsB1ZMlDEf2zZGyntrBdH4YoP-vNzRrrNCycjKYuZO9t8zPzGWfEfQS8UeHn4Hqxb8HbshjdCUXd4knT0GdTcdYdzuH9fDsawxTXuqp25PWn-JH3zGVgrJUosytju5dWEbRNss654TC0tG0kWlMneNDQSIaz7roAjq9FFG2AHxSXWyOtf-plDFNuSQwg"
              alt="Kavitha Flagship Showroom Cherai, Ernakulam"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1410]/90 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <span className="bg-[#B88A44] text-white text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded">
                Flagship Store
              </span>
              <h3 className="font-serif-display text-2xl font-bold mt-1 text-[#FAF6F0]">
                Kavitha Jewellery Showroom
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans text-[#524346]">
            <div className="space-y-2">
              <span className="block uppercase tracking-wider text-[#370617] font-bold text-[11px]">
                Showroom Address
              </span>
              <p className="leading-relaxed">
                <strong>Kavitha Jewellery</strong><br />
                Kavitha Shopping Complex,<br />
                Devasomnada, Cherai,<br />
                Ernakulam, Kerala 683514
              </p>
            </div>

            <div className="space-y-2">
              <span className="block uppercase tracking-wider text-[#370617] font-bold text-[11px]">
                Contact & Email
              </span>
              <p className="leading-relaxed">
                Email: <a href="mailto:kavithajewelleryandtextiles@gmail.com" className="text-[#370617] font-semibold underline">kavithajewelleryandtextiles@gmail.com</a><br />
                Helpline: <span className="font-data font-semibold text-[#370617]">+91 98765 43210</span>
              </p>
            </div>

            <div className="space-y-2">
              <span className="block uppercase tracking-wider text-[#370617] font-bold text-[11px]">
                Direct Helpline
              </span>
              <p className="font-data font-semibold text-[#370617]">
                +91 98765 43210 / 1800-KAVITHA
              </p>
            </div>

            <div className="space-y-2">
              <span className="block uppercase tracking-wider text-[#370617] font-bold text-[11px]">
                Services Available
              </span>
              <p className="leading-relaxed">
                • Private Bridal Suite<br />
                • On-site Gold XRF Purity Testing<br />
                • Customized Jewellery Engraving
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#f2e5e6] flex flex-wrap gap-4">
            <button
              onClick={onOpenAppointmentModal}
              className="bg-[#370617] text-white px-6 py-3 rounded-lg font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors"
            >
              Book Private Showroom Slot
            </button>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="bg-[#FAF6F0] text-[#370617] border border-[#d7c1c4] px-6 py-3 rounded-lg font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#f2e5e6] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">near_me</span>
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        {/* Info Box (5 cols) */}
        <div className="lg:col-span-5 bg-[#FAF6F0] p-6 rounded-2xl border border-[#b88a44]/30 space-y-6">
          <div className="space-y-2 border-b border-[#b88a44]/20 pb-4">
            <span className="material-symbols-outlined text-3xl text-[#B88A44]">verified_user</span>
            <h3 className="font-serif-display text-2xl text-[#370617] font-bold">
              The In-Store Experience
            </h3>
            <p className="font-sans text-xs text-[#524346]">
              When you enter Kavitha Jewellery, you are welcomed as family. Experience our heritage hospitality and gold weighing transparency.
            </p>
          </div>

          <div className="space-y-4 font-sans text-xs text-[#524346]">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-[#B88A44] text-xl">shield</span>
              <div>
                <strong className="text-[#370617] block">Laser XRF Purity Analysis</strong>
                <span>Observe live non-destructive electronic testing of your gold on precision scales.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="material-symbols-outlined text-[#B88A44] text-xl">diamond</span>
              <div>
                <strong className="text-[#370617] block">Bridal Trousseau Styling</strong>
                <span>Our master stylists curate matching Haarams, Chokers, Jhumkas, and Bangles tailored to your silk saree weave.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="material-symbols-outlined text-[#B88A44] text-xl">sync_alt</span>
              <div>
                <strong className="text-[#370617] block">Immediate Gold Exchange</strong>
                <span>Trade old 22K gold ornament weight at 100% current market rate with zero deduction penalty.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
