# Honeycomb Harmonic Website

Static first-pass website for `honeycombharmonic.com`, designed for GitHub -> Netlify -> GoDaddy DNS.

## Publish Path

1. Create a new GitHub repository, for example `honeycombharmonic-site`.
2. Push this folder to the repository root.
3. In Netlify, choose "Add new site" then "Import an existing project".
4. Connect the GitHub repo.
5. Build settings:
   - Build command: leave blank
   - Publish directory: `.`
6. After deploy, add `honeycombharmonic.com` in Netlify under Domain management.
7. In GoDaddy DNS, point the domain to Netlify using Netlify's current DNS instructions for the site.

## Edit Notes

- Replace `assets/bodywork-hands.jpg` and `assets/balm-jar.jpg` with real photos when available.
- Netlify Forms should detect the `honeycomb-contact` form after the first deploy.
- Product names and pricing are draft placeholders.
- The site is intentionally dependency-free, so it can publish without a build pipeline.

## Image Credits

- Bodywork image: Jakub Klucky on Unsplash, `https://unsplash.com/photos/massage-therapist-giving-a-back-massage-7yeqemd-p90`
- Balm image: Sia Ray on Unsplash, `https://unsplash.com/photos/a-hand-holding-a-small-jar-of-cream-QkAnVbOrvNE`
