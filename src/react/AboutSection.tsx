'use client';

import React from 'react';

const features = [
  {
    title: 'Сертифицированные мастера',
    description:
      'Наши специалисты прошли обучение у лучших тренеров индустрии и регулярно повышают квалификацию.',
  },
  {
    title: 'Премиальные пигменты',
    description:
      'Работаем только с органическими пигментами ведущих мировых брендов, которые не меняют цвет со временем.',
  },
  {
    title: 'Полная стерильность',
    description:
      'Одноразовые расходники, автоклав и строгое соблюдение санитарных норм для вашей безопасности.',
  },
];

interface AboutSectionProps {
  image: string;
  title: string;
  description: string[];
}

export function AboutSection({ image, title, description }: AboutSectionProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image with decorative frame */}
          <div
            className="relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-32px)',
              transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
            }}
          >
            {/* Offset decorative border */}
            <div className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl border-2 border-primary/20" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-xl shadow-black/10">
              <img
                src={image}
                alt="О нашей студии"
                className="h-full w-full object-cover"
              />
              {/* Subtle gradient overlay on lower-left (decorative) */}
              <div className="absolute bottom-0 left-0 h-1/3 w-2/3 bg-gradient-to-tr from-primary/15 to-transparent" />
            </div>
            {/* Floating accent badge */}
            <div className="absolute -left-5 top-12 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg shadow-black/8">
              <span className="text-2xl font-serif font-bold text-primary">8+</span>
              <span className="max-w-[90px] text-xs leading-tight text-muted-foreground">лет опыта в индустрии</span>
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(32px)',
              transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.22s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.22s',
            }}
          >
            <span className="section-label">О нашей студии</span>
            <h2 className="mt-5 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {title}
            </h2>
            <div className="mt-6 space-y-4">
              {description.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base leading-relaxed text-muted-foreground lg:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-5">
              {features.map((feature, fi) => (
                <div
                  key={feature.title}
                  className="flex gap-4"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(16px)',
                    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${0.4 + fi * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.4 + fi * 0.1}s`,
                  }}
                >
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

