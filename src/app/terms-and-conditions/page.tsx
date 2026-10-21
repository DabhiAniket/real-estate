import LegalPage from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms for using this website and its property information, photography and 3D models.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="October 2026"
      sections={[
        {
          title: "Using this website",
          body: ["By using this website you agree to these terms. If you do not agree, please do not use the site."],
        },
        {
          title: "Property information",
          body: [
            "Descriptions, photographs, floor plans and 3D models are provided to help you understand a property. They are not an offer or part of any contract, and details such as dimensions, finishes and availability may change. Please confirm anything important with us before relying on it.",
          ],
        },
        {
          title: "The 3D model",
          body: [
            "The walk-through house is a visualisation. Furniture, landscaping and materials are illustrative. Third-party textures and models used in it are credited on the 3D asset credits page.",
          ],
        },
        {
          title: "Content ownership",
          body: ["Text, photography and models on this site may not be copied or republished without permission, except for third-party assets released under their own licences."],
        },
        {
          title: "Governing law",
          body: ["These terms are governed by the laws of India."],
        },
      ]}
    />
  );
}
