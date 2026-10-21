import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "About",
  description: "How we present residential, commercial and land properties — with honest photography and walk-through 3D models.",
  alternates: { canonical: "/about" },
};

const APPROACH = [
  ["Shown as it is", "Real photography and a 3D model you can walk through, so you understand a property before you visit."],
  ["One point of contact", "One person follows your enquiry from the first conversation to the final paperwork."],
  ["Residential, commercial and land", "Homes, workplaces and development plots, presented with the same care."],
];

export default function AboutPage() {
  return (
    <main className="bg-charcoal pt-28 sm:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="label text-winter">About</p>
          <h1 className="mt-4 max-w-4xl text-5xl text-linen sm:text-7xl">Property, presented with care.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-linen-muted">
            We present architect-designed homes, workplaces and land — clearly, honestly and in enough detail that you can
            decide with confidence.
          </p>
        </Reveal>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-12 sm:mt-24">
          <Reveal className="relative aspect-[4/5] overflow-hidden lg:col-span-5">
            <Image
              src="/images/about_architect.jpg"
              alt="An architect reviewing a scale model in the studio"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal as="ul" className="divide-y divide-stone-subtle border-y border-stone-subtle">
              {APPROACH.map(([title, text]) => (
                <li key={title} className="py-8">
                  <h2 className="text-3xl text-linen">{title}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-linen-muted">{text}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </div>

      <Reveal as="section" className="mt-24 border-t border-stone-subtle">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-16 sm:px-6">
          <p className="max-w-xl font-serif text-3xl text-linen">Have a property in mind?</p>
          <Link href="/contact" className="btn-copper">
            Get in touch
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
