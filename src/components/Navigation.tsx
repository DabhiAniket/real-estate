"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Residential", href: "/residential" },
  { label: "Commercial", href: "/commercial" },
  { label: "Land", href: "/land" },
  { label: "About", href: "/about" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "bg-charcoal-dark/92 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Home" className="relative h-9 w-28 sm:h-11 sm:w-32">
          <Image src="/logo.png" alt="" fill priority sizes="128px" className="object-contain object-left" />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-9">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`text-sm tracking-wide transition-colors ${pathname === l.href ? "text-linen" : "text-linen-muted hover:text-linen"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/contact" className="border border-copper px-5 py-2 text-sm tracking-wide text-linen hover:bg-copper hover:text-charcoal-dark transition-colors">
            Enquire
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="md:hidden px-2 py-2 text-sm uppercase tracking-widest text-linen"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Primary" className="md:hidden border-t border-stone-subtle px-4 pb-8 pt-4">
          {[...LINKS, { label: "Enquire", href: "/contact" }].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 font-serif text-2xl text-linen">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
