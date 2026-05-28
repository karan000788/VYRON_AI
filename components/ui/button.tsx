import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { playChime } from '@/lib/sound';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vyron-violet disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:from-cyan-400 hover:to-violet-500',
        secondary:
          'bg-white/10 text-zinc-100 hover:bg-white/15 border border-white/10',
        ghost: 'hover:bg-white/10 text-zinc-300',
        destructive: 'bg-red-600 text-white hover:bg-red-500',
        outline:
          'border border-white/20 bg-transparent hover:bg-white/5 text-zinc-100',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Optional sound type for click feedback */
  sound?: 'success' | 'warning' | 'info' | 'delete' | 'click';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, sound = 'click', onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button;
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playChime(sound);
      if (onClick) onClick(e);
    };
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
