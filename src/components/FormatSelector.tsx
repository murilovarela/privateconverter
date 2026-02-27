import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FORMATS, type FormatId } from "@/lib/formats";

interface FormatSelectorProps {
  formats: FormatId[];
  highlightedFormat?: FormatId;
  convertingTo: FormatId | null;
  onSelect: (format: FormatId) => void;
}

export default function FormatSelector({
  formats,
  highlightedFormat,
  convertingTo,
  onSelect,
}: FormatSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground text-center">
        Convert to:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {formats.map((id) => {
          const isConverting = convertingTo === id;
          const isHighlighted = highlightedFormat === id;
          return (
            <Button
              key={id}
              variant={isHighlighted ? "default" : "outline"}
              size="sm"
              disabled={convertingTo !== null}
              onClick={() => onSelect(id)}
              className="min-w-[72px]"
            >
              {isConverting ? (
                <Spinner className="h-4 w-4" />
              ) : (
                FORMATS[id].label
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
