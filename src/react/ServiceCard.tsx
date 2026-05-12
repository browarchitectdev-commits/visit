import { ProgressiveImage } from './ProgressiveImage';

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
  bookingUrl?: string;
  telegramUrl?: string;
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
  const formatPrice = (price: number) => `EUR ${price.toLocaleString('it-IT')}`;

  return (
    <article
      className={`cinematic-card group editorial-panel chromatic-frame glass-sheen shine-border relative flex h-full flex-col overflow-hidden rounded-[2rem] ${
        featured ? 'sm:col-span-2 lg:col-span-2 lg:grid lg:grid-cols-[1.15fr_0.85fr]' : ''
      }`}
    >
      <div className={`relative overflow-hidden bg-muted ${featured ? 'aspect-[4/3] lg:aspect-auto lg:h-full' : 'aspect-[4/4.8]'}`}>
        <ProgressiveImage
          src={image}
          alt={title}
          className="cinematic-media h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,10,8,0.02)_0%,rgba(14,10,8,0.55)_100%)]" />
        <div className="motion-ribbon-field opacity-60" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
            Servizio
          </span>
          {badge && (
            <span className="rounded-full bg-[linear-gradient(135deg,var(--primary),var(--coral),var(--champagne))] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary-foreground shadow-sm">
              {badge}
            </span>
          )}
        </div>
        {featured && (
          <div className="absolute bottom-4 left-4 right-4 rounded-[1.35rem] border border-white/14 bg-black/20 px-4 py-3 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">Best for</p>
            <p className="mt-1 text-sm font-medium text-white">Per chi desidera un contorno definito, ma sempre naturale.</p>
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col gap-4 p-5 ${featured ? 'justify-between lg:p-6' : ''}`}>
        <div className="cinematic-copy flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-[1.9rem] font-semibold leading-tight tracking-tight text-card-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            {meta && <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">{meta}</p>}
          </div>
          <span className="text-gradient font-serif text-3xl font-semibold">
            {featured ? '01' : `0${items.length}`}
          </span>
        </div>

        <div className="cinematic-panel color-sweep mt-auto rounded-[1.4rem] border border-border/70 bg-white/48 p-4">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-4 py-1.5">
              <span className="text-sm text-card-foreground">{item.name}</span>
              <span className="text-gradient font-serif text-2xl font-semibold">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>

        {featured && (
          <div className="cinematic-copy flex items-center justify-start">
            <span className="inline-flex items-center justify-center rounded-full border border-border/70 bg-white/55 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:w-auto">
              Scelta editoriale
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
