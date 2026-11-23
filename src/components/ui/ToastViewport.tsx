import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const icons = { success: CheckCircle2, info: Info, error: AlertCircle }

export default function ToastViewport() {
  const { toasts } = useApp()
  return (
    <div className="fixed bottom-4 right-4 z-[1300] grid w-[calc(100%-2rem)] max-w-sm gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone]
        return <div key={toast.id} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${toast.tone === 'error' ? 'bg-red-700' : toast.tone === 'info' ? 'bg-petrol' : 'bg-forest'}`}><Icon className="mt-0.5 h-5 w-5 shrink-0" /><span className="flex-1">{toast.message}</span></div>
      })}
    </div>
  )
}
