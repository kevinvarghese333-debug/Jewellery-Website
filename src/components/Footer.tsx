import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate?: (view: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#f2e5e6] text-[#201a1b] border-t border-[#d7c1c4] mt-20 pt-16 pb-8 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1 flex flex-col space-y-4 items-start">
          <Logo variant="horizontal" size="md" />
          <p className="font-sans text-xs text-[#524346] leading-relaxed max-w-xs mt-2">
            Excellence in Craftsmanship since 1992. Dedicated to preserving the heritage of South Indian jewelry arts through uncompromising quality, pure 22K/916 gold, and transparent pricing.
          </p>
          <div className="flex space-x-4 pt-2 text-[#370617]">
            <a aria-label="Location" href="#locations" onClick={() => onNavigate?.('locations')} className="hover:text-[#B88A44] transition-colors">
              <span className="material-symbols-outlined text-xl">storefront</span>
            </a>
            <a aria-label="Support" href="#contact" className="hover:text-[#B88A44] transition-colors">
              <span className="material-symbols-outlined text-xl">support_agent</span>
            </a>
            <a aria-label="Certificate" href="#hallmark" className="hover:text-[#B88A44] transition-colors">
              <span className="material-symbols-outlined text-xl">verified</span>
            </a>
          </div>
        </div>

        {/* Customer Care */}
        <div className="col-span-1 flex flex-col space-y-3">
          <h4 className="font-sans text-xs uppercase tracking-widest text-[#370617] font-semibold mb-1">
            Customer Care
          </h4>
          <a href="#shipping" className="font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Insured Shipping Policy
          </a>
          <a href="#buyback" className="font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Transparent Exchange & Buyback
          </a>
          <a href="#hallmark" className="font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            BIS 100% Hallmark Guide
          </a>
          <a href="#terms" className="font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Terms of Service
          </a>
          <a href="#privacy" className="font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Privacy Policy
          </a>
        </div>

        {/* Explore */}
        <div className="col-span-1 flex flex-col space-y-3">
          <h4 className="font-sans text-xs uppercase tracking-widest text-[#370617] font-semibold mb-1">
            Explore Collections & Campaigns
          </h4>
          <button onClick={() => onNavigate?.('onam-campaign')} className="text-left font-sans text-xs text-[#370617] font-bold hover:underline transition-all flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[#B88A44]">card_giftcard</span>
            <span>Onam Surprise Campaign (₹50-₹50k)</span>
          </button>
          <button onClick={() => onNavigate?.('staff-redemption')} className="text-left font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Showroom Staff Redemption Portal
          </button>
          <button onClick={() => onNavigate?.('campaign-admin')} className="text-left font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Campaign Admin & Analytics
          </button>
          <a
            href="/Kavitha_Jewellery_Developer_Handover.pdf"
            download="Kavitha_Jewellery_Developer_Handover.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-left font-sans text-xs text-[#B88A44] font-semibold hover:underline transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            <span>Developer Handover Spec (PDF)</span>
          </a>
          <button onClick={() => onNavigate?.('catalog')} className="text-left font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Gold Necklaces (Haaram & Chokers)
          </button>
          <button onClick={() => onNavigate?.('catalog')} className="text-left font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Heritage Temple Jhumkas
          </button>
          <button onClick={() => onNavigate?.('locations')} className="text-left font-sans text-xs text-[#524346] hover:text-[#370617] hover:underline transition-all">
            Showroom Locator
          </button>
        </div>

        {/* Contact Info */}
        <div className="col-span-1 flex flex-col space-y-3">
          <h4 className="font-sans text-xs uppercase tracking-widest text-[#370617] font-semibold mb-1">
            Contact & Showroom
          </h4>
          <p className="font-sans text-xs text-[#524346] flex items-start gap-2">
            <span className="material-symbols-outlined text-base text-[#370617]">location_on</span>
            <span>Kavitha Shopping complex,<br />Devasomnada, Cherai, Kerala</span>
          </p>
          <p className="font-sans text-xs text-[#524346] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#370617]">call</span>
            <span>+91 98765 43210</span>
          </p>
          <p className="font-sans text-xs text-[#524346] flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#370617]">mail</span>
            <a href="mailto:kavithajewelleryandtextiles@gmail.com" className="hover:underline text-[#370617]">
              kavithajewelleryandtextiles@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 pt-6 border-t border-[#d7c1c4]/60 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
        <p className="font-sans text-[11px] uppercase tracking-widest text-[#524346]">
          © 2026 KAVITHA JEWELLERY. ALL RIGHTS RESERVED. BIS HALLMARKED 22K/916 GOLD.
        </p>
        <div className="flex items-center space-x-4 text-[#847375]">
          <span className="material-symbols-outlined text-xl" title="Insured Logistics">payments</span>
          <span className="material-symbols-outlined text-xl" title="Net Banking">account_balance</span>
          <span className="material-symbols-outlined text-xl" title="Card & UPI">credit_card</span>
        </div>
      </div>
    </footer>
  );
};
