import React, { useState, useEffect } from 'react';
import { ProductReview, PurityType } from '../types';
import { getProductReviews, saveProductReview, voteReviewHelpful } from '../data/reviewsData';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  // Form State
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [purityBought, setPurityBought] = useState<PurityType>('22K');
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [verifiedBuyer, setVerifiedBuyer] = useState<boolean>(true);
  const [submitNotice, setSubmitNotice] = useState<string>('');

  useEffect(() => {
    setReviews(getProductReviews(productId));
  }, [productId]);

  // Calculations
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === 'ALL') return true;
    return r.rating === filterRating;
  });

  const handleHelpful = (reviewId: string) => {
    if (votedMap[reviewId]) return;
    const updated = voteReviewHelpful(productId, reviewId);
    setReviews(updated);
    setVotedMap((prev) => ({ ...prev, [reviewId]: true }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !title.trim() || !comment.trim()) {
      alert('Please fill in all required fields (Name, Review Title, and Comment).');
      return;
    }

    const newRev = saveProductReview(productId, {
      productId,
      authorName: authorName.trim(),
      location: location.trim() || 'Kerala, India',
      rating: formRating,
      title: title.trim(),
      comment: comment.trim(),
      verifiedBuyer,
      purityBought,
    });

    setReviews(getProductReviews(productId));
    setSubmitNotice('✓ Thank you! Your review has been submitted successfully.');
    
    // Reset form
    setTitle('');
    setComment('');
    setTimeout(() => {
      setSubmitNotice('');
      setShowForm(false);
    }, 2500);
  };

  const getRatingDescription = (star: number) => {
    switch (star) {
      case 5:
        return '5 Stars - Outstanding Craftsmanship & Finishing';
      case 4:
        return '4 Stars - Very Good Quality & Authentic Gold';
      case 3:
        return '3 Stars - Average Design / Standard';
      case 2:
        return '2 Stars - Below Expectations';
      case 1:
        return '1 Star - Unsatisfied';
      default:
        return 'Select a rating';
    }
  };

  return (
    <div id="pdp-reviews-section" className="bg-white rounded-2xl border border-[#d7c1c4] p-6 md:p-8 shadow-md space-y-8 mt-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#f2e5e6] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#B88A44] font-bold font-sans">
            CUSTOMER VERIFIED REVIEWS
          </span>
          <h2 className="font-serif-display text-2xl font-bold text-[#370617] mt-1">
            Ratings & Feedback for {productName}
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#370617] hover:bg-[#521b2b] text-white px-5 py-3 rounded-xl font-sans text-xs uppercase tracking-wider font-bold shadow transition-all flex items-center gap-2 min-h-[44px]"
        >
          <span className="material-symbols-outlined text-lg">edit_note</span>
          <span>{showForm ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Overview & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#FAF6F0] p-6 rounded-2xl border border-[#b88a44]/20">
        {/* Left: Overall Score (4 cols) */}
        <div className="md:col-span-4 text-center md:border-r border-[#d7c1c4] md:pr-6 space-y-2">
          <div className="font-data text-5xl font-extrabold text-[#370617] tracking-tight">
            {avgRating}
          </div>
          <div className="flex items-center justify-center gap-1 text-[#B88A44]">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className="material-symbols-outlined text-xl text-[#B88A44] fill-current"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
          </div>
          <p className="text-xs font-sans text-[#524346] font-medium">
            Based on {totalReviews} verified customer review{totalReviews !== 1 ? 's' : ''}
          </p>
          <div className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-[#1F7A52] bg-[#1F7A52]/10 px-3 py-1 rounded-full border border-[#1F7A52]/20">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>100% BIS Hallmarking Verified Buyers</span>
          </div>
        </div>

        {/* Right: Star Distribution Bars (8 cols) */}
        <div className="md:col-span-8 space-y-2">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = ratingCounts[star];
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-sans">
                <span className="w-12 font-bold text-[#370617] flex items-center gap-0.5">
                  {star} <span className="material-symbols-outlined text-xs text-[#B88A44]">star</span>
                </span>
                <div className="flex-1 bg-white h-2.5 rounded-full overflow-hidden border border-[#d7c1c4]">
                  <div
                    className="bg-[#B88A44] h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-data text-[#847375] font-semibold">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form (Collapsible) */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-[#fff8f7] p-6 rounded-2xl border-2 border-[#B88A44] space-y-4 animate-fadeIn shadow-lg"
        >
          <div className="flex justify-between items-center border-b border-[#d7c1c4] pb-3">
            <h3 className="font-serif-display font-bold text-lg text-[#370617]">
              Submit Your Product Feedback
            </h3>
            <span className="text-xs font-sans text-[#B88A44] font-bold">Kavitha Verified Buyer</span>
          </div>

          {/* Interactive Star Picker */}
          <div className="space-y-1">
            <label className="block text-xs font-sans font-bold text-[#370617]">
              Your Overall Rating <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 min-w-[40px] min-h-[40px] flex items-center justify-center focus:outline-none transition-transform hover:scale-110"
                  aria-label={`Rate ${star} star`}
                >
                  <span
                    className={`material-symbols-outlined text-3xl transition-colors ${
                      star <= (hoverRating || formRating)
                        ? 'text-[#B88A44]'
                        : 'text-[#d7c1c4]'
                    }`}
                    style={{
                      fontVariationSettings:
                        star <= (hoverRating || formRating) ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs font-sans text-[#B88A44] font-semibold">
              {getRatingDescription(hoverRating || formRating)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-sans font-bold text-[#370617] mb-1">
                Your Full Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Kavya Mohan"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2.5 text-xs font-sans font-bold text-[#370617] focus:outline-none focus:border-[#370617]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-[#370617] mb-1">
                City / Location
              </label>
              <input
                type="text"
                placeholder="e.g. Kochi, Kerala"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2.5 text-xs font-sans text-[#370617] focus:outline-none focus:border-[#370617]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-[#370617] mb-1">
                Gold Purity Purchased
              </label>
              <select
                value={purityBought}
                onChange={(e) => setPurityBought(e.target.value as PurityType)}
                className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2.5 text-xs font-sans font-bold text-[#370617] focus:outline-none"
              >
                <option value="22K">22K / 916 Hallmark Gold</option>
                <option value="18K">18K / 750 Fine Gold</option>
                <option value="14K">14K Gold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans font-bold text-[#370617] mb-1">
              Review Headline / Title <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Outstanding finish and certified hallmarking!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3.5 py-2.5 text-xs font-sans font-bold text-[#370617] focus:outline-none focus:border-[#370617]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-bold text-[#370617] mb-1">
              Detailed Feedback / Review Comments <span className="text-[#ba1a1a]">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Tell us about the craftsmanship, weight precision, packaging, delivery speed, and overall experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-[#d7c1c4] rounded-xl p-3 text-xs font-sans text-[#370617] focus:outline-none focus:border-[#370617]"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verified-check"
              checked={verifiedBuyer}
              onChange={(e) => setVerifiedBuyer(e.target.checked)}
              className="w-4 h-4 text-[#370617] rounded border-[#d7c1c4] focus:ring-[#370617]"
            />
            <label htmlFor="verified-check" className="text-xs font-sans text-[#524346]">
              I purchased this item from Kavitha Jewellery store or online.
            </label>
          </div>

          {submitNotice && (
            <p className="text-xs text-[#1F7A52] bg-[#1F7A52]/10 p-3 rounded-xl border border-[#1F7A52]/30 font-bold animate-fadeIn">
              {submitNotice}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl border border-[#d7c1c4] text-xs font-sans font-bold text-[#847375] hover:bg-[#f2e5e6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#370617] hover:bg-[#521b2b] text-white px-6 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-bold shadow"
            >
              Publish Review
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#f2e5e6] pb-4 text-xs font-sans">
        <span className="font-bold text-[#370617] mr-2">Filter Reviews:</span>
        <button
          onClick={() => setFilterRating('ALL')}
          className={`px-3 py-1.5 rounded-full font-bold transition-colors ${
            filterRating === 'ALL'
              ? 'bg-[#370617] text-white'
              : 'bg-[#f2e5e6] text-[#524346] hover:bg-[#d7c1c4]'
          }`}
        >
          All ({totalReviews})
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => setFilterRating(star)}
            className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors ${
              filterRating === star
                ? 'bg-[#370617] text-white'
                : 'bg-[#f2e5e6] text-[#524346] hover:bg-[#d7c1c4]'
            }`}
          >
            <span>{star} Stars</span>
            <span className="text-[11px] font-data font-normal">({ratingCounts[star as 1|2|3|4|5]})</span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-xs font-sans text-[#847375]">
            No reviews match this star rating filter yet.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#fff8f7] p-5 rounded-2xl border border-[#d7c1c4] space-y-3 transition-all hover:border-[#B88A44]"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex text-[#B88A44]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className="material-symbols-outlined text-base"
                        style={{
                          fontVariationSettings: s <= rev.rating ? "'FILL' 1" : "'FILL' 0",
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  {rev.purityBought && (
                    <span className="bg-[#370617] text-white text-[10px] font-data px-2 py-0.5 rounded font-bold">
                      {rev.purityBought} Gold
                    </span>
                  )}
                  {rev.verifiedBuyer && (
                    <span className="bg-[#1F7A52]/10 text-[#1F7A52] text-[10px] font-sans px-2 py-0.5 rounded-full font-bold border border-[#1F7A52]/20 flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-sans text-[#847375] font-medium">
                  {rev.date}
                </span>
              </div>

              <h4 className="font-serif-display font-bold text-base text-[#370617]">
                {rev.title}
              </h4>

              <p className="font-sans text-xs text-[#524346] leading-relaxed">
                {rev.comment}
              </p>

              <div className="flex justify-between items-center pt-2 text-xs font-sans border-t border-[#f2e5e6]">
                <div className="text-[#370617] font-semibold">
                  <span>{rev.authorName}</span>
                  {rev.location && (
                    <span className="text-[#847375] font-normal ml-1">({rev.location})</span>
                  )}
                </div>

                <button
                  onClick={() => handleHelpful(rev.id)}
                  disabled={votedMap[rev.id]}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    votedMap[rev.id]
                      ? 'bg-[#1F7A52]/10 text-[#1F7A52] border border-[#1F7A52]/30'
                      : 'bg-white border border-[#d7c1c4] text-[#524346] hover:bg-[#f2e5e6]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">thumb_up</span>
                  <span>{votedMap[rev.id] ? 'Helpful!' : 'Helpful'}</span>
                  <span className="font-data font-normal">({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
