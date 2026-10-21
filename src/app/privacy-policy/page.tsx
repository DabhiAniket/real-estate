import LegalPage from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description: "What information this website collects, why, and how to have it removed.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 2026"
      sections={[
        {
          title: "What we collect",
          body: ["When you send an enquiry, we receive the details you enter in the form:"],
          list: ["your name and email address", "your phone number, if you choose to give it", "what you are interested in and your message"],
        },
        {
          title: "How we use it",
          body: [
            "Only to reply to your enquiry and to arrange viewings you ask for. We do not sell or rent your details, and we do not add you to marketing lists without asking.",
          ],
        },
        {
          title: "Your browser",
          body: [
            "The 3D tour remembers where you were standing for the current browser session so you can resume it. This stays in your browser and is cleared when you close it. The site does not use advertising or tracking cookies.",
          ],
        },
        {
          title: "Keeping and removing your details",
          body: [
            "We keep enquiry details only as long as needed to deal with your enquiry. You can ask us at any time to see, correct or delete what we hold about you.",
          ],
        },
      ]}
    />
  );
}
