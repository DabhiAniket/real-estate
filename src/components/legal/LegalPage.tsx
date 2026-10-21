import { CONTACT_EMAIL } from "@/lib/enquiry";

export interface LegalSection {
  title: string;
  body: string[];
  list?: string[];
}

export default function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <main className="bg-charcoal pt-28 pb-24 sm:pt-36">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="label text-winter">Legal</p>
        <h1 className="mt-4 text-5xl text-linen sm:text-6xl">{title}</h1>
        <p className="mt-4 text-base text-stone-arch">Last updated {updated}</p>
        <div className="mt-14 space-y-12">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-3xl text-linen">
                {i + 1}. {s.title}
              </h2>
              {s.body.map((p) => (
                <p key={p} className="mt-4 text-lg leading-relaxed text-linen-muted">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-lg leading-relaxed text-linen-muted marker:text-copper">
                  {s.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        <p className="mt-16 border-t border-stone-subtle pt-8 text-lg text-linen-muted">
          Questions about this page:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-linen underline decoration-winter underline-offset-4">
            {CONTACT_EMAIL}
          </a>
        </p>
      </article>
    </main>
  );
}
