import React, { useState, useEffect } from 'react';
import { 
  StoreBrandingConfig, 
  DEFAULT_BRANDING, 
  getLocalCachedBranding, 
  updateStoreBrandingInFirestore 
} from '../data/storeBrandingService';
import { Logo } from './Logo';
import { ASSET_IMAGES } from '../data/products';

type PreviewStatus = 'idle' | 'loading' | 'valid' | 'error' | 'empty';

export const AdminBrandingManager: React.FC = () => {
  const [config, setConfig] = useState<StoreBrandingConfig>(() => getLocalCachedBranding());
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url' | 'presets'>('url');
  const [heroInputType, setHeroInputType] = useState<'upload' | 'url' | 'presets'>('url');
  
  // Real-time staging states
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(config.logoUrl);
  const [customHeroUrl, setCustomHeroUrl] = useState<string>(config.heroImageUrl);
  const [blurLevel, setBlurLevel] = useState<StoreBrandingConfig['heroBlurLevel']>(config.heroBlurLevel || 'medium');
  const [heroHeading1, setHeroHeading1] = useState<string>(config.heroHeadingLine1 || DEFAULT_BRANDING.heroHeadingLine1 || 'Crafted for Today.');
  const [heroHeading2, setHeroHeading2] = useState<string>(config.heroHeadingLine2 || DEFAULT_BRANDING.heroHeadingLine2 || 'Cherished for Generations');
  const [heroSubtitleText, setHeroSubtitleText] = useState<string>(config.heroSubtitle || DEFAULT_BRANDING.heroSubtitle || '');

  // Image verification states
  const [logoPreviewStatus, setLogoPreviewStatus] = useState<PreviewStatus>('idle');
  const [logoDimensions, setLogoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [heroPreviewStatus, setHeroPreviewStatus] = useState<PreviewStatus>('idle');
  const [heroDimensions, setHeroDimensions] = useState<{ width: number; height: number } | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string>('');
  const [activeLogoSurfaceTab, setActiveLogoSurfaceTab] = useState<'all' | 'header' | 'light' | 'maroon' | 'dark'>('all');
  const [showFullscreenHeroPreview, setShowFullscreenHeroPreview] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  // Check if there are unsaved pending changes
  const isDirty = 
    customLogoUrl.trim() !== config.logoUrl ||
    customHeroUrl.trim() !== config.heroImageUrl ||
    blurLevel !== (config.heroBlurLevel || 'medium') ||
    heroHeading1 !== (config.heroHeadingLine1 || DEFAULT_BRANDING.heroHeadingLine1) ||
    heroHeading2 !== (config.heroHeadingLine2 || DEFAULT_BRANDING.heroHeadingLine2);

  // Sync state if external store changes
  useEffect(() => {
    const current = getLocalCachedBranding();
    setConfig(current);
    setCustomLogoUrl(current.logoUrl);
    setCustomHeroUrl(current.heroImageUrl);
    setBlurLevel(current.heroBlurLevel || 'medium');
    setHeroHeading1(current.heroHeadingLine1 || DEFAULT_BRANDING.heroHeadingLine1 || 'Crafted for Today.');
    setHeroHeading2(current.heroHeadingLine2 || DEFAULT_BRANDING.heroHeadingLine2 || 'Cherished for Generations');
    setHeroSubtitleText(current.heroSubtitle || DEFAULT_BRANDING.heroSubtitle || '');
  }, []);

  // Real-time Logo Image URL verification
  useEffect(() => {
    const trimmed = customLogoUrl?.trim();
    if (!trimmed) {
      setLogoPreviewStatus('empty');
      setLogoDimensions(null);
      return;
    }

    setLogoPreviewStatus('loading');
    const img = new Image();
    img.src = trimmed;
    img.onload = () => {
      setLogoPreviewStatus('valid');
      setLogoDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      setLogoPreviewStatus('error');
      setLogoDimensions(null);
    };
  }, [customLogoUrl]);

  // Real-time Hero Image URL verification
  useEffect(() => {
    const trimmed = customHeroUrl?.trim();
    if (!trimmed) {
      setHeroPreviewStatus('empty');
      setHeroDimensions(null);
      return;
    }

    setHeroPreviewStatus('loading');
    const img = new Image();
    img.src = trimmed;
    img.onload = () => {
      setHeroPreviewStatus('valid');
      setHeroDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      setHeroPreviewStatus('error');
      setHeroDimensions(null);
    };
  }, [customHeroUrl]);

  // Handle Logo File Upload (convert to base64 Data URL)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomLogoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Hero Image File Upload (convert to base64 Data URL)
  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomHeroUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save all branding changes to Firestore and localStorage
  const handleSaveBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveNotice('');

    try {
      const updated: Partial<StoreBrandingConfig> = {
        logoUrl: customLogoUrl.trim() || DEFAULT_BRANDING.logoUrl,
        heroImageUrl: customHeroUrl.trim() || DEFAULT_BRANDING.heroImageUrl,
        heroBlurLevel: blurLevel,
        heroHeadingLine1: heroHeading1.trim() || DEFAULT_BRANDING.heroHeadingLine1,
        heroHeadingLine2: heroHeading2.trim() || DEFAULT_BRANDING.heroHeadingLine2,
        heroSubtitle: heroSubtitleText.trim() || DEFAULT_BRANDING.heroSubtitle,
      };

      await updateStoreBrandingInFirestore(updated, 'Admin Portal');
      setConfig(prev => ({ ...prev, ...updated }));
      setSaveNotice('✓ Store Logo & Hero Media updated in real-time across all customer devices!');
      setTimeout(() => setSaveNotice(''), 5000);
    } catch (err) {
      console.error('Error updating branding:', err);
      setSaveNotice('✓ Updated locally in active browser session.');
      setTimeout(() => setSaveNotice(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Discard pending changes and revert to live saved configuration
  const handleDiscardChanges = () => {
    setCustomLogoUrl(config.logoUrl);
    setCustomHeroUrl(config.heroImageUrl);
    setBlurLevel(config.heroBlurLevel || 'medium');
    setHeroHeading1(config.heroHeadingLine1 || DEFAULT_BRANDING.heroHeadingLine1 || 'Crafted for Today.');
    setHeroHeading2(config.heroHeadingLine2 || DEFAULT_BRANDING.heroHeadingLine2 || 'Cherished for Generations');
    setHeroSubtitleText(config.heroSubtitle || DEFAULT_BRANDING.heroSubtitle || '');
    setSaveNotice('↺ Discarded staged changes. Reverted to live database config.');
    setTimeout(() => setSaveNotice(''), 4000);
  };

  // Reset to factory defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Reset Store Logo and Hero Image to default official assets?')) {
      setConfig(DEFAULT_BRANDING);
      setCustomLogoUrl(DEFAULT_BRANDING.logoUrl);
      setCustomHeroUrl(DEFAULT_BRANDING.heroImageUrl);
      setBlurLevel(DEFAULT_BRANDING.heroBlurLevel);
      setHeroHeading1(DEFAULT_BRANDING.heroHeadingLine1 || 'Crafted for Today.');
      setHeroHeading2(DEFAULT_BRANDING.heroHeadingLine2 || 'Cherished for Generations');
      setHeroSubtitleText(DEFAULT_BRANDING.heroSubtitle || '');
      updateStoreBrandingInFirestore(DEFAULT_BRANDING);
      setSaveNotice('✓ Reverted to factory store media assets.');
      setTimeout(() => setSaveNotice(''), 4000);
    }
  };

  // Quick clipboard paste helper
  const handlePasteFromClipboard = async (target: 'logo' | 'hero') => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          if (target === 'logo') {
            setCustomLogoUrl(text.trim());
            setLogoInputType('url');
          } else {
            setCustomHeroUrl(text.trim());
            setHeroInputType('url');
          }
        }
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  // Hero presets list
  const heroPresets = [
    { name: 'Composed Heritage Bridal Banner', url: '/hero-banner-composed.jpg' },
    { name: 'Kerala Temple Bridal Photography', url: '/hero-traditional-cropped.jpg' },
    { name: 'High-Resolution Bridal Atelier (Original)', url: '/ADH04463 JPEG Lq.jpg' },
    { name: 'Classic Gold Jewellery Showcase', url: '/hero.jpg' },
    { name: 'Full Kerala Bridal Trousseau', url: ASSET_IMAGES.bridalCategory },
  ];

  // Logo presets list
  const logoPresets = [
    { name: 'Primary Authentic Crest (logo.png)', url: '/logo.png' },
    { name: 'Traditional Gold Foil Crest (kavitha-logo.jpg)', url: '/kavitha-logo.jpg' },
    { name: 'Vector SVG Monogram (logo.svg)', url: '/logo.svg' },
    { name: 'High-Res Studio Logo (logo.jpg)', url: '/logo.jpg' },
  ];

  // Blur preview class
  const getPreviewBlurClass = () => {
    switch (blurLevel) {
      case 'none':
        return 'filter-none scale-100';
      case 'subtle':
        return 'blur-[3px] scale-102';
      case 'strong':
        return 'blur-[12px] scale-110';
      case 'luxury':
        return 'blur-[8px] scale-105 saturate-125';
      case 'medium':
      default:
        return 'blur-[8px] scale-105';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-xs font-sans">
      {/* Top Banner Notice */}
      <div className="bg-[#20221C] border border-[#C7E24E]/40 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C7E24E]">palette</span>
            <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">
              SITE-WIDE ASSET & BRANDING STUDIO
            </span>
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[#ECEAE2] mt-1">
            Store Logo & Hero Banner Real-Time Preview
          </h2>
          <p className="text-xs text-[#ECEAE2]/70 mt-1 max-w-2xl">
            Type or paste any image URL to preview the updated logo and hero banner with luxury blur in real time across all surfaces before saving to the database.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-4 py-2 bg-[#070A0D] border border-[#4E4C4B] hover:border-red-400 text-[#ECEAE2]/80 hover:text-red-300 rounded-xl font-bold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Factory Reset</span>
          </button>

          {isDirty && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-4 py-2 bg-[#070A0D] border border-amber-500/50 hover:border-amber-400 text-amber-300 rounded-xl font-bold transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">undo</span>
              <span>Discard Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSaveBranding()}
            disabled={isSaving}
            className="px-5 py-2 bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-[#070A0D] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                <span>Save to Database</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Active Banner */}
      {isDirty && (
        <div className="bg-gradient-to-r from-amber-950/60 via-[#20221C] to-amber-950/60 border border-amber-500/60 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-xl animate-pulse">visibility</span>
            <div>
              <p className="text-xs font-bold text-amber-300">
                ⚡ Real-Time Staging Preview Active (Unsaved Changes)
              </p>
              <p className="text-[11px] text-[#ECEAE2]/80">
                You are viewing real-time previews of your entered image URLs. These changes will not affect customers until you click "Save to Database".
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-3 py-1.5 bg-[#070A0D] hover:bg-[#181818] text-[#ECEAE2] border border-[#4E4C4B] rounded-lg text-xs font-bold transition-all"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => handleSaveBranding()}
              disabled={isSaving}
              className="px-4 py-1.5 bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow"
            >
              Save Now
            </button>
          </div>
        </div>
      )}

      {saveNotice && (
        <div className="p-3 bg-[#C7E24E]/15 border border-[#C7E24E]/50 rounded-xl text-[#C7E24E] text-center font-bold animate-fadeIn flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Main Grid: Section 1 (Logo) & Section 2 (Hero) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ========================================================================= */}
        {/* 1. STORE LOGO CONFIGURATION & MULTI-SURFACE REAL-TIME PREVIEW */}
        {/* ========================================================================= */}
        <div className="bg-[#20221C] border border-[#4E4C4B] rounded-2xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B88A44] font-bold">BRAND IDENTITY</span>
                <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">Official Store Logo</h3>
              </div>
              <div className="flex items-center gap-2">
                {logoPreviewStatus === 'valid' && (
                  <span className="bg-[#C7E24E]/20 text-[#C7E24E] border border-[#C7E24E]/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#C7E24E] rounded-full animate-ping" />
                    <span>Live Validated {logoDimensions ? `(${logoDimensions.width}×${logoDimensions.height})` : ''}</span>
                  </span>
                )}
                {logoPreviewStatus === 'loading' && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    <span>Testing link...</span>
                  </span>
                )}
                {logoPreviewStatus === 'error' && (
                  <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⚠️ Invalid Image URL
                  </span>
                )}
              </div>
            </div>

            {/* Input Mode Selector */}
            <div className="flex gap-2 p-1 bg-[#070A0D] rounded-xl border border-[#4E4C4B]/60">
              <button
                type="button"
                onClick={() => setLogoInputType('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  logoInputType === 'url' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70 hover:text-white'
                }`}
              >
                Direct Image URL
              </button>
              <button
                type="button"
                onClick={() => setLogoInputType('upload')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  logoInputType === 'upload' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70 hover:text-white'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setLogoInputType('presets')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  logoInputType === 'presets' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70 hover:text-white'
                }`}
              >
                Preset Logos
              </button>
            </div>

            {/* Direct URL Option with Real-Time Input & Quick Paste */}
            {logoInputType === 'url' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[#ECEAE2]/80 font-medium">
                    Enter Logo Image URL (Live Preview on typing)
                  </label>
                  <button
                    type="button"
                    onClick={() => handlePasteFromClipboard('logo')}
                    className="text-[10px] text-[#C7E24E] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs">content_paste</span>
                    <span>Paste Link</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="https://example.com/kavitha-logo.png"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    className={`w-full bg-[#070A0D] border ${
                      logoPreviewStatus === 'error'
                        ? 'border-red-500/80 focus:border-red-400'
                        : logoPreviewStatus === 'valid'
                        ? 'border-[#C7E24E]/80 focus:border-[#C7E24E]'
                        : 'border-[#4E4C4B] focus:border-[#C7E24E]'
                    } p-2.5 pr-8 rounded-xl text-xs font-mono text-[#ECEAE2] outline-none transition-all`}
                  />
                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomLogoUrl('')}
                      className="absolute right-2.5 text-[#ECEAE2]/40 hover:text-[#ECEAE2] text-sm"
                      title="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {logoPreviewStatus === 'error' && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>Could not load image from this URL. Please verify the link is public and CORS-accessible.</span>
                  </p>
                )}
              </div>
            )}

            {/* Upload Option */}
            {logoInputType === 'upload' && (
              <div className="space-y-2">
                <label className="block text-[#ECEAE2]/80 font-medium">Upload Logo Image (PNG, JPG, SVG, WebP)</label>
                <div className="border-2 border-dashed border-[#4E4C4B] hover:border-[#C7E24E] rounded-xl p-5 text-center transition-all bg-[#070A0D]/60 flex flex-col items-center justify-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="material-symbols-outlined text-3xl text-[#C7E24E] mb-2">upload_file</span>
                  <p className="font-bold text-[#ECEAE2]">Click or Drag & Drop new Logo file</p>
                  <p className="text-[10px] text-[#ECEAE2]/60 mt-1">Instant local real-time preview before saving</p>
                </div>
              </div>
            )}

            {/* Presets Option */}
            {logoInputType === 'presets' && (
              <div className="space-y-2">
                <label className="block text-[#ECEAE2]/80 font-medium">Select Available System Logo</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {logoPresets.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setCustomLogoUrl(preset.url)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        customLogoUrl === preset.url
                          ? 'bg-[#C7E24E]/15 border-[#C7E24E] text-[#ECEAE2]'
                          : 'bg-[#070A0D] border-[#4E4C4B]/60 text-[#ECEAE2]/70 hover:border-[#ECEAE2]/50'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-8 h-8 object-contain rounded-full bg-white/10 p-0.5" />
                      <span className="text-[11px] font-semibold truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Multi-Surface Staging Preview */}
            <div className="space-y-3 pt-3 border-t border-[#4E4C4B]/40">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">view_in_ar</span>
                  <span>REAL-TIME MULTI-SURFACE PREVIEW</span>
                </span>
                <div className="flex gap-1 bg-[#070A0D] p-0.5 rounded-lg border border-[#4E4C4B]/60 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveLogoSurfaceTab('all')}
                    className={`px-2 py-0.5 rounded font-bold ${activeLogoSurfaceTab === 'all' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/60'}`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLogoSurfaceTab('header')}
                    className={`px-2 py-0.5 rounded font-bold ${activeLogoSurfaceTab === 'header' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/60'}`}
                  >
                    Header
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLogoSurfaceTab('light')}
                    className={`px-2 py-0.5 rounded font-bold ${activeLogoSurfaceTab === 'light' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/60'}`}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLogoSurfaceTab('maroon')}
                    className={`px-2 py-0.5 rounded font-bold ${activeLogoSurfaceTab === 'maroon' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/60'}`}
                  >
                    Maroon
                  </button>
                </div>
              </div>

              {/* Header Bar Simulation */}
              {(activeLogoSurfaceTab === 'all' || activeLogoSurfaceTab === 'header') && (
                <div className="bg-[#FAF6F0] rounded-xl border border-[#B88A44]/40 p-3 shadow-sm space-y-2">
                  <div className="flex justify-between items-center border-b border-[#B88A44]/20 pb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#9A7228]">
                      Store Navigation Header Simulation
                    </span>
                    <span className="text-[8px] bg-[#C7E24E]/20 text-[#070A0D] px-2 py-0.5 rounded-full font-bold">
                      Real-Time Staged
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white border border-[#B88A44]/30 shadow-xs shrink-0">
                        {customLogoUrl ? (
                          <img
                            src={customLogoUrl}
                            alt="Logo Staged Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-[#370617]">KJ</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-serif-display font-bold text-base text-[#370617] leading-tight">
                          Kavitha Jewellery
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-[#9A7228] font-bold">
                          EST. 1992 • CHERAI, KERALA • 916 BIS
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold text-[#370617]/70">
                      <span>Collections</span>
                      <span>Bullion Rates</span>
                      <span>Store</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid of Light & Maroon Theme Previews */}
              {(activeLogoSurfaceTab === 'all' || activeLogoSurfaceTab === 'light' || activeLogoSurfaceTab === 'maroon') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Light Surface Preview */}
                  {(activeLogoSurfaceTab === 'all' || activeLogoSurfaceTab === 'light') && (
                    <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#B88A44]/30 flex flex-col justify-center items-center text-center shadow-sm">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#9A7228] mb-2">
                        Light Ivory / Kasavu Theme
                      </span>
                      <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center p-1 bg-white shadow-xs border border-[#B88A44]/20">
                        <img
                          src={customLogoUrl || '/logo.png'}
                          alt="Staged Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="font-serif-display font-bold text-sm text-[#370617] mt-2">Kavitha Jewellery</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#9A7228]">EST. 1992 • CHERAI</span>
                    </div>
                  )}

                  {/* Dark / Maroon Surface Preview */}
                  {(activeLogoSurfaceTab === 'all' || activeLogoSurfaceTab === 'maroon') && (
                    <div className="bg-[#370617] p-4 rounded-xl border border-[#D4AF6A]/30 flex flex-col justify-center items-center text-center shadow-sm">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF6A] mb-2">
                        Royal Velvet Maroon Theme
                      </span>
                      <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center p-1 bg-[#FAF6F0] shadow-xs ring-1 ring-[#D4AF6A]">
                        <img
                          src={customLogoUrl || '/logo.png'}
                          alt="Staged Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="font-serif-display font-bold text-sm text-white mt-2">Kavitha Jewellery</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF6A]">EST. 1992 • CHERAI</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#4E4C4B]/40 flex justify-between items-center text-[10px] text-[#ECEAE2]/60">
            <span className="truncate max-w-[260px]">
              Active Staged: <code className="text-[#C7E24E]">{customLogoUrl ? customLogoUrl.slice(0, 32) + '...' : 'None'}</code>
            </span>
            {isDirty && (
              <span className="text-amber-300 font-bold">● Unsaved</span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. HERO IMAGE & BLUR CONTROLLER WITH REAL-TIME PREVIEW & STAGE SIMULATOR */}
        {/* ========================================================================= */}
        <div className="bg-[#20221C] border border-[#4E4C4B] rounded-2xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">STOREFRONT HERO BANNER</span>
                <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">Hero Picture & Luxury Blur</h3>
              </div>
              <div className="flex items-center gap-2">
                {heroPreviewStatus === 'valid' && (
                  <span className="bg-[#C7E24E]/20 text-[#C7E24E] border border-[#C7E24E]/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#C7E24E] rounded-full animate-ping" />
                    <span>Live Validated {heroDimensions ? `(${heroDimensions.width}×${heroDimensions.height})` : ''}</span>
                  </span>
                )}
                {heroPreviewStatus === 'loading' && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    <span>Testing link...</span>
                  </span>
                )}
                {heroPreviewStatus === 'error' && (
                  <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⚠️ Invalid Image URL
                  </span>
                )}
              </div>
            </div>

            {/* Hero Input Mode Selector */}
            <div className="flex gap-2 p-1 bg-[#070A0D] rounded-xl border border-[#4E4C4B]/60">
              <button
                type="button"
                onClick={() => setHeroInputType('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  heroInputType === 'url' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70 hover:text-white'
                }`}
              >
                Direct Image URL
              </button>
              <button
                type="button"
                onClick={() => setHeroInputType('upload')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  heroInputType === 'upload' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70 hover:text-white'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setHeroInputType('presets')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  heroInputType === 'presets' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70 hover:text-white'
                }`}
              >
                Preset Banners
              </button>
            </div>

            {/* Hero Direct URL with Real-Time Input & Quick Paste */}
            {heroInputType === 'url' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[#ECEAE2]/80 font-medium">
                    Enter Hero Image URL (Live Preview on typing)
                  </label>
                  <button
                    type="button"
                    onClick={() => handlePasteFromClipboard('hero')}
                    className="text-[10px] text-[#C7E24E] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs">content_paste</span>
                    <span>Paste Link</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="https://example.com/kerala-bridal-hero.jpg"
                    value={customHeroUrl}
                    onChange={(e) => setCustomHeroUrl(e.target.value)}
                    className={`w-full bg-[#070A0D] border ${
                      heroPreviewStatus === 'error'
                        ? 'border-red-500/80 focus:border-red-400'
                        : heroPreviewStatus === 'valid'
                        ? 'border-[#C7E24E]/80 focus:border-[#C7E24E]'
                        : 'border-[#4E4C4B] focus:border-[#C7E24E]'
                    } p-2.5 pr-8 rounded-xl text-xs font-mono text-[#ECEAE2] outline-none transition-all`}
                  />
                  {customHeroUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomHeroUrl('')}
                      className="absolute right-2.5 text-[#ECEAE2]/40 hover:text-[#ECEAE2] text-sm"
                      title="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {heroPreviewStatus === 'error' && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    <span>Could not load hero banner from this URL. Verify the URL is directly accessible.</span>
                  </p>
                )}
              </div>
            )}

            {/* Hero Upload */}
            {heroInputType === 'upload' && (
              <div className="space-y-2">
                <label className="block text-[#ECEAE2]/80 font-medium">Upload Hero Banner (High-Resolution Campaign Photo)</label>
                <div className="border-2 border-dashed border-[#4E4C4B] hover:border-[#C7E24E] rounded-xl p-5 text-center transition-all bg-[#070A0D]/60 flex flex-col items-center justify-center cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="material-symbols-outlined text-3xl text-[#B88A44] mb-2">add_photo_alternate</span>
                  <p className="font-bold text-[#ECEAE2]">Click or Drag & Drop new Hero Banner</p>
                  <p className="text-[10px] text-[#ECEAE2]/60 mt-1">Instant local real-time preview before saving</p>
                </div>
              </div>
            )}

            {/* Hero Presets */}
            {heroInputType === 'presets' && (
              <div className="space-y-2">
                <label className="block text-[#ECEAE2]/80 font-medium">Select Heritage Campaign Photography</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {heroPresets.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setCustomHeroUrl(preset.url)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                        customHeroUrl === preset.url
                          ? 'bg-[#C7E24E]/15 border-[#C7E24E] text-[#ECEAE2]'
                          : 'bg-[#070A0D] border-[#4E4C4B]/60 text-[#ECEAE2]/70 hover:border-[#ECEAE2]/50'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-12 h-9 object-cover rounded-md" />
                      <span className="text-[10px] font-semibold truncate leading-tight">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blur Intensity Real-Time Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <label className="block text-[#ECEAE2] font-bold">Hero Picture Blur Effect (Real-time)</label>
                <span className="text-[10px] text-[#C7E24E] font-bold uppercase tracking-wider">
                  {blurLevel === 'none' ? 'No Blur (Sharp)' : `${blurLevel.toUpperCase()} BLUR ACTIVE`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setBlurLevel('subtle')}
                  className={`p-2 rounded-xl text-center font-bold transition-all border ${
                    blurLevel === 'subtle'
                      ? 'bg-[#C7E24E] text-[#070A0D] border-[#C7E24E]'
                      : 'bg-[#070A0D] text-[#ECEAE2]/80 border-[#4E4C4B]'
                  }`}
                >
                  Subtle (3px)
                </button>
                <button
                  type="button"
                  onClick={() => setBlurLevel('medium')}
                  className={`p-2 rounded-xl text-center font-bold transition-all border ${
                    blurLevel === 'medium'
                      ? 'bg-[#C7E24E] text-[#070A0D] border-[#C7E24E]'
                      : 'bg-[#070A0D] text-[#ECEAE2]/80 border-[#4E4C4B]'
                  }`}
                >
                  Medium (8px) ⭐
                </button>
                <button
                  type="button"
                  onClick={() => setBlurLevel('strong')}
                  className={`p-2 rounded-xl text-center font-bold transition-all border ${
                    blurLevel === 'strong'
                      ? 'bg-[#C7E24E] text-[#070A0D] border-[#C7E24E]'
                      : 'bg-[#070A0D] text-[#ECEAE2]/80 border-[#4E4C4B]'
                  }`}
                >
                  Strong (12px)
                </button>
                <button
                  type="button"
                  onClick={() => setBlurLevel('none')}
                  className={`p-2 rounded-xl text-center font-bold transition-all border ${
                    blurLevel === 'none'
                      ? 'bg-[#C7E24E] text-[#070A0D] border-[#C7E24E]'
                      : 'bg-[#070A0D] text-[#ECEAE2]/80 border-[#4E4C4B]'
                  }`}
                >
                  No Blur (0px)
                </button>
              </div>
            </div>

            {/* Live Hero Stage Interactive Preview */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">tv</span>
                  <span>LIVE STOREFRONT HERO STAGE PREVIEW</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullscreenHeroPreview(true)}
                  className="text-[10px] text-[#C7E24E] hover:underline flex items-center gap-1 font-bold"
                >
                  <span className="material-symbols-outlined text-xs">fullscreen</span>
                  <span>Full Screen Preview</span>
                </button>
              </div>
              
              <div className="relative h-48 rounded-xl overflow-hidden border border-[#4E4C4B] bg-[#18040A] flex items-center shadow-lg">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={customHeroUrl || ASSET_IMAGES.hero}
                    alt="Hero Live Staged Preview"
                    className={`w-full h-full object-cover object-center ${getPreviewBlurClass()} transition-all duration-300`}
                  />
                </div>

                {/* CSS Backdrop Blur layer */}
                <div className="absolute inset-0 backdrop-blur-[8px] bg-black/15 pointer-events-none" />

                {/* Luminous Warm Vignette & Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#18040A] via-[#18040A]/85 to-transparent pointer-events-none" />

                <div className="relative z-10 px-5 space-y-1.5 text-white max-w-sm">
                  <div className="inline-flex items-center gap-1 bg-[#B88A44]/30 px-2 py-0.5 rounded text-[8px] font-bold text-[#F5D77F] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#C7E24E] rounded-full animate-ping" />
                    <span>EST. 1992 • CHERAI, KERALA</span>
                  </div>
                  <h4 className="font-serif-display text-base sm:text-lg font-bold text-[#FAF6F0] leading-tight">
                    {heroHeading1} <br />
                    <span className="italic font-normal text-[#F5D77F]">{heroHeading2}</span>
                  </h4>
                  <div className="flex gap-2 pt-1">
                    <span className="bg-[#B88A44] text-[#070A0D] px-2.5 py-1 rounded text-[9px] font-bold shadow">
                      Explore Collections
                    </span>
                    <span className="bg-white/20 text-white px-2.5 py-1 rounded text-[9px] font-semibold">
                      Book Video Call
                    </span>
                  </div>
                </div>

                {/* Live Staged Watermark badge */}
                <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-[#C7E24E] border border-[#C7E24E]/30">
                  REAL-TIME PREVIEW
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#4E4C4B]/40 flex justify-between items-center text-[10px] text-[#ECEAE2]/60">
            <span className="truncate max-w-[260px]">
              Active Staged: <code className="text-[#C7E24E]">{customHeroUrl ? customHeroUrl.slice(0, 32) + '...' : 'None'}</code>
            </span>
            {isDirty && (
              <span className="text-amber-300 font-bold">● Unsaved</span>
            )}
          </div>
        </div>

      </div>

      {/* Save Button Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[#4E4C4B]/60 bg-[#20221C]/60 p-4 rounded-2xl">
        <div className="text-xs text-[#ECEAE2]/70">
          {isDirty ? (
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
              <span>You have unsaved branding changes staged above. Click Save to persist to Firestore.</span>
            </span>
          ) : (
            <span className="text-[#C7E24E] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">cloud_done</span>
              <span>All branding assets are synchronized and up-to-date in database.</span>
            </span>
          )}
        </div>

        <div className="flex gap-3 shrink-0">
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              className="px-4 py-2.5 bg-[#20221C] border border-[#4E4C4B] hover:border-red-400 text-[#ECEAE2]/80 hover:text-red-300 rounded-xl font-bold transition-all"
            >
              Discard Changes
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSaveBranding()}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-[#070A0D] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-base">cloud_sync</span>
                <span>Save & Apply Store Branding</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN HERO REAL-TIME PREVIEW MODAL */}
      {/* ========================================================================= */}
      {showFullscreenHeroPreview && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fadeIn">
          {/* Modal Header */}
          <div className="flex justify-between items-center pb-4 border-b border-[#4E4C4B] max-w-6xl w-full mx-auto">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#C7E24E]">preview</span>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-white">
                  Storefront Hero Section — Full Real-Time Preview
                </h3>
                <p className="text-[11px] text-[#ECEAE2]/70">
                  Previewing entered hero image URL with {blurLevel} blur before database commit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-[#20221C] p-1 rounded-xl border border-[#4E4C4B]">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewViewport === 'desktop' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70'
                  }`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewViewport === 'mobile' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70'
                  }`}
                >
                  Mobile
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowFullscreenHeroPreview(false)}
                className="w-8 h-8 rounded-full bg-[#20221C] hover:bg-[#4E4C4B] text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Stage Body */}
          <div className="flex-1 flex items-center justify-center py-6 overflow-auto">
            <div className={`transition-all duration-300 ${previewViewport === 'mobile' ? 'w-[375px]' : 'w-full max-w-5xl'}`}>
              <div className="relative min-h-[420px] rounded-2xl overflow-hidden border border-[#B88A44]/40 bg-[#18040A] flex items-center shadow-2xl">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={customHeroUrl || ASSET_IMAGES.hero}
                    alt="Hero Full Preview"
                    className={`w-full h-full object-cover object-center ${getPreviewBlurClass()}`}
                  />
                </div>

                {/* CSS Backdrop Blur layer */}
                <div className="absolute inset-0 backdrop-blur-[8px] bg-black/15 pointer-events-none" />

                {/* Luminous Vignette */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#18040A] via-[#18040A]/85 to-transparent pointer-events-none" />

                {/* Hero Content */}
                <div className="relative z-10 px-8 py-10 space-y-4 text-white max-w-xl">
                  <div className="inline-flex items-center gap-2 bg-[#B88A44]/30 px-3 py-1 rounded-full text-xs font-bold text-[#F5D77F] uppercase tracking-wider border border-[#B88A44]/40">
                    <span className="w-2 h-2 bg-[#C7E24E] rounded-full animate-ping" />
                    <span>EST. 1992 • CHERAI, KERALA • 916 BIS</span>
                  </div>

                  <h1 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#FAF6F0] leading-tight">
                    {heroHeading1} <br />
                    <span className="italic font-normal text-[#F5D77F]">{heroHeading2}</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-[#ECEAE2]/80 leading-relaxed font-sans">
                    {heroSubtitleText || DEFAULT_BRANDING.heroSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <span className="bg-[#B88A44] text-[#070A0D] px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg">
                      Explore Bridal Collections
                    </span>
                    <span className="bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-semibold backdrop-blur-sm">
                      Book Video Consultation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#4E4C4B] max-w-6xl w-full mx-auto flex justify-between items-center">
            <span className="text-xs text-[#ECEAE2]/70">
              Previewing URL: <code className="text-[#C7E24E]">{customHeroUrl}</code>
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowFullscreenHeroPreview(false)}
                className="px-4 py-2 bg-[#20221C] text-white rounded-xl font-bold"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFullscreenHeroPreview(false);
                  handleSaveBranding();
                }}
                className="px-5 py-2 bg-[#C7E24E] text-[#070A0D] rounded-xl font-bold uppercase tracking-wider shadow"
              >
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
