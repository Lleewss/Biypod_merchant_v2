import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'elevated' | 'outline';
  children: React.ReactNode;
}

const BiypodCard = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-neutral-200 shadow-sm',
      gradient: 'biypod-gradient text-white shadow-lg',
      elevated: 'bg-white shadow-xl border-0 hover:shadow-2xl',
      outline: 'bg-transparent border-2 biypod-border-primary'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-6 transition-all duration-200',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BiypodCard.displayName = 'BiypodCard';

export { BiypodCard };
