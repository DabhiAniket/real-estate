import Image from "next/image";
import Link from "next/link";
import PropertyRow from "./PropertyRow";
import Reveal from "@/components/Reveal";
import { PROPERTIES, type Property } from "@/data/properties";

export default function CollectionPage({
  category,
  title,
  intro,
  image,
  imageAlt,
}: {
  category: Property["category"];
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
}) {
  const list = PROPERTIES.filter((p) => p.category === category);
  return (
    <main className="bg-charcoal">
      <section className="relative isolate flex min-h-[70svh] items-end overflow-hidden">
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/20" />
        <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 sm:pb-20">
          <p className="label text-winter">Collection</p>
          <h1 className="mt-4 text-5xl text-linen sm:text-7xl">{title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-linen-muted">{intro}</p>
        </div>
      </section>

      <section aria-label={`${title} properties`} className="mx-auto max-w-7xl space-y-24 px-4 py-20 sm:px-6 sm:py-28">
        {list.length ? (
          list.map((p, i) => <PropertyRow key={p.slug} property={p} flip={i % 2 === 1} priority={i === 0} />)
        ) : (
          <p className="text-lg text-linen-muted">New properties are being prepared for this collection.</p>
        )}
      </section>

      <Reveal as="section" className="border-t border-stone-subtle">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-16 sm:px-6">
          <p className="max-w-xl text-2xl text-linen font-serif">Looking for something not listed here?</p>
          <Link href="/contact" className="btn-outline-stone">
            Talk to us
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
