import { FORMATS, type FormatId } from "./formats";

async function decodeToImageData(
  buffer: ArrayBuffer,
  from: FormatId
): Promise<ImageData> {
  const format = FORMATS[from];

  if (format.engine === "libheif") {
    const { decodeHEIC } = await import("./decoders/heic");
    return decodeHEIC(buffer);
  }

  if (format.engine === "utif") {
    const { decodeTIFF } = await import("./decoders/tiff");
    return decodeTIFF(buffer);
  }

  // Canvas-decodable formats: PNG, JPG, WebP, AVIF, BMP, GIF, SVG, ICO
  const blob = new Blob([buffer], { type: format.mime });
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function encodeImageData(
  imageData: ImageData,
  to: FormatId
): Promise<Blob> {
  const format = FORMATS[to];

  if (format.engine === "pdflib") {
    return encodeToPDF(imageData);
  }

  if (format.engine === "utif") {
    const { encodeTIFF } = await import("./decoders/tiff");
    const buf = encodeTIFF(imageData);
    return new Blob([buf], { type: format.mime });
  }

  if (format.engine === "custom" && to === "bmp") {
    const { encodeImageDataToBMP } = await import("./encoders/bmp");
    const buf = encodeImageDataToBMP(imageData);
    return new Blob([buf], { type: format.mime });
  }

  if (format.engine === "custom" && to === "ico") {
    const { encodeImageDataToICO } = await import("./encoders/ico");
    const buf = encodeImageDataToICO(imageData);
    return new Blob([buf], { type: format.mime });
  }

  if (format.engine === "gifjs") {
    const { encodeImageDataToGIF } = await import("./encoders/gif");
    return encodeImageDataToGIF(imageData);
  }

  // Canvas-encodable: PNG, JPG, WebP, AVIF
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  return canvas.convertToBlob({ type: format.mime, quality: 0.92 });
}

async function encodeToPDF(imageData: ImageData): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");

  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  const pngBlob = await canvas.convertToBlob({ type: "image/png" });
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());

  const doc = await PDFDocument.create();
  const img = await doc.embedPng(pngBytes);
  const page = doc.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export interface ConvertMessage {
  type: "convert";
  buffer: ArrayBuffer;
  from: FormatId;
  to: FormatId;
}

export interface ConvertResult {
  type: "result";
  blob: Blob;
  filename: string;
}

export interface ConvertError {
  type: "error";
  message: string;
}

export async function convertImage(
  buffer: ArrayBuffer,
  from: FormatId,
  to: FormatId
): Promise<Blob> {
  const imageData = await decodeToImageData(buffer, from);
  return encodeImageData(imageData, to);
}
