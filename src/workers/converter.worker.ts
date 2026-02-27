import { convertImage } from "../lib/convert";
import { FORMATS, type FormatId } from "../lib/formats";

export interface WorkerRequest {
  buffer: ArrayBuffer;
  from: FormatId;
  to: FormatId;
  originalName: string;
}

export interface WorkerResponse {
  type: "result";
  blob: Blob;
  filename: string;
}

export interface WorkerError {
  type: "error";
  message: string;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { buffer, from, to, originalName } = e.data;
  try {
    const blob = await convertImage(buffer, from, to);
    const baseName = originalName.replace(/\.[^.]+$/, "");
    const filename = `${baseName}${FORMATS[to].ext}`;
    (self as unknown as Worker).postMessage(
      { type: "result", blob, filename } satisfies WorkerResponse
    );
  } catch (err) {
    (self as unknown as Worker).postMessage(
      { type: "error", message: err instanceof Error ? err.message : String(err) } satisfies WorkerError
    );
  }
};
