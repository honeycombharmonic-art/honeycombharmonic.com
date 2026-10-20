# Honeycomb Harmonic website

The production source for https://honeycombharmonic.com.

- GitHub: `honeycombharmonic-art/honeycombharmonic.com`
- Production branch: `main`
- Netlify project: `honeycombharmonic-com`
- Netlify site ID: `3c40de16-84f6-42af-b16b-cd716dac7ae4`
- Build: none. Publish directory: repository root.

Static HTML, CSS, and a small progressive enhancement script. Navigation, reading, product information, and email links work without JavaScript. The script adds the mobile menu and copy-email feedback.

## Content and assets

- Book excerpts reproduce the canonical original/approved passages. The book remains a manuscript in development.
- Harmonic Touch uses the current three-shea development architecture. No retail prices, release date, assay, finished formula, clinical claims, or tested holder compatibility are asserted.
- The holder image is the all-black digital prototype reference with the tongue depressor removed, as permanently directed on October 20, 2026. Use `holder-clean-*.webp`; never restore the retired stick imagery. The current editable scene also excludes the stick and its balm dab. The balm image preserves the approved cap artwork, presented as a design study.
- The original photography and emblem remain in `assets/`. Smaller WebP derivatives serve the redesigned pages.
- DM Sans and Italiana are served locally. Their OFL licenses are included in `assets/`.
- Existing Fascial Reconstruction article bodies are preserved; their shared navigation and footer use the new design. The redesign does not constitute scientific verification of their claims.

## Routing and contact

`_redirects` owns route mapping and real 404 responses. `netlify.toml` sets the publish directory. `_headers` owns security and cache headers. Avoid a homepage catch-all: it hides missing content.

Contact uses explicit mailto links and a copy-address fallback. Netlify Forms is disabled on the production project; do not restore the former form without configuring and verifying delivery.

## Deployment

Commit changes to GitHub and let Netlify build from `main`. Confirm the production deploy's `commit_ref` and verify the custom domain afterward. Do not substitute a manual upload for the Git-backed production flow.

The October 20, 2026 redesign was checked at 320, 390, 768, and 1440 CSS pixels, with keyboard navigation, no JavaScript, reduced motion, real 404 behavior, internal routes, and an automated accessibility audit.
