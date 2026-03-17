'use client';

import React from 'react';
import { ServiceCard } from './ServiceCard';

export interface Service {
  id: string;
  data: {
    name: string;
    description: string;
    price: number;
    duration: number;
    image: string;
    order?: number;
    isActive: boolean;
  };
}

interface ServicesListProps {
  services: Service[];
}

export function ServicesList({ services }: ServicesListProps) {
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

  const activeServices = services.filter((service) => service.data.isActive);

  return (
    <section id="services" className="section-shell px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div
          ref={headerRef}
          className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div>
            <span className="section-label">Trattamenti</span>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Sopracciglia e labbra disegnate per il tuo viso.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            Selezioniamo forma, intensita e tono per un risultato sofisticato, equilibrato e sempre personale.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              title={service.data.name}
              description={service.data.description}
              image={service.data.image}
              items={[{ name: service.data.name, price: service.data.price }]}
              badge={index === 0 ? 'Signature' : undefined}
              index={index}
              featured={index === 0}
              meta={index === 0 ? 'Most requested' : index === 1 ? 'Soft technique' : 'Tailored look'}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Non sai quale tecnica scegliere?{' '}
            <a href="#booking" className="font-semibold text-primary transition-colors hover:text-primary/80">
              Prenota una consulenza guidata
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
