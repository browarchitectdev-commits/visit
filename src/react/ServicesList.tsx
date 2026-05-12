'use client';

import { ServiceCard } from './ServiceCard';
import { useInViewOnce } from './hooks/useInViewOnce';

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
  const { ref: headerRef, visible } = useInViewOnce<HTMLDivElement>();

  const activeServices = services.filter((service) => service.data.isActive);

  return (
    <section id="services" data-section-cinema className="section-shell relative overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="kinetic-lines opacity-35" aria-hidden="true" />
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
            <span className="section-label">Servizi</span>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Sopracciglia e labbra disegnate per i tuoi lineamenti.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            Scegliamo forma, intensita e tonalita per un risultato sofisticato, equilibrato e personale.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeServices.map((service, index) => (
            <div
              key={service.id}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible
                  ? 'translate3d(0, 0, 0)'
                  : `translate3d(${index % 2 === 0 ? '-46px' : '46px'}, 42px, 0)`,
                transition: `opacity 1.35s cubic-bezier(0.16,1,0.3,1) ${0.22 + index * 0.18}s, transform 1.35s cubic-bezier(0.16,1,0.3,1) ${0.22 + index * 0.18}s`,
              }}
            >
              <ServiceCard
                title={service.data.name}
                description={service.data.description}
                image={service.data.image}
                items={[{ name: service.data.name, price: service.data.price }]}
                badge={index === 0 ? 'Signature' : undefined}
                index={index}
                featured={index === 0}
                meta={index === 0 ? 'Piu richiesto' : index === 1 ? 'Tecnica soft' : 'Look su misura'}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
