'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';

const navLinks = [
  { label: 'Услуги', href: '#services' },
  { label: 'О нас', href: '#about' },
  { label: 'Галерея', href: '#gallery' },
  { label: 'Отзывы', href: '#testimonials' },
  { label: 'Контакты', href: '#contacts' },
  { label: 'Соцсети', href: '/social' },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5 text-primary-foreground"
              aria-hidden="true"
            >
              <path d="M12 19c-4 0-7-2-7-5s3-5 7-5 7 2 7 5-3 5-7 5z" />
              <path d="M5 14c-1.5-1-2-3-1-5 1.5-3 5.5-5 9-4" />
              <path d="M19 14c1.5-1 2-3 1-5-1.5-3-5.5-5-9-4" />
            </svg>
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            Brow & Lip
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:block">
          <Button asChild variant="primary" size="md">
            <a href="#booking">Записаться</a>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex size-10 items-center justify-center rounded-lg lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 12h16" />
              <path d="M4 6h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-6 lg:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-medium text-foreground hover:text-primary"
              >
                {link.label}
              </a>
            ))}
            <Button asChild variant="primary" size="lg" className="mt-4">
              <a href="#booking">Записаться на консультацию</a>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
