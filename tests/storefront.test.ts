import test from "node:test";
import assert from "node:assert/strict";
import {
  PRODUCTS,
  calculatePriceBreakdown,
  getLiveProductPrice,
} from "../src/data/products.ts";
import { matchesOrnament } from "../src/data/catalogNavigation.ts";
import { educationSections, educationHref } from "../src/data/education.ts";

test("ornament families separate chains, pendants and bracelets from adjacent categories", () => {
  const chain = PRODUCTS.find((p) => p.id === "tara-layered-chain")!;
  const pendant = PRODUCTS.find((p) => p.id === "navya-pendant-necklace")!;
  const bracelet = PRODUCTS.find(
    (p) => p.id === "modern-geometric-18k-bracelet",
  )!;
  assert.ok(matchesOrnament(chain, "Chains", "Layered Chains"));
  assert.ok(!matchesOrnament(chain, "Necklaces"));
  assert.ok(matchesOrnament(pendant, "Pendants", "Gold Pendants"));
  assert.ok(!matchesOrnament(pendant, "Chains"));
  assert.ok(matchesOrnament(bracelet, "Bracelets"));
  assert.ok(!matchesOrnament(bracelet, "Bangles"));
});
test("style filters return the requested styles, and unlisted styles stay empty", () => {
  const studs = PRODUCTS.filter((p) => matchesOrnament(p, "Earrings", "Studs"));
  assert.deepEqual(
    studs.map((p) => p.id),
    ["saira-diamond-cut-studs", "tara-daily-gold-studs"],
  );
  assert.equal(
    PRODUCTS.filter((p) => matchesOrnament(p, "Nose Pins")).length,
    0,
  );
  assert.equal(
    PRODUCTS.filter((p) => matchesOrnament(p, "Rings", "Solitaire Rings"))
      .length,
    0,
  );
});
test("a published rate change reprices every listed product and its detail total together", () => {
  for (const product of PRODUCTS) {
    const original = getLiveProductPrice(product, 14000);
    const revised = getLiveProductPrice(product, 15000);
    assert.ok(revised > original, product.id);
    assert.equal(
      revised,
      calculatePriceBreakdown(product.weightGrams, product.purity, 15000).total,
    );
  }
});
test("estimate totals remain consistent and reflect weight and purity choices", () => {
  for (const purity of ["14K", "18K", "22K"] as const) {
    const price = calculatePriceBreakdown(10, purity, 15000);
    assert.equal(
      price.total,
      price.goldValue +
        price.makingCharges +
        price.wastage +
        price.bisHallmarking +
        price.gst,
    );
    assert.ok(calculatePriceBreakdown(20, purity, 15000).total > price.total);
  }
  assert.ok(
    calculatePriceBreakdown(10, "22K", 15000).total >
      calculatePriceBreakdown(10, "18K", 15000).total,
  );
});
test("education has seven sections with unique deep links and substantive lessons", () => {
  assert.equal(educationSections.length, 7);
  const links = new Set<string>();
  let count = 0;
  for (const section of educationSections) {
    for (const topic of section.topics) {
      for (const article of topic.children || [topic]) {
        const link = educationHref(
          section.id,
          topic.id,
          topic.children ? article.id : undefined,
        );
        assert.ok(!links.has(link), link);
        links.add(link);
        assert.ok(article.intro.length > 30);
        assert.ok(article.points.length >= 2);
        count++;
      }
    }
  }
  assert.equal(count, 32);
});
