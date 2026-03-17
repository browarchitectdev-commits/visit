'use client';

import React from 'react';

interface HeroSectionProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
}

export function HeroSection({
  title,
  description,
  ctaText = 'Записаться на консультацию',
  ctaHref = '#booking',
  secondaryCTA,
  backgroundImage = '/images/hero.jpg',
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-16">
      {/* Background image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Интерьер студии"
            className="h-full w-full object-cover"
          />
          {/* Directional gradient — darker on the left (text side) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>
      )}

      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[110px]"
        style={{ animation: 'floatSlow 9s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 right-1/3 h-[320px] w-[320px] rounded-full bg-rose-400/12 blur-[90px]"
        style={{ animation: 'floatMedium 6s ease-in-out 2.5s infinite' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[12%] top-[22%] h-40 w-40 rounded-full border border-white/10"
        style={{ animation: 'floatFast 4s ease-in-out 1s infinite' }}
        aria-hidden="true"
      />

      {/* Decorative concentric rings (top-right) */}
      <div
        className="pointer-events-none absolute right-10 top-28 hidden opacity-20 lg:block"
        aria-hidden="true"
      >
        <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
          <circle cx="70" cy="70" r="65" stroke="white" strokeWidth="0.6" />
          <circle cx="70" cy="70" r="46" stroke="white" strokeWidth="0.6" />
          <circle cx="70" cy="70" r="28" stroke="white" strokeWidth="0.6" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <span
            className="mb-6 inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55"
            style={{ animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
          >
            Студия перманентного макияжа
          </span>
          <h1
            className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.28s both' }}
          >
            {title}
          </h1>
          <p
            className="mt-6 max-w-lg text-base leading-relaxed text-white/72 sm:text-lg"
            style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.46s both' }}
          >
            {description}
          </p>
          <div
            className="mt-10 flex flex-wrap gap-4"
            style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.64s both' }}
          >
            <a
              href={ctaHref}
              className="btn-shimmer relative inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-300 hover:scale-[1.04] hover:shadow-xl hover:shadow-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {ctaText}
            </a>
            {secondaryCTA && (
              <a
                href={secondaryCTA.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/55 hover:bg-white/15"
              >
                {secondaryCTA.text}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        style={{ animation: 'fadeIn 1s ease 1.9s both' }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/38">
            Листайте
          </span>
          <div className="relative h-12 w-px overflow-hidden bg-white/20">
            <div
              className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-white/70 to-transparent"
              style={{ animation: 'scrollLine 1.8s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

