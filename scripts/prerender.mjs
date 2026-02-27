import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "../dist");
const BASE_URL = "https://freeprivateconverter.com";

const FORMATS = {
  png:  { label: "PNG",  canDecode: true,  canEncode: true  },
  jpg:  { label: "JPG",  canDecode: true,  canEncode: true  },
  webp: { label: "WebP", canDecode: true,  canEncode: true  },
  avif: { label: "AVIF", canDecode: true,  canEncode: true  },
  heic: { label: "HEIC", canDecode: true,  canEncode: false },
  tiff: { label: "TIFF", canDecode: true,  canEncode: true  },
  bmp:  { label: "BMP",  canDecode: true,  canEncode: true  },
  gif:  { label: "GIF",  canDecode: true,  canEncode: true  },
  svg:  { label: "SVG",  canDecode: true,  canEncode: false },
  ico:  { label: "ICO",  canDecode: true,  canEncode: true  },
  pdf:  { label: "PDF",  canDecode: false, canEncode: true  },
};

function getConversionPairs() {
  const pairs = [];
  const ids = Object.keys(FORMATS);
  for (const from of ids) {
    if (!FORMATS[from].canDecode) continue;
    for (const to of ids) {
      if (!FORMATS[to].canEncode || from === to) continue;
      pairs.push({ from, to, slug: `${from}-to-${to}` });
    }
  }
  return pairs;
}

function getSEO(from, to) {
  const fromLabel = FORMATS[from].label;
  const toLabel = FORMATS[to].label;
  return {
    title: `Convert ${fromLabel} to ${toLabel} Online Free - ConverterPrivacy`,
    description: `Convert ${fromLabel} to ${toLabel} online for free. 100% private — your files never leave your browser. No upload, no server, no tracking.`,
    canonical: `${BASE_URL}/${from}-to-${to}`,
  };
}

function injectSEO(html, { title, description, canonical }) {
  let result = html;
  result = result.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );

  const metaTags = [
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
  ].join("\n    ");

  result = result.replace("</head>", `    ${metaTags}\n  </head>`);
  return result;
}

function generateSitemap(pairs) {
  const urls = [
    `  <url><loc>${BASE_URL}/</loc><priority>1.0</priority></url>`,
    ...pairs.map(
      (p) =>
        `  <url><loc>${BASE_URL}/${p.slug}</loc><priority>0.8</priority></url>`
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

function main() {
  const indexHtml = fs.readFileSync(path.join(DIST, "index.html"), "utf-8");
  const pairs = getConversionPairs();

  console.log(`Pre-rendering ${pairs.length} conversion pages...`);

  for (const pair of pairs) {
    const seo = getSEO(pair.from, pair.to);
    const html = injectSEO(indexHtml, seo);
    const dir = path.join(DIST, pair.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), html);
  }

  // Sitemap
  const sitemap = generateSitemap(pairs);
  fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);
  console.log(`Generated sitemap.xml with ${pairs.length + 1} URLs`);

  console.log("Pre-rendering complete!");
}

main();
