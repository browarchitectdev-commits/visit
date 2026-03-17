'use client';

import React, { useState, useEffect } from 'react';

const navLinks = [
  { label: 'Услуги', href: '#services' },
  { label: 'О нас', href: '#about' },
  { label: 'Галерея', href: '#gallery' },
  { label: 'Мастера', href: '#masters' },
  { label: 'Соцсети', href: '/social' },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: 'color-mix(in oklab, var(--background) 90%, transparent)',
        backdropFilter: 'blur(14px)',
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.06)' : '0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="group flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 text-primary-foreground"
              aria-hidden="true"
            >
              <path d="M12 19c-4 0-7-2-7-5s3-5 7-5 7 2 7 5-3 5-7 5z" />
              <path d="M5 14c-1.5-1-2-3-1-5 1.5-3 5.5-5 9-4" />
              <path d="M19 14c1.5-1 2-3 1-5-1.5-3-5.5-5-9-4" />
            </svg>
          </div>
          <span
            className="font-serif text-lg font-bold tracking-tight text-foreground transition-colors duration-500"
          >
            Brow & Lip
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:block">
          <a
            href="#booking"
            className="btn-shimmer inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-300 hover:opacity-90"
          >
            Записаться
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex size-10 items-center justify-center rounded-lg lg:hidden transition-colors"
          style={{ color: 'var(--foreground)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
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

      {/* Mobile nav */}
      <div
        className="overflow-hidden border-t border-border/40 bg-background/95 backdrop-blur-lg lg:hidden"
        style={{
          maxHeight: mobileOpen ? '400px' : '0px',
          transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#booking"
            onClick={() => setMobileOpen(false)}
            className="btn-shimmer mt-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Записаться на консультацию
          </a>
        </nav>
      </div>
    </header>
  );
}

