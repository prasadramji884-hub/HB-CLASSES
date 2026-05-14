import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
    const variants = {
      default: 'bg-accent/10 text-accent border-accent/30',
      success: 'bg-green-500/10 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      danger: 'bg-red-500/10 text-red-400 border-red-500/30',
      info: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    };

    const sizes = {
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full border',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';