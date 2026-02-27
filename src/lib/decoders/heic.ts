export async function decodeHEIC(buffer: ArrayBuffer): Promise<ImageData> {
  const libheif = await import("libheif-js");
  const decoder = new libheif.HeifDecoder();
  const images = decoder.decode(new Uint8Array(buffer));

  if (!images || images.length === 0) {
    throw new Error("Failed to decode HEIC image");
  }

  const image = images[0];
  const width = image.get_width();
  const height = image.get_height();

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(width, height);

  await new Promise<void>((resolve, reject) => {
    image.display(imgData, (result: boolean) => {
      if (result) resolve();
      else reject(new Error("HEIC display failed"));
    });
  });

  return imgData;
}
