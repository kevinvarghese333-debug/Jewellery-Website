import React, { useState, useEffect, useMemo } from 'react';
import { ProductReview, PurityType, UserProfile } from '../types';
import { 
  getProductReviews, 
  fetchProductReviewsFromCloud, 
  saveProductReview, 
  voteReviewHelpful, 
  checkUserVerifiedBuyer 
} from '../data/reviewsData';
import { useToast } from '../context/ToastContext';

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'login' | 'register' | 'profile' | 'orders') => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
  currentUser,
  onOpenAuthModal,
}) => {
  const { notifySuccess, notifyInfo, notifyError } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});
  const [isVerifiedBuyerAuto, setIsVerifiedBuyerAuto] = useState<boolean>(false);

  // Form State
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>(currentUser?.name || '');
  const [location, setLocation] = useState<string>(currentUser?.city || 'Kerala, India');
  const [purityBought, setPurityBought] = useState<PurityType>('22K');
  const [occasion, setOccasion] = useState<string>('Bridal Trousseau');
  const [recommended, setRecommended] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitNotice, setSubmitNotice] = useState<string>('');

  // Sync with current user profile whenever auth changes
  useEffect(() => {
    if (currentUser?.isLoggedIn) {
      if (currentUser.name && !authorName) setAuthorName(currentUser.name);
      if (currentUser.city && (!location || location === 'Kerala, India')) setLocation(currentUser.city);
      
      // Check if user bought this item
      checkUserVerifiedBuyer(currentUser.uid, currentUser.email, productId).then((bought) => {
        setIsVerifiedBuyerAuto(bought);
      });
    }
  }, [currentUser, productId]);

  // Load reviews from local storage immediately, then fetch cloud updates
  useEffect(() => {
    // 1. Initial cached/seeded load
    setReviews(getProductReviews(productId));

    // 2. Cloud fetch
    setIsLoading(true);
    fetchProductReviewsFromCloud(productId)
      .then((cloudRevs) => {
        if (cloudRevs && cloudRevs.length > 0) {
          setReviews(cloudRevs);
        }
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  // Analytics & Summary Metrics
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const recommendCount = reviews.filter((r) => r.recommended !== false).length;
  const recommendPercent = totalReviews > 0 ? Math.round((recommendCount / totalReviews) * 100) : 100;

  const ratingCounts = useMemo(() => {
    return {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };
  }, [reviews]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (filterRating !== 'ALL' && r.rating !== filterRating) return false;
        if (verifiedOnly && !r.verifiedBuyer) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchComment = r.comment.toLowerCase().includes(q);
          const matchAuthor = r.authorName.toLowerCase().includes(q);
          const matchLocation = r.location?.toLowerCase().includes(q);
          const matchOccasion = r.occasion?.toLowerCase().includes(q);
          if (!matchTitle && !matchComment && !matchAuthor && !matchLocation && !matchOccasion) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.rating - a.rating;
        if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        // Default newest
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [reviews, filterRating, verifiedOnly, searchQuery, sortBy]);

  const handleHelpful = (reviewId: string) => {
    if (votedMap[reviewId]) {
      notifyInfo('Already Voted', 'You have already marked this review as helpful.');
      return;
    }
    const updated = voteReviewHelpful(productId, reviewId);
    setReviews(updated);
    setVotedMap((prev) => ({ ...prev, [reviewId]: true }));
    notifySuccess('Feedback Recorded', 'Thank you for rating this review as helpful!');
  };

  const handleOpenFormClick = () => {
    if (!currentUser?.isLoggedIn) {
      notifyInfo('Sign In Required', 'Please sign in to your Kavitha account to submit a verified review.');
      onOpenAuthModal?.('login');
      return;
    }
    setShowForm(!showForm);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.isLoggedIn) {
      onOpenAuthModal?.('login');
      return;
    }

    const finalName = authorName.trim() || currentUser.name || 'Kavitha Patron';
    const finalTitle = title.trim();
    const finalComment = comment.trim();

    if (!finalTitle || !finalComment) {
      notifyError('Missing Details', 'Please provide a review headline and detailed comments.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRev = await saveProductReview(productId, {
        productId,
        userId: currentUser.uid,
        authorName: finalName,
        authorEmail: currentUser.email,
        location: location.trim() || currentUser.city || 'Kerala, India',
        rating: formRating,
        title: finalTitle,
        comment: finalComment,
        verifiedBuyer: isVerifiedBuyerAuto || true,
        purityBought,
        occasion,
        recommended,
      });

      // Update state
      const updatedList = [newRev, ...reviews.filter((r) => r.id !== newRev.id)];
      setReviews(updatedList);
      setSubmitNotice('✓ Thank you! Your verified review has been published.');
      notifySuccess('Review Published', `Thank you ${finalName}! Your feedback is now live on Kavitha Jewellery.`);

      // Reset form fields
      setTitle('');
      setComment('');
      setTimeout(() => {
        setSubmitNotice('');
        setShowForm(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      notifyError('Submission Error', 'Could not save review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingDescription = (star: number) => {
    switch (star) {
      case 5:
        return '5 Stars — Outstanding Masterpiece, Flawless 916 Hallmark & Finishing';
      case 4:
        return '4 Stars — Very High Quality & Authentic Gold Weight';
      case 3:
        return '3 Stars — Good Design & Standard Packaging';
      case 2:
        return '2 Stars — Below Expectations';
      case 1:
        return '1 Star — Unsatisfied';
      default:
        return 'Select your star rating';
    }
  };

  const OCCASIONS = [
    'Bridal Trousseau',
    'Anniversary / Gift',
    'Festive & Onam',
    'Temple / Traditional Pooja',
    'Daily Wear & Office',
    'Milestone Celebration',
  ];

  return (
    <section id="pdp-reviews-section" className="bg-white rounded-2xl border border-[#d7c1c4] p-6 md:p-10 shadow-sm space-y-8 mt-12 scroll-mt-24">
      {/* Header & Write Review Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#f2e5e6] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.22em] text-[#B88A44] font-bold font-sans">
              PATRON TESTIMONIALS & RATINGS
            </span>
            <span className="bg-[#1F7A52]/10 text-[#1F7A52] text-[10px] font-sans px-2.5 py-0.5 rounded-full font-bold border border-[#1F7A52]/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              <span>100% Certified Gold</span>
            </span>
          </div>
          <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-[#370617] mt-1">
            Customer Reviews for {productName}
          </h2>
        </div>

        {currentUser?.isLoggedIn ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#370617] hover:bg-[#521b2b] text-white px-5 py-3 rounded-xl font-sans text-xs uppercase tracking-wider font-bold shadow-sm transition-all flex items-center gap-2 min-h-[44px]"
          >
            <span className="material-symbols-outlined text-lg">
              {showForm ? 'expand_less' : 'edit_note'}
            </span>
            <span>{showForm ? 'Hide Review Form' : 'Write a Review'}</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenAuthModal?.('login')}
            className="bg-[#FAF6F0] hover:bg-[#f2e5e6] text-[#370617] border border-[#B88A44] px-5 py-3 rounded-xl font-sans text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 min-h-[44px] shadow-sm"
          >
            <span className="material-symbols-outlined text-lg text-[#B88A44]">lock</span>
            <span>Sign In to Review</span>
          </button>
        )}
      </div>

      {/* Review Metrics Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FAF6F0] p-6 md:p-8 rounded-2xl border border-[#b88a44]/20 items-center">
        {/* Left Column: Overall Rating (4 cols) */}
        <div className="lg:col-span-4 text-center lg:border-r border-[#d7c1c4] lg:pr-8 space-y-2">
          <div className="font-data text-5xl md:text-6xl font-extrabold text-[#370617] tracking-tight">
            {avgRating}
          </div>
          <div className="flex items-center justify-center gap-1 text-[#B88A44]">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className="material-symbols-outlined text-2xl text-[#B88A44]"
                style={{
                  fontVariationSettings: s <= Math.round(Number(avgRating)) ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                star
              </span>
            ))}
          </div>
          <p className="text-xs font-sans text-[#524346] font-medium">
            Based on <span className="font-bold text-[#370617]">{totalReviews}</span> verified customer rating{totalReviews !== 1 ? 's' : ''}
          </p>
          <div className="pt-2 flex flex-col gap-1.5 items-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#1F7A52] bg-white px-3 py-1 rounded-full border border-[#1F7A52]/20 shadow-xs">
              <span className="material-symbols-outlined text-sm">thumb_up</span>
              <span>{recommendPercent}% of patrons recommend this piece</span>
            </div>
            <span className="text-[11px] font-sans text-[#847375]">
              Inspected & stamped under BIS Hallmark standards
            </span>
          </div>
        </div>

        {/* Right Column: Star Breakdown Bars (8 cols) */}
        <div className="lg:col-span-8 space-y-2.5">
          <div className="text-xs font-sans font-bold text-[#370617] uppercase tracking-wider mb-2 flex justify-between items-center">
            <span>Rating Distribution</span>
            {filterRating !== 'ALL' && (
              <button
                onClick={() => setFilterRating('ALL')}
                className="text-[11px] font-sans text-[#B88A44] font-semibold hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = ratingCounts[star];
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            const isSelected = filterRating === star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(filterRating === star ? 'ALL' : star)}
                className={`w-full flex items-center gap-3 text-xs font-sans p-1.5 rounded-lg transition-all text-left ${
                  isSelected ? 'bg-white shadow-xs ring-1 ring-[#B88A44]' : 'hover:bg-white/60'
                }`}
              >
                <span className="w-14 font-bold text-[#370617] flex items-center gap-1">
                  <span>{star}</span>
                  <span
                    className="material-symbols-outlined text-sm text-[#B88A44]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                </span>
                <div className="flex-1 bg-white h-3 rounded-full overflow-hidden border border-[#d7c1c4]">
                  <div
                    className="bg-[#B88A44] h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-data text-[#847375] font-semibold">{pct}%</span>
                <span className="w-8 text-right text-[11px] font-sans text-[#847375]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guest Login Callout if Not Logged In */}
      {!currentUser?.isLoggedIn && (
        <div className="bg-[#FAF6F0] p-6 rounded-2xl border border-[#b88a44]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-serif-display font-bold text-base text-[#370617] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#B88A44]">verified_user</span>
              <span>Own or purchased this jewellery piece?</span>
            </h4>
            <p className="text-xs font-sans text-[#524346] max-w-xl">
              Sign in with your Google account or email to share your rating, verified hallmarking feedback, and styling experience with fellow jewellery patrons.
            </p>
          </div>
          <button
            onClick={() => onOpenAuthModal?.('login')}
            className="bg-[#370617] hover:bg-[#521b2b] text-white px-5 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-bold shadow transition-all whitespace-nowrap"
          >
            Sign In & Write Review
          </button>
        </div>
      )}

      {/* Review Submission Form (Logged In) */}
      {currentUser?.isLoggedIn && showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-[#fff8f7] p-6 md:p-8 rounded-2xl border-2 border-[#B88A44] space-y-6 animate-fadeIn shadow-md"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#d7c1c4] pb-4">
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#B88A44]">
                AUTHENTIC PATRON REVIEW
              </span>
              <h3 className="font-serif-display font-bold text-xl text-[#370617]">
                Share Your Experience for {productName}
              </h3>
            </div>
            <div className="bg-white px-3 py-1.5 rounded-lg border border-[#d7c1c4] text-xs font-sans text-[#370617] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1F7A52]"></span>
              <span>Posting as: <strong className="font-bold">{currentUser.name || currentUser.email}</strong></span>
            </div>
          </div>

          {/* Interactive 5-Star Rating Picker */}
          <div className="space-y-2 bg-white p-4 rounded-xl border border-[#d7c1c4]">
            <label className="block text-xs font-sans font-bold text-[#370617] uppercase tracking-wider">
              1. Your Star Rating <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoverRating || formRating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                    aria-label={`Rate ${star} star`}
                  >
                    <span
                      className={`material-symbols-outlined text-4xl transition-colors ${
                        isActive ? 'text-[#B88A44]' : 'text-[#d7c1c4]'
                      }`}
                      style={{
                        fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                      }}
                    >
                      star
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-sans text-[#B88A44] font-bold">
              {getRatingDescription(hoverRating || formRating)}
            </p>
          </div>

          {/* Review Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-sans font-bold text-[#370617] mb-1.5">
                Patron Display Name <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Kavya Mohan"
                className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3.5 py-2.5 text-xs font-sans font-bold text-[#370617] focus:outline-none focus:border-[#370617]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-[#370617] mb-1.5">
                City / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kochi, Kerala"
                className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3.5 py-2.5 text-xs font-sans text-[#370617] focus:outline-none focus:border-[#370617]"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-[#370617] mb-1.5">
                Gold Purity Standard
              </label>
              <select
                value={purityBought}
                onChange={(e) => setPurityBought(e.target.value as PurityType)}
                className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3.5 py-2.5 text-xs font-sans font-bold text-[#370617] focus:outline-none"
              >
                <option value="22K">22K • 916 BIS Hallmark Gold</option>
                <option value="18K">18K • 750 BIS Hallmark Gold</option>
                <option value="14K">14K • 585 BIS Hallmark Gold</option>
              </select>
            </div>
          </div>

          {/* Occasion / Wear Purpose */}
          <div className="space-y-2">
            <label className="block text-xs font-sans font-bold text-[#370617]">
              Occasion / Styling Purpose
            </label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occ)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                    occasion === occ
                      ? 'bg-[#370617] text-white font-bold'
                      : 'bg-white border border-[#d7c1c4] text-[#524346] hover:border-[#370617]'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-xs font-sans font-bold text-[#370617] mb-1.5">
              Review Headline / Summary <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Masterpiece craftsmanship, perfect weight, and speedy insured delivery!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3.5 py-2.5 text-xs font-sans font-bold text-[#370617] focus:outline-none focus:border-[#370617]"
              required
            />
          </div>

          {/* Review Detailed Feedback */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-sans font-bold text-[#370617]">
                Detailed Feedback & Craftsmanship Notes <span className="text-[#ba1a1a]">*</span>
              </label>
              <span className="text-[11px] font-sans text-[#847375]">
                {comment.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Describe the finishing quality, weight accuracy, comfort on the neck/wrist, BIS stamp clarity, packaging, and store/delivery service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-[#d7c1c4] rounded-xl p-3 text-xs font-sans text-[#370617] focus:outline-none focus:border-[#370617]"
              required
            />
          </div>

          {/* Recommendation & Verified Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#d7c1c4]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-sans font-bold text-[#370617]">Would you recommend this piece?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecommended(true)}
                  className={`px-3 py-1 rounded-md text-xs font-sans font-bold transition-all ${
                    recommended ? 'bg-[#1F7A52] text-white' : 'bg-[#f2e5e6] text-[#524346]'
                  }`}
                >
                  ✓ Yes
                </button>
                <button
                  type="button"
                  onClick={() => setRecommended(false)}
                  className={`px-3 py-1 rounded-md text-xs font-sans font-bold transition-all ${
                    !recommended ? 'bg-[#ba1a1a] text-white' : 'bg-[#f2e5e6] text-[#524346]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-sans text-[#1F7A52] font-semibold">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Verified Patron Review (BIS Hallmarked piece)</span>
            </div>
          </div>

          {submitNotice && (
            <p className="text-xs text-[#1F7A52] bg-[#1F7A52]/10 p-3 rounded-xl border border-[#1F7A52]/30 font-bold animate-fadeIn">
              {submitNotice}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl border border-[#d7c1c4] text-xs font-sans font-bold text-[#847375] hover:bg-[#f2e5e6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#370617] hover:bg-[#521b2b] text-white px-7 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing Review...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Submit Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter, Search & Sort Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-[#FAF6F0] p-4 rounded-xl border border-[#d7c1c4] text-xs font-sans">
        {/* Left: Star Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#370617] mr-1">Filter:</span>
          <button
            onClick={() => setFilterRating('ALL')}
            className={`px-3 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
              filterRating === 'ALL'
                ? 'bg-[#370617] text-white'
                : 'bg-white border border-[#d7c1c4] text-[#524346] hover:bg-[#f2e5e6]'
            }`}
          >
            All ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                filterRating === star
                  ? 'bg-[#370617] text-white'
                  : 'bg-white border border-[#d7c1c4] text-[#524346] hover:bg-[#f2e5e6]'
              }`}
            >
              <span>{star}</span>
              <span
                className="material-symbols-outlined text-xs text-[#B88A44]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-[10px] font-data opacity-80">({ratingCounts[star as 1|2|3|4|5]})</span>
            </button>
          ))}

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              verifiedOnly
                ? 'bg-[#1F7A52] text-white'
                : 'bg-white border border-[#d7c1c4] text-[#1F7A52] hover:bg-[#1F7A52]/10'
            }`}
          >
            <span className="material-symbols-outlined text-xs">verified</span>
            <span>Verified Buyers Only</span>
          </button>
        </div>

        {/* Right: Search & Sorting */}
        <div className="flex items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 sm:w-48">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-[#847375]">
              search
            </span>
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#d7c1c4] rounded-lg pl-8 pr-3 py-1.5 text-xs font-sans text-[#370617] focus:outline-none focus:border-[#370617]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#847375] hover:text-[#370617]"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[#847375] font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'highest' | 'helpful')}
              className="bg-white border border-[#d7c1c4] rounded-lg px-2.5 py-1.5 text-xs font-sans font-bold text-[#370617] focus:outline-none"
            >
              <option value="newest">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-[#fff8f7] rounded-2xl border border-dashed border-[#d7c1c4] space-y-2">
            <span className="material-symbols-outlined text-4xl text-[#B88A44]">reviews</span>
            <h4 className="font-serif-display font-bold text-[#370617]">No Matching Reviews Found</h4>
            <p className="text-xs font-sans text-[#847375] max-w-sm mx-auto">
              {searchQuery
                ? `No reviews matched "${searchQuery}". Try searching for another keyword or clear filters.`
                : 'No reviews for this star filter yet. Be the first to share your experience!'}
            </p>
            {(searchQuery || filterRating !== 'ALL' || verifiedOnly) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterRating('ALL');
                  setVerifiedOnly(false);
                }}
                className="mt-2 text-xs font-sans text-[#370617] font-bold underline hover:text-[#B88A44]"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#fff8f7] p-5 sm:p-6 rounded-2xl border border-[#d7c1c4] space-y-3.5 transition-all hover:border-[#B88A44] hover:shadow-xs"
            >
              {/* Review Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Star Rating Icons */}
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

                  {/* Purity Badge */}
                  {rev.purityBought && (
                    <span className="bg-[#370617] text-white text-[10px] font-brand px-2 py-0.5 rounded font-bold">
                      {rev.purityBought} • 916 BIS Hallmark
                    </span>
                  )}

                  {/* Verified Buyer Badge */}
                  {rev.verifiedBuyer && (
                    <span className="bg-[#1F7A52]/10 text-[#1F7A52] text-[10px] font-sans px-2.5 py-0.5 rounded-full font-bold border border-[#1F7A52]/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      <span>Verified Buyer</span>
                    </span>
                  )}

                  {/* Occasion Pill */}
                  {rev.occasion && (
                    <span className="bg-[#FAF6F0] text-[#B88A44] text-[10px] font-sans px-2 py-0.5 rounded border border-[#b88a44]/30 font-semibold">
                      {rev.occasion}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-sans text-[#847375] font-medium">
                  {rev.date}
                </span>
              </div>

              {/* Review Title */}
              <h4 className="font-serif-display font-bold text-base md:text-lg text-[#370617]">
                {rev.title}
              </h4>

              {/* Review Content */}
              <p className="font-sans text-xs text-[#524346] leading-relaxed">
                {rev.comment}
              </p>

              {/* Recommended Note */}
              {rev.recommended !== false && (
                <div className="flex items-center gap-1 text-[11px] font-sans text-[#1F7A52] font-semibold">
                  <span className="material-symbols-outlined text-sm">recommend</span>
                  <span>Recommends this jewellery piece</span>
                </div>
              )}

              {/* Card Footer: Author Info & Helpful Vote */}
              <div className="flex justify-between items-center pt-3 text-xs font-sans border-t border-[#f2e5e6]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#370617] text-[#FAF6F0] flex items-center justify-center font-bold text-[11px]">
                    {rev.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[#370617] font-bold">{rev.authorName}</span>
                    {rev.location && (
                      <span className="text-[#847375] font-normal text-[11px] ml-1.5">
                        • {rev.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Helpful Upvote Button */}
                <button
                  type="button"
                  onClick={() => handleHelpful(rev.id)}
                  disabled={votedMap[rev.id]}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    votedMap[rev.id]
                      ? 'bg-[#1F7A52]/10 text-[#1F7A52] border border-[#1F7A52]/30'
                      : 'bg-white border border-[#d7c1c4] text-[#524346] hover:bg-[#FAF6F0] hover:border-[#B88A44]'
                  }`}
                  title="Mark this review as helpful"
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{
                      fontVariationSettings: votedMap[rev.id] ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    thumb_up
                  </span>
                  <span>{votedMap[rev.id] ? 'Helpful!' : 'Helpful'}</span>
                  <span className="font-data font-normal">({rev.helpfulCount || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
