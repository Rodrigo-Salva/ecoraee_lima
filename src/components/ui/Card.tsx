import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const Card = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(({ className, ...props }, ref) => (
  <article ref={ref} className={cn('rounded-2xl border border-emerald-950/10 bg-white shadow-soft', className)} {...props} />
))

Card.displayName = 'Card'
export default Card
