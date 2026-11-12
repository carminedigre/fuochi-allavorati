# Fuochi Allavorati — Luogosano

Responsive tourism website for the Fuochi Allavorati, 6–8 December 2026.

## Features

- Italian and English, selected from browser preferences with a saved manual override.
- Accessible programme tabs for the three event days.
- Mobile layouts, directions, downloadable calendars and the original event poster.
- AI-generated illustrative hero image; generation prompt in `hero-image.md`.

## Run locally

No build step or package installation is required. From the repository root:

```sh
python3 -m http.server 8765
```

Open http://localhost:8765.

## Files

- `index.html`: page content.
- `style.css`: desktop and mobile styles.
- `app.js`: accessible programme tabs.
- `i18n.js`: translations and language preferences.
- `fuochi.jpg` and `falo-comunita.jpg`: original poster and illustrative hero image.
- `*.ics`: Italian and English calendar downloads.

For static hosting, publish this repository root. The site uses Google Fonts and external Google Maps links. It does not require server-side code or credentials.

## Content

Event information comes from the supplied post and poster. The hero image is an illustrative AI-generated scene, not a documentary photograph of Luogosano. This is not an official institutional website.

This GitHub export keeps the website files and images at the repository root for direct static hosting. The original Sites deployment remains separate.
