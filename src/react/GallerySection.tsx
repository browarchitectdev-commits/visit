'use client';

import React from 'react';
import { ProgressiveImage } from './ProgressiveImage';

interface GallerySectionProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
}

export function GallerySection({ images }: GallerySectionProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
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

  return (
    <section id="gallery" data-section-cinema className="section-shell relative px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[32rem] -translate-x-1/2 bg-[radial-gradient(circle,rgba(224,188,145,0.18),transparent_68%)] blur-[38px]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl">
        <div
          ref={headerRef}
          className="mb-7 grid gap-4 lg:mb-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div>
            <span className="section-label">Portofoliu</span>
            <h2 className="mt-4 font-serif text-[2.35rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              O selectie de detalii, tonuri si transformari delicate.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
            Galeria functioneaza ca o revista vizuala: contraste de format, prim-planuri si rezultate care raman elegante.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-12 lg:grid-rows-3">
          {images.map((image, index) => {
            const layoutClass =
              index === 0
                ? 'col-span-2 lg:col-span-5 lg:row-span-3 aspect-[4/5]'
                : index === 1
                  ? 'col-span-1 lg:col-span-4 lg:row-span-1 aspect-[4/3]'
                  : index === 2
                    ? 'col-span-1 lg:col-span-3 lg:row-span-2 aspect-[4/5]'
                    : index === 3
                      ? 'col-span-2 lg:col-span-4 lg:row-span-1 aspect-[16/10]'
                      : index === 4
                        ? 'col-span-1 lg:col-span-3 lg:row-span-1 aspect-square'
                        : 'col-span-1 lg:col-span-4 lg:row-span-1 aspect-[4/3]';

            return (
              <div
                key={image.src}
                className={`cinematic-card group glass-sheen shine-border relative overflow-hidden rounded-[1.45rem] bg-muted sm:rounded-[1.9rem] ${layoutClass}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                  transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s`,
                }}
              >
                <ProgressiveImage
                  src={image.src}
                  alt={image.alt}
                  className="cinematic-media h-full w-full object-cover transition-transform duration-700"
                  style={{ transform: hoveredIndex === index ? 'scale(1.06)' : 'scale(1)' }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,9,8,0.06)_0%,rgba(13,9,8,0.62)_100%)]" />
                <div className="absolute left-3 top-3 rounded-full border border-white/16 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.22em]">
                  {index === 0 ? 'Rezultat definitoriu' : 'Detaliu editorial'}
                </div>
                <div
                  className="absolute inset-x-0 bottom-0 p-3 transition-all duration-500 sm:p-4"
                  style={{
                    transform: hoveredIndex === index ? 'translateY(0)' : 'translateY(8px)',
                    opacity: hoveredIndex === index ? 1 : 0.9,
                  }}
                >
                  <div className="cinematic-panel rounded-[1.1rem] border border-white/12 bg-black/18 px-3 py-2.5 backdrop-blur-md sm:rounded-[1.35rem] sm:px-4 sm:py-3">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/48 sm:text-[10px] sm:tracking-[0.22em]">
                      {index === 0 ? 'Compozitie principala' : 'Portofoliul studioului'}
                    </p>
                    <p className="mt-1 text-xs font-medium text-white sm:text-sm">{image.alt}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
