import Image from "next/image";
import Link from "next/link";
import SceneLabel from "./SceneLabel";
import Reveal from "@/components/Reveal";

const COLLECTIONS = [
  {
    href: "/residential",
    title: "Residential",
    line: "Villas, penthouses and family homes.",
    image: "/images/property_res_villa.jpg",
    alt: "Contemporary villa with a lit interior at dusk",
  },
  {
    href: "/commercial",
    title: "Commercial",
    line: "Workplaces and retail buildings.",
    image: "/images/property_comm_hq.jpg",
    alt: "Glazed commercial office building",
  },
  {
    href: "/land",
    title: "Land & Development",
    line: "Plots and parcels ready for planning.",
    image: "/images/property_land_aerial.jpg",
    alt: "Aerial view of a coastal development site",
  },
];

export default function PropertyCollectionSection() {
  return (
    <section aria-labelledby="collection-heading" className="bg-charcoal-dark">
      <Reveal className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pt-32">
        <SceneLabel n="06">The collection</SceneLabel>
        <h2 id="collection-heading" className="mt-4 text-4xl text-linen sm:text-6xl">
          Three ways in
        </h2>
      </Reveal>
      {COLLECTIONS.map((c) => (
        <Link key={c.href} href={c.href} className="group relative block h-[62svh] min-h-[22rem] overflow-hidden border-t border-stone-subtle">
          <Image src={c.image} alt={c.alt} fill sizes="100vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/85 via-charcoal-dark/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl items-end justify-between gap-6 px-4 pb-10 sm:px-6">
            <div>
              <h3 className="text-5xl text-linen sm:text-7xl">{c.title}</h3>
              <p className="mt-3 text-lg text-linen-muted">{c.line}</p>
            </div>
            <span className="hidden shrink-0 text-base text-linen underline decoration-winter underline-offset-[6px] sm:inline group-hover:text-winter">
              View →
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
