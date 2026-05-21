'use client';

import { useInViewOnce } from './hooks/useInViewOnce';

interface StatsItem {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats: StatsItem[];
}

export function StatsSection({ stats }: StatsSectionProps) {
  const { ref: sectionRef, visible } = useInViewOnce<HTMLElement>(0.15);

  return (
    <section ref={sectionRef} className="relative -mt-10 px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="editorial-panel chromatic-frame color-sweep relative overflow-hidden rounded-[2rem] px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-[radial-gradient(circle_at_left,rgba(193,95,100,0.2),transparent_70%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-8 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full border border-primary/10" aria-hidden="true" />
          <div className="motion-ribbon-field opacity-50" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="mb-5 flex flex-col gap-3 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="section-label">Lo studio in numeri</span>
              <h2 className="mt-4 max-w-xl font-serif text-3xl font-semibold tracking-tight text-card-foreground sm:text-4xl">
                Una presenza elegante, costruita con precisione e fiducia.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Ogni trattamento parte dalla consulenza, dallo studio del viso e da una tecnica calibrata per un effetto raffinato.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="color-sweep rounded-[1.6rem] border border-border/80 bg-white/58 px-4 py-5 shadow-[0_14px_30px_-24px_rgba(33,24,19,0.45)] backdrop-blur-sm"
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
                  <span className="rounded-full border border-primary/14 bg-[linear-gradient(135deg,rgba(193,95,100,0.1),rgba(243,208,140,0.18))] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                    Brow & Lip & Eyeliner
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
