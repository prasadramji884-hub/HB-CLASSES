import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card border border-border rounded-2xl p-6',
          'transition-all duration-300',
          hover && 'hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';