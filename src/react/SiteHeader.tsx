'use client';

import { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Trattamenti', href: '#services' },
  { label: 'Studio', href: '#about' },
  { label: 'Portfolio', href: '#gallery' },
  { label: 'Team', href: '#masters' },
  { label: 'Social', href: '/social' },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const headerTextClass = scrolled ? 'text-foreground' : 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]';
  const mutedTextClass = scrolled ? 'text-muted-foreground' : 'text-white/88 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]';
  const borderClass = scrolled ? 'border-border/70 bg-white/40' : 'border-white/18 bg-white/10';
  const mobilePanelClass = scrolled ? 'bg-background/90' : 'bg-[#1f1612]/84';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'color-mix(in oklab, var(--background) 86%, transparent)'
          : 'linear-gradient(180deg, rgba(18,12,10,0.82) 0%, rgba(18,12,10,0.5) 62%, rgba(18,12,10,0.16) 100%)',
        backdropFilter: 'blur(18px)',
        boxShadow: scrolled ? '0 12px 34px -28px rgba(33,24,19,0.4)' : 'none',
        animation: 'fadeInUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#" className="group flex items-center gap-3">
          <div
            className="relative flex size-11 items-center justify-center overflow-hidden rounded-full border border-white/20 shadow-[0_16px_28px_-18px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-[1.06] group-hover:rotate-[4deg]"
            style={{ animation: 'floatMedium 7s ease-in-out infinite' }}
          >
            <img
              src="/images/about.jpg"
              alt="Brow & Lip Studio"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,12,10,0.05)_0%,rgba(18,12,10,0.34)_100%)]" />
            <div className="absolute inset-0 rounded-full ring-1 ring-white/25" />
          </div>
          <div>
            <span className={`block font-serif text-xl font-semibold tracking-tight transition-colors duration-300 ${headerTextClass}`}>
              Brow & Lip
            </span>
            <span className={`block text-[10px] font-semibold uppercase tracking-[0.26em] transition-colors duration-300 ${mutedTextClass}`}>
              Permanent Beauty Studio
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
            >
              <span
                className={`transition-colors duration-300 ${
                  scrolled ? 'text-muted-foreground group-hover:text-foreground' : 'text-white/88 group-hover:text-white'
                }`}
              >
                {link.label}
              </span>
              <span
                className={`absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                  scrolled ? 'bg-primary/70' : 'bg-white/75'
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <a
            href="#booking"
            className={`btn-shimmer inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
              scrolled
                ? 'bg-foreground text-background hover:opacity-92'
                : 'border border-white/18 bg-white/12 text-white backdrop-blur-md hover:bg-white/18'
            }`}
          >
            Prenota ora
          </a>
        </div>

        <button
          className={`flex size-10 items-center justify-center rounded-full transition-colors lg:hidden ${borderClass} ${headerTextClass}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 12h16" />
              <path d="M4 6h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t backdrop-blur-lg lg:hidden ${scrolled ? 'border-border/40' : 'border-white/10'} ${mobilePanelClass}`}
        style={{
          maxHeight: mobileOpen ? '420px' : '0px',
          transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
                scrolled ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/8'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#booking"
            onClick={() => setMobileOpen(false)}
            className={`btn-shimmer mt-3 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
              scrolled
                ? 'bg-foreground text-background'
                : 'border border-white/15 bg-white/12 text-white'
            }`}
          >
            Prenota una consulenza
          </a>
        </nav>
      </div>
    </header>
  );
}
