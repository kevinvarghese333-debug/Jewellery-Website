import React from "react";
import {
  ArrowUpRight,
  BookOpen,
  Gem,
  MapPin,
  PencilRuler,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { ConsultationLink, SocialLinks } from "./StorefrontElements";
import { directionsUrl } from "../data/storefrontConfig";
export function StorefrontFooter() {
  const values = [
    {
      Icon: Sparkles,
      title: "28+ years of mastery",
      href: "#/curated-designs",
    },
    { Icon: HeartHandshake, title: "Personal consultations", href: "#/visit" },
    {
      Icon: PencilRuler,
      title: "Thoughtful design",
      href: "#/traditional-drawing",
    },
    { Icon: Gem, title: "Eternal diamond collections", href: "#/eternal" },
    { Icon: BookOpen, title: "Guidance at every step", href: "#/education" },
    { Icon: MapPin, title: "Find us in Cherai", href: "#/visit" },
  ];
  return (
    <footer className="kj-footer-new">
      <section
        className="kj-values kj-shell"
        aria-label="The Kavitha experience"
      >
        <p className="kj-eyebrow">The Kavitha experience</p>
        <h2>Considered in every detail.</h2>
        <div className="kj-values-grid">
          {values.map(({ Icon, title, href }) => (
            <a key={title} href={href}>
              <Icon size={34} strokeWidth={1} />
              <span>{title}</span>
            </a>
          ))}
        </div>
      </section>
      <div className="kj-footer-split">
        <div className="kj-footer-directory">
          <a href="#/home" className="kj-brand">
            <img src="/logo.svg" alt="" />
            <span>
              Kavitha<small>JEWELLERY</small>
            </span>
          </a>
          <p className="kj-footer-tagline">Curating the extraordinary.</p>
          <div className="kj-footer-columns">
            <div>
              <h2>Discover Kavitha</h2>
              <a href="#/collections">Explore jewellery</a>
              <a href="#/eternal">Eternal diamonds</a>
              <a href="#/curated-designs">Curated Designs</a>
              <a href="#/traditional-drawing">Traditional Drawing</a>
              <a href="#/wishlist">Your favourites</a>
            </div>
            <div>
              <h2>A little guidance</h2>
              <a href="#/education/loose-diamonds">Diamond education</a>
              <a href="#/education/engagement-rings">Engagement rings</a>
              <a href="#/education/size-chart">Size guide</a>
              <a href="#/education/loose-diamonds/care">Jewellery care</a>
              <a href="#/education/birthstones">Birthstones</a>
            </div>
            <div>
              <h2>Visit our showroom</h2>
              <p>
                Kavitha Shopping Complex
                <br />
                Devaswom Nada, Cherai
                <br />
                Kerala, India
              </p>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                Get directions <ArrowUpRight size={13} />
              </a>
              <a href="#/visit">Plan your visit</a>
            </div>
          </div>
          <p className="kj-footer-copyright">
            © {new Date().getFullYear()} Kavitha Jewellery · 28+ years of
            mastery
          </p>
        </div>
        <div className="kj-footer-invite">
          <p className="kj-eyebrow">A conversation away</p>
          <h2>
            Let’s find your
            <br />
            <em>extraordinary.</em>
          </h2>
          <p>
            A wedding to remember. An everyday signature. A gift that says it
            all.
            <br />
            <br />
            Tell us what you have in mind.
          </p>
          <ConsultationLink className="kj-light-link" />
          <div className="kj-footer-social">
            <span>Stay close to Kavitha</span>
            <SocialLinks />
          </div>
          <a
            className="kj-footer-top"
            href="#/home"
            aria-label="Return to home"
          >
            Explore Kavitha <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </footer>
  );
}
