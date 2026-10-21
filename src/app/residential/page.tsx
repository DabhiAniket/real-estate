import CollectionPage from "@/components/property/CollectionPage";

export const metadata = {
  title: "Residential",
  description: "Villas, penthouses and family homes, presented with photography and walk-through 3D models.",
  alternates: { canonical: "/residential" },
  openGraph: { title: "Residential", description: "Villas, penthouses and family homes, presented with photography and walk-through 3D models.", url: "/residential" },
};

export default function Page() {
  return (
    <CollectionPage
      category="residential"
      title="Residential"
      intro="Villas, penthouses and family homes — each one presented as it is, inside and out."
      image="/images/property_res_villa.jpg"
      imageAlt="Contemporary villa with lit interiors at dusk"
    />
  );
}
