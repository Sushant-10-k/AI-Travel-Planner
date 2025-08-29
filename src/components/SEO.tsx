import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
}

function upsertLinkRel(rel: string, href: string) {
  let link = document.head.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export default function SEO({ title, description, canonical, image }: SEOProps) {
  useEffect(() => {
    document.title = title;

    upsertMeta("meta[name='description']", { name: "description", content: description });

    upsertMeta("meta[property='og:title']", { property: "og:title", content: title });
    upsertMeta("meta[property='og:description']", { property: "og:description", content: description });
    upsertMeta("meta[property='og:type']", { property: "og:type", content: "website" });
    if (image) upsertMeta("meta[property='og:image']", { property: "og:image", content: image });

    upsertMeta("meta[name='twitter:card']", { name: "twitter:card", content: "summary_large_image" });
    upsertMeta("meta[name='twitter:title']", { name: "twitter:title", content: title });
    upsertMeta("meta[name='twitter:description']", { name: "twitter:description", content: description });
    if (image) upsertMeta("meta[name='twitter:image']", { name: "twitter:image", content: image });

    const url = canonical || window.location.href;
    upsertLinkRel("canonical", url);

    const ldId = "ld-json-seo";
    const existing = document.getElementById(ldId);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = ldId;
    script.type = "application/ld+json";
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      url,
      description,
      applicationCategory: "TravelApplication",
      potentialAction: {
        "@type": "SearchAction",
        target: `${url}?q={query}`,
        "query-input": "required name=query"
      }
    };
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }, [title, description, canonical, image]);

  return null;
}
