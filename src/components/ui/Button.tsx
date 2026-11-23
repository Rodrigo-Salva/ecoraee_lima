import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-forest text-white hover:bg-emerald-900',
  secondary: 'border border-forest/20 bg-white text-forest hover:border-forest hover:bg-emerald-50',
  ghost: 'text-slate-700 hover:bg-slate-100 hover:text-forest',
  danger: 'bg-red-700 text-white hover:bg-red-800',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 rounded-lg px-3 py-2 text-sm',
  md: 'min-h-11 rounded-xl px-5 py-3',
  lg: 'min-h-12 rounded-xl px-6 py-3.5',
  icon: 'h-11 w-11 rounded-xl p-0',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
export default Button
