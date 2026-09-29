import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  ConsultationLink,
  JewelleryImage,
} from "../components/StorefrontElements";
import { directionsUrl, storeAddress } from "../data/storefrontConfig";

export function EternalView({ collection = "" }: { collection?: string }) {
  const choices = [
    "Rings",
    "Earrings",
    "Necklaces",
    "Pendants",
    "Bangles",
    "Bracelets",
    "Nose Pins",
    "Solitaire Rings",
    "Solitaire Pendants",
  ];
  const selected = choices.includes(collection) ? collection : "All diamonds";
  return (
    <>
      <section className="kj-eternal-hero">
        <div className="kj-eternal-copy">
          <p className="kj-eyebrow">Diamonds by Kavitha</p>
          <h1>
            Eternal
            <span>
              A little light.
              <br />A lifetime of meaning.
            </span>
          </h1>
          <p>
            Discover a world of diamonds, chosen for the moments that stay with
            you. From a quiet everyday sparkle to the centrepiece of your
            wedding story.
          </p>
          <ConsultationLink
            subject={`the Eternal diamond collection: ${selected}`}
          />
          <small>Explore the collection in a personal consultation.</small>
        </div>
        <div className="kj-eternal-image">
          <JewelleryImage
            src="/editorial/diamond.jpg"
            alt="Diamond ring inspiration for the Eternal collection"
            eager
          />
          <span>Collection inspiration</span>
        </div>
      </section>
      <section className="kj-shell kj-eternal-selection">
        <nav
          className="kj-category-tabs"
          aria-label="Eternal diamond ornaments"
        >
          <a
            href="#/eternal"
            aria-current={selected === "All diamonds" ? "page" : undefined}
          >
            All diamonds
          </a>
          {choices.map((c) => (
            <a
              key={c}
              href={`#/eternal?collection=${encodeURIComponent(c)}`}
              aria-current={c === selected ? "page" : undefined}
            >
              {c}
            </a>
          ))}
        </nav>
        {selected !== "All diamonds" && (
          <div className="kj-eternal-interest">
            <div>
              <p className="kj-eyebrow">Your Eternal edit</p>
              <h2>{selected}</h2>
              <p>
                Explore available designs, individual stone specifications and
                pricing with our team.
              </p>
            </div>
            <ConsultationLink subject={`Eternal ${selected.toLowerCase()}`}>
              Enquire about {selected.toLowerCase()}
            </ConsultationLink>
          </div>
        )}
      </section>
      <section className="kj-section kj-shell">
        <div className="kj-section-heading">
          <div>
            <p className="kj-eyebrow">Find your expression</p>
            <h2>Diamonds, as individual as you.</h2>
          </div>
          <p>
            Tell us what you love. We’ll help you discover the pieces,
            proportions, and details that feel like you.
          </p>
        </div>
        <div className="kj-diamond-categories">
          {[
            [
              "01",
              "Solitaire moments",
              "A single point of light. Explore rings and pendants with a beautifully understated presence.",
            ],
            [
              "02",
              "Everyday brilliance",
              "Thoughtful earrings and delicate accents that become part of your everyday signature.",
            ],
            [
              "03",
              "The bridal edit",
              "From an intimate detail to a complete diamond trousseau, begin with your own story.",
            ],
          ].map(([n, title, copy]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <ConsultationLink
                subject={`Eternal: ${title}`}
                className="kj-text-link"
              >
                Enquire about this collection
              </ConsultationLink>
            </article>
          ))}
        </div>
        <p className="kj-caption">
          Diamond specifications, availability, certification and pricing are
          confirmed individually during your consultation.
        </p>
      </section>
      <section className="kj-quote-band">
        <p className="kj-eyebrow">Eternal by Kavitha</p>
        <h2>
          Chosen for a moment.
          <br />
          <em>Loved for a lifetime.</em>
        </h2>
        <a href="#/curated-designs" className="kj-light-link">
          Discover bespoke bridal <ArrowRight size={18} />
        </a>
      </section>
    </>
  );
}

export function CuratedDesignsView() {
  return (
    <>
      <section className="kj-editorial-intro kj-shell">
        <p className="kj-eyebrow">Curated designs · Kavitha Jewellery</p>
        <h1>
          For your day.
          <br />
          <em>For all the days after.</em>
        </h1>
        <p>
          Jewellery that begins with you, and becomes part of your family’s
          story.
        </p>
      </section>
      <section className="kj-story-split kj-shell">
        <div className="kj-story-photo">
          <JewelleryImage
            src="/editorial/heroTraditional.jpg"
            alt="Intricate gold jewellery from Kavitha’s existing collection imagery"
            eager
          />
        </div>
        <div className="kj-story-copy">
          <p className="kj-eyebrow">28+ years of mastery</p>
          <h2>
            Some stories deserve
            <br />
            to be made by hand.
          </h2>
          <p>
            Your wedding jewellery should feel unmistakably yours. A favourite
            motif. A family memory. A silhouette you have imagined for years. At
            Kavitha, a one-on-one consultation brings those details into focus.
          </p>
          <p>
            From a graceful bridal necklace to a considered diamond trousseau,
            we explore the design with you—balancing personal expression,
            comfort, and the beauty of every detail. Each conversation takes us
            closer to a piece that belongs to your story.
          </p>
          <p>
            We’ll guide you through the materials, proportions, finish and
            budget, and explain the specifications and care of your chosen
            design. So you can make your decision with clarity, and wear it with
            confidence.
          </p>
          <p className="kj-story-ending">
            Made to mark a beginning. Made to carry the memories that follow.
          </p>
          <ConsultationLink subject="a bespoke bridal jewellery consultation" />
        </div>
      </section>
      <section className="kj-section kj-shell">
        <div className="kj-section-heading">
          <div>
            <p className="kj-eyebrow">Your story, thoughtfully shaped</p>
            <h2>A personal journey.</h2>
          </div>
        </div>
        <div className="kj-process">
          {[
            [
              "01",
              "A conversation",
              "Share your occasion, inspirations and budget. We begin by listening.",
            ],
            [
              "02",
              "A considered design",
              "Explore sketches, proportions and materials together before your design takes shape.",
            ],
            [
              "03",
              "A piece to treasure",
              "Review the details with our team, from fit and finish to caring for your jewellery.",
            ],
          ].map(([n, title, copy]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <a href="#/traditional-drawing" className="kj-text-link">
          See where a design begins <ArrowRight size={17} />
        </a>
      </section>
    </>
  );
}

export function TraditionalDrawingView() {
  return (
    <>
      <section className="kj-editorial-intro kj-shell">
        <p className="kj-eyebrow">The art behind the ornament</p>
        <h1>Traditional Drawing</h1>
        <p>Where an idea finds its form.</p>
      </section>
      <section className="kj-drawing-layout kj-shell">
        <figure className="kj-drawing-figure">
          <img
            src="/editorial/traditional-drawing.png"
            alt="Traditional jewellery drawing showing a necklace and earrings, gemstone arrangements, dimensions and setting details"
          />
          <figcaption>
            A study in proportion, stone placement and the details that bring a
            design to life.
          </figcaption>
        </figure>
        <div className="kj-drawing-copy">
          <p className="kj-eyebrow">From imagination to a working blueprint</p>
          <h2>
            Before the gold,
            <br />
            <em>there is a line.</em>
          </h2>
          <p>
            A beautiful piece begins with a thoughtful drawing. Ideas become
            measured lines, revealing how a jewel will look, sit and move long
            before it takes physical form.
          </p>
          <article>
            <span>01 / Structure</span>
            <h3>Giving the vision its proportions</h3>
            <p>
              Fine graphite sketches explore the front, side and top of a
              design. The placement of each stone, the depth of its setting and
              the thickness of the metal are considered together—balancing
              character with comfort and strength.
            </p>
          </article>
          <article>
            <span>02 / Light & colour</span>
            <h3>Imagining the finished jewel</h3>
            <p>
              Traditional gouache rendering introduces colour, reflection and
              the play of light. It helps communicate the warmth of polished
              gold and the character of the gemstones, giving the workshop a
              shared visual reference.
            </p>
          </article>
          <article>
            <span>03 / Craft</span>
            <h3>A guide for every hand that follows</h3>
            <p>
              The finished drawing becomes a working blueprint for modelling,
              casting and setting. Its dimensions and details guide the next
              stages, with each element refined as the design moves from paper
              into a piece you can hold.
            </p>
          </article>
          <ConsultationLink subject="a custom jewellery design consultation" />
        </div>
      </section>
      <section className="kj-quote-band">
        <p className="kj-eyebrow">28+ years of mastery</p>
        <h2>
          Every detail considered.
          <br />
          <em>Every piece, personal.</em>
        </h2>
        <a className="kj-light-link" href="#/curated-designs">
          Explore curated designs <ArrowRight size={18} />
        </a>
      </section>
    </>
  );
}

export function VisitView() {
  return (
    <section className="kj-visit kj-shell">
      <p className="kj-eyebrow">Come a little closer</p>
      <h1>
        Find your piece.
        <br />
        <em>In person.</em>
      </h1>
      <div className="kj-visit-grid">
        <div>
          <h2>Our Cherai showroom</h2>
          <p>{storeAddress}</p>
          <p>
            Discover the details, try your favourites, and speak with our team
            about a piece that feels right for you.
          </p>
          <a
            className="kj-button"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions <ArrowUpRight size={18} />
          </a>
        </div>
        <div>
          <h2>Let’s make it personal.</h2>
          <p>
            Planning a wedding, exploring Eternal, or looking for an everyday
            favourite? Start a conversation on WhatsApp.
          </p>
          <ConsultationLink />
          <p className="kj-caption">
            Please confirm opening hours with the showroom before travelling.
          </p>
        </div>
      </div>
    </section>
  );
}
