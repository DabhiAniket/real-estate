import ConsultationSection from "@/components/home/ConsultationSection";

export const metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description: "Arrange a private viewing or ask about a residential, commercial or land property.",
};

export default function ContactPage() {
  return (
    <main className="w-full bg-charcoal-dark pt-24 text-linen">
      <h1 className="sr-only">Contact</h1>
      <ConsultationSection label={false} />
    </main>
  );
}
