'use client';

import React from 'react';
import { ServiceCard } from './ServiceCard';
import { TelegramIcon } from './TelegramIcon';

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
  bookingUrl?: string;
  telegramUrl?: string;
}

export function ServicesList({ services, bookingUrl, telegramUrl }: ServicesListProps) {
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
            <span className="section-label">Servicii</span>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Sprancene si buze conturate pentru trasaturile tale.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            Alegem forma, intensitatea si nuanta pentru un rezultat sofisticat, echilibrat si personal.
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

        <div className="mt-8 rounded-[2rem] border border-border/70 bg-white/65 p-6 text-center shadow-[0_24px_70px_-50px_rgba(73,45,28,0.4)] sm:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Rezervare</p>
          <h3 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Alege modul in care vrei sa rezervi
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Daca stii deja serviciul dorit, deschide direct calendarul. Daca vrei sa ne scrii intai, foloseste Telegram si alegem impreuna varianta potrivita.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-all duration-300 hover:opacity-92"
              >
                Rezerva prin calendar
              </a>
            )}
            {telegramUrl && (
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#229ED9]/20 bg-[#229ED9] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#1c8fc4]"
              >
                <TelegramIcon />
                Scrie-ne pe Telegram
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
