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
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="masters" className="bg-secondary/20 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          ref={headerRef}
          className="mb-10 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <span className="section-label">Наша команда</span>
          <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Сертифицированные мастера
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            Специалисты с многолетним опытом и постоянно повышаемой квалификацией.
            Каждый мастер работает в своей специализации.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {masters.filter(m => m.data.isActive).map((master, index) => (
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
