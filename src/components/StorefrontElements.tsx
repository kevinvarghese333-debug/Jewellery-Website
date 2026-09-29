import React, { useEffect, useId, useRef, useState } from "react";
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  MessageCircle,
  Heart,
  X,
} from "lucide-react";
import {
  consultationUrl,
  socialLinks,
  formatPrice,
} from "../data/storefrontConfig";
import { getLiveProductPrice } from "../data/products";
import { Product } from "../types";

export function ConsultationLink({
  subject,
  children = "Book a Consultation",
  className = "kj-button",
}: {
  subject?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const href = consultationUrl(subject);
  return href ? (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  ) : (
    <span className="kj-contact-pending">
      <button className={className} disabled>
        {children}
        <ArrowUpRight size={17} aria-hidden="true" />
      </button>
      <small>
        WhatsApp contact coming soon. Please visit our Cherai showroom.
      </small>
    </span>
  );
}
export function SocialLinks() {
  return (
    <div className="kj-socials" aria-label="Follow Kavitha Jewellery">
      {[
        { name: "Facebook", href: socialLinks.facebook, Icon: Facebook },
        { name: "Instagram", href: socialLinks.instagram, Icon: Instagram },
        { name: "WhatsApp", href: consultationUrl(), Icon: MessageCircle },
      ].map(({ name, href, Icon }) =>
        href ? (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
          >
            <Icon size={19} aria-hidden="true" />
          </a>
        ) : (
          <span
            key={name}
            aria-label={`${name} link coming soon`}
            title={`${name} link awaiting confirmation`}
            className="kj-social-pending"
          >
            <Icon size={19} aria-hidden="true" />
          </span>
        ),
      )}
    </div>
  );
}
export function JewelleryImage({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed || !src ? (
    <div className={`kj-image-fallback ${className}`}>
      <span>Photograph coming soon</span>
      <small>{alt}</small>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
export function ProductCard({
  product,
  rate,
  saved,
  onSave,
}: {
  product: Product;
  rate: number;
  saved: boolean;
  onSave: (product: Product) => void;
}) {
  return (
    <article className="kj-product-card">
      <div className="kj-product-image">
        <a
          href={`#/jewellery/${product.id}`}
          aria-label={`View ${product.name}`}
        >
          <JewelleryImage src={product.images.main} alt={product.name} />
        </a>
        <button
          className={`kj-heart ${saved ? "is-saved" : ""}`}
          aria-label={`${saved ? "Remove" : "Save"} ${product.name}${saved ? " from" : " to"} favourites`}
          aria-pressed={saved}
          onClick={() => onSave(product)}
        >
          <Heart size={19} fill={saved ? "currentColor" : "none"} />
        </button>
        {product.isNewArrival && (
          <span className="kj-product-badge">New in</span>
        )}
      </div>
      <div className="kj-product-info">
        <p>
          {product.purity} gold <span>·</span> {product.weightGrams} g
        </p>
        <h3>
          <a href={`#/jewellery/${product.id}`}>{product.name}</a>
        </h3>
        <div className="kj-product-price">
          {formatPrice(getLiveProductPrice(product, rate))}
          <span>Estimated price</span>
        </div>
      </div>
    </article>
  );
}
export function Modal({
  title,
  onClose,
  children,
  className = "",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`kj-modal ${className}`}
      aria-labelledby={id}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="kj-modal-inner">
        <header>
          <h2 id={id}>{title}</h2>
          <button onClick={onClose} aria-label="Close dialog">
            <X />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
