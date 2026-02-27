import UTIF from "utif";

export function decodeTIFF(buffer: ArrayBuffer): ImageData {
  const ifds = UTIF.decode(buffer);
  if (ifds.length === 0) throw new Error("Failed to decode TIFF image");

  UTIF.decodeImage(buffer, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);

  const width = ifds[0].width;
  const height = ifds[0].height;

  const clamped = new Uint8ClampedArray(rgba.buffer as ArrayBuffer);
  return new ImageData(clamped, width, height);
}

export function encodeTIFF(imageData: ImageData): ArrayBuffer {
  const { width, height, data } = imageData;
  const rgba = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return UTIF.encodeImage(rgba, width, height);
}
