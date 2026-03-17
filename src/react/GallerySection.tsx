'use client';

import React from 'react';

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
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="gallery" className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
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
          <span className="section-label">Наши работы</span>
          <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Портфолио мастеров
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Каждая работа — это результат точного подбора формы, цвета и техники
            под индивидуальные черты лица
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.src}
              className={`group relative overflow-hidden rounded-2xl bg-muted ${
                index === 0 || index === 5 ? 'aspect-[4/5]' : 'aspect-square'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
                transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s`,
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-700"
                style={{ transform: hoveredIndex === index ? 'scale(1.04)' : 'scale(1)' }}
              />
              {/* Always-on subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 flex flex-col justify-end bg-black/0 transition-all duration-500"
                style={{ backgroundColor: hoveredIndex === index ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)' }}
              >
                <p
                  className="px-4 pb-4 pt-2 text-sm font-medium text-white"
                  style={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    transform: hoveredIndex === index ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 0.35s ease, transform 0.35s ease',
                  }}
                >
                  {image.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
