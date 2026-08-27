import React, { useState } from 'react';
import { Product, CategoryType, PurityType } from '../types';
import { calculatePriceBreakdown, getGoldRateForPurity, getLiveProductPrice } from '../data/products';
import { getAllProducts, addCustomProduct, deleteCustomProduct, getCustomProducts } from '../data/productStore';

interface AdminProductManagerProps {
  currentGoldRate: number;
}

const CATEGORIES: CategoryType[] = [
  'Chokers',
  'Long Necklaces (Haaram)',
  'Layered Necklaces',
  'Earrings',
  'Bangles & Bracelets',
  'Rings',
  'Bridal Trousseau',
];

const PRESET_SAMPLE_IMAGES: { label: string; url: string }[] = [
  { label: 'Stacked Bangles', url: 'https://images.unsplash.com/photo-1611591475827-0cf19232a93a?q=80&w=800&auto=format&fit=crop' },
  { label: 'Royal Kada', url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop' },
  { label: 'Temple Jhumkas', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop' },
  { label: 'Heritage Choker', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop' },
  { label: 'Bridal Haaram', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCFnIW7MpYWKLhk2eQbummGd6OlVGAfq5xXrQ_6nJSqyZYcHSQ4alS8i7EMOcreo91KZBwIObg6SnQ4MNybu7FQkT8JyKMrnr_ngfRhx8xeN3rjV9L7ALj_TgQzq7yS3S2OZfS5pxLFmvloMWq1voVfVvcx_Y9io82hyYYiMkKiE7c7boDOoMkQ-Ku7CoDWZfKGNnBxPfUBie8VIfbuGwh8iXipuSUX4FQzD76lw3UsKTRl-rsQqBH-w' },
];

export const AdminProductManager: React.FC<AdminProductManagerProps> = ({ currentGoldRate }) => {
  const [products, setProducts] = useState<Product[]>(() => getAllProducts());
  const [customProductsCount, setCustomProductsCount] = useState<number>(() => getCustomProducts().length);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('Bangles & Bracelets');
  const [purity, setPurity] = useState<PurityType>('22K');
  const [weightGrams, setWeightGrams] = useState<number>(18.5);
  const [size, setSize] = useState('Size 2-6 (Standard)');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1611591475827-0cf19232a93a?q=80&w=800&auto=format&fit=crop');
  const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1611591475827-0cf19232a93a?q=80&w=800&auto=format&fit=crop');
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState(false);
  const [filterPurity, setFilterPurity] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Real-time calculation based on current purity and current gold rate
  const rateForPurity = getGoldRateForPurity(purity, currentGoldRate);
  const breakdown = calculatePriceBreakdown(weightGrams, purity, currentGoldRate);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || weightGrams <= 0) return;

    const purityBadge = purity === '22K' ? '22K/916' : purity === '18K' ? '18K/750' : '14K/585';

    addCustomProduct({
      name: name.trim(),
      category,
      purity,
      purityBadge,
      weightGrams,
      basePrice: breakdown.total,
      size: size.trim() || 'Standard',
      description: description.trim() || `Handcrafted ${purity} gold ${category.toLowerCase()} with 100% BIS hallmark guarantee.`,
      images: {
        main: imageUrl || '/products/bangle-stacked.jpg',
      },
      isNewArrival: true,
    });

    setProducts(getAllProducts());
    setCustomProductsCount(getCustomProducts().length);
    setUploadSuccessNotice(true);

    // Reset some form fields
    setName('');
    setDescription('');

    setTimeout(() => {
      setUploadSuccessNotice(false);
    }, 3500);
  };

  const handleDelete = (id: string) => {
    deleteCustomProduct(id);
    setProducts(getAllProducts());
    setCustomProductsCount(getCustomProducts().length);
  };

  // Filter list
  const filteredProducts = products.filter(p => {
    if (filterPurity !== 'All' && p.purity !== filterPurity) return false;
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="bg-[#20221C] p-6 rounded-2xl border border-[#C7E24E]/40 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#4E4C4B]/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">CATALOG MANAGEMENT</span>
            <span className="bg-[#C7E24E]/20 text-[#C7E24E] text-[10px] px-2 py-0.5 rounded font-bold">
              {customProductsCount} Custom Uploaded
            </span>
          </div>
          <h3 className="font-serif-display text-xl font-bold text-[#ECEAE2]">
            Jewellery Upload & Karat Tagging Studio
          </h3>
          <p className="text-xs text-[#ECEAE2]/70">
            Upload new designs, tag purity (22K / 18K / 14K), and preview live pricing calculated automatically against the current bullion rate (₹{currentGoldRate.toLocaleString()}/g).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Upload Form */}
        <form onSubmit={handleAddProduct} className="lg:col-span-7 space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Title */}
            <div>
              <label htmlFor="admin-product-name" className="block text-[#ECEAE2]/90 font-semibold mb-1">
                Jewellery Piece Name / Title *
              </label>
              <input
                id="admin-product-name"
                type="text"
                required
                placeholder="e.g. Aadhya 22K Lakshmi Kada"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-medium text-[#ECEAE2] outline-none focus:border-[#C7E24E]"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="admin-product-category" className="block text-[#ECEAE2]/90 font-semibold mb-1">
                Category *
              </label>
              <select
                id="admin-product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-bold text-[#ECEAE2] outline-none focus:border-[#C7E24E]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Karat / Purity Tag Selector */}
          <div>
            <label className="block text-[#ECEAE2]/90 font-semibold mb-1.5">
              Gold Purity Tag *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['22K', '18K', '14K'] as PurityType[]).map((p) => {
                const isSelected = purity === p;
                const pRate = getGoldRateForPurity(p, currentGoldRate);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPurity(p)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#C7E24E] text-[#070A0D] border-[#C7E24E] shadow-md font-bold'
                        : 'bg-[#070A0D] text-[#ECEAE2] border-[#4E4C4B] hover:border-[#C7E24E]/60'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">{p} Gold</span>
                      <span className={`text-[10px] uppercase font-data px-1.5 py-0.5 rounded ${isSelected ? 'bg-black/20 text-black font-bold' : 'bg-[#20221C] text-[#C7E24E]'}`}>
                        {p === '22K' ? '916' : p === '18K' ? '750' : '585'}
                      </span>
                    </div>
                    <div className="text-[11px] font-data mt-1 opacity-90">
                      ₹{pRate.toLocaleString()}/g
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weight & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="admin-product-weight" className="block text-[#ECEAE2]/90 font-semibold mb-1">
                Gross Weight (Grams) *
              </label>
              <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 focus-within:border-[#C7E24E]">
                <input
                  id="admin-product-weight"
                  type="number"
                  step="0.05"
                  min="0.1"
                  required
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-transparent font-data text-sm font-bold text-[#ECEAE2] focus:outline-none"
                />
                <span className="text-xs text-[#847375] font-bold ml-1">grams</span>
              </div>
            </div>

            <div>
              <label htmlFor="admin-product-size" className="block text-[#ECEAE2]/90 font-semibold mb-1">
                Size / Dimensions
              </label>
              <input
                id="admin-product-size"
                type="text"
                placeholder="e.g. Size 2-6 (Openable)"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-medium text-[#ECEAE2] outline-none focus:border-[#C7E24E]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="admin-product-desc" className="block text-[#ECEAE2]/90 font-semibold mb-1">
              Craftsmanship Details / Description
            </label>
            <textarea
              id="admin-product-desc"
              rows={2}
              placeholder="Provide heirloom motifs, gemstone details, or lock mechanism..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs text-[#ECEAE2] outline-none focus:border-[#C7E24E]"
            />
          </div>

          {/* Image Upload & Presets */}
          <div className="space-y-2">
            <label className="block text-[#ECEAE2]/90 font-semibold">
              Product Image (Upload File or Select Preset)
            </label>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#4E4C4B] hover:border-[#C7E24E] rounded-xl cursor-pointer bg-[#070A0D]/50 transition-colors">
                <span className="material-symbols-outlined text-xl text-[#C7E24E] mb-1">cloud_upload</span>
                <span className="text-[11px] text-[#ECEAE2] font-semibold">Click to upload photo</span>
                <span className="text-[9px] text-[#847375]">PNG, JPG, WebP supported</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 space-y-1">
                <span className="text-[10px] text-[#847375] uppercase tracking-wider block">Or pick verified asset:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SAMPLE_IMAGES.slice(0, 4).map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        setImagePreview(preset.url);
                      }}
                      className={`text-[10px] p-1.5 rounded-lg border text-left truncate transition-colors ${
                        imageUrl === preset.url
                          ? 'bg-[#C7E24E]/20 text-[#C7E24E] border-[#C7E24E]'
                          : 'bg-[#070A0D] text-[#ECEAE2]/80 border-[#4E4C4B] hover:border-[#ECEAE2]/40'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Add Jewellery Piece to Catalog</span>
          </button>

          {uploadSuccessNotice && (
            <div className="bg-[#C7E24E]/20 border border-[#C7E24E] text-[#C7E24E] p-3 rounded-xl text-center font-bold animate-fadeIn">
              ✓ Product uploaded successfully with {purity} Karat tagging! Live price synchronized to storefront.
            </div>
          )}
        </form>

        {/* Right 5 cols: Live Price Preview & Image Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#070A0D] p-4 rounded-xl border border-[#4E4C4B] space-y-3">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/60 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">
                LIVE DYNAMIC PRICE PREVIEW
              </span>
              <span className="text-[10px] font-data px-2 py-0.5 rounded bg-[#C7E24E]/20 text-[#C7E24E] font-bold">
                {purity} Tagged
              </span>
            </div>

            {/* Preview image */}
            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#4E4C4B] bg-[#141512]">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611591475827-0cf19232a93a?q=80&w=800&auto=format&fit=crop';
                }}
              />
              <div className="absolute top-2 left-2 bg-[#070A0D]/90 px-2 py-1 rounded text-[10px] font-bold text-[#C7E24E] border border-[#C7E24E]/40">
                {purity} • {weightGrams}g
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-[#070A0D]/90 backdrop-blur-sm p-2 rounded text-xs text-[#ECEAE2] truncate font-medium">
                {name || 'Product Title Preview'}
              </div>
            </div>

            {/* Price breakdown calculation */}
            <div className="space-y-1.5 text-xs text-[#ECEAE2]/80 pt-1">
              <div className="flex justify-between">
                <span>Gold Rate for {purity}</span>
                <span className="font-data text-[#C7E24E] font-bold">₹{rateForPurity.toLocaleString()}/g</span>
              </div>
              <div className="flex justify-between">
                <span>Raw Gold Value ({weightGrams}g × ₹{rateForPurity.toLocaleString()})</span>
                <span className="font-data font-semibold">₹{breakdown.goldValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Making Charges (8%)</span>
                <span className="font-data">₹{breakdown.makingCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Wastage Allowance (2%)</span>
                <span className="font-data">₹{breakdown.wastage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>BIS Hallmark Fee</span>
                <span className="font-data">₹{breakdown.bisHallmarking.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (3%)</span>
                <span className="font-data">₹{breakdown.gst.toLocaleString()}</span>
              </div>
              <div className="border-t border-[#4E4C4B] pt-2 mt-2 flex justify-between items-center">
                <span className="font-bold text-[#ECEAE2]">Live Store Price</span>
                <span className="font-data text-lg font-bold text-[#C7E24E]">
                  ₹{breakdown.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="border-t border-[#4E4C4B]/40 pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h4 className="font-serif-display text-base font-bold text-[#ECEAE2]">
            Active Catalog Items ({filteredProducts.length})
          </h4>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={filterPurity}
              onChange={(e) => setFilterPurity(e.target.value)}
              className="bg-[#070A0D] border border-[#4E4C4B] px-2.5 py-1.5 rounded-lg text-[#ECEAE2] outline-none"
            >
              <option value="All">All Purities</option>
              <option value="22K">22K Only</option>
              <option value="18K">18K Only</option>
              <option value="14K">14K Only</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#070A0D] border border-[#4E4C4B] px-2.5 py-1.5 rounded-lg text-[#ECEAE2] outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#4E4C4B]">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#070A0D] text-[#847375] uppercase text-[10px] tracking-wider border-b border-[#4E4C4B]">
              <tr>
                <th className="p-3">Item</th>
                <th className="p-3">Category</th>
                <th className="p-3">Karat / Purity</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Live Rate Estimate</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4E4C4B]/40 text-[#ECEAE2]">
              {filteredProducts.slice(0, 10).map((prod) => {
                const livePrice = getLiveProductPrice(prod, currentGoldRate);
                const isCustom = prod.id.startsWith('custom-');

                return (
                  <tr key={prod.id} className="hover:bg-[#070A0D]/50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={prod.images.main}
                          alt={prod.name}
                          className="w-9 h-9 rounded object-cover border border-[#4E4C4B]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611591475827-0cf19232a93a?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                        <div>
                          <div className="font-bold text-xs">{prod.name}</div>
                          {isCustom && (
                            <span className="text-[9px] bg-[#C7E24E]/20 text-[#C7E24E] px-1 rounded font-semibold">
                              Custom Upload
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[#ECEAE2]/80">{prod.category}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-data ${
                          prod.purity === '22K'
                            ? 'bg-[#C7E24E]/20 text-[#C7E24E]'
                            : prod.purity === '18K'
                            ? 'bg-[#D4AF6A]/20 text-[#D4AF6A]'
                            : 'bg-[#94A3B8]/20 text-[#94A3B8]'
                        }`}
                      >
                        {prod.purity} ({prod.purityBadge || prod.purity})
                      </span>
                    </td>
                    <td className="p-3 font-data">{prod.weightGrams}g</td>
                    <td className="p-3 font-data font-bold text-[#C7E24E]">
                      ₹{livePrice.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {isCustom ? (
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="text-[#ff6b6b] hover:text-red-400 p-1 transition-colors"
                          title="Delete custom product"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      ) : (
                        <span className="text-[#847375] text-[10px]">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
