import Image from 'next/image';
import Link from 'next/link';
import type { RecipeImage } from '@/types/recipe-image';

interface Props {
  image: RecipeImage;
  utmSource: string;
  variant: 'card' | 'hero';
  /** Optional fallback alt text if image.alt is empty */
  altFallback?: string;
}

export function RecipeImageWithCredit({ image, utmSource, variant, altFallback }: Props) {
  const isHero = variant === 'hero';
  const imgUrl = isHero ? image.urlRegular : image.urlSmall;
  const alt = image.alt || altFallback || '';

  const unsplashUrl = `https://unsplash.com/?utm_source=${utmSource}&utm_medium=referral`;

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
          <Link
            href={image.creditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            {image.creditName}
          </Link>{' '}
          on{' '}
          <Link
            href={unsplashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Unsplash
          </Link>
        </p>
      </figcaption>
    </figure>
  );
}
