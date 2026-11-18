import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// Public domain listed in the GitHub repository's homepage settings.
const siteUrl = 'https://fuochiallavorati.it/';
const root = new URL('../', import.meta.url);
const source = await readFile(new URL('index.html', root), 'utf8');
const dictionary = await readFile(new URL('i18n.js', root), 'utf8');
const translations = vm.runInNewContext(
  dictionary.slice(0, dictionary.indexOf('const languageSelect')) + '\ntranslations;'
);
const image = new URL('scultura-fuochi.jpg', siteUrl).href;
const descriptions = {
  it: 'Fuochi Allavorati a Luogosano, 6–8 dicembre 2026. Programma dei falò, musica e tradizioni in Irpinia. Convegno il 5 dicembre, indicazioni e locandine.',
  en: 'Fuochi Allavorati in Luogosano, Italy, 6–8 December 2026. Bonfires, folk music and Irpinia traditions. Conference on 5 December, programme and directions.'
};
const titles = {
  it: 'Fuochi Allavorati 2026 a Luogosano | Programma e date',
  en: 'Fuochi Allavorati 2026 in Luogosano | Programme & Dates'
};
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const translate = value => translations[value] || value;

function metadata(language) {
  const url = language === 'it' ? siteUrl : new URL('en/', siteUrl).href;
  const event = {
    '@type': 'Festival',
    '@id': `${siteUrl}#festival-2026`,
    name: 'Fuochi Allavorati 2026',
    description: language === 'it'
      ? 'Tre giorni di tradizione a Luogosano con falò nei rioni, musica popolare e stand enogastronomici.'
      : 'Three days of tradition in Luogosano with neighbourhood bonfires, folk music, and food and wine stalls.',
    startDate: '2026-12-06',
    endDate: '2026-12-08',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url,
    image: [new URL('fuochi.jpg', siteUrl).href],
    location: {
      '@type': 'Place',
      name: 'Luogosano',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Luogosano',
        addressRegion: 'Campania',
        addressCountry: 'IT'
      }
    }
  };
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: 'Fuochi Allavorati · Luogosano',
        inLanguage: ['it', 'en']
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: titles[language],
        description: descriptions[language],
        inLanguage: language,
        isPartOf: { '@id': `${siteUrl}#website` },
        mainEntity: { '@id': event['@id'] }
      },
      event
    ]
  };
  const tags = [
    `<title>${escapeHtml(titles[language])}</title>`,
    `<meta name="description" content="${escapeHtml(descriptions[language])}">`,
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="it" href="${siteUrl}">`,
    `<link rel="alternate" hreflang="en" href="${siteUrl}en/">`,
    `<link rel="alternate" hreflang="x-default" href="${siteUrl}">`,
    `<link rel="alternate" type="text/markdown" href="${url}index.md" title="${language === 'it' ? 'Versione testuale' : 'Text version'}">`,
    `<link rel="describedby" type="text/plain" href="${siteUrl}llms.txt">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Fuochi Allavorati · Luogosano">',
    `<meta property="og:locale" content="${language === 'it' ? 'it_IT' : 'en_GB'}">`,
    `<meta property="og:locale:alternate" content="${language === 'it' ? 'en_GB' : 'it_IT'}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${escapeHtml(titles[language])}">`,
    `<meta property="og:description" content="${escapeHtml(descriptions[language])}">`,
    `<meta property="og:image" content="${image}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    '<meta property="og:image:width" content="1066">',
    '<meta property="og:image:height" content="1476">',
    `<meta property="og:image:alt" content="${language === 'it' ? 'Scultura di una fiamma in metallo a Luogosano al crepuscolo' : 'Metal flame sculpture in Luogosano at dusk'}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(titles[language])}">`,
    `<meta name="twitter:description" content="${escapeHtml(descriptions[language])}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n</script>`
  ];
  return `<!-- SEO:START -->\n${tags.join('\n')}\n<!-- SEO:END -->`;
}

const italian = source.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, metadata('it'));

// Work on text nodes and attributes separately, preserving scripts and JSON-LD.
const english = italian.split(/(<script\b[\s\S]*?<\/script>)/i).map(part => {
  if (part.startsWith('<script')) {
    return part.replace(/src="(i18n\.js|app\.js)"/, 'src="../$1"');
  }
  return part.split(/(<[^>]+>)/).map(token => {
    if (!token.startsWith('<')) {
      const text = token.trim();
      return text ? token.replace(text, escapeHtml(translate(text))) : token;
    }
    return token
      .replace(/aria-label="([^"]*)"/g, (_, value) => `aria-label="${escapeHtml(translate(value))}"`)
      .replace(/\b(href|src)="([^"]+)"/g, (match, name, value) => {
        if (/^(?:[a-z]+:|\/|#)/i.test(value)) return match;
        if (value === 'en/') return `${name}="./"`;
        if (value === './') return `${name}="../"`;
        const path = value === 'fuochi-allavorati.ics' ? 'fuochi-allavorati-en.ics' : value;
        return `${name}="../${path}"`;
      });
  }).join('');
}).join('')
  .replace('<html lang="it">', '<html lang="en">')
  .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, metadata('en'));

await writeFile(new URL('index.html', root), italian);
await mkdir(new URL('en/', root), { recursive: true });
await writeFile(new URL('en/index.html', root), english);

// Generate text from the same HTML as the published pages to keep facts in sync.
function markdownPage(html, language) {
  const url = language === 'it' ? siteUrl : `${siteUrl}en/`;
  const sections = [...html.matchAll(/<section\b[^>]*id="(?:rito|programma|luogosano|visita)"[^>]*>([\s\S]*?)<\/section>/g)]
    .map(match => match[1]).join('\n\n');
  const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
  const text = sections
    .replace(/<p class="eyebrow">[\s\S]*?<\/p>/g, '')
    .replace(/<button\b[\s\S]*?<\/button>/g, '')
    .replace(/<div class="place-mark">[\s\S]*?<\/svg><\/div>/g, '')
    .replace(/<time class="conference-date"[^>]*>([\s\S]*?)<\/time>/g, (_, content) =>
      `<p>${content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}</p>`)
    .replace(/<\/a>\s*<a/g, '</a>\n\n<a')
    .replace(/<div class="event"><time>(.*?)<\/time><div><h3>(.*?)<\/h3><p>(.*?)<\/p><\/div><span>.*?<\/span><\/div>/g,
      '\n\n- **$1 — $2**. $3\n')
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, label) => {
      const caption = label.replace(/<[^>]*>/g, '').trim();
      return `[${caption}](${new URL(decode(href), url).href})`;
    })
    .replace(/<h2\b[^>]*>/g, '\n\n## ')
    .replace(/<h3\b[^>]*>/g, '\n\n### ')
    .replace(/<p\b[^>]*>/g, '\n\n')
    .replace(/<\/span>/g, ' ')
    .replace(/<\/(?:h2|h3|p|div|article|details|blockquote|time)>/g, '\n\n')
    .replace(/<summary>/g, '\n\n### ')
    .replace(/<\/summary>/g, '\n\n')
    .replace(/<br\s*\/?\s*>/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n').trim();
  const context = language === 'it'
    ? 'Orari locali di Luogosano, fuso Europe/Rome (UTC+01:00 nel dicembre 2026). Le date si riferiscono all’edizione 2026. Il convegno si tiene il 5 dicembre alle 16:30. I tre giorni dei Fuochi Allavorati sono il 6, 7 e 8 dicembre.'
    : 'All times are local to Luogosano, Europe/Rome (UTC+01:00 in December 2026). Dates refer to the 2026 edition. The conference takes place on 5 December at 16:30. The three days of the Fuochi Allavorati are 6, 7 and 8 December.';
  const provenance = language === 'it'
    ? 'Informazioni tratte dalla pagina e dalle locandine fornite. Pagina di promozione turistica. Le parti coperte dalle scritte nella foto di apertura sono state ricostruite con IA. Il programma completo del convegno è nella locandina originale.'
    : 'Information comes from the page and supplied posters. This is a tourism promotion page. Areas covered by lettering in the hero photo were reconstructed using AI. The full conference programme is in the original poster.';
  const posterLabels = language === 'it'
    ? ['Locandina Fuochi Allavorati 2026', 'Locandina convegno 5 dicembre 2026']
    : ['Fuochi Allavorati 2026 poster', '5 December 2026 conference poster'];
  return `# ${titles[language]}\n\n> ${descriptions[language]}\n\n${url}\n\n${context}\n\n${decode(text)}\n\n${provenance}\n\n- [${posterLabels[0]}](${siteUrl}fuochi.jpg)\n- [${posterLabels[1]}](${siteUrl}convegno.jpg)\n`;
}

await writeFile(new URL('index.md', root), markdownPage(italian, 'it'));
await writeFile(new URL('en/index.md', root), markdownPage(english, 'en'));
await writeFile(new URL('llms.txt', root), `# Fuochi Allavorati · Luogosano

> Guida al rito dei Fuochi Allavorati di Luogosano, in provincia di Avellino, Campania, Italia. Edizione 2026, dal 6 all’8 dicembre, con convegno il 5 dicembre alle 16:30 al Teatro A. Buono.

Le versioni Markdown sono generate dallo stesso HTML delle pagine pubblicate. Tutti gli orari sono locali, nel fuso Europe/Rome. Le locandine originali sono le fonti del programma. La pagina presenta informazioni di promozione turistica. Prezzi, parcheggi, accessibilità e modalità di partecipazione al contest fotografico non sono specificati nel materiale fornito.

## Contenuti testuali

- [Programma e informazioni in italiano](${siteUrl}index.md)
- [Programme and visitor information in English](${siteUrl}en/index.md)

## Pagine web

- [Fuochi Allavorati 2026](${siteUrl})
- [Fuochi Allavorati 2026 in English](${siteUrl}en/)

## Fonti originali

- [Locandina dei Fuochi Allavorati](${siteUrl}fuochi.jpg)
- [Locandina del convegno](${siteUrl}convegno.jpg)
`);
await writeFile(new URL('robots.txt', root), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`);
const urls = ['', 'en/'].map(path => `  <url>
    <loc>${siteUrl}${path}</loc>
    <xhtml:link rel="alternate" hreflang="it" href="${siteUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}en/"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}"/>
    <image:image><image:loc>${siteUrl}fuochi.jpg</image:loc></image:image>
    <image:image><image:loc>${siteUrl}convegno.jpg</image:loc></image:image>
  </url>`);
await writeFile(new URL('sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`);
console.log(`SEO pages and sitemap generated in ${fileURLToPath(root)}`);
