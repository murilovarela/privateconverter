import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import {
  parseSlug,
  getConversionSEO,
  getConversionPairs,
  FORMATS,
  type FormatId,
} from "@/lib/formats";
import Converter from "@/components/Converter";
import NotFoundPage from "./NotFoundPage";

function getRelatedPairs(from: FormatId, to: FormatId) {
  return getConversionPairs()
    .filter((p) => (p.from === from || p.to === to) && p.slug !== `${from}-to-${to}`)
    .slice(0, 10);
}

export default function ConverterPage() {
  const { slug } = useParams<{ slug: string }>();
  const parsed = slug ? parseSlug(slug) : null;

  if (!parsed) return <NotFoundPage />;

  const { from, to } = parsed;
  const seo = getConversionSEO(from, to);
  const related = getRelatedPairs(from, to);

  const fromLabel = FORMATS[from].label;
  const toLabel = FORMATS[to].label;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: seo.title,
      description: seo.description,
      url: seo.canonical,
      applicationCategory: "UtilityApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to convert ${fromLabel} to ${toLabel}`,
      step: [
        { "@type": "HowToStep", name: "Upload", text: `Drop your ${fromLabel} file into the converter` },
        { "@type": "HowToStep", name: "Convert", text: `Click the ${toLabel} button to start conversion` },
        { "@type": "HowToStep", name: "Download", text: "Your converted file downloads automatically" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://converterprivacy.com" },
        { "@type": "ListItem", position: 2, name: seo.heading, item: seo.canonical },
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={seo.canonical} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={seo.canonical} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-center">
          {seo.heading}
        </h1>
        <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
          {seo.description}
        </p>

        <Converter defaultFrom={from} defaultTo={to} />

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-lg font-semibold mb-4">Related conversions</h2>
            <div className="flex flex-wrap gap-2">
              {related.map((pair) => (
                <Link key={pair.slug} to={`/${pair.slug}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent transition-colors"
                  >
                    {FORMATS[pair.from].label} → {FORMATS[pair.to].label}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
