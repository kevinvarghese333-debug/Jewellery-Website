import React, { useRef, useState } from "react";
import { Product } from "../types";
import { calculatePriceBreakdown } from "../data/products";
import { formatPrice } from "../data/storefrontConfig";
import { ConsultationLink } from "./StorefrontElements";
export function ProductInformation({
  product,
  rate,
}: {
  product: Product;
  rate: number;
}) {
  const tabs = [
    "Product details",
    "Specifications",
    "Price breakup",
    "Consultation",
  ];
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const price = calculatePriceBreakdown(
    product.weightGrams,
    product.purity,
    rate,
  );
  return (
    <div className="kj-product-information">
      <div
        className="kj-product-tabs"
        role="tablist"
        aria-label="About this ornament"
        onKeyDown={(e) => {
          let next = active;
          if (e.key === "ArrowRight") next = (active + 1) % tabs.length;
          else if (e.key === "ArrowLeft")
            next = (active + tabs.length - 1) % tabs.length;
          else if (e.key === "Home") next = 0;
          else if (e.key === "End") next = tabs.length - 1;
          else return;
          e.preventDefault();
          setActive(next);
          refs.current[next]?.focus();
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`product-tab-${i}`}
            aria-controls={`product-panel-${i}`}
            aria-selected={active === i}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
          >
            {tab}
          </button>
        ))}
      </div>
      <section
        className="kj-product-panel"
        role="tabpanel"
        id={`product-panel-${active}`}
        aria-labelledby={`product-tab-${active}`}
        tabIndex={0}
      >
        {active === 0 && (
          <>
            <h2>A closer look.</h2>
            <p>{product.description}</p>
            <p>
              The listed details describe this design. Our showroom can confirm
              current availability and show you additional photographs before
              your visit.
            </p>
          </>
        )}
        {active === 1 && (
          <>
            <h2>The finer details.</h2>
            <dl className="kj-product-spec-table">
              {[
                ["Design reference", product.id],
                ["Ornament", product.category],
                ["Gold purity", product.purityBadge],
                ["Listed weight", `${product.weightGrams} g`],
                [
                  "Size / dimensions",
                  product.size || "Confirm with the showroom",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p>
              Stone identity, stone weight and any certification must be
              confirmed for the individual piece. “Diamond-cut gold” describes a
              finish; it does not mean the piece contains diamonds.
            </p>
          </>
        )}
        {active === 2 && (
          <>
            <h2>Understand your estimate.</h2>
            <dl className="kj-product-spec-table">
              {Object.entries({
                "Gold value": price.goldValue,
                "Making charges (indicative)": price.makingCharges,
                "Wastage (indicative)": price.wastage,
                "Hallmarking estimate": price.bisHallmarking,
                "Tax estimate": price.gst,
                "Estimated total": price.total,
              }).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{formatPrice(value)}</dd>
                </div>
              ))}
            </dl>
            <p>
              The estimate responds to the published gold rate. Exact weight,
              stones, charges, taxes and final price are confirmed by the
              showroom before purchase.
            </p>
          </>
        )}
        {active === 3 && (
          <>
            <h2>Make it personal.</h2>
            <p>
              Ask about fit, finish, availability and styling. Share the design
              reference with our team to plan a shortlist for your visit.
            </p>
            <ConsultationLink
              subject={`${product.name} (reference ${product.id})`}
            />
            <a className="kj-text-link" href="#/visit">
              Visit our Cherai showroom
            </a>
          </>
        )}
      </section>
    </div>
  );
}
