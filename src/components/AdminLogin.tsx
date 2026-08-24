import React, { useState } from 'react';
import { Logo } from './Logo';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [adminEmail, setAdminEmail] = useState<string>('admin@kavithajewellery.com');
  const [passcode, setPasscode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberSession, setRememberSession] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);

  const VALID_PASSCODES = ['kavitha2026', 'admin123', '2026', 'kavithaAdmin2026'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim();

    if (VALID_PASSCODES.includes(cleanPass)) {
      setErrorMsg('');
      if (rememberSession) {
        sessionStorage.setItem('kavitha_admin_authenticated', 'true');
        localStorage.setItem('kavitha_admin_remember', 'true');
      } else {
        sessionStorage.setItem('kavitha_admin_authenticated', 'true');
      }
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setErrorMsg('Invalid passcode. Hint: Use "kavitha2026" or click Quick Demo Access.');
      } else {
        setErrorMsg('Incorrect admin passcode. Please check and try again.');
      }
    }
  };

  const handleQuickDemo = () => {
    sessionStorage.setItem('kavitha_admin_authenticated', 'true');
    setErrorMsg('');
    onSuccess();
  };

  return (
    <div className="bg-[#070A0D] text-[#ECEAE2] min-h-screen font-sans -mx-4 md:-mx-12 -mt-6 flex flex-col items-center justify-center p-4 selection:bg-[#C7E24E] selection:text-[#070A0D]">
      <div className="w-full max-w-md bg-[#20221C] border border-[#C7E24E]/40 rounded-3xl p-8 space-y-6 shadow-2xl animate-fadeIn relative">
        {/* Kasavu Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B88A44] via-[#C7E24E] to-[#B88A44] rounded-t-3xl" />

        {/* Header */}
        <div className="text-center space-y-3 pt-2">
          <Logo variant="stacked" theme="dark" size="md" className="mx-auto" />
          <h1 className="font-serif-display text-xl font-bold text-[#ECEAE2] pt-2">
            Admin Control Authentication
          </h1>
          <p className="font-sans text-xs text-[#ECEAE2]/70">
            Enter passcode to manage campaign rules, live gold rates & customer logs
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-[#ECEAE2]/80 font-medium">Admin Identifier</label>
            <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2.5 focus-within:border-[#C7E24E] transition-colors">
              <span className="material-symbols-outlined text-[#B88A44] mr-2 text-lg">mail</span>
              <input
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-[#ECEAE2] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-passcode" className="block text-[#ECEAE2]/80 font-medium">Security Passcode</label>
            <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2.5 focus-within:border-[#C7E24E] transition-colors relative">
              <span className="material-symbols-outlined text-[#B88A44] mr-2 text-lg">key</span>
              <input
                id="admin-passcode"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter passcode (e.g. kavitha2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-transparent text-xs text-[#ECEAE2] focus:outline-none pr-8"
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
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="rounded border-[#4E4C4B] bg-[#070A0D] text-[#C7E24E] focus:ring-0"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[10px] text-[#B88A44] font-data">Hardcoded Check: Active</span>
          </div>

          {errorMsg && (
            <div className="text-[11px] text-[#ff6b6b] bg-[#ff6b6b]/10 p-3 rounded-xl border border-[#ff6b6b]/30 flex items-start gap-2">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-3.5 min-h-[48px] rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">lock_open</span>
            <span>Authenticate & Launch Admin Control</span>
          </button>
        </form>

        {/* Demo Quick Bypass */}
        <div className="pt-3 border-t border-[#4E4C4B]/40 text-center space-y-3">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 text-[#C7E24E] border border-[#C7E24E]/40 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">flash_on</span>
            <span>Quick 1-Click Demo Login</span>
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-[11px] text-[#ECEAE2]/60 hover:text-[#ECEAE2] block mx-auto pt-1"
            >
              ← Return to Main Storefront
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
