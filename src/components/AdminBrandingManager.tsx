import React, { useState, useEffect } from 'react';
import { 
  StoreBrandingConfig, 
  DEFAULT_BRANDING, 
  getLocalCachedBranding, 
  updateStoreBrandingInFirestore 
} from '../data/storeBrandingService';
import { Logo } from './Logo';
import { ASSET_IMAGES } from '../data/products';

export const AdminBrandingManager: React.FC = () => {
  const [config, setConfig] = useState<StoreBrandingConfig>(() => getLocalCachedBranding());
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url' | 'presets'>('upload');
  const [heroInputType, setHeroInputType] = useState<'upload' | 'url' | 'presets'>('upload');
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(config.logoUrl);
  const [customHeroUrl, setCustomHeroUrl] = useState<string>(config.heroImageUrl);
  const [blurLevel, setBlurLevel] = useState<StoreBrandingConfig['heroBlurLevel']>(config.heroBlurLevel || 'medium');
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string>('');

  // Sync state if external store changes
  useEffect(() => {
    const current = getLocalCachedBranding();
    setConfig(current);
    setCustomLogoUrl(current.logoUrl);
    setCustomHeroUrl(current.heroImageUrl);
    setBlurLevel(current.heroBlurLevel || 'medium');
  }, []);

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
        setConfig(prev => ({ ...prev, logoUrl: dataUrl }));
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
        setConfig(prev => ({ ...prev, heroImageUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save all branding changes to Firestore and localStorage
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveNotice('');

    try {
      const updated: Partial<StoreBrandingConfig> = {
        logoUrl: customLogoUrl.trim() || DEFAULT_BRANDING.logoUrl,
        heroImageUrl: customHeroUrl.trim() || DEFAULT_BRANDING.heroImageUrl,
        heroBlurLevel: blurLevel,
        heroHeadingLine1: config.heroHeadingLine1 || DEFAULT_BRANDING.heroHeadingLine1,
        heroHeadingLine2: config.heroHeadingLine2 || DEFAULT_BRANDING.heroHeadingLine2,
        heroSubtitle: config.heroSubtitle || DEFAULT_BRANDING.heroSubtitle,
      };

      await updateStoreBrandingInFirestore(updated, 'Admin Portal');
      setSaveNotice('✓ Store Logo & Hero Media updated in real-time across all devices!');
      setTimeout(() => setSaveNotice(''), 5000);
    } catch (err) {
      console.error('Error updating branding:', err);
      setSaveNotice('✓ Updated locally in active browser session.');
      setTimeout(() => setSaveNotice(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Reset Store Logo and Hero Image to default official assets?')) {
      setConfig(DEFAULT_BRANDING);
      setCustomLogoUrl(DEFAULT_BRANDING.logoUrl);
      setCustomHeroUrl(DEFAULT_BRANDING.heroImageUrl);
      setBlurLevel(DEFAULT_BRANDING.heroBlurLevel);
      updateStoreBrandingInFirestore(DEFAULT_BRANDING);
      setSaveNotice('✓ Reverted to default store media assets.');
      setTimeout(() => setSaveNotice(''), 4000);
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
        return 'blur-[2px] scale-102';
      case 'strong':
        return 'blur-[8px] scale-110';
      case 'luxury':
        return 'blur-[6px] scale-105 saturate-125';
      case 'medium':
      default:
        return 'blur-[5px] scale-105';
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
              SITE-WIDE ASSET & BRANDING MANAGER
            </span>
          </div>
          <h2 className="font-serif-display text-2xl font-bold text-[#ECEAE2] mt-1">
            Store Logo & Hero Banner Management
          </h2>
          <p className="text-xs text-[#ECEAE2]/70 mt-1 max-w-2xl">
            Upload your authentic store logo and customize the storefront hero campaign banner, including soft luxury photo blur and live text overlays. Changes take effect instantaneously across all customer pages.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-4 py-2 bg-[#070A0D] border border-[#4E4C4B] hover:border-red-400 text-[#ECEAE2]/80 hover:text-red-300 rounded-xl font-bold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveBranding}
            disabled={isSaving}
            className="px-5 py-2 bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-[#070A0D] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">cloud_done</span>
                <span>Save & Broadcast</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3 bg-[#C7E24E]/15 border border-[#C7E24E]/50 rounded-xl text-[#C7E24E] text-center font-bold animate-fadeIn">
          {saveNotice}
        </div>
      )}

      {/* Main Grid: Section 1 (Logo) & Section 2 (Hero) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ========================================================================= */}
        {/* 1. STORE LOGO CONFIGURATION */}
        {/* ========================================================================= */}
        <div className="bg-[#20221C] border border-[#4E4C4B] rounded-2xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B88A44] font-bold">BRAND IDENTITY</span>
                <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">Official Store Logo</h3>
              </div>
              <span className="material-symbols-outlined text-[#B88A44]">verified</span>
            </div>

            {/* Input Mode Selector */}
            <div className="flex gap-2 p-1 bg-[#070A0D] rounded-xl border border-[#4E4C4B]/60">
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
                onClick={() => setLogoInputType('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  logoInputType === 'url' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70 hover:text-white'
                }`}
              >
                Direct Image URL
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
                  <p className="text-[10px] text-[#ECEAE2]/60 mt-1">Recommended: Transparent PNG or high-res square logo</p>
                </div>
              </div>
            )}

            {/* Direct URL Option */}
            {logoInputType === 'url' && (
              <div className="space-y-2">
                <label className="block text-[#ECEAE2]/80 font-medium">Enter Logo Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/kavitha-logo.png"
                  value={customLogoUrl}
                  onChange={(e) => {
                    setCustomLogoUrl(e.target.value);
                    setConfig(prev => ({ ...prev, logoUrl: e.target.value }));
                  }}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-mono text-[#ECEAE2] focus:border-[#C7E24E] outline-none"
                />
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
                      onClick={() => {
                        setCustomLogoUrl(preset.url);
                        setConfig(prev => ({ ...prev, logoUrl: preset.url }));
                      }}
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

            {/* Live Multi-Surface Preview */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] uppercase tracking-widest text-[#ECEAE2]/60 font-bold block">
                LIVE LOGO RENDERING PREVIEW
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Light Surface Preview */}
                <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#B88A44]/30 flex flex-col justify-center items-center text-center shadow-sm">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#9A7228] mb-2">Light Store Theme</span>
                  <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center p-1 bg-white shadow-xs border border-[#B88A44]/20">
                    <img src={customLogoUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-serif-display font-bold text-sm text-[#370617] mt-1.5">Kavitha Jewellery</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#9A7228]">EST. 1992 • CHERAI</span>
                </div>

                {/* Dark / Maroon Surface Preview */}
                <div className="bg-[#370617] p-3.5 rounded-xl border border-[#D4AF6A]/30 flex flex-col justify-center items-center text-center shadow-sm">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF6A] mb-2">Maroon Luxury Theme</span>
                  <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center p-1 bg-[#FAF6F0] shadow-xs ring-1 ring-[#D4AF6A]">
                    <img src={customLogoUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-serif-display font-bold text-sm text-white mt-1.5">Kavitha Jewellery</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF6A]">EST. 1992 • CHERAI</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#4E4C4B]/40">
            <p className="text-[10px] text-[#ECEAE2]/50">
              Active Source: <code className="text-[#C7E24E] break-all">{customLogoUrl.slice(0, 45)}...</code>
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. HERO IMAGE & BLUR CONTROLLER */}
        {/* ========================================================================= */}
        <div className="bg-[#20221C] border border-[#4E4C4B] rounded-2xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">STOREFRONT HERO BANNER</span>
                <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">Hero Picture & Luxury Blur</h3>
              </div>
              <span className="material-symbols-outlined text-[#C7E24E]">photo_library</span>
            </div>

            {/* Hero Input Mode Selector */}
            <div className="flex gap-2 p-1 bg-[#070A0D] rounded-xl border border-[#4E4C4B]/60">
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
                onClick={() => setHeroInputType('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  heroInputType === 'url' ? 'bg-[#C7E24E] text-[#070A0D]' : 'text-[#ECEAE2]/70 hover:text-white'
                }`}
              >
                Direct Image URL
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
                  <p className="text-[10px] text-[#ECEAE2]/60 mt-1">Recommended: 1920×1080 or landscape orientation</p>
                </div>
              </div>
            )}

            {/* Hero Direct URL */}
            {heroInputType === 'url' && (
              <div className="space-y-2">
                <label className="block text-[#ECEAE2]/80 font-medium">Enter Hero Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/kerala-bridal-hero.jpg"
                  value={customHeroUrl}
                  onChange={(e) => {
                    setCustomHeroUrl(e.target.value);
                    setConfig(prev => ({ ...prev, heroImageUrl: e.target.value }));
                  }}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-mono text-[#ECEAE2] focus:border-[#C7E24E] outline-none"
                />
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
                      onClick={() => {
                        setCustomHeroUrl(preset.url);
                        setConfig(prev => ({ ...prev, heroImageUrl: preset.url }));
                      }}
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

            {/* Blur Intensity Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <label className="block text-[#ECEAE2] font-bold">Hero Picture Blur Effect</label>
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
                  Subtle (2px)
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
                  Medium (5px) ⭐
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
                  Strong (8px)
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

            {/* Live Hero Stage Preview */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase tracking-widest text-[#ECEAE2]/60 font-bold block">
                LIVE STOREFRONT HERO STAGE PREVIEW
              </span>
              
              <div className="relative h-44 rounded-xl overflow-hidden border border-[#4E4C4B] bg-[#18040A] flex items-center shadow-lg">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={customHeroUrl}
                    alt="Hero Preview"
                    className={`w-full h-full object-cover object-center ${getPreviewBlurClass()}`}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#18040A] via-[#18040A]/80 to-transparent" />

                <div className="relative z-10 px-5 space-y-1.5 text-white max-w-sm">
                  <div className="inline-block bg-[#B88A44]/30 px-2 py-0.5 rounded text-[8px] font-bold text-[#F5D77F] uppercase tracking-wider">
                    EST. 1992 • CHERAI, KERALA
                  </div>
                  <h4 className="font-serif-display text-base sm:text-lg font-bold text-[#FAF6F0] leading-tight">
                    Crafted for Today. <br />
                    <span className="italic font-normal text-[#F5D77F]">Cherished for Generations</span>
                  </h4>
                  <div className="flex gap-2 pt-1">
                    <span className="bg-[#B88A44] text-[#070A0D] px-2 py-1 rounded text-[9px] font-bold">
                      Explore Collections
                    </span>
                    <span className="bg-white/20 text-white px-2 py-1 rounded text-[9px] font-semibold">
                      Book Video Call
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#4E4C4B]/40">
            <p className="text-[10px] text-[#ECEAE2]/50">
              Active Banner: <code className="text-[#C7E24E] break-all">{customHeroUrl.slice(0, 45)}...</code>
            </p>
          </div>
        </div>

      </div>

      {/* Save Button Bar */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#4E4C4B]/60">
        <button
          type="button"
          onClick={handleResetToDefaults}
          className="px-4 py-2.5 bg-[#20221C] border border-[#4E4C4B] hover:border-red-400 text-[#ECEAE2]/80 hover:text-red-300 rounded-xl font-bold transition-all"
        >
          Reset to Factory Assets
        </button>
        <button
          type="button"
          onClick={handleSaveBranding}
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
  );
};
