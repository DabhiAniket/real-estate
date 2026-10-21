"use client";

import { useEffect, useState } from "react";
import SceneLabel from "./SceneLabel";
import Reveal from "@/components/Reveal";
import { CONTACT_EMAIL, INTERESTS, validateEnquiry, type Enquiry, type EnquiryErrors } from "@/lib/enquiry";

type Status = "idle" | "sending" | "sent" | "not_configured" | "failed";

const EMPTY: Enquiry = { name: "", email: "", phone: "", interest: INTERESTS[0], message: "" };

export default function ConsultationSection({ label = true, property, heading = "Arrange a private viewing" }: { label?: boolean; property?: { slug: string; title: string }; heading?: string }) {
  const [form, setForm] = useState<Enquiry>(
    property ? { ...EMPTY, property: property.slug, interest: "Residential", message: `I'd like to know more about ${property.title}.` } : EMPTY,
  );
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    // pre-fill the property when arriving from "Enquire" on a listing
    const fromQuery = new URLSearchParams(window.location.search).get("property");
    if (fromQuery && !property) queueMicrotask(() => setForm((f) => ({ ...f, property: fromQuery, interest: "Residential", message: `I'd like to know more about ${fromQuery.replace(/-/g, " ")}.` })));
  }, [property]);

  const set = (k: keyof Enquiry) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateEnquiry(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) setStatus("sent");
      else if (res.status === 503) setStatus("not_configured");
      else if (res.status === 422) {
        setErrors((await res.json()).errors ?? {});
        setStatus("idle");
      } else setStatus("failed");
    } catch {
      setStatus("failed");
    }
  };

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Enquiry — ${form.interest}`)}&body=${encodeURIComponent(
    `${form.message}\n\n${form.name}\n${form.email}${form.phone ? `\n${form.phone}` : ""}`,
  )}`;

  const field = "w-full border-b border-stone-subtle bg-transparent py-3 text-base text-linen placeholder:text-stone-arch focus:border-winter focus:outline-none";

  return (
    <section id="contact" aria-labelledby="contact-heading" className="bg-charcoal-dark py-24 sm:py-32">
      <Reveal className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {label && <SceneLabel n="08">Contact</SceneLabel>}
          <h2 id="contact-heading" className="mt-4 text-4xl leading-tight text-linen sm:text-6xl">
            {heading}
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-linen-muted">
            Tell us what you are looking for and we will reply by email.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-8 inline-block text-linen underline decoration-copper underline-offset-4 hover:text-winter">
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="lg:col-span-7">
          {status === "sent" ? (
            <p role="status" className="font-serif text-2xl text-linen">Thank you — your enquiry has been received. We will be in touch by email.</p>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-7 sm:grid-cols-2">
              {([
                ["name", "Name", "text", "name"],
                ["email", "Email", "email", "email"],
                ["phone", "Phone (optional)", "tel", "tel"],
              ] as const).map(([k, label, type, auto]) => (
                <div key={k} className={k === "phone" ? "sm:col-span-1" : ""}>
                  <label htmlFor={`f-${k}`} className="label block">{label}</label>
                  <input
                    id={`f-${k}`}
                    type={type}
                    autoComplete={auto}
                    value={form[k]}
                    onChange={set(k)}
                    aria-invalid={!!errors[k]}
                    aria-describedby={errors[k] ? `e-${k}` : undefined}
                    className={field}
                  />
                  {errors[k] && <p id={`e-${k}`} className="mt-2 text-sm text-error">{errors[k]}</p>}
                </div>
              ))}
              <div>
                <label htmlFor="f-interest" className="label block">Interested in</label>
                <select id="f-interest" value={form.interest} onChange={set("interest")} className={`${field} [&>option]:bg-charcoal-dark`}>
                  {INTERESTS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-message" className="label block">Message</label>
                <textarea id="f-message" rows={3} value={form.message} onChange={set("message")} aria-invalid={!!errors.message} className={`${field} resize-none`} />
                {errors.message && <p className="mt-2 text-sm text-error">{errors.message}</p>}
              </div>
              <div className="sm:col-span-2 flex flex-wrap items-center gap-6">
                <button type="submit" disabled={status === "sending"} className="btn-copper disabled:opacity-60">
                  {status === "sending" ? "Sending…" : "Send enquiry"}
                </button>
                {status === "not_configured" && (
                  <p role="status" className="text-sm text-linen-muted">
                    Online enquiries aren&apos;t connected yet — <a href={mailto} className="text-linen underline">send this by email</a> instead.
                  </p>
                )}
                {status === "failed" && (
                  <p role="alert" className="text-sm text-error">
                    We couldn&apos;t send that. Please try again or <a href={mailto} className="underline">email us</a>.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
