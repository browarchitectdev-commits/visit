'use client';

import { TelegramIcon } from './TelegramIcon';

const footerLinks = [
  { label: 'Servicii', href: '#services' },
  { label: 'Studio', href: '#about' },
  { label: 'Portofoliu', href: '#gallery' },
  { label: 'Echipa', href: '#masters' },
  { label: 'Social', href: '/social' },
];

interface SiteFooterProps {
  telegramUrl?: string;
}

export function SiteFooter({ telegramUrl }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-border/80 bg-[#201713] text-white">
      <div className="pointer-events-none absolute left-0 top-0 h-48 w-48 bg-[radial-gradient(circle,rgba(224,188,145,0.18),transparent_66%)] blur-[40px]" aria-hidden="true" />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e0bc91]/70 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
          <div>
            <a href="#" className="inline-flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_18px_32px_-18px_rgba(182,106,89,0.8)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M12 19c-4 0-7-2-7-5s3-5 7-5 7 2 7 5-3 5-7 5z" />
                  <path d="M5 14c-1.5-1-2-3-1-5 1.5-3 5.5-5 9-4" />
                  <path d="M19 14c1.5-1 2-3 1-5-1.5-3-5.5-5-9-4" />
                </svg>
              </div>
              <div>
                <span className="block font-serif text-2xl font-semibold text-white">Brow & Lip Studio</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.26em] text-white/42">
                  Frumusete permanenta in Italia
                </span>
              </div>
            </a>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/62">
              Studio de machiaj permanent pentru sprancene si buze: atmosfera discreta, tehnici delicate si rezultate elegante create pe masura.
            </p>

            <div className="mt-5 flex gap-2.5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/72 transition-all hover:border-[#e0bc91]/40 hover:bg-white/12 hover:text-white"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/72 transition-all hover:border-[#e0bc91]/40 hover:bg-white/12 hover:text-white"
                  aria-label="Telegram"
                >
                  <TelegramIcon />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Navigare</h4>
            <nav className="mt-5 flex flex-col gap-3">
              {footerLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-white/68 transition-colors hover:text-white">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Contacte</h4>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/68">
              <a href="tel:+390000000000" className="transition-colors hover:text-white">
                +39 000 000 0000
              </a>
              <a href="mailto:ciao@browlip.it" className="transition-colors hover:text-white">
                ciao@browlip.it
              </a>
              <p>Italia, doar cu programare</p>
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-white/10" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/42">
            &copy; {currentYear} Brow & Lip Studio. Toate drepturile rezervate.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-xs text-white/42 transition-colors hover:text-white">
              Politica de confidentialitate
            </a>
            <a href="/terms" className="text-xs text-white/42 transition-colors hover:text-white">
              Termeni de utilizare
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
