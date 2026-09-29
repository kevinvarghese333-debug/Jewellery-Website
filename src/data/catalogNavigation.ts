import { Product } from "../types";
export const ornamentGroups = [
  {
    name: "Earrings",
    styles: ["Studs", "Jhumkas", "Danglers", "Chandbalis", "Koppu"],
  },
  {
    name: "Necklaces",
    styles: ["Chokers", "Haarams", "Layered Necklaces", "Mangalsutra"],
  },
  {
    name: "Rings",
    styles: ["Bands", "Cocktail Rings", "Temple Rings", "Solitaire Rings"],
  },
  { name: "Chains", styles: ["Layered Chains", "Mugappu Chains"] },
  { name: "Pendants", styles: ["Gold Pendants", "Solitaire Pendants"] },
  {
    name: "Bangles",
    styles: ["Traditional Bangles", "Kadas", "Lightweight Bangles"],
  },
  { name: "Bracelets", styles: ["Link Bracelets", "Everyday Bracelets"] },
  { name: "Nose Pins", styles: ["Nose Studs", "Nose Screws"] },
];
export function ornamentHref(category = "", style = "") {
  const p = new URLSearchParams();
  if (category) p.set("category", category);
  if (style) p.set("style", style);
  return `#/collections${p.size ? `?${p}` : ""}`;
}
const patterns: Record<string, RegExp> = {
  Studs: /stud|tops/i,
  Jhumkas: /jhumka/i,
  Danglers: /drop|hanging|dangl/i,
  Chandbalis: /chandbali/i,
  Koppu: /koppu/i,
  Chokers: /choker/i,
  Haarams: /haaram|haram|mala/i,
  "Layered Necklaces": /layered/i,
  Mangalsutra: /mangalsutra/i,
  Bands: /band/i,
  "Cocktail Rings": /cocktail/i,
  "Temple Rings": /temple/i,
  "Solitaire Rings": /solitaire/i,
  "Layered Chains": /layered/i,
  "Mugappu Chains": /mugappu/i,
  "Gold Pendants": /pendant/i,
  "Solitaire Pendants": /solitaire/i,
  "Traditional Bangles": /stacked|filigree|carved|temple/i,
  Kadas: /kada/i,
  "Lightweight Bangles": /lightweight|minimal/i,
  "Link Bracelets": /link/i,
  "Everyday Bracelets": /bracelet/i,
  "Nose Studs": /nose.*stud/i,
  "Nose Screws": /nose.*screw/i,
};
export function matchesOrnament(
  product: Product,
  category: string,
  style = "",
) {
  const name = product.name;
  let match = !category || product.category === category;
  if (category === "Necklaces")
    match =
      ["Chokers", "Long Necklaces (Haaram)", "Layered Necklaces"].includes(
        product.category,
      ) && !/pendant|chain/i.test(name);
  if (category === "Chains") match = /chain/i.test(name);
  if (category === "Pendants") match = /pendant/i.test(name);
  if (category === "Bangles")
    match =
      product.category === "Bangles & Bracelets" && !/bracelet/i.test(name);
  if (category === "Bracelets") match = /bracelet/i.test(name);
  if (category === "Nose Pins") match = /nose/i.test(name);
  return match && (!style || !!patterns[style]?.test(name));
}
