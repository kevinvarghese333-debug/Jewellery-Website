import React, { useState } from 'react';
import { Logo } from './Logo';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const VALID_PASSCODES = ['kavitha2026', 'kavithaAdmin2026', 'KJ@2026!Master'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const cleanPass = passcode.trim();

    setTimeout(() => {
      if (VALID_PASSCODES.includes(cleanPass)) {
        setErrorMsg('');
        sessionStorage.setItem('kavitha_admin_authenticated', 'true');
        // Clear any old localstorage flags for safety
        try {
          localStorage.removeItem('kavitha_admin_remember');
        } catch (e) {
          console.error(e);
        }
        onSuccess();
      } else {
        setErrorMsg('Invalid administrator credentials. Access denied.');
        setIsSubmitting(false);
      }
    }, 400);
  };

  return (
    <div className="bg-[#070A0D] text-[#ECEAE2] min-h-screen font-sans -mx-4 md:-mx-12 -mt-6 flex flex-col items-center justify-center p-4 selection:bg-[#C7E24E] selection:text-[#070A0D]">
      <div className="w-full max-w-md bg-[#20221C] border border-[#C7E24E]/30 rounded-3xl p-8 space-y-6 shadow-2xl relative">
        {/* Gold Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B88A44] via-[#C7E24E] to-[#B88A44] rounded-t-3xl" />

        {/* Header */}
        <div className="text-center space-y-3 pt-2">
          <Logo variant="stacked" theme="dark" size="md" className="mx-auto" />
          <h1 className="font-serif-display text-xl font-bold text-[#ECEAE2] pt-2">
            Administrator Portal
          </h1>
          <p className="font-brand text-xs text-[#ECEAE2]/70">
            Authorized management access for live bullion rates, inventory & campaigns
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-[#ECEAE2]/80 font-medium">Administrator Email / ID</label>
            <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3.5 py-3 focus-within:border-[#C7E24E] transition-colors">
              <span className="material-symbols-outlined text-[#B88A44] mr-2 text-lg">mail</span>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@kavithajewellery.in"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-[#ECEAE2] focus:outline-none placeholder-[#ECEAE2]/30"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-passcode" className="block text-[#ECEAE2]/80 font-medium">Security Passcode</label>
            <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3.5 py-3 focus-within:border-[#C7E24E] transition-colors relative">
              <span className="material-symbols-outlined text-[#B88A44] mr-2 text-lg">key</span>
              <input
                id="admin-passcode"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter administrator passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-transparent text-xs text-[#ECEAE2] focus:outline-none pr-8 placeholder-[#ECEAE2]/30"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#ECEAE2]/60 hover:text-[#C7E24E] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#ECEAE2]/70 pt-1">
            <span className="flex items-center gap-1.5 text-[11px] text-[#ECEAE2]/60">
              <span className="material-symbols-outlined text-xs text-[#C7E24E]">shield</span>
              Protected Single-Session Access
            </span>
            <span className="text-[10px] text-[#10B981] font-data flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Secure 256-bit
            </span>
          </div>

          {errorMsg && (
            <div className="text-[11px] text-[#ff6b6b] bg-[#ff6b6b]/10 p-3 rounded-xl border border-[#ff6b6b]/30 flex items-start gap-2 animate-shake">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-[#070A0D]/60 border border-[#4E4C4B]/60 rounded-xl p-2.5 text-[11px] text-[#ECEAE2]/70 flex items-center justify-between">
            <span className="text-[#ECEAE2]/50">Demo Credentials:</span>
            <span className="font-mono text-[#C7E24E] bg-[#C7E24E]/10 px-2 py-0.5 rounded border border-[#C7E24E]/30">kavitha2026</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-3.5 min-h-[48px] rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-[#070A0D] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">lock</span>
                <span>Sign In to Admin Console</span>
              </>
            )}
          </button>
        </form>

        {onCancel && (
          <div className="pt-2 border-t border-[#4E4C4B]/40 text-center">
            <button
              onClick={onCancel}
              className="text-[11px] text-[#ECEAE2]/60 hover:text-[#ECEAE2] inline-flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              <span>Return to Storefront</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
