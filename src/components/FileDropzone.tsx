import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon } from "lucide-react";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  file: File | null;
  previewUrl: string | null;
  formatLabel: string | null;
}

export default function FileDropzone({
  onFile,
  file,
  previewUrl,
  formatLabel,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [],
      "image/heic": [".heic", ".heif"],
      "image/heif": [".heic", ".heif"],
    },
  });

  const inputProps = getInputProps({ "aria-label": "Upload an image file" });

  if (file && previewUrl) {
    return (
      <div className="relative group">
        <div
          {...getRootProps()}
          className="rounded-lg border bg-card overflow-hidden cursor-pointer"
        >
          <input {...inputProps} />
          <div className="flex items-center gap-4 p-4">
            <img
              src={previewUrl}
              alt={`Preview of ${file.name}`}
              className="h-20 w-20 rounded object-cover border bg-muted"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatLabel} · {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              Click or drop to replace
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        rounded-lg border-2 border-dashed p-12 text-center cursor-pointer
        transition-colors
        ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
      `}
    >
      <input {...inputProps} />
      <div className="flex flex-col items-center gap-3">
        {isDragActive ? (
          <>
            <ImageIcon className="h-10 w-10 text-primary" />
            <p className="text-lg font-medium">Drop your image here</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">
              Drop an image here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WebP, HEIC, TIFF, AVIF, BMP, GIF, SVG, ICO
            </p>
          </>
        )}
      </div>
    </div>
  );
}
