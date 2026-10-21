import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { Property } from "@/data/properties";

/** Editorial listing row: large image, short facts, two clear actions. */
export default function PropertyRow({ property: p, flip = false, priority = false }: { property: Property; flip?: boolean; priority?: boolean }) {
  return (
    <Reveal as="article" className="grid items-end gap-6 lg:grid-cols-12 lg:gap-12">
      <Link href={`/properties/${p.slug}`} className={`group relative block aspect-[3/2] overflow-hidden bg-charcoal-dark lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
        <Image
          src={p.image}
          alt={`${p.title}, ${p.location}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <p className="label">{p.propertyType}</p>
        <h3 className="mt-3 text-3xl text-linen sm:text-4xl">{p.title}</h3>
        <p className="mt-2 text-base text-stone-arch">{p.location}</p>
        <p className="mt-5 text-base leading-relaxed text-linen-muted sm:text-lg">{p.tagline}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href={`/properties/${p.slug}`} className="btn-copper">
            View property
          </Link>
          <Link href={`/contact?property=${p.slug}`} className="text-base text-linen underline decoration-winter underline-offset-[6px] hover:text-winter">
            Enquire
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
