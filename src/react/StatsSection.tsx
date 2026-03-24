'use client';

import React from 'react';

interface StatsItem {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats: StatsItem[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative -mt-10 px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="editorial-panel relative overflow-hidden rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-[radial-gradient(circle_at_left,rgba(182,106,89,0.18),transparent_70%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-8 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full border border-primary/10" aria-hidden="true" />

          <div className="mb-5 flex flex-col gap-3 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="section-label">Studioul in cifre</span>
              <h2 className="mt-4 max-w-xl font-serif text-3xl font-semibold tracking-tight text-card-foreground sm:text-4xl">
                O prezenta eleganta, construita cu precizie si incredere.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Fiecare tratament porneste de la consultatie, studiul fetei si o tehnica calibrata pentru un efect rafinat.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="rounded-[1.6rem] border border-border/80 bg-white/55 px-4 py-5 shadow-[0_14px_30px_-24px_rgba(33,24,19,0.45)] backdrop-blur-sm"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${index * 0.12}s, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${index * 0.12}s`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="font-serif text-5xl font-semibold leading-none text-card-foreground sm:text-6xl">
                    {stat.value}
                  </div>
                  <span className="rounded-full border border-primary/14 bg-primary/6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                    Brow & Lip
                  </span>
                </div>
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
