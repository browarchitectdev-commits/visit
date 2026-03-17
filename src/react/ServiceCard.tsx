'use client';

import { useState } from 'react';

interface ServiceItem {
  name: string;
  price: number;
}

interface ServiceCardProps {
  title: string;
  description: string;
  image: string;
  items: ServiceItem[];
  badge?: string;
  index?: number;
  featured?: boolean;
  meta?: string;
}

export function ServiceCard({
  title,
  description,
  image,
  items,
  badge,
  featured = false,
  meta,
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => `EUR ${price.toLocaleString('it-IT')}`;

  return (
    <article
      className={`group editorial-panel shine-border relative flex h-full flex-col overflow-hidden rounded-[2rem] transition-all duration-500 ${
        featured ? 'sm:col-span-2 lg:col-span-2 lg:grid lg:grid-cols-[1.15fr_0.85fr]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 28px 52px -30px rgba(54, 35, 25, 0.45)'
          : '0 18px 38px -32px rgba(54, 35, 25, 0.42)',
      }}
    >
      <div className={`relative overflow-hidden bg-muted ${featured ? 'aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-[4/4.8]'}`}>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,10,8,0.02)_0%,rgba(14,10,8,0.55)_100%)]" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
            Trattamento
          </span>
          {badge && (
            <span className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground shadow-sm">
              {badge}
            </span>
          )}
        </div>
        {featured && (
          <div className="absolute bottom-4 left-4 right-4 rounded-[1.35rem] border border-white/14 bg-black/20 px-4 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Best for</p>
            <p className="mt-1 text-sm font-medium text-white">Chi desidera una presenza definita ma sempre naturale.</p>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-4 p-5 ${featured ? 'justify-between lg:p-6' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-[1.9rem] font-semibold leading-tight tracking-tight text-card-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            {meta && (
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                {meta}
              </p>
            )}
          </div>
          <span className="text-gradient font-serif text-3xl font-semibold">
            {featured ? '01' : `0${items.length}`}
          </span>
        </div>

        <div className="mt-auto rounded-[1.4rem] border border-border/70 bg-white/45 p-4">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4 py-1.5">
              <span className="text-sm text-card-foreground">{item.name}</span>
              <span className="font-serif text-2xl font-semibold text-primary">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>

        <div className={`flex ${featured ? 'flex-col gap-3 sm:flex-row' : ''}`}>
          <a
            href="#booking"
            className={`btn-shimmer inline-flex items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background transition-all duration-300 hover:opacity-92 ${
              featured ? 'sm:flex-1' : 'w-full'
            }`}
          >
            Prenota il trattamento
          </a>
          {featured && (
            <span className="inline-flex items-center justify-center rounded-full border border-border/70 bg-white/55 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:w-auto">
              Editorial choice
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
