'use client';

import { useEffect, useRef, useState } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function ProgressiveImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  skeletonClassName = '',
  style,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const webpSrc = /^\/(?:images|uploads)\/.+\.(?:jpe?g|png)$/i.test(src)
    ? src.replace(/\.(?:jpe?g|png)$/i, '.webp')
    : null;

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    if (image.complete && image.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  return (
    <div className={`media-shell ${loaded ? 'is-loaded' : ''} ${wrapperClassName}`.trim()}>
      <div className={`media-skeleton ${skeletonClassName}`.trim()} aria-hidden="true" />
      <picture>
        {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
          className={className}
          style={style}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </picture>
    </div>
  );
}
