'use client';

import { ProgressiveImage } from './ProgressiveImage';
import { useInViewOnce } from './hooks/useInViewOnce';

const features = [
  {
    title: 'Specialiste certificate',
    description: 'Formazione continua, occhio estetico e attenzione piena alla naturalezza del risultato.',
  },
  {
    title: 'Pigmenti selezionati',
    description: 'Texture stabili e tonalità pensate per valorizzare incarnato, labbra e sopracciglia.',
  },
  {
    title: 'Igiene rigorosa',
    description: 'Materiali monouso, procedure controllate e un ambiente privato per un’esperienza impeccabile.',
  },
];

interface AboutSectionProps {
  image: string;
  title: string;
  description: string[];
}

export function AboutSection({ image, title, description }: AboutSectionProps) {
  const { ref: sectionRef, visible } = useInViewOnce<HTMLElement>();

  return (
    <section id="about" ref={sectionRef} data-section-cinema className="section-shell px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
          <div
            className="relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-32px)',
              transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.08s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.08s',
            }}
          >
            <div className="absolute -left-3 top-8 h-[68%] w-[88%] rounded-[2.25rem] border border-primary/18" />
            <div className="editorial-panel chromatic-frame relative overflow-hidden rounded-[2.25rem] p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-muted">
                <ProgressiveImage
                  src={image}
                  alt="Studio Brow & Lip"
                  className="cinematic-media h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,12,9,0.06)_0%,rgba(19,12,9,0.38)_100%)]" />
                <div className="kinetic-lines opacity-45" aria-hidden="true" />
              </div>
            </div>

            <div className="editorial-panel color-sweep absolute -bottom-5 right-0 max-w-[15rem] rounded-[1.6rem] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Approccio personalizzato</p>
              <p className="mt-2 font-serif text-2xl font-semibold text-card-foreground">8+ anni</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                di esperienza nel valorizzare lineamenti, forma e colore con delicatezza.
              </p>
            </div>
          </div>

          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(32px)',
              transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.18s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.18s',
            }}
          >
            <span className="section-label">Lo studio</span>
            <h2 className="mt-4 max-w-xl font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {title}
            </h2>
            <div className="mt-5 space-y-4">
              {description.map((paragraph, idx) => (
                <p key={idx} className="max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {features.map((feature, fi) => (
                <div
                  key={feature.title}
                  className="editorial-panel color-sweep rounded-[1.5rem] p-4"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(16px)',
                    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${0.34 + fi * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.34 + fi * 0.1}s`,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(193,95,100,0.13),rgba(243,208,140,0.2),rgba(147,182,154,0.14))] text-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-semibold text-card-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

