import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Circle,
  Diamond,
  Gem,
  Ruler,
  Sparkles,
} from "lucide-react";
import {
  birthstones,
  educationHref,
  educationSections,
} from "../data/education";
import { ConsultationLink } from "../components/StorefrontElements";
const icons = [Diamond, Circle, Gem, Circle, Sparkles, Ruler, BookOpen];
function DiamondDiagram() {
  return (
    <figure className="kj-diamond-diagram">
      <svg
        viewBox="0 0 400 340"
        role="img"
        aria-label="Diamond anatomy: table on top, crown above the girdle, pavilion below, and culet at the base"
      >
        <g stroke="currentColor" strokeWidth="1.3" fill="none">
          <path fill="#f2e7e8" d="M65 137 126 86H247L307 137 186 274Z" />
          <path d="M65 137H307M126 86 115 137 186 274 257 137 247 86M126 86 186 137 247 86M115 137 186 86 257 137M65 137 126 86M307 137 247 86" />
          <path
            stroke="#ac9169"
            d="M192 86H330M285 115H330M308 137H330M260 195H330M186 274H330"
          />
        </g>
        <g fill="currentColor" fontSize="12" fontFamily="Inter, sans-serif">
          <text x="335" y="90">
            Table
          </text>
          <text x="335" y="119">
            Crown
          </text>
          <text x="335" y="141">
            Girdle
          </text>
          <text x="335" y="199">
            Pavilion
          </text>
          <text x="335" y="278">
            Culet
          </text>
        </g>
      </svg>
      <figcaption>
        THE ANATOMY OF LIGHT
        <br />
        <span>Simplified illustration · not to scale</span>
      </figcaption>
    </figure>
  );
}
export function EducationView({ path }: { path: string }) {
  const [, sectionId, topicId, childId] = path.split("/");
  const section =
    educationSections.find((s) => s.id === sectionId) || educationSections[0];
  const topic =
    section.topics.find((t) => t.id === topicId) || section.topics[0];
  const article =
    topic.children?.find((c) => c.id === childId) ||
    topic.children?.[0] ||
    topic;
  const index = section.topics.indexOf(topic);
  const nextTopic = section.topics[(index + 1) % section.topics.length];
  return (
    <section className="kj-education kj-shell">
      <nav className="kj-breadcrumb" aria-label="Breadcrumb">
        <a href="#/home">Home</a>
        <span>/</span>
        <a href="#/education">Education</a>
        <span>/</span>
        <span>{section.label}</span>
      </nav>
      <div className="kj-education-intro">
        <div>
          <p className="kj-eyebrow">The Kavitha guide</p>
          <h1>
            A little knowledge.
            <br />
            <em>A more confident choice.</em>
          </h1>
        </div>
        <p>
          Understand the details that make a jewel yours.
          <br />
          Explore at your own pace, one beautiful discovery at a time.
        </p>
      </div>
      <div className="kj-education-layout">
        <nav className="kj-education-sidebar" aria-label="Education categories">
          {educationSections.map((s, i) => {
            const Icon = icons[i];
            return (
              <a
                key={s.id}
                href={educationHref(s.id)}
                aria-current={s.id === section.id ? "page" : undefined}
              >
                <span>
                  <Icon size={23} strokeWidth={1.2} />
                </span>
                {s.label}
              </a>
            );
          })}
        </nav>
        <div className="kj-education-body">
          <nav className="kj-topic-nav" aria-label={`${section.label} topics`}>
            {section.topics.map((t) => (
              <a
                key={t.id}
                href={educationHref(section.id, t.id)}
                aria-current={t.id === topic.id ? "page" : undefined}
              >
                {t.label}
              </a>
            ))}
          </nav>
          {topic.children && (
            <nav
              className="kj-subtopic-nav"
              aria-label={`${topic.label} subjects`}
            >
              {topic.children.map((c) => (
                <a
                  key={c.id}
                  href={educationHref(section.id, topic.id, c.id)}
                  aria-current={c.id === article.id ? "page" : undefined}
                >
                  {c.label}
                </a>
              ))}
            </nav>
          )}
          <article key={article.id} className="kj-lesson">
            <div className="kj-lesson-top">
              <div className="kj-lesson-visual">
                {section.id === "loose-diamonds" ? (
                  <DiamondDiagram />
                ) : (
                  <>
                    <Gem size={94} strokeWidth={0.6} />
                    <span>THE KAVITHA GUIDE</span>
                    <p>{section.label}</p>
                  </>
                )}
              </div>
              <div>
                <p className="kj-eyebrow">
                  {section.label} / {article.label}
                </p>
                <h2>{article.title}</h2>
                <p className="kj-lesson-lead">{article.intro}</p>
              </div>
            </div>
            <div className="kj-lesson-points">
              {article.points.map(([title, copy], i) => (
                <section key={title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </section>
              ))}
            </div>
            {section.id === "birthstones" && (
              <div className="kj-birthstones">
                {birthstones.map(([month, stone, colour]) => (
                  <div key={month}>
                    <Gem size={29} style={{ color: colour }} />
                    <span>{month}</span>
                    <strong>{stone}</strong>
                  </div>
                ))}
              </div>
            )}
            {section.id === "size-chart" && (
              <div className="kj-size-note">
                <Ruler size={26} />
                <div>
                  <h3>Bring your measurements, in millimetres.</h3>
                  <p>
                    We’ll confirm the right fit for the exact design at your
                    consultation. This guide does not assign a final ring or
                    bangle size.
                  </p>
                </div>
              </div>
            )}
            {article.source && (
              <p className="kj-learning-source">
                Further reading:{" "}
                <a
                  href={article.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GIA’s independent gem education <ArrowUpRight size={13} />
                </a>
              </p>
            )}
            <div className="kj-lesson-end">
              <a className="kj-text-link" href="#/traditional-drawing">
                Discover our design process <ArrowUpRight size={15} />
              </a>
              {section.topics.length > 1 && (
                <a
                  className="kj-text-link"
                  href={educationHref(section.id, nextTopic.id)}
                >
                  Next: {nextTopic.label} <ArrowRight size={15} />
                </a>
              )}
            </div>
          </article>
          <aside className="kj-education-consult">
            <div>
              <p className="kj-eyebrow">Bring your questions</p>
              <h3>Good jewellery begins with a conversation.</h3>
              <p>Let’s explore the details together at our Cherai showroom.</p>
            </div>
            <ConsultationLink
              subject={`a consultation about ${section.label.toLowerCase()}`}
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
