import { useState, useCallback, useRef, useEffect } from "react";
import { detectFormat, getOutputFormats, type FormatId, FORMATS } from "@/lib/formats";
import type { WorkerResponse, WorkerError } from "@/workers/converter.worker";
import FileDropzone from "./FileDropzone";
import FormatSelector from "./FormatSelector";

interface ConverterProps {
  defaultFrom?: FormatId;
  defaultTo?: FormatId;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function Converter({ defaultFrom: _defaultFrom, defaultTo }: ConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<FormatId | null>(null);
  const [outputFormats, setOutputFormats] = useState<FormatId[]>([]);
  const [convertingTo, setConvertingTo] = useState<FormatId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      setError(null);
      setConvertingTo(null);

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const format = detectFormat(f);
      if (!format) {
        setError("Unsupported file format. Please try another file.");
        setFile(null);
        setPreviewUrl(null);
        setDetectedFormat(null);
        setOutputFormats([]);
        return;
      }

      setFile(f);
      setDetectedFormat(format);
      setOutputFormats(getOutputFormats(format));

      if (FORMATS[format].engine === "canvas" || ["bmp", "gif", "ico"].includes(format)) {
        setPreviewUrl(URL.createObjectURL(f));
      } else {
        setPreviewUrl(URL.createObjectURL(f));
      }
    },
    [previewUrl]
  );

  const handleConvert = useCallback(
    (to: FormatId) => {
      if (!file || !detectedFormat) return;
      setError(null);
      setConvertingTo(to);

      workerRef.current?.terminate();
      const worker = new Worker(
        new URL("../workers/converter.worker.ts", import.meta.url),
        { type: "module" }
      );
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent<WorkerResponse | WorkerError>) => {
        if (e.data.type === "result") {
          triggerDownload(e.data.blob, e.data.filename);
        } else {
          setError(e.data.message);
        }
        setConvertingTo(null);
        worker.terminate();
      };

      worker.onerror = () => {
        setError("Conversion failed. Please try again.");
        setConvertingTo(null);
        worker.terminate();
      };

      file.arrayBuffer().then((buffer) => {
        worker.postMessage({
          buffer,
          from: detectedFormat,
          to,
          originalName: file.name,
        });
      });
    },
    [file, detectedFormat]
  );

  return (
    <div className="space-y-6">
      <FileDropzone
        onFile={handleFile}
        file={file}
        previewUrl={previewUrl}
        formatLabel={detectedFormat ? FORMATS[detectedFormat].label : null}
      />

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {file && outputFormats.length > 0 && (
        <FormatSelector
          formats={outputFormats}
          highlightedFormat={
            defaultTo && outputFormats.includes(defaultTo) ? defaultTo : undefined
          }
          convertingTo={convertingTo}
          onSelect={handleConvert}
        />
      )}
    </div>
  );
}
