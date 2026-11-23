import { X } from 'lucide-react'
import { useEffect, useId, type ReactNode } from 'react'
import Button from './Button'

interface ModalProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}

export default function Modal({ open, title, description, children, footer, onClose }: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center bg-slate-950/55 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div><h2 id={titleId} className="text-xl font-bold text-slate-950">{title}</h2>{description && <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}</div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar ventana"><X className="h-5 w-5" /></Button>
        </header>
        <div className="p-5 sm:p-6">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-100 p-5 sm:p-6">{footer}</footer>}
      </section>
    </div>
  )
}
