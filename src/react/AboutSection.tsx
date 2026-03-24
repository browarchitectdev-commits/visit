'use client';

import React from 'react';

const features = [
  {
    title: 'Specialiste certificate',
    description: 'Formare continua, ochi estetic si atentie deplina la naturaletea rezultatului.',
  },
  {
    title: 'Pigmenti selectati',
    description: 'Texturi stabile si nuante gandite pentru a pune in valoare tenul, buzele si sprancenele.',
  },
  {
    title: 'Igiena riguroasa',
    description: 'Materiale de unica folosinta, proceduri controlate si un cadru privat pentru o experienta impecabila.',
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
    <section id="about" ref={sectionRef} className="section-shell px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
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
            <div className="editorial-panel relative overflow-hidden rounded-[2.25rem] p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-muted">
                <img src={image} alt="Studioul Brow & Lip" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,12,9,0.06)_0%,rgba(19,12,9,0.38)_100%)]" />
              </div>
            </div>

            <div className="editorial-panel absolute -bottom-5 right-0 max-w-[15rem] rounded-[1.6rem] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Abordare personalizata</p>
              <p className="mt-2 font-serif text-2xl font-semibold text-card-foreground">8+ ani</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                de experienta in evidentierea trasaturilor, formei si culorii cu delicatete.
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
            <span className="section-label">Studioul</span>
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
                  className="editorial-panel rounded-[1.5rem] p-4"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(16px)',
                    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${0.34 + fi * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${0.34 + fi * 0.1}s`,
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
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

