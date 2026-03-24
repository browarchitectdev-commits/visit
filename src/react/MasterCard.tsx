'use client';

import React from 'react';

interface MasterCardProps {
  name: string;
  position: string;
  experience: number;
  bio: string;
  photo: string;
  instagram?: string;
  telegram?: string;
  index?: number;
  featured?: boolean;
}

export function MasterCard({
  name,
  position,
  experience,
  bio,
  photo,
  instagram,
  telegram,
  featured = false,
}: MasterCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <article
      className={`group shine-border relative overflow-hidden rounded-[1.75rem] border border-white/18 bg-card/15 sm:rounded-[2rem] ${
        featured ? 'sm:col-span-2 lg:col-span-2 lg:grid lg:grid-cols-[1.05fr_0.95fr]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered
          ? '0 30px 58px -32px rgba(44,27,18,0.56)'
          : '0 18px 42px -34px rgba(44,27,18,0.44)',
        transition: 'box-shadow 0.45s ease, transform 0.45s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div className={`relative overflow-hidden bg-muted ${featured ? 'aspect-[4/4.4] sm:aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-[3/4]'}`}>
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.04)' : 'scale(1)' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,7,0.05)_0%,rgba(10,8,7,0.78)_100%)]" />

        <div className="absolute left-4 top-4 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm">
          {featured ? 'Fondatoare' : 'Echipa Brow & Lip'}
        </div>

        {featured && (
          <div className="absolute bottom-3 left-3 right-3 rounded-[1.2rem] border border-white/14 bg-black/20 px-3 py-2.5 text-white backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:rounded-[1.35rem] sm:px-4 sm:py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Prezenta definitorie</p>
            <p className="mt-1 text-sm font-medium">Precizie estetica, mana sigura, ton natural.</p>
          </div>
        )}
      </div>

      <div className={`flex flex-col justify-end p-4 sm:p-5 ${featured ? 'bg-[linear-gradient(180deg,rgba(255,251,247,0.94),rgba(247,238,232,0.86))] lg:p-6' : ''}`}>
        <div className={`rounded-[1.35rem] border ${featured ? 'border-border/70 bg-white/54' : 'border-white/12 bg-black/18'} p-3.5 backdrop-blur-md sm:rounded-[1.6rem] sm:p-4`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={`font-serif text-[1.8rem] font-semibold leading-tight sm:text-3xl ${featured ? 'text-card-foreground' : 'text-white'}`}>{name}</h3>
              <p className={`mt-1 text-sm font-medium ${featured ? 'text-muted-foreground' : 'text-white/76'}`}>{position}</p>
            </div>
            <div className="text-right">
              <p className={`text-[10px] uppercase tracking-[0.24em] ${featured ? 'text-muted-foreground' : 'text-white/42'}`}>Experienta</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-[#d09b72]">{experience}+</p>
            </div>
          </div>

          <p
            className={`mt-3 text-sm leading-relaxed transition-all duration-500 ${featured ? 'text-card-foreground/78' : 'text-white/76'}`}
            style={{
              maxHeight: isHovered || featured ? '112px' : '0px',
              opacity: isHovered || featured ? 1 : 0,
              overflow: 'hidden',
            }}
          >
            {bio}
          </p>

          {(instagram || telegram) && (
            <div
              className="mt-3 flex gap-2 transition-all duration-500"
              style={{
                opacity: isHovered || featured ? 1 : 0,
                transform: isHovered || featured ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors sm:size-9 ${
                    featured ? 'bg-foreground text-background hover:opacity-88' : 'bg-white/12 text-white hover:bg-white/24'
                  }`}
                  aria-label="Instagram"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {telegram && (
                <a
                  href={telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors sm:size-9 ${
                    featured ? 'bg-foreground text-background hover:opacity-88' : 'bg-white/12 text-white hover:bg-white/24'
                  }`}
                  aria-label="Telegram"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.328-.373-.115l-6.869 4.332-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.54-.203 1.01.122.84 1.125z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
