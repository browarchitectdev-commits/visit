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
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="services" className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
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
          <span className="section-label">Услуги и цены</span>
          <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Идеальные брови и губы
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
            Подберём технику, форму и оттенок, которые подчеркнут вашу индивидуальность
            и будут радовать вас каждый день
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.filter(s => s.data.isActive).map((service, index) => (
            <ServiceCard
              key={service.id}
              title={service.data.name}
              description={service.data.description}
              image={service.data.image}
              items={[
                { name: service.data.name, price: service.data.price },
              ]}
              index={index}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Не уверены, какая процедура подойдёт?{' '}
            <a href="#booking" className="font-semibold text-primary hover:underline">
              Запишитесь на бесплатную консультацию
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
