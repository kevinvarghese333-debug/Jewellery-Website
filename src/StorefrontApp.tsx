import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Heart,
  Menu,
  Search,
  X,
  MapPin,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { Product, PurityType } from "./types";
import {
  PRODUCTS,
  calculatePriceBreakdown,
  getGoldRateForPurity,
  getLiveProductPrice,
} from "./data/products";
import { getAllProducts } from "./data/productStore";
import productImages from "./data/productImages.json";
const imageFor = (p: Product | undefined) =>
  p
    ? (productImages as Record<string, string>)[p.id] ||
      (PRODUCTS.some((item) => item.id === p.id) ? "" : p.images.main)
    : "";
const storefrontProducts = () =>
  getAllProducts().map((p) => ({
    ...p,
    images: { ...p.images, main: imageFor(p) },
  }));
import { getLocalCachedGoldRate } from "./data/rateCache";
import { formatPrice } from "./data/storefrontConfig";
import {
  ConsultationLink,
  JewelleryImage,
  Modal,
  ProductCard,
  SocialLinks,
} from "./components/StorefrontElements";
import {
  CuratedDesignsView,
  EternalView,
  TraditionalDrawingView,
  VisitView,
} from "./views/EditorialViews";
import { EducationView } from "./views/EducationView";
import {
  StorefrontNavigation,
  MobileNavigation,
} from "./components/StorefrontNavigation";
import { StorefrontFooter } from "./components/StorefrontFooter";
import { ProductInformation } from "./components/ProductInformation";
import {
  matchesOrnament,
  ornamentGroups,
  ornamentHref,
} from "./data/catalogNavigation";
import "./storefront.css";

const LegacyApp = lazy(() => import("./App"));
const categories = [
  { name: "Earrings", filter: "Earrings", image: imageFor(PRODUCTS[0]) },
  {
    name: "Necklaces",
    filter: "Necklaces",
    image: "/editorial/heroTraditional.jpg",
  },
  {
    name: "Bangles",
    filter: "Bangles & Bracelets",
    image: imageFor(
      PRODUCTS.find((p) => p.id === "kanteerava-royal-kada") ||
        PRODUCTS.find(
          (p) =>
            p.category === "Bangles & Bracelets" &&
            p.images.main.startsWith("https://lh3."),
        )!,
    ),
  },
  {
    name: "Rings",
    filter: "Rings",
    image: imageFor(PRODUCTS.find((p) => p.category === "Rings")!),
  },
  {
    name: "Bridal",
    filter: "Bridal Trousseau",
    image: "/editorial/heroPortrait.jpg",
  },
  { name: "Eternal", filter: "", image: "/editorial/diamond.jpg" },
];
function readRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const path = location.pathname.replace(/^\/+|\/+$/g, "");
  const legacy = new URLSearchParams(location.search);
  let queryRoute = legacy.get("view") || "";
  if (legacy.has("admin")) queryRoute = "admin";
  else if (legacy.has("staff")) queryRoute = "staff";
  else if (legacy.has("campaign") || legacy.has("source")) queryRoute = "onam";
  const raw = hash || path || queryRoute || "home";
  const [route, query = ""] = raw.split("?");
  const aliases: Record<string, string> = {
    catalog: "collections",
    locations: "visit",
    cart: "wishlist",
    earrings: "collections",
    earring: "collections",
    necklace: "collections",
    bangle: "collections",
    trousseau: "collections",
    necklaces: "collections",
    bangles: "collections",
    bridal: "collections",
  };
  const params = new URLSearchParams(query);
  const oldCategory: Record<string, string> = {
    earrings: "Earrings",
    earring: "Earrings",
    necklace: "Necklaces",
    bangle: "Bangles & Bracelets",
    trousseau: "Bridal Trousseau",
    necklaces: "Necklaces",
    bangles: "Bangles & Bracelets",
    bridal: "Bridal Trousseau",
  };
  if (oldCategory[route]) params.set("category", oldCategory[route]);
  return { name: aliases[route] || route, params };
}
function collectionHref(category = "", query = "") {
  const p = new URLSearchParams();
  if (category) p.set("category", category);
  if (query) p.set("q", query);
  return `#/collections${p.size ? `?${p}` : ""}`;
}
const WISHLIST_KEY = "kavitha_storefront_favourites_v1";
function readWishlist(): string[] {
  try {
    const data = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(data) ? data.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function Home({
  products,
  rate,
  saved,
  onSave,
}: {
  products: Product[];
  rate: number;
  saved: string[];
  onSave: (p: Product) => void;
}) {
  return (
    <>
      <section className="kj-hero">
        <div className="kj-hero-copy">
          <p className="kj-eyebrow">Kavitha Jewellery · Cherai, Kerala</p>
          <h1>
            Curating the
            <br />
            <em>extraordinary.</em>
          </h1>
          <p>
            Jewellery for the moments that become memories.
            <br className="kj-desktop" /> Discover a world of gold, diamonds and
            personal expression.
          </p>
          <div className="kj-hero-actions">
            <ConsultationLink />
            <a href="#/collections" className="kj-text-link">
              Explore jewellery <ArrowRight size={17} />
            </a>
          </div>
          <div className="kj-mastery">
            <span>
              28<span className="kj-plus">+</span>
            </span>
            <div>
              YEARS OF MASTERY<small>A legacy in every detail.</small>
            </div>
          </div>
        </div>
        <div className="kj-hero-art">
          <JewelleryImage
            src="/editorial/heroPortrait.jpg"
            alt="Intricate heritage gold necklace with ruby-coloured accents"
            eager
          />
          <div className="kj-hero-caption">
            <span>The heritage edit</span>
            <a href={collectionHref("Necklaces")}>
              Discover <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>
      <div className="kj-promise-strip">
        <span>28+ years of mastery</span>
        <i />
        <span>Personal consultations</span>
        <i />
        <span>Crafted around your story</span>
        <i />
        <span>Visit us in Cherai</span>
      </div>
      <section className="kj-section kj-shell">
        <div className="kj-section-heading">
          <div>
            <p className="kj-eyebrow">A world of beautiful possibilities</p>
            <h2>Find your kind of extraordinary.</h2>
          </div>
          <a href="#/collections" className="kj-text-link">
            View all jewellery <ArrowRight size={17} />
          </a>
        </div>
        <div className="kj-categories">
          {categories.map((c) => (
            <a
              key={c.name}
              href={
                c.name === "Eternal" ? "#/eternal" : collectionHref(c.filter)
              }
            >
              <div>
                <JewelleryImage
                  src={c.image}
                  alt={
                    c.name === "Eternal"
                      ? "Diamond collection inspiration"
                      : `${c.name} collection`
                  }
                />
              </div>
              <span>
                {c.name}
                <ArrowUpRight size={15} />
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="kj-section kj-shell kj-favourites-section">
        <div className="kj-section-heading">
          <div>
            <p className="kj-eyebrow">The Kavitha edit</p>
            <h2>Pieces to fall in love with.</h2>
          </div>
          <p>
            A considered selection.
            <br />A beautiful place to begin.
          </p>
        </div>
        <div className="kj-product-grid">
          {products
            .filter(
              (p) => p.isBestseller && p.images.main.startsWith("/collection/"),
            )
            .slice(0, 4)
            .map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                rate={rate}
                saved={saved.includes(p.id)}
                onSave={onSave}
              />
            ))}
        </div>
        <div className="kj-section-end">
          <p>
            Gold estimates respond to the store’s published rate. Final price
            and availability are confirmed in consultation.
          </p>
          <a href="#/collections" className="kj-text-link">
            Explore the collection <ArrowRight size={17} />
          </a>
        </div>
      </section>
      <section className="kj-eternal-banner">
        <div className="kj-eternal-banner-image">
          <JewelleryImage
            src="/editorial/diamond.jpg"
            alt="Diamond ring inspiration"
          />
          <small>Collection inspiration</small>
        </div>
        <div>
          <p className="kj-eyebrow">Introducing diamonds by Kavitha</p>
          <h2>Eternal</h2>
          <p>
            A moment of brilliance.
            <br />A lifetime of meaning.
          </p>
          <a href="#/eternal" className="kj-light-link">
            Discover Eternal <ArrowRight size={18} />
          </a>
        </div>
      </section>
      <section className="kj-section kj-shell kj-home-bridal">
        <div>
          <p className="kj-eyebrow">Curated designs</p>
          <h2>
            For your day.
            <br />
            <em>For generations.</em>
          </h2>
          <p>
            A wedding is where a new story begins. Let’s create the jewellery
            that will always take you back to yours.
          </p>
          <a href="#/curated-designs" className="kj-button">
            Explore bespoke bridal <ArrowUpRight size={17} />
          </a>
        </div>
        <JewelleryImage
          src="/editorial/heroTraditional.jpg"
          alt="Gold bridal necklace with intricate traditional detailing"
        />
      </section>
      <section className="kj-craft-teaser kj-shell">
        <div className="kj-craft-thumb">
          <img
            src="/editorial/traditional-drawing.png"
            alt="Hand-drawn jewellery design with gemstone and setting studies"
          />
        </div>
        <div>
          <p className="kj-eyebrow">The art behind the ornament</p>
          <h2>
            Before the gold,
            <br />
            there is a line.
          </h2>
          <p>
            Discover how a fleeting idea becomes a considered design, one
            thoughtful detail at a time.
          </p>
          <a href="#/traditional-drawing" className="kj-text-link">
            Explore Traditional Drawing <ArrowRight size={17} />
          </a>
        </div>
      </section>
      <section className="kj-visit-banner kj-shell">
        <div>
          <p className="kj-eyebrow">We would love to meet you</p>
          <h2>
            Your next chapter
            <br />
            begins in Cherai.
          </h2>
        </div>
        <div>
          <p>
            See the details. Try your favourites.
            <br />
            Find a piece that feels like you.
          </p>
          <a href="#/visit" className="kj-text-link">
            Visit our showroom <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}

function Collection({
  products,
  rate,
  route,
  saved,
  onSave,
}: {
  products: Product[];
  rate: number;
  route: ReturnType<typeof readRoute>;
  saved: string[];
  onSave: (p: Product) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(route.params.toString());
  const category = route.params.get("category") || "";
  const style = route.params.get("style") || "";
  const group = ornamentGroups.find((g) => g.name === category);
  const purity = route.params.get("purity") || "";
  const budget = Number(route.params.get("budget")) || 0;
  const query = route.params.get("q")?.trim() || "";
  const sort = route.params.get("sort") || "featured";
  const isWishlist = route.name === "wishlist";
  function update(key: string, value: string) {
    const params = new URLSearchParams(route.params);
    value ? params.set(key, value) : params.delete(key);
    if (key === "category") params.delete("style");
    location.hash = `/${route.name}?${params}`;
  }
  function matches(p: Product) {
    return (
      (!isWishlist || saved.includes(p.id)) &&
      matchesOrnament(p, category, style) &&
      (!purity || p.purity === purity) &&
      (!budget || getLiveProductPrice(p, rate) <= budget) &&
      (!query ||
        `${p.name} ${p.category} ${p.description}`
          .toLowerCase()
          .includes(query.toLowerCase()))
    );
  }
  const filtered = products
    .filter(matches)
    .sort((a, b) =>
      sort === "price-low"
        ? getLiveProductPrice(a, rate) - getLiveProductPrice(b, rate)
        : sort === "price-high"
          ? getLiveProductPrice(b, rate) - getLiveProductPrice(a, rate)
          : sort === "weight"
            ? a.weightGrams - b.weightGrams
            : Number(!!b.isBestseller) - Number(!!a.isBestseller),
    );
  const filterFields = (
    params: URLSearchParams,
    set: (key: string, value: string) => void,
  ) => (
    <>
      <label>
        Category
        <select
          value={params.get("category") || ""}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="">All jewellery</option>
          {[
            ...ornamentGroups.map((g) => g.name),
            "Bridal Trousseau",
            "Bangles & Bracelets",
          ].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label>
        Gold purity
        <select
          value={params.get("purity") || ""}
          onChange={(e) => set("purity", e.target.value)}
        >
          <option value="">All purities</option>
          {["22K", "18K", "14K"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label>
        Budget
        <select
          value={params.get("budget") || ""}
          onChange={(e) => set("budget", e.target.value)}
        >
          <option value="">Any budget</option>
          {[100000, 250000, 500000, 1000000].map((n) => (
            <option key={n} value={n}>
              Under {formatPrice(n)}
            </option>
          ))}
        </select>
      </label>
    </>
  );
  return (
    <section className="kj-section kj-shell kj-collection">
      <p className="kj-breadcrumb">
        <a href="#/home">Home</a> /{" "}
        {isWishlist ? "Your favourites" : "Jewellery"}
      </p>
      <div className="kj-section-heading">
        <div>
          <p className="kj-eyebrow">
            {isWishlist ? "Your personal edit" : "Discover Kavitha"}
          </p>
          <h1>
            {isWishlist
              ? "Saved for a second look."
              : query
                ? `Results for “${query}”`
                : style || category || "Extraordinary, every day."}
          </h1>
        </div>
        <p>
          {isWishlist
            ? "Keep the pieces you love close."
            : "Explore. Save your favourites. Make it personal."}
        </p>
      </div>
      <nav className="kj-category-tabs" aria-label="Ornament categories">
        <a href="#/collections" aria-current={!category ? "page" : undefined}>
          All jewellery
        </a>
        {ornamentGroups.map((g) => (
          <a
            key={g.name}
            href={ornamentHref(g.name)}
            aria-current={category === g.name ? "page" : undefined}
          >
            {g.name}
          </a>
        ))}
      </nav>
      {group && (
        <nav className="kj-style-tabs" aria-label={`${category} styles`}>
          <a
            href={ornamentHref(category)}
            aria-current={!style ? "page" : undefined}
          >
            All {category.toLowerCase()}
          </a>
          {group.styles.map((item) => (
            <a
              key={item}
              href={
                item.includes("Solitaire")
                  ? `#/eternal?collection=${encodeURIComponent(item)}`
                  : ornamentHref(category, item)
              }
              aria-current={style === item ? "page" : undefined}
            >
              {item}
            </a>
          ))}
        </nav>
      )}
      <div className="kj-filter-bar">
        <div className="kj-desktop-filters">
          {filterFields(route.params, update)}
        </div>
        <button
          className="kj-mobile-filter"
          onClick={() => {
            setDraft(route.params.toString());
            setFiltersOpen(true);
          }}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
        <label className="kj-sort">
          Sort by
          <select value={sort} onChange={(e) => update("sort", e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="weight">Weight: low to high</option>
          </select>
        </label>
      </div>
      <div className="kj-result-bar">
        <span aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "design" : "designs"}
        </span>
        <div>
          {[
            ["category", category],
            ["style", style],
            ["purity", purity],
            ["budget", budget ? `Under ${formatPrice(budget)}` : ""],
            ["q", query],
          ]
            .filter(([, value]) => value)
            .map(([key, value]) => (
              <button
                key={key}
                onClick={() => update(key, "")}
                aria-label={`Remove ${value} filter`}
              >
                {value}
                <X size={13} />
              </button>
            ))}
          {(category || style || purity || budget || query) && (
            <a href={`#/${route.name}`} className="kj-reset">
              Clear all
            </a>
          )}
        </div>
      </div>
      {filtered.length ? (
        <div className="kj-product-grid">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              rate={rate}
              saved={saved.includes(p.id)}
              onSave={onSave}
            />
          ))}
        </div>
      ) : (
        <div className="kj-empty">
          <Heart size={30} />
          <h2>
            {isWishlist && !saved.length
              ? "Your favourites start here."
              : "Let’s find something you love."}
          </h2>
          <p>
            {isWishlist && !saved.length
              ? "Tap the heart on a design to save it for your next visit."
              : "No listed designs match this selection yet. Explore other styles or ask our team about availability at the showroom."}
          </p>
          <a href="#/collections" className="kj-button">
            Explore jewellery <ArrowRight size={17} />
          </a>
          <a href="#/visit" className="kj-text-link">
            Ask at our showroom <ArrowUpRight size={16} />
          </a>
        </div>
      )}
      <p className="kj-caption">
        Prices are indicative estimates based on the published gold rate. The
        showroom confirms availability, exact weight, making charges and final
        price.
      </p>
      {filtersOpen && (
        <Modal title="Filter jewellery" onClose={() => setFiltersOpen(false)}>
          <div className="kj-filter-fields">
            {filterFields(new URLSearchParams(draft), (key, value) => {
              const p = new URLSearchParams(draft);
              value ? p.set(key, value) : p.delete(key);
              if (key === "category") p.delete("style");
              setDraft(p.toString());
            })}
          </div>
          <div className="kj-dialog-actions">
            <button className="kj-text-link" onClick={() => setDraft("")}>
              Reset filters
            </button>
            <button
              className="kj-button"
              onClick={() => {
                location.hash = `/${route.name}?${draft}`;
                setFiltersOpen(false);
              }}
            >
              Show designs <ArrowRight size={17} />
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function ProductDetail({
  product,
  rate,
  saved,
  onSave,
}: {
  product: Product;
  rate: number;
  saved: boolean;
  onSave: (p: Product) => void;
}) {
  const [zoom, setZoom] = useState(false);
  const breakdown = calculatePriceBreakdown(
    product.weightGrams,
    product.purity,
    rate,
  );
  return (
    <section className="kj-section kj-shell">
      <nav className="kj-breadcrumb" aria-label="Breadcrumb">
        <a href="#/home">Home</a>
        <span>/</span>
        <a href="#/collections">Jewellery</a>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <div className="kj-detail">
        <div>
          <button
            className="kj-detail-photo"
            onClick={() => setZoom(true)}
            aria-label={`Enlarge photograph of ${product.name}`}
          >
            <JewelleryImage
              src={product.images.main}
              alt={product.name}
              eager
            />
            <span>
              Click to look closer <ArrowUpRight size={16} />
            </span>
          </button>
          <p className="kj-caption">
            Ask our team for additional photographs and availability.
          </p>
        </div>
        <div className="kj-detail-copy">
          <p className="kj-eyebrow">
            {product.category} · The Kavitha collection
          </p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="kj-detail-price">
            <span>{formatPrice(breakdown.total)}</span>
            <small>Estimated price · final quote confirmed by our team</small>
          </div>
          <dl className="kj-specs">
            <div>
              <dt>Gold purity</dt>
              <dd>
                {product.purity} / {product.purityBadge.split("/")[1]}
              </dd>
            </div>
            <div>
              <dt>Listed weight</dt>
              <dd>{product.weightGrams} g</dd>
            </div>
            {product.size && (
              <div>
                <dt>Design details</dt>
                <dd>{product.size}</dd>
              </div>
            )}
          </dl>
          <div className="kj-detail-actions">
            <ConsultationLink
              subject={`${product.name} (${product.purity}, ${product.weightGrams}g), estimated at ${formatPrice(breakdown.total)}`}
            >
              Enquire on WhatsApp
            </ConsultationLink>
            <button
              className={`kj-save-button ${saved ? "is-saved" : ""}`}
              onClick={() => onSave(product)}
              aria-pressed={saved}
            >
              <Heart size={18} fill={saved ? "currentColor" : "none"} />
              {saved ? "Saved to favourites" : "Save to favourites"}
            </button>
          </div>
          <a href="#/visit" className="kj-text-link">
            <MapPin size={16} /> See it at our Cherai showroom{" "}
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <ProductInformation product={product} rate={rate} />
      {zoom && (
        <Modal
          title={product.name}
          onClose={() => setZoom(false)}
          className="kj-image-modal"
        >
          <JewelleryImage
            src={product.images.main}
            alt={`Enlarged view of ${product.name}`}
          />
        </Modal>
      )}
    </section>
  );
}

function RateCalculator({
  rate,
  updated,
  onClose,
}: {
  rate: number;
  updated: string;
  onClose: () => void;
}) {
  const [weight, setWeight] = useState("10");
  const [purity, setPurity] = useState<PurityType>("22K");
  const value = Number(weight);
  const valid =
    weight.trim() !== "" &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= 1000;
  return (
    <Modal title="Gold price guide" onClose={onClose}>
      <p className="kj-caption">
        {updated}. Estimates only; final quotes are confirmed by the showroom.
      </p>
      <div className="kj-rate-list">
        {(["22K", "18K", "14K"] as PurityType[]).map((p) => (
          <div key={p}>
            <span>{p} gold</span>
            <strong>
              {formatPrice(getGoldRateForPurity(p, rate))}
              <small> / g</small>
            </strong>
          </div>
        ))}
      </div>
      <div className="kj-filter-fields">
        <label>
          Weight in grams
          <input
            type="number"
            min="0.01"
            max="1000"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            aria-invalid={!valid}
          />
        </label>
        <label>
          Gold purity
          <select
            value={purity}
            onChange={(e) => setPurity(e.target.value as PurityType)}
          >
            {["22K", "18K", "14K"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="kj-calculator-total" aria-live="polite">
        {valid ? (
          <>
            <span>Indicative jewellery estimate</span>
            <strong>
              {formatPrice(calculatePriceBreakdown(value, purity, rate).total)}
            </strong>
            <p>
              Includes indicative making, wastage, hallmarking and tax charges.
            </p>
          </>
        ) : (
          <p>Enter a weight greater than 0 and no more than 1,000 grams.</p>
        )}
      </div>
    </Modal>
  );
}

export default function StorefrontApp() {
  const [route, setRoute] = useState(readRoute);
  const [products, setProducts] = useState(storefrontProducts);
  const [rate, setRate] = useState(getLocalCachedGoldRate);
  const [updated, setUpdated] = useState("Indicative gold rate");
  const [saved, setSaved] = useState(readWishlist);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [ratesOpen, setRatesOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [undo, setUndo] = useState<Product | null>(null);
  const main = useRef<HTMLElement>(null);
  const initial = useRef(true);
  const scrollPositions = useRef(new Map<string, number>());
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
    };
  }, []);
  useEffect(() => {
    const update = () => setProducts(storefrontProducts());
    window.addEventListener("kavitha_products_updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("kavitha_products_updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};
    import("./data/storeConfigService")
      .then(({ subscribeToGoldRates }) => {
        if (cancelled) return;
        unsubscribe = subscribeToGoldRates((data) => {
          if (Number.isFinite(data.rate22k) && data.rate22k > 0)
            setRate(data.rate22k);
          const date = data.updatedAt?.toDate?.();
          const prefix =
            data.status === "cached"
              ? "Cached store rate"
              : "Store rate updated";
          setUpdated(
            date instanceof Date && !Number.isNaN(date.getTime())
              ? `${prefix} ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
              : "Indicative gold rate",
          );
        });
      })
      .catch(() => setUpdated("Indicative gold rate · connection unavailable"));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(saved));
    } catch {
      setNotice(
        "Your favourites are saved for this visit. Browser storage is unavailable.",
      );
    }
  }, [saved]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => {
      setNotice("");
      setUndo(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    setMenu(false);
    setSearch(false);
    if (initial.current) {
      initial.current = false;
      return;
    }
    window.scrollTo({
      top: scrollPositions.current.get(route.name) || 0,
      behavior: "instant",
    });
    main.current?.focus({ preventScroll: true });
    const remember = () =>
      scrollPositions.current.set(route.name, window.scrollY);
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [route.name]);
  const selected = route.name.startsWith("jewellery/")
    ? products.find((p) => p.id === route.name.slice(10))
    : undefined;
  useEffect(() => {
    const titles: Record<string, string> = {
      home: "Curating the extraordinary",
      collections: "Explore jewellery",
      eternal: "Eternal · Diamond collections",
      "curated-designs": "Curated Designs",
      "traditional-drawing": "Traditional Drawing",
      visit: "Visit our Cherai showroom",
      wishlist: "Your favourites",
    };
    document.title = `${selected?.name || titles[route.name] || (route.name.startsWith("education") ? "Education · The Kavitha guide" : "Explore")} | Kavitha Jewellery`;
  }, [route.name, selected]);
  const results = useMemo(
    () =>
      products
        .filter((p) =>
          `${p.name} ${p.category}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
        )
        .slice(0, 6),
    [products, query],
  );
  function toggleSave(p: Product) {
    const removing = saved.includes(p.id);
    setSaved((prev) =>
      removing ? prev.filter((id) => id !== p.id) : [...prev, p.id],
    );
    setNotice(
      removing
        ? `${p.name} removed from favourites.`
        : `${p.name} saved to favourites.`,
    );
    setUndo(removing ? p : null);
  }
  if (
    [
      "admin",
      "staff",
      "campaign-admin",
      "staff-redemption",
      "onam",
      "onam-campaign",
    ].includes(route.name)
  )
    return (
      <Suspense fallback={<p className="kj-loading">Loading…</p>}>
        <LegacyApp />
      </Suspense>
    );
  return (
    <div className="kj-storefront">
      <a
        className="kj-skip"
        href="#kj-main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <div className="kj-utility">
        <span>28+ years of mastery. A lifetime of meaning.</span>
        <button
          onClick={() => setRatesOpen(true)}
          aria-label="Open gold price guide"
        >
          22K gold <strong>{formatPrice(rate)} / g</strong>
          <span className="kj-rate-note">{updated}</span>
          <ChevronDown size={13} />
        </button>
      </div>
      <header className="kj-header">
        <div className="kj-header-main kj-shell">
          <button
            className="kj-mobile-menu"
            onClick={() => setMenu(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <a
            href="#/home"
            className="kj-brand"
            aria-label="Kavitha Jewellery home"
          >
            <img src="/logo.svg" alt="" />
            <span>
              Kavitha<small>JEWELLERY</small>
            </span>
          </a>
          <form
            className="kj-header-search"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              location.hash = collectionHref("", query).slice(1);
            }}
          >
            <Search size={19} aria-hidden="true" />
            <input
              aria-label="Search jewellery"
              placeholder="Find something extraordinary…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="kj-header-actions">
            <button
              className="kj-search-trigger"
              onClick={() => setSearch(true)}
              aria-label="Search jewellery"
            >
              <Search size={21} />
            </button>
            <a className="kj-store-link" href="#/visit">
              <MapPin size={20} />
              <span>Our showroom</span>
            </a>
            <a
              href="#/wishlist"
              aria-label={`Favourites, ${saved.length} saved designs`}
            >
              <Heart size={21} />
              <span className="kj-favourite-label">Favourites</span>
              {saved.length > 0 && <b>{saved.length}</b>}
            </a>
          </div>
        </div>
        <StorefrontNavigation route={`${route.name}?${route.params}`} />
      </header>
      <main id="kj-main" ref={main} tabIndex={-1}>
        {route.name === "home" ? (
          <Home
            products={products}
            rate={rate}
            saved={saved}
            onSave={toggleSave}
          />
        ) : ["collections", "wishlist"].includes(route.name) ? (
          <Collection
            products={products}
            rate={rate}
            route={route}
            saved={saved}
            onSave={toggleSave}
          />
        ) : selected ? (
          <ProductDetail
            key={selected.id}
            product={selected}
            rate={rate}
            saved={saved.includes(selected.id)}
            onSave={toggleSave}
          />
        ) : route.name === "eternal" ? (
          <EternalView collection={route.params.get("collection") || ""} />
        ) : route.name === "curated-designs" ? (
          <CuratedDesignsView />
        ) : route.name === "traditional-drawing" ? (
          <TraditionalDrawingView />
        ) : route.name === "visit" ? (
          <VisitView />
        ) : route.name === "education" ||
          route.name.startsWith("education/") ? (
          <EducationView path={route.name} />
        ) : (
          <section className="kj-empty">
            <h1>This page has moved.</h1>
            <a href="#/collections" className="kj-button">
              Explore jewellery <ArrowRight size={17} />
            </a>
          </section>
        )}
      </main>
      <StorefrontFooter />
      {menu && (
        <Modal
          title="Explore Kavitha"
          onClose={() => setMenu(false)}
          className="kj-menu-modal"
        >
          <MobileNavigation onNavigate={() => setMenu(false)} />
          <SocialLinks />
        </Modal>
      )}
      {search && (
        <Modal title="Find your extraordinary" onClose={() => setSearch(false)}>
          <form
            className="kj-search-form"
            onSubmit={(e) => {
              e.preventDefault();
              location.hash = collectionHref("", query).slice(1);
              setSearch(false);
            }}
          >
            <input
              autoFocus
              placeholder="Try earrings, necklaces or rings"
              aria-label="Search jewellery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button aria-label="See search results">
              <ArrowRight />
            </button>
          </form>
          <div className="kj-search-results">
            {results.length ? (
              results.map((p) => (
                <a
                  key={p.id}
                  href={`#/jewellery/${p.id}`}
                  onClick={() => setSearch(false)}
                >
                  <JewelleryImage src={p.images.main} alt="" />
                  <span>
                    {p.name}
                    <small>
                      {formatPrice(getLiveProductPrice(p, rate))} · Estimated
                    </small>
                  </span>
                  <ArrowUpRight size={16} />
                </a>
              ))
            ) : (
              <p>No matching designs. Try another style or category.</p>
            )}
          </div>
        </Modal>
      )}
      {ratesOpen && (
        <RateCalculator
          rate={rate}
          updated={updated}
          onClose={() => setRatesOpen(false)}
        />
      )}
      {notice && (
        <div className="kj-toast">
          <Check size={18} />
          <p role="status">{notice}</p>
          {undo && (
            <button
              onClick={() => {
                setSaved((prev) =>
                  prev.includes(undo.id) ? prev : [...prev, undo.id],
                );
                setNotice(`${undo.name} restored to favourites.`);
                setUndo(null);
              }}
            >
              Undo
            </button>
          )}
          <button
            aria-label="Dismiss notification"
            onClick={() => {
              setNotice("");
              setUndo(null);
            }}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
