'use client';

import React from 'react';
import { MasterCard } from './MasterCard';

export interface Master {
  id: string;
  data: {
    name: string;
    position: string;
    experience: number;
    bio: string;
    photo: string;
    instagram?: string;
    telegram?: string;
    order?: number;
    isActive: boolean;
  };
}

interface MastersListProps {
  masters: Master[];
}

export function MastersList({ masters }: MastersListProps) {
  const headerRef = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const activeMasters = masters.filter((master) => master.data.isActive);

  return (
    <section id="masters" data-section-cinema className="section-shell relative overflow-hidden bg-secondary/45 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 bg-[radial-gradient(circle,rgba(182,106,89,0.16),transparent_66%)] blur-[40px]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-64 w-64 bg-[radial-gradient(circle,rgba(217,189,147,0.18),transparent_66%)] blur-[44px]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <div
          ref={headerRef}
          className="mb-7 grid gap-4 lg:mb-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div>
            <span className="section-label">Echipa</span>
            <h2 className="mt-4 font-serif text-[2.35rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Specialiste care lucreaza cu precizie, atentie si bun gust.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            O echipa selectata care imbina tehnica, viziunea estetica si un mod de lucru atent si discret.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeMasters.map((master, index) => (
            <MasterCard
              key={master.id}
              name={master.data.name}
              position={master.data.position}
              experience={master.data.experience}
              bio={master.data.bio}
              photo={master.data.photo}
              instagram={master.data.instagram}
              telegram={master.data.telegram}
              index={index}
              featured={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
