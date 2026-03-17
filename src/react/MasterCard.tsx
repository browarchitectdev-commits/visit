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
}

export function MasterCard({
  name,
  position,
  experience,
  bio,
  photo,
  instagram,
  telegram,
  index = 0,
}: MasterCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/90"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered
          ? '0 12px 32px -14px rgba(163,87,100,0.16), 0 6px 16px -8px rgba(0,0,0,0.08)'
          : '0 1px 6px -3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.5s ease, transform 0.5s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Photo fills the full card */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
        />
        {/* Base gradient always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Hover overlay — slides up bio + social */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 transition-all duration-500"
          style={{
            transform: isHovered ? 'translateY(0)' : 'translateY(0)',
          }}
        >
          {/* Name & position — always visible */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-white leading-tight">{name}</h3>
            <p className="mt-1 text-sm font-medium text-primary-foreground/80">{position}</p>
            <p className="text-xs text-white/50 mt-0.5">Опыт: {experience} {experience === 1 ? 'год' : experience < 5 ? 'года' : 'лет'}</p>
          </div>

          {/* Bio — slides in on hover */}
          <p
            className="text-sm leading-relaxed text-white/80 transition-all duration-500"
            style={{
              maxHeight: isHovered ? '80px' : '0px',
              opacity: isHovered ? 1 : 0,
              overflow: 'hidden',
            }}
          >
            {bio}
          </p>

          {/* Social links — appear on hover */}
          {(instagram || telegram) && (
            <div
              className="flex gap-2 transition-all duration-500"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
              }}
            >
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
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
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
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
