import React from "react";
import { notFound } from "next/navigation";
import { PROPERTIES } from "@/data/properties";
import Link from "next/link";
import PropertyGallery from "./PropertyGallery";
import ConsultationSection from "@/components/home/ConsultationSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PROPERTIES.map((property) => ({
    slug: property.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const property = PROPERTIES.find((p) => p.slug === slug);
  if (!property) return { title: "Property Not Found" };

  return {
    title: `${property.title} | Luxury Real Estate`,
    alternates: { canonical: `/properties/${property.slug}` },
    description: property.tagline,
    openGraph: {
      title: property.title,
      description: property.tagline,
      images: [{ url: property.image }],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = PROPERTIES.find((p) => p.slug === slug);

  if (!property) {
    notFound();
  }

  const images = [...new Set([property.image, ...property.gallery, ...(property.blueprintImage ? [property.blueprintImage] : [])])];
  const facts: [string, string | number | undefined][] = [
    ["Type", property.propertyType],
    ["Location", property.location],
    ["Area", property.area],
    ["Bedrooms", property.bedrooms],
    ["Bathrooms", property.bathrooms],
    ["Completed", property.yearBuilt],
    ["Price", property.price],
  ];
  const back = { residential: "/residential", commercial: "/commercial", land: "/land" }[property.category];

  return (
    <main className="bg-charcoal pt-28 sm:pt-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link href={back} className="text-sm text-linen-muted hover:text-linen">
          ← Back to {property.category === "land" ? "land" : property.category}
        </Link>
        <p className="label mt-10">{property.propertyType}</p>
        <h1 className="mt-3 text-5xl text-linen sm:text-7xl">{property.title}</h1>
        <p className="mt-3 text-lg text-stone-arch">{property.location}</p>

        <div className="mt-10">
          <PropertyGallery images={images} title={property.title} />
        </div>

        <div className="grid gap-14 py-16 sm:py-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-3xl text-linen">About the property</h2>
            <p className="mt-6 text-lg leading-relaxed text-linen-muted">{property.description}</p>
          </div>
          <dl className="divide-y divide-stone-subtle border-y border-stone-subtle lg:col-span-5">
            {facts
              .filter(([, v]) => v !== undefined && v !== "")
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-4">
                  <dt className="text-base text-stone-arch">{k}</dt>
                  <dd className="text-right text-base text-linen">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
      <ConsultationSection label={false} property={{ slug: property.slug, title: property.title }} heading={`Enquire about ${property.title}`} />
    </main>
  );
}
