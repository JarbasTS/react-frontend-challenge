import type { ComponentProps } from 'react';
import { cn } from 'cn';

export type StampVariant = 'want' | 'reading' | 'done' | 'error';

const VARIANT_CLASSES: Record<StampVariant, string> = {
  want: 'border-status-want text-status-want -rotate-2',
  reading: 'border-status-reading text-status-reading rotate-1',
  done: 'border-status-done text-status-done -rotate-1',
  error: 'border-destructive text-destructive rotate-2',
};

interface StampProps extends ComponentProps<'span'> {
  variant: StampVariant;
}

/**
 * O elemento-assinatura do Libris: um carimbo de data/status de biblioteca,
 * reutilizado no status da estante, na ficha de login e nos estados vazio/erro.
 */
export function Stamp({ variant, className, children, ...props }: StampProps) {
  return (
    <span
      data-slot="stamp"
      data-variant={variant}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border-2 px-2 py-0.5',
        'font-mono text-[0.6875rem] font-medium tracking-[0.08em] whitespace-nowrap uppercase',
        'shadow-[inset_0_0_0_1px_currentColor]',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
