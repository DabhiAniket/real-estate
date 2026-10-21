import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/enquiry";

const LINKS = [
  { label: "Residential", href: "/residential" },
  { label: "Commercial", href: "/commercial" },
  { label: "Land", href: "/land" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

async function copyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export default async function Footer() {
  const year = await copyrightYear();
  return (
    <footer className="border-t border-stone-subtle bg-charcoal-dark text-linen">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-start md:justify-between">
        <Link href="/" aria-label="Home" className="relative block h-10 w-32">
          <Image src="/logo.png" alt="" fill sizes="128px" className="object-contain object-left" />
        </Link>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-linen-muted">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-linen">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-linen underline decoration-copper underline-offset-4 hover:text-winter">
          {CONTACT_EMAIL}
        </a>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-stone-subtle px-4 py-6 text-xs text-stone-arch sm:px-6">
        <span>© {year} Real Estate Atelier</span>
        <span className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-linen">Privacy</Link>
          <Link href="/terms-and-conditions" className="hover:text-linen">Terms</Link>
          <a href="/textures/CREDITS.json" className="hover:text-linen">3D asset credits</a>
        </span>
      </div>
    </footer>
  );
}
