import Image from 'next/image';
import Link from 'next/link';
import type { RecipeImage } from '@/types/recipe-image';

interface Props {
  image: RecipeImage;
  utmSource: string;
  variant: 'card' | 'hero';
  /** Optional fallback alt text if image.alt is empty */
  altFallback?: string;
  /** Whether to make photo credits clickable (default: true) */
  allowClickableCredits?: boolean;
}

export function RecipeImageWithCredit({ 
  image, 
  utmSource, 
  variant, 
  altFallback, 
  allowClickableCredits = true 
}: Props) {
  const isHero = variant === 'hero';
  const imgUrl = isHero ? image.urlRegular : image.urlSmall;
  const alt = image.alt || altFallback || '';

  const unsplashUrl = `https://unsplash.com/?utm_source=${utmSource}&utm_medium=referral`;

  const CreditLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    if (allowClickableCredits) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </a>
      );
    }
    return <span className="underline">{children}</span>;
  };

  return (
    <figure className={isHero ? 'relative w-full h-96' : 'relative w-full h-48'}>
      <Image
        src={imgUrl}
        alt={alt}
        fill
        sizes={isHero ? '(max-width: 768px) 100vw, 80vw' : '(max-width: 768px) 100vw, 40vw'}
        className="object-cover"
      />
      <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white text-xs">
        <p className="leading-snug">
          Photo by{' '}
          <CreditLink href={image.creditUrl}>
            {image.creditName}
          </CreditLink>{' '}
          on{' '}
          <CreditLink href={unsplashUrl}>
            Unsplash
          </CreditLink>
        </p>
      </figcaption>
    </figure>
  );
}
