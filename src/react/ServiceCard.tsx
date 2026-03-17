'use client';

import React, { useState } from 'react';

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
}

export function ServiceCard({
  title,
  description,
  image,
  items,
  badge,
  index = 0,
}: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => `${price.toLocaleString('ru-RU')} ₽`;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered
          ? '0 10px 28px -12px rgba(163, 87, 100, 0.16), 0 4px 12px -6px rgba(0,0,0,0.08)'
          : '0 1px 6px -3px rgba(0,0,0,0.06)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.04)' : 'scale(1)' }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-500"
          style={{ opacity: isHovered ? 0.6 : 0.3 }}
        />
        {badge && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="font-serif text-2xl font-bold tracking-tight text-card-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-auto space-y-2">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-2">
              <span className="text-sm text-card-foreground">{item.name}</span>
              <span className="font-serif text-lg font-bold text-primary">{formatPrice(item.price)}</span>
            </div>
          ))}
          <div className="h-px bg-border" />
        </div>

        <a
          href="#booking"
          className="btn-shimmer mt-2 inline-flex w-full items-center justify-center rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Записаться
        </a>
      </div>
    </article>
  );
}
