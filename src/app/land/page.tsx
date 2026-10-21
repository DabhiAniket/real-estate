import CollectionPage from "@/components/property/CollectionPage";

export const metadata = {
  title: "Land & Development",
  description: "Plots and parcels for development, with site information and enquiry details.",
  alternates: { canonical: "/land" },
  openGraph: { title: "Land & Development", description: "Plots and parcels for development, with site information and enquiry details.", url: "/land" },
};

export default function Page() {
  return (
    <CollectionPage
      category="land"
      title="Land & Development"
      intro="Plots and parcels with the groundwork done, ready for planning."
      image="/images/property_land_aerial.jpg"
      imageAlt="Aerial view of a coastal development site"
    />
  );
}
