# Fuochi Allavorati — Luogosano

Responsive tourism website for the Fuochi Allavorati, 6–8 December 2026.

## Features

- Italian at `/` and English at `/en/`, with crawlable links and a language selector. Automatic selection uses browser preferences when chosen.
- Accessible programme tabs for the three event days.
- Mobile layouts, directions, downloadable calendars and the original event poster.
- Hero image adapted from the conference poster using AI to remove the text and logo.

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
- `fuochi.jpg` and `convegno.jpg`: original event and conference posters.
- `scultura-fuochi.jpg`: hero image adapted from the conference poster.
- `*.ics`: Italian and English calendar downloads.

For static hosting, publish this repository root. The site uses Google Fonts and external Google Maps links. It does not require server-side code or credentials.

## SEO

The public domain is `https://fuochiallavorati.it/`, taken from the repository's homepage setting. Both language pages include canonical URLs, reciprocal hreflang links, social sharing metadata and JSON-LD for the festival. The programme remains readable with JavaScript disabled.

After changing `index.html`, translations in `i18n.js`, or the public domain in `scripts/build-seo.mjs`, run `node scripts/build-seo.mjs`. This refreshes the metadata, the English HTML, `robots.txt` and `sitemap.xml`. Deploy these generated files together with the source assets. No Node runtime is needed on the host.

The same command generates `llms.txt`, `index.md` and `en/index.md` for AI readers. Both HTML pages advertise their Markdown alternative and the llms.txt guide through link relations. Markdown programme entries are extracted from the corresponding HTML, including all three days, conference summary and original poster links. Dates, local timezone, provenance and unavailable practical details are explicit. The format follows the [llms.txt proposal](https://llmstxt.org/). Deploy the Markdown and text files alongside the HTML. Verify that the host serves their content with successful responses and suitable text content types, including when bot protection is enabled.

After deployment, verify that the domain, `/en/`, `/robots.txt` and `/sitemap.xml` return HTTP 200, that HTTP and alternative hostnames redirect to the HTTPS canonical domain, and that the host sends no `noindex` header. Configure redirects in the hosting provider. Verify ownership in Google Search Console and Bing Webmaster Tools, submit `https://fuochiallavorati.it/sitemap.xml` and request indexing of both pages. Search engine account access is required for submission. Validate the published page with Google's Rich Results Test and monitor indexing and Core Web Vitals in Search Console.

## Content

Event information comes from the supplied post and posters. This is not an official institutional website.

This GitHub export keeps the website files and images at the repository root for direct static hosting. The original Sites deployment remains separate.
