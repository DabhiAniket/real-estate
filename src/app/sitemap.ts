import type { MetadataRoute } from "next";
import { PROPERTIES } from "@/data/properties";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/residential", "/commercial", "/land", "/about", "/contact", "/privacy-policy", "/terms-and-conditions"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...PROPERTIES.map((p) => ({ url: `${SITE_URL}/properties/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
