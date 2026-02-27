export type EngineType = "canvas" | "libheif" | "utif" | "gifjs" | "custom" | "pdflib";

export interface FormatDef {
  label: string;
  mime: string;
  ext: string;
  canDecode: boolean;
  canEncode: boolean;
  engine: EngineType;
}

export const FORMATS: Record<string, FormatDef> = {
  png: { label: "PNG", mime: "image/png", ext: ".png", canDecode: true, canEncode: true, engine: "canvas" },
  jpg: { label: "JPG", mime: "image/jpeg", ext: ".jpg", canDecode: true, canEncode: true, engine: "canvas" },
  webp: { label: "WebP", mime: "image/webp", ext: ".webp", canDecode: true, canEncode: true, engine: "canvas" },
  avif: { label: "AVIF", mime: "image/avif", ext: ".avif", canDecode: true, canEncode: true, engine: "canvas" },
  heic: { label: "HEIC", mime: "image/heic", ext: ".heic", canDecode: true, canEncode: false, engine: "libheif" },
  tiff: { label: "TIFF", mime: "image/tiff", ext: ".tiff", canDecode: true, canEncode: true, engine: "utif" },
  bmp: { label: "BMP", mime: "image/bmp", ext: ".bmp", canDecode: true, canEncode: true, engine: "custom" },
  gif: { label: "GIF", mime: "image/gif", ext: ".gif", canDecode: true, canEncode: true, engine: "gifjs" },
  svg: { label: "SVG", mime: "image/svg+xml", ext: ".svg", canDecode: true, canEncode: false, engine: "canvas" },
  ico: { label: "ICO", mime: "image/x-icon", ext: ".ico", canDecode: true, canEncode: true, engine: "custom" },
  pdf: { label: "PDF", mime: "application/pdf", ext: ".pdf", canDecode: false, canEncode: true, engine: "pdflib" },
} as const;

export type FormatId = keyof typeof FORMATS;

const FORMAT_IDS = Object.keys(FORMATS) as FormatId[];

export function getOutputFormats(inputFormat: FormatId): FormatId[] {
  return FORMAT_IDS.filter(
    (id) => FORMATS[id].canEncode && id !== inputFormat
  );
}

export interface ConversionPair {
  from: FormatId;
  to: FormatId;
  slug: string;
}

export function getConversionPairs(): ConversionPair[] {
  const pairs: ConversionPair[] = [];
  for (const from of FORMAT_IDS) {
    if (!FORMATS[from].canDecode) continue;
    for (const to of FORMAT_IDS) {
      if (!FORMATS[to].canEncode || from === to) continue;
      pairs.push({ from, to, slug: `${from}-to-${to}` });
    }
  }
  return pairs;
}

export function parseSlug(slug: string): { from: FormatId; to: FormatId } | null {
  const match = slug.match(/^(\w+)-to-(\w+)$/);
  if (!match) return null;
  const from = match[1] as FormatId;
  const to = match[2] as FormatId;
  if (!FORMATS[from]?.canDecode || !FORMATS[to]?.canEncode || from === to) return null;
  return { from, to };
}

const MIME_TO_FORMAT: Record<string, FormatId> = {};
for (const [id, def] of Object.entries(FORMATS)) {
  if (def.canDecode) {
    MIME_TO_FORMAT[def.mime] = id as FormatId;
  }
}
MIME_TO_FORMAT["image/jpg"] = "jpg";
MIME_TO_FORMAT["image/heif"] = "heic";

const EXT_TO_FORMAT: Record<string, FormatId> = {};
for (const [id, def] of Object.entries(FORMATS)) {
  if (def.canDecode) {
    EXT_TO_FORMAT[def.ext] = id as FormatId;
  }
}
EXT_TO_FORMAT[".jpeg"] = "jpg";
EXT_TO_FORMAT[".heif"] = "heic";
EXT_TO_FORMAT[".tif"] = "tiff";
EXT_TO_FORMAT[".svgz"] = "svg";

export function detectFormat(file: File): FormatId | null {
  if (file.type && MIME_TO_FORMAT[file.type]) {
    return MIME_TO_FORMAT[file.type];
  }
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (ext && EXT_TO_FORMAT[ext]) {
    return EXT_TO_FORMAT[ext];
  }
  return null;
}

export interface ConversionSEO {
  title: string;
  heading: string;
  description: string;
  canonical: string;
}

const BASE_URL = "https://freeprivateconverter.com";

export function getConversionSEO(from: FormatId, to: FormatId): ConversionSEO {
  const fromLabel = FORMATS[from].label;
  const toLabel = FORMATS[to].label;
  const slug = `${from}-to-${to}`;

  return {
    title: `Convert ${fromLabel} to ${toLabel} Online Free - ConverterPrivacy`,
    heading: `Convert ${fromLabel} to ${toLabel}`,
    description: `Convert ${fromLabel} to ${toLabel} online for free. 100% private — your files never leave your browser. No upload, no server, no tracking.`,
    canonical: `${BASE_URL}/${slug}`,
  };
}
