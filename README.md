# Honeycomb Harmonic

Honeycomb Harmonic is a dependency-free static site published at
`https://honeycombharmonic.com`.

## Publication layout

- `public/` is the complete Netlify publish directory.
- Files retained at the repository root are legacy source material and are not
  included in deploys.
- `netlify.toml` defines clean-route rewrites, security headers, and caching.
- Assets may receive immutable one-year caching only when they are deliberately
  versioned under `public/assets/v1/`. Increment that directory version whenever
  a cached asset changes.

There is no build command. Netlify serves the contents of `public/` directly.

## Production and previews

Netlify is connected to this GitHub repository. A push merged to `main` creates
the production deploy. Pull requests create Netlify Deploy Previews, and
non-production branches can create branch deploys when that feature is enabled
for the site.

For a manual draft preview with the Netlify CLI, authenticate and link the
repository locally, then run:

```powershell
netlify deploy --dir=public
```

The command creates a draft URL; it does not publish production. Production is
normally promoted through the connected GitHub `main` branch. Keep tokens and
other secrets in Netlify's environment settings or the local CLI session, never
in this repository.

## Routes

The public routes are `/`, `/bodywork`, `/philosophy`, `/classes`, `/balm`,
`/about`, `/contact`, and `/privacy`. Unknown routes return Netlify's normal 404
response; there is intentionally no catch-all rewrite.
