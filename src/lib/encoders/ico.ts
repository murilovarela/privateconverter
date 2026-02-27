export function encodeImageDataToICO(imageData: ImageData): ArrayBuffer {
  const { width, height } = imageData;

  const size = Math.min(width, height, 256);
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d")!;

  const source = new OffscreenCanvas(width, height);
  const sourceCtx = source.getContext("2d")!;
  sourceCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(source, 0, 0, size, size);

  const resized = ctx.getImageData(0, 0, size, size);
  const pixels = resized.data;

  const bmpHeaderSize = 40;
  const rowSizeRGBA = size * 4;
  const maskRowSize = Math.ceil(size / 32) * 4;
  const bmpDataSize = bmpHeaderSize + rowSizeRGBA * size + maskRowSize * size;

  const fileSize = 6 + 16 + bmpDataSize;
  const buf = new ArrayBuffer(fileSize);
  const view = new DataView(buf);

  // ICO header
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true); // ICO type
  view.setUint16(4, 1, true); // 1 image

  // ICO directory entry
  view.setUint8(6, size >= 256 ? 0 : size);
  view.setUint8(7, size >= 256 ? 0 : size);
  view.setUint8(8, 0); // colors in palette
  view.setUint8(9, 0); // reserved
  view.setUint16(10, 1, true); // planes
  view.setUint16(12, 32, true); // bits per pixel
  view.setUint32(14, bmpDataSize, true);
  view.setUint32(18, 22, true); // offset to BMP data

  // BMP INFO header (no file header, just info)
  let offset = 22;
  view.setUint32(offset, 40, true); offset += 4;
  view.setInt32(offset, size, true); offset += 4;
  view.setInt32(offset, size * 2, true); offset += 4; // height * 2 (XOR + AND masks)
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, 32, true); offset += 2;
  view.setUint32(offset, 0, true); offset += 4; // compression
  view.setUint32(offset, rowSizeRGBA * size + maskRowSize * size, true); offset += 4;
  offset += 16; // skip ppm + colors

  // Pixel data (bottom-up BGRA)
  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      view.setUint8(offset++, pixels[i + 2]); // B
      view.setUint8(offset++, pixels[i + 1]); // G
      view.setUint8(offset++, pixels[i]);     // R
      view.setUint8(offset++, pixels[i + 3]); // A
    }
  }

  // AND mask (all zeros = fully opaque, alpha is in BGRA)
  for (let y = 0; y < size; y++) {
    for (let b = 0; b < maskRowSize; b++) {
      view.setUint8(offset++, 0);
    }
  }

  return buf;
}
