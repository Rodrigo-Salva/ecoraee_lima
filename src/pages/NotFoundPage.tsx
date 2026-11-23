import { Home, MapPinOff } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <section className="container-page grid min-h-[68vh] place-items-center py-16 text-center"><div><span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-emerald-100 text-forest"><MapPinOff className="h-10 w-10" /></span><p className="eyebrow mt-7">Error 404</p><h1 className="mt-3 text-4xl font-bold text-slate-950">Esta ruta no está en el mapa</h1><p className="mx-auto mt-4 max-w-md leading-7 text-slate-600">La página que buscas no existe o cambió de dirección.</p><Link to="/" className="btn-primary mt-7"><Home className="h-5 w-5" />Volver al inicio</Link></div></section>
}
