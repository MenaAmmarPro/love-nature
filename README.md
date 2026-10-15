# Our Garden — Love for Mena

A quiet, code-drawn garden the two of you tend together. Plant a seed, water it
on different days, and it grows from seed to sprout to bud to bloom. Part of the
**Love for Mena** collection.

**Live:** https://menaammarpro.github.io/love-nature/

## What it does

- **Six plots** that start as empty earth
- Plant a seed — each one is a slightly different white-petalled flower
- **Water** it on different days: seed → sprout → bud → **bloom** (three days of care)
- A little verse for each flower when it opens
- A decorative meadow that re-sows itself each day
- Everything is stored on the device only — no tracking, no network calls
- Installable PWA with offline support

## How it works

Tap an empty plot to plant; tap **Water** once a day until it blooms; tap **Pull**
to start that plot over. Progress is saved in `localStorage` on that device.
**Clear the whole garden** in the Details section starts fresh.

To change the flowers, their petal counts, colours or verses, edit the `SPECIES`
array at the top of `js/app.js`.

## Files

- `index.html` — the page
- `css/theme.css` — shared love-theme (copied from `_love-theme/`)
- `css/app.css` — page-specific styles (the drawn flowers)
- `js/theme-main.js`, `js/effects.js` — shared behaviour/effects
- `js/app.js` — planting, watering and growth
- `manifest.webmanifest`, `sw.js` — PWA
- `assets/` — favicon and icons

## Run locally

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Static site, deployed with GitHub Pages from `main`.

## License

Creative Commons BY-NC-ND 4.0 — see [`LICENSE`](LICENSE).
© 2026 Ammar (MenaAmmarPro). Made with care for Mena.
