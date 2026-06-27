import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'nav'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[4px] text-[14px] font-medium transition-all duration-330 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-[#3E6AE1] text-white hover:bg-[#3459c2] min-h-[40px] w-[200px] border-[3px] border-transparent shadow-[0_0_0_2px_inset_transparent] focus-visible:shadow-[#3E6AE1]': variant === 'primary',
            'bg-white text-[#393C41] hover:bg-gray-50 min-h-[40px] w-[200px] border-[3px] border-transparent shadow-[0_0_0_2px_inset_transparent] focus-visible:shadow-[#393C41]': variant === 'secondary',
            'bg-transparent text-[#171A20] hover:bg-black/5 min-h-[32px] px-4 py-1': variant === 'nav',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }