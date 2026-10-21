import CollectionPage from "@/components/property/CollectionPage";

export const metadata = {
  title: "Commercial",
  description: "Workplaces and retail buildings with location and specification details.",
  alternates: { canonical: "/commercial" },
  openGraph: { title: "Commercial", description: "Workplaces and retail buildings with location and specification details.", url: "/commercial" },
};

export default function Page() {
  return (
    <CollectionPage
      category="commercial"
      title="Commercial"
      intro="Workplaces and retail buildings in established city locations."
      image="/images/property_comm_hq.jpg"
      imageAlt="Glazed office building"
    />
  );
}
