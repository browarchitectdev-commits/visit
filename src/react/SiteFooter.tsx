'use client';

import { TelegramIcon } from './TelegramIcon';

const navigationLinks = [
  { label: 'Home', href: '/' },
  { label: 'Servizi', href: '/services' },
  { label: 'Portfolio', href: '/gallery' },
  { label: 'Social', href: '/social' },
  { label: 'Contatti', href: '/contacts' },
];

const studioDetails = [
  { label: 'Studio', value: 'Solo su appuntamento' },
  { label: 'Lun - Ven', value: '10:00 - 21:00' },
  { label: 'Sab - Dom', value: '11:00 - 20:00' },
];

interface SiteFooterProps {
  telegramUrl?: string;
  homeNavigation?: boolean;
}

export function SiteFooter({ telegramUrl }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();
  const ctaUrl = telegramUrl || '/contacts';

  return (
    <footer className="relative overflow-hidden border-t border-border/80 bg-[#201713] pb-20 text-white sm:pb-0">
      <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 bg-[radial-gradient(circle,rgba(224,188,145,0.18),transparent_66%)] blur-[44px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 bg-[radial-gradient(circle,rgba(193,95,100,0.16),transparent_70%)] blur-[54px]" aria-hidden="true" />
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e0bc91]/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <a href="/" className="inline-flex items-center gap-3">
              <div className="relative flex size-12 overflow-hidden rounded-full border border-white/15 shadow-[0_20px_34px_-20px_rgba(0,0,0,0.65)]">
                <img src="/images/about.jpg" alt="Brow & Lip Studio" className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,12,10,0.04),rgba(18,12,10,0.38))]" />
              </div>
              <div>
                <span className="block font-serif text-2xl font-semibold text-white">Brow & Lip Studio</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.26em] text-white/45">
                  Trucco permanente
                </span>
              </div>
            </a>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/62">
              Studio di trucco permanente per sopracciglia e labbra: consulenza attenta, atmosfera riservata e risultati naturali nel tempo.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={ctaUrl}
                target={ctaUrl.startsWith('http') || ctaUrl.startsWith('tg:') ? '_blank' : undefined}
                rel={ctaUrl.startsWith('http') || ctaUrl.startsWith('tg:') ? 'noopener noreferrer' : undefined}
                className="btn-shimmer inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#201713] transition-transform hover:-translate-y-0.5"
              >
                Prenota su Telegram
              </a>
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1c8fc4]"
                >
                  <TelegramIcon className="h-4 w-4" />
                  Telegram
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Navigazione</h4>
            <nav className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1" aria-label="Footer navigation">
              {navigationLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-white/68 transition-colors hover:text-white">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Contatti</h4>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/68">
              <a href="tel:+3513149394" className="transition-colors hover:text-white">
                +35 1314 9394
              </a>
              <a href="mailto:ciao@browlip.it" className="transition-colors hover:text-white">
                ciao@browlip.it
              </a>
              <a href="https://www.instagram.com/browarchitect.studio/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                Instagram
              </a>
              {telegramUrl && (
                <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                  Telegram
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Orari</h4>
            <div className="mt-5 space-y-2.5">
              {studioDetails.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/36">{item.label}</span>
                  <span className="mt-1 block text-sm font-semibold text-white/78">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="my-7 border-t border-white/10" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/42">
            &copy; {currentYear} Brow & Lip Studio. Tutti i diritti riservati.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="/privacy" className="text-xs text-white/42 transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="text-xs text-white/42 transition-colors hover:text-white">
              Termini di utilizzo
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
