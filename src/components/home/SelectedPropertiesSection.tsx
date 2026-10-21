import SceneLabel from "./SceneLabel";
import PropertyRow from "@/components/property/PropertyRow";
import Reveal from "@/components/Reveal";
import { PROPERTIES } from "@/data/properties";

export default function SelectedPropertiesSection() {
  const featured = PROPERTIES.filter((p) => p.isFeatured).slice(0, 3);
  const list = featured.length ? featured : PROPERTIES.slice(0, 3);
  return (
    <section aria-labelledby="selected-heading" className="bg-charcoal py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SceneLabel n="07">Selected properties</SceneLabel>
          <h2 id="selected-heading" className="mt-4 text-4xl text-linen sm:text-6xl">
            Currently presenting
          </h2>
        </Reveal>
        <div className="mt-16 space-y-24 sm:space-y-32">
          {list.map((p, i) => (
            <PropertyRow key={p.slug} property={p} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
