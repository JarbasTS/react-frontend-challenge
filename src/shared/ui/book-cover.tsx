import { useState } from 'react';
import { BookIcon } from 'lucide-react';
import { cn } from 'cn';

export type BookCoverSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<BookCoverSize, string> = {
  sm: 'w-12',
  md: 'w-24',
  lg: 'w-48',
};

interface BookCoverProps {
  src: string | null;
  alt: string;
  size?: BookCoverSize;
  className?: string;
}

/**
 * Renderiza a capa do livro com fallback para um placeholder quando `src`
 * é `null` ou a imagem falha ao carregar — nunca um ícone de imagem quebrada.
 */
export function BookCover({ src, alt, size = 'md', className }: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = src === null || failed;

  return (
    <div
      className={cn(
        'flex aspect-[2/3] shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted',
        SIZE_CLASSES[size],
        className
      )}
    >
      {showPlaceholder ? (
        <BookIcon
          aria-hidden="true"
          className="h-1/3 w-1/3 text-muted-foreground"
          strokeWidth={1.5}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
