export async function encodeImageDataToGIF(imageData: ImageData): Promise<Blob> {
  const GIF = (await import("gif.js")).default;

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: imageData.width,
      height: imageData.height,
      workerScript: undefined,
    });

    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);

    gif.addFrame(ctx as unknown as CanvasRenderingContext2D, { delay: 100, copy: true });

    gif.on("finished", (blob: Blob) => resolve(blob));
    gif.on("abort", () => reject(new Error("GIF encoding aborted")));

    gif.render();
  });
}
