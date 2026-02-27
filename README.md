# ConverterPrivacy

A privacy-focused file converter that runs entirely in your browser. No uploads, no servers, no tracking.

## Supported Formats

**Input**: PNG, JPG, WebP, AVIF, HEIC, TIFF, BMP, GIF, SVG, ICO  
**Output**: PNG, JPG, WebP, AVIF, TIFF, BMP, GIF, ICO, PDF

## Development

```bash
yarn install
yarn dev
```

## Build

```bash
yarn build
```

The build step pre-renders 82+ SEO pages and generates a sitemap.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Canvas API + Web Workers for conversion
- libheif-js (HEIC), utif (TIFF), gif.js (GIF), pdf-lib (PDF)
- react-helmet-async for SEO
- Static pre-rendering for Google indexing
