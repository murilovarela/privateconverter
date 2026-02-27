import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Zap, Upload, MousePointerClick, Download } from "lucide-react";
import { getConversionPairs, FORMATS } from "@/lib/formats";
import Converter from "@/components/Converter";

const pairs = getConversionPairs();

const imageToImage = pairs.filter((p) => p.to !== "pdf");
const imageToPdf = pairs.filter((p) => p.to === "pdf");

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>ConverterPrivacy - Convert Files Privately in Your Browser</title>
        <meta
          name="description"
          content="Free online file converter that runs entirely in your browser. Convert images between PNG, JPG, WebP, HEIC, TIFF, AVIF, and more. 100% private — no uploads, no servers."
        />
        <link rel="canonical" href="https://freeprivateconverter.com" />
        <meta property="og:title" content="ConverterPrivacy - Convert Files Privately in Your Browser" />
        <meta property="og:description" content="Free online file converter that runs entirely in your browser. 100% private — no uploads, no servers." />
        <meta property="og:url" content="https://freeprivateconverter.com" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "ConverterPrivacy",
            description: "Free online file converter that runs entirely in your browser. 100% private.",
            url: "https://freeprivateconverter.com",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          })}
        </script>
      </Helmet>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Convert files privately, right in your browser
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Your files never leave your device. No uploads, no servers, no
            tracking. Just drop a file and pick a format.
          </p>

          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>100% Private</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-primary" />
              <span>No uploads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span>Instant conversion</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Converter />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-10 text-center">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">1. Drop your file</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop any image into the converter, or click to browse.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MousePointerClick className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">2. Pick a format</h3>
              <p className="text-sm text-muted-foreground">
                Choose your desired output format from the available options.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">3. Download instantly</h3>
              <p className="text-sm text-muted-foreground">
                Your converted file downloads automatically. Nothing was uploaded.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Image to Image
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {imageToImage.map((pair) => (
              <Link key={pair.slug} to={`/${pair.slug}`}>
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-3 text-center text-sm font-medium">
                    Convert {FORMATS[pair.from].label} to {FORMATS[pair.to].label}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Image to PDF
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {imageToPdf.map((pair) => (
              <Link key={pair.slug} to={`/${pair.slug}`}>
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-3 text-center text-sm font-medium">
                    Convert {FORMATS[pair.from].label} to PDF
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
