# Kavitha storefront redesign

This branch changes the public experience to browsing jewellery, learning about the details, saving favourites and starting a personal consultation. It keeps the existing React/Vite application and legacy administrative routes.

## Included

- Ivory, burgundy and muted gold design; editorial typography; responsive layouts.
- “Curating the extraordinary.” hero, consultation action and “28+ years of mastery”.
- Eight ornament families with style submenus and collection tabs: earrings, necklaces, rings, chains, pendants, bangles, bracelets and nose pins.
- Eternal diamond collection page with nine ornament/solitaire interests. These are enquiry categories, not fabricated stock records.
- Curated Designs with original bridal copy; Traditional Drawing with the supplied artwork.
- Education: seven sections and 32 original lessons, nested navigation, diamond diagram, birthstone calendar and independent GIA reading links.
- Product details, specifications, price breakup and consultation tabs with arrow-key navigation.
- URL-based filters, sorting, search, saved favourites, removal undo, native modal dialogs and visible feedback.
- Six service cards and a cream/burgundy split footer. Social destinations are limited to Facebook, Instagram and WhatsApp.
- Shared rate-based estimates. Public rate reads no longer write defaults to Firestore. Admin saves wait for server acknowledgement and show failures instead of a false success. Removed a duplicate rate write that could overwrite the silver rate.

## Required configuration and release checks

Set these public build variables to verified business destinations, then rebuild:

```
VITE_WHATSAPP_NUMBER=<country code and number, digits only>
VITE_FACEBOOK_URL=<official https Facebook page>
VITE_INSTAGRAM_URL=<official https Instagram page>
```

They are intentionally blank in `.env.example`. Missing values show disabled controls with an explanation; the previous dummy WhatsApp number is not used. WhatsApp messages are composed in the link, and the customer sends them in WhatsApp.

The active hosting target is unresolved. The repository has an opt-in Hostinger workflow for `main`; earlier live-domain checks showed Vercel response headers. No Heroku connection or production deployment was verified. Confirm the actual app and domain before merging for release.

The preview encountered Firebase Listen transport warnings and displayed indicative pricing. Rate calculation and UI recalculation are tested; a successful authorised admin-to-second-browser publication still needs verification against the correct live database. This is a store-published rate system, not an automatic market-price feed.

The existing catalogue contains 27 records, including stock photography and descriptions that need business approval. Twenty-two original image URLs were recovered into local assets; five unrecoverable images display an explicit photograph-pending state. Eternal needs the store's actual diamond inventory and photographs to become a priced product catalogue. No competitor imagery, certification claims, return guarantees or buyback policies were copied.

The repository's existing client-side admin authentication and permissive Firestore rules remain separate release risks documented in the audit. Custom product uploads remain localStorage-based and are not synchronised across devices. This redesign does not claim to fix those backend systems.

## Shneiderman's eight rules in this implementation

| Rule | Application |
| --- | --- |
| Consistency | Shared typography, palette, buttons, menu structure and pricing format |
| Universal usability | Responsive menus, keyboard access, focus indicators, labelled controls and reduced-motion styling |
| Informative feedback | Result counts, filter chips, favourite feedback and explicit estimate labels |
| Closure | Applied filters close their dialog; saved and removed states are clear; enquiry opens the configured WhatsApp destination |
| Error prevention | Weight validation; confirmed cloud saves; unavailable stock and contacts are not fabricated |
| Easy reversal | Undo favourite removal, removable filters, reset, browser navigation and dismissible dialogs |
| User control | No forced carousel, fabricated urgency or automatic message sending; customers choose the next step |
| Reduced memory load | Breadcrumbs, persistent favourites, URL-based selections, visible specifications and contextual education |

## Verification

- `npm run lint` — TypeScript passes.
- `npm run test:storefront` — five tests cover ornament classification, empty categories, repricing, estimate consistency and education links/content.
- `npm run build` — production build passes. Initial JS is approximately 332 KB before gzip; Firebase and the legacy admin remain larger deferred chunks.
- Browser checked at desktop and 390px mobile: home, nested menus, style filters, product tabs/keyboard arrows, favourites and undo, education sections/deep-link reload, Eternal interests, supplied drawing and calculator validation.
- A 10 g estimate changed from ₹1,70,110 to ₹3,40,173 when changed to 20 g at the preview's indicative ₹15,010/g rate. Invalid negative weight was rejected.
- No production data, rates, messages or deployment settings were changed during validation.

Run locally with `npm ci`, then `npm run dev`. If the surrounding environment sets `DISABLE_HMR=true`, use `DISABLE_HMR=false CHOKIDAR_USEPOLLING=true npm run dev` for a refreshing development preview.
