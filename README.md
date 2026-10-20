# Honeycomb Harmonic website

The production source for https://honeycombharmonic.com.

- GitHub: `honeycombharmonic-art/honeycombharmonic.com`
- Production branch: `main`
- Netlify project: `honeycombharmonic-com`
- Netlify site ID: `3c40de16-84f6-42af-b16b-cd716dac7ae4`
- Build: none. Publish directory: repository root.

Static HTML, CSS, and progressive enhancement scripts. Navigation, reading, product information, the launch form, and email links work without JavaScript. Scripts add the mobile menu, copy-email feedback, catalog filters, and a browser-local launch list.

## Content and assets

- Book excerpts reproduce the canonical original/approved passages. The book remains a manuscript in development.
- Harmonic Touch uses the October 8 three-shea development architecture. The prelaunch store presents eleven concepts with proposed USD prices, development ingredients, comparison, and launch-interest registration. No final retail prices, release date, assay, finished formula, clinical claims, or tested holder compatibility are asserted.
- Balm, refill, and Reserve price proposals derive from September 29 planning bands. Pumpable prices include a provisional packaging allowance; book, holder, and Grip prices are new estimates. These are not validated margins or manufacturer quotes.
- The book, balm, and holder use photorealistic studio visualizations. Current assets use `book-adam-*`, `campaign-adam-*`, `balm-studio-v5-*`, `balm-open-*`, `pump-study-*`, `refill-study-*`, and `holder-studio-v2-*`. Developmental status and cover-concept labels remain visible. The source logos, cap master, and holder CAD are authoritative; artistic pictures do not replace them.
- The tongue depressor is permanently excluded. The current editable holder scene also excludes the stick and balm dab. Never restore retired stick imagery.
- The original photography and emblem remain in `assets/`. Smaller WebP derivatives serve the redesigned pages.
- The interface uses a native sans-serif stack, with locally available DM Sans as fallback. Book passages use a readable serif face. Existing font assets retain their OFL licenses.
- Actual session photographs retain their original color and people. Only responsive resizing and compression are applied. Superseded synthetic pictures are retired from the public asset directory.
- Existing Fascial Reconstruction article bodies are preserved; their shared navigation and footer use the new design. The redesign does not constitute scientific verification of their claims.

## Routing and contact

`_redirects` owns route mapping and real 404 responses. `netlify.toml` sets the publish directory. `_headers` owns security and cache headers. Avoid a homepage catch-all: it hides missing content.

Contact uses explicit mailto links and a copy-address fallback. Netlify Forms is enabled for the `launch-interest` form. Verify form registration and a persisted test submission after deployment. No payments or orders are taken. See `/privacy` for the local launch list and submitted information.

## Deployment

Commit changes to GitHub and let Netlify build from `main`. Confirm the production deploy's `commit_ref` and verify the custom domain afterward. Do not substitute a manual upload for the Git-backed production flow.

The October 20, 2026 redesign was checked at 320, 390, 768, and 1440 CSS pixels, with keyboard navigation, no JavaScript, reduced motion, real 404 behavior, internal routes, and an automated accessibility audit.

The subsequent Apple-referenced dark visual system and production imagery direction are documented in DESIGN.md.
