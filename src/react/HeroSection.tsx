'use client';

interface HeroSectionProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCTA?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
}

const trustItems = [
  'Consulenza personalizzata',
  'Pigmenti premium',
  'Studio riservato in Italia',
];

const heroHighlights = [
  { label: 'Effetto', value: 'Soft definition' },
  { label: 'Durata media', value: '2h sessione' },
  { label: 'Style note', value: 'Eleganza naturale' },
];

export function HeroSection({
  title,
  description,
  ctaText = 'Prenota una consulenza',
  ctaHref = '#booking',
  secondaryCTA,
  backgroundImage = '/images/hero.jpg',
}: HeroSectionProps) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {backgroundImage && (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Interno dello studio Brow & Lip"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,12,10,0.84)_0%,rgba(18,12,10,0.6)_38%,rgba(18,12,10,0.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(224,188,145,0.18),transparent_26%),linear-gradient(180deg,rgba(18,12,10,0.1)_0%,rgba(18,12,10,0.54)_100%)]" />
        </div>
      )}

      <div
        className="pointer-events-none absolute -right-24 top-24 h-[28rem] w-[28rem] rounded-full bg-[#e0bc91]/18 blur-[110px]"
        style={{ animation: 'floatSlow 9s ease-in-out infinite' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[6%] top-[22%] h-36 w-36 rounded-full border border-white/10"
        style={{ animation: 'floatMedium 6s ease-in-out infinite' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.08fr)_23rem]">
          <div className="max-w-3xl">
            <span
              className="mb-5 inline-flex max-w-full rounded-full border border-white/15 bg-white/8 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72 backdrop-blur-sm sm:px-4 sm:text-[11px] sm:tracking-[0.3em]"
              style={{
                animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 2px 10px rgba(0,0,0,0.35)',
              }}
            >
              Trucco permanente per sopracciglia e labbra
            </span>

            <h1
              className="max-w-3xl font-serif text-[3.2rem] font-semibold leading-[0.92] tracking-[-0.04em] text-white sm:text-6xl lg:text-[5.7rem]"
              style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.24s both' }}
            >
              {title}
            </h1>

            <p
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/74 sm:mt-6 sm:text-lg"
              style={{
                animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.38s both',
                color: 'rgba(255,255,255,0.9)',
                textShadow: '0 2px 12px rgba(0,0,0,0.42)',
              }}
            >
              {description}
            </p>

            <div
              className="mt-7 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3"
              style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.52s both' }}
            >
              {trustItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-[11px] font-medium text-white/78 backdrop-blur-sm sm:px-3.5 sm:text-xs"
                  style={{
                    color: 'rgba(255,255,255,0.92)',
                    textShadow: '0 2px 8px rgba(0,0,0,0.34)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e0bc91]" />
                  {item}
                </span>
              ))}
            </div>

            <div
              className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
              style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.66s both' }}
            >
              <a
                href={ctaHref}
                className="btn-shimmer inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_20px_44px_-18px_rgba(182,106,89,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_54px_-22px_rgba(182,106,89,0.8)] sm:w-auto sm:px-8"
              >
                {ctaText}
              </a>
              {secondaryCTA && (
                <a
                  href={secondaryCTA.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/24 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/42 hover:bg-white/14 sm:w-auto sm:px-8"
                >
                  {secondaryCTA.text}
                </a>
              )}
            </div>

            <div
              className="mt-8 grid max-w-2xl gap-3 sm:mt-10 sm:grid-cols-3"
              style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.78s both' }}
            >
              {heroHighlights.map((item, index) => (
                <div
                  key={item.label}
                  className="shine-border rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-3.5 backdrop-blur-md sm:rounded-[1.5rem] sm:py-4"
                  style={{ animationDelay: `${index * 0.8}s` }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45"
                    style={{ color: 'rgba(255,255,255,0.58)' }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="mt-2 font-serif text-xl font-semibold text-white"
                    style={{ color: 'rgba(255,255,255,0.96)', textShadow: '0 2px 10px rgba(0,0,0,0.36)' }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="editorial-panel shine-border relative mt-8 overflow-hidden rounded-[1.8rem] p-3 lg:hidden"
              style={{ animation: 'fadeInUp 0.85s cubic-bezier(0.16,1,0.3,1) 0.84s both' }}
            >
              <div className="grid grid-cols-[5.5rem_1fr] items-center gap-3 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,251,247,0.18),rgba(255,251,247,0.08))] p-2.5">
                <div className="overflow-hidden rounded-[1.2rem]">
                  <img
                    src="/images/director.jpg"
                    alt="Direttrice Brow & Lip Studio"
                    className="h-28 w-full object-cover object-top"
                  />
                </div>
                <div className="pr-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/52">
                    Founder / Direttrice
                  </p>
                  <p className="mt-2 font-serif text-2xl font-semibold leading-none text-white">
                    Brow & Lip
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/76">
                    Il volto dello studio, con una visione elegante e calibrata su ogni cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="parallax-soft relative hidden lg:block"
            style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.78s both' }}
          >
            <div className="editorial-panel shine-border relative overflow-hidden rounded-[2.3rem] p-3 shadow-[0_36px_70px_-34px_rgba(22,14,10,0.72)]">
              <div className="relative overflow-hidden rounded-[1.8rem] bg-[#d8b1a6]">
                <img
                  src="/images/director.jpg"
                  alt="Direttrice Brow & Lip Studio"
                  className="h-[34rem] w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,15,11,0.04)_0%,rgba(24,15,11,0.16)_52%,rgba(24,15,11,0.58)_100%)]" />
              </div>

              <div className="absolute inset-x-7 bottom-7 rounded-[1.7rem] border border-white/12 bg-[#1d140f]/54 p-5 text-white backdrop-blur-md">
                <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/48">
                  Founder / Direttrice Artistica
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-white">
                  Il volto dello studio e della sua visione estetica.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/76">
                  Un approccio femminile, preciso e raffinato per valorizzare ogni lineamento con equilibrio.
                </p>
              </div>
            </div>

            <div className="absolute -left-10 top-8 w-40 rounded-[1.5rem] border border-white/16 bg-[#2a1e19]/84 p-4 text-white shadow-[0_22px_42px_-26px_rgba(0,0,0,0.55)] backdrop-blur-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                Artistic direction
              </p>
              <p className="mt-2 font-serif text-2xl font-semibold text-white">
                Brow & Lip
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/72">
                Eleganza naturale, tono su misura, presenza impeccabile.
              </p>
            </div>

            <div className="absolute -bottom-6 right-5 rounded-[1.5rem] border border-white/12 bg-white/92 px-4 py-4 text-card-foreground shadow-[0_22px_44px_-28px_rgba(0,0,0,0.52)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Studio signature
              </p>
              <p className="mt-2 font-serif text-2xl font-semibold text-card-foreground">
                Precisione e bellezza
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 sm:block"
        style={{ animation: 'fadeIn 1s ease 1.2s both' }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/36">
            Scorri
          </span>
          <div className="relative h-12 w-px overflow-hidden bg-white/16">
            <div
              className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-transparent via-white/72 to-transparent"
              style={{ animation: 'scrollLine 1.8s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
