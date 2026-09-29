import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Gem, X } from "lucide-react";
import { ornamentGroups, ornamentHref } from "../data/catalogNavigation";
import { educationHref, educationSections } from "../data/education";
export const editorialNav = [
  ["eternal", "Eternal"],
  ["curated-designs", "Curated Designs"],
  ["traditional-drawing", "Traditional Drawing"],
  ["education", "Education"],
  ["visit", "Visit Us"],
];
export function OrnamentLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="kj-ornament-groups">
      {ornamentGroups.map((group) => (
        <div key={group.name}>
          <a
            className="kj-menu-category"
            href={ornamentHref(group.name)}
            onClick={onNavigate}
          >
            {group.name}
            <ArrowUpRight size={13} />
          </a>
          {group.styles.map((style) => (
            <a
              key={style}
              href={
                style.includes("Solitaire")
                  ? `#/eternal?collection=${encodeURIComponent(style)}`
                  : ornamentHref(group.name, style)
              }
              onClick={onNavigate}
            >
              {style}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
export function StorefrontNavigation({ route }: { route: string }) {
  const [open, setOpen] = useState<"jewellery" | "education" | null>(null);
  const ref = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => setOpen(null), [route]);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <nav
      ref={ref}
      className="kj-navigation kj-main-nav"
      aria-label="Main navigation"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          triggers.current[open]?.focus();
          setOpen(null);
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(null);
      }}
    >
      <button
        ref={(el) => {
          triggers.current.jewellery = el;
        }}
        aria-expanded={open === "jewellery"}
        aria-controls="kj-jewellery-menu"
        onClick={() => setOpen(open === "jewellery" ? null : "jewellery")}
      >
        Jewellery <ChevronDown size={12} />
      </button>
      {editorialNav.map(([id, label]) =>
        id === "education" ? (
          <div className="kj-nav-education" key={id}>
            <a
              href="#/education"
              aria-current={route.startsWith(id) ? "page" : undefined}
            >
              Education
            </a>
            <button
              ref={(el) => {
                triggers.current.education = el;
              }}
              aria-label="Education topics"
              aria-expanded={open === "education"}
              aria-controls="kj-education-menu"
              onClick={() => setOpen(open === "education" ? null : "education")}
            >
              <ChevronDown size={12} />
            </button>
          </div>
        ) : (
          <a
            key={id}
            href={`#/${id}`}
            aria-current={route.split("?")[0] === id ? "page" : undefined}
          >
            {label}
            {id === "eternal" && <small>DIAMONDS</small>}
          </a>
        ),
      )}
      {open && (
        <div
          className="kj-mega-menu"
          id={open === "jewellery" ? "kj-jewellery-menu" : "kj-education-menu"}
        >
          <div className="kj-mega-heading">
            <span>
              {open === "jewellery"
                ? "Find your extraordinary"
                : "The Kavitha guide"}
            </span>
            <button
              aria-label="Close menu"
              onClick={() => {
                triggers.current[open]?.focus();
                setOpen(null);
              }}
            >
              <X size={17} />
            </button>
          </div>
          {open === "jewellery" ? (
            <OrnamentLinks onNavigate={() => setOpen(null)} />
          ) : (
            <div className="kj-education-menu">
              {educationSections.map((s) => (
                <a
                  key={s.id}
                  href={educationHref(s.id)}
                  onClick={() => setOpen(null)}
                >
                  <Gem size={19} strokeWidth={1.2} />
                  <span>
                    {s.label}
                    <small>
                      {s.topics
                        .map((t) => t.label)
                        .slice(0, 3)
                        .join(" · ")}
                    </small>
                  </span>
                  <ArrowUpRight size={15} />
                </a>
              ))}
            </div>
          )}
          <div className="kj-mega-bottom">
            <a
              href={open === "jewellery" ? "#/collections" : "#/education"}
              onClick={() => setOpen(null)}
            >
              {open === "jewellery"
                ? "Explore all jewellery"
                : "Explore the education guide"}{" "}
              <ArrowUpRight size={14} />
            </a>
            <a href="#/eternal" onClick={() => setOpen(null)}>
              Eternal · Diamonds by Kavitha
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
export function MobileNavigation({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="kj-mobile-navigation" aria-label="Mobile navigation">
      <a href="#/home" onClick={onNavigate}>
        Home <ArrowUpRight size={17} />
      </a>
      <details>
        <summary>
          Jewellery <ChevronDown size={17} />
        </summary>
        <a href="#/collections" onClick={onNavigate}>
          All jewellery
        </a>
        {ornamentGroups.map((g) => (
          <details key={g.name}>
            <summary>
              {g.name}
              <ChevronDown size={15} />
            </summary>
            <a href={ornamentHref(g.name)} onClick={onNavigate}>
              View all {g.name.toLowerCase()}
            </a>
            {g.styles.map((style) => (
              <a
                key={style}
                href={
                  style.includes("Solitaire")
                    ? `#/eternal?collection=${encodeURIComponent(style)}`
                    : ornamentHref(g.name, style)
                }
                onClick={onNavigate}
              >
                {style}
              </a>
            ))}
          </details>
        ))}
      </details>
      {editorialNav.map(([id, label]) =>
        id === "education" ? (
          <details key={id}>
            <summary>
              Education <ChevronDown size={17} />
            </summary>
            {educationSections.map((s) => (
              <a key={s.id} href={educationHref(s.id)} onClick={onNavigate}>
                {s.label}
              </a>
            ))}
          </details>
        ) : (
          <a key={id} href={`#/${id}`} onClick={onNavigate}>
            {label}
            <ArrowUpRight size={17} />
          </a>
        ),
      )}
    </nav>
  );
}
