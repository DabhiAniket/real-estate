import React from "react";
import HeroSection from "@/components/home/HeroSection";
import ArchitecturalAssemblySection from "@/components/architectural-3d/ArchitecturalAssemblySection";
import InteriorRevealSection from "@/components/home/InteriorRevealSection";
import WalkInsideSection from "@/components/home/WalkInsideSection";
import PropertyCollectionSection from "@/components/home/PropertyCollectionSection";
import SelectedPropertiesSection from "@/components/home/SelectedPropertiesSection";
import ConsultationSection from "@/components/home/ConsultationSection";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import WalkthroughHost from "@/components/villa/WalkthroughHost";

export const metadata = {
  title: { absolute: "Real Estate Atelier | Architectural Homes with 3D Walkthroughs" },
  description:
    "Architect-designed residences, commercial developments and land. Watch a villa assemble from foundation to finish, then walk through every room in 3D.",
  alternates: { canonical: "/" },
};

const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

export default function HomePage() {
  return (
    <main className="w-full flex flex-col bg-charcoal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_LD) }} />
      {/* 01 Hero · 02 The build + 03 The reveal · 04 Walk inside · 05 Interiors
          06 Collection · 07 Selected properties · 08 Contact · 09 Footer (layout) */}
      <HeroSection />
      <ArchitecturalAssemblySection />
      <WalkInsideSection />
      <InteriorRevealSection />
      <PropertyCollectionSection />
      <SelectedPropertiesSection />
      <ConsultationSection />

      {/* Full-screen first-person walkthrough (opened from the hero or the assembly) */}
      <WalkthroughHost />
    </main>
  );
}
