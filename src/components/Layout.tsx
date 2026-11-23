import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import type { UserRole } from '../types'
import { useApp } from '../context/AppContext'
import Logo from './Logo'
import RoleSelector from './RoleSelector'
import ToastViewport from './ui/ToastViewport'
import HeaderTools from './HeaderTools'

const linksByRole: Record<UserRole, ReadonlyArray<readonly [string, string]>> = {
  citizen: [
    ['/', 'Inicio'],
    ['/mapa', 'Mapa'],
    ['/asistente', 'Asistente'],
    ['/campanas', 'Campañas'],
    ['/aprende', 'Aprende'],
    ['/entregas', 'Mis entregas'],
    ['/indicadores', 'Indicadores'],
    ['/acerca', 'Acerca de'],
  ],
  point: [
    ['/punto', 'Panel del punto'],
    ['/mapa', 'Mapa'],
    ['/campanas', 'Campañas'],
    ['/aprende', 'Aprende'],
    ['/acerca', 'Acerca de'],
  ],
  admin: [
    ['/admin', 'Administración'],
    ['/indicadores', 'Indicadores'],
    ['/mapa', 'Mapa'],
    ['/campanas', 'Campañas'],
    ['/acerca', 'Acerca de'],
  ],
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { role } = useApp()
  const links = linksByRole[role]

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname, role])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-2.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-emerald-50 text-forest' : 'text-slate-600 hover:bg-slate-100 hover:text-forest'}`

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="fixed left-3 top-3 z-[1000] -translate-y-24 rounded-lg bg-sun px-4 py-2 font-bold text-slate-950 focus:translate-y-0">Saltar al contenido</a>
      <header className="sticky top-0 z-[500] border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-page flex min-h-16 items-center justify-between gap-3">
          <Logo />
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="Navegación principal">
            {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/' || to === '/punto' || to === '/admin'} className={navClass}>{label}</NavLink>)}
          </nav>
          <HeaderTools />
          <div className="hidden shrink-0 md:block"><RoleSelector compact /></div>
          <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-forest xl:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div id="mobile-navigation" className="border-t border-slate-100 bg-white xl:hidden">
            <div className="container-page grid gap-4 py-4">
              <div className="sm:hidden"><RoleSelector /></div>
              <nav className="grid gap-1 sm:grid-cols-2" aria-label="Navegación móvil">
                {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/' || to === '/punto' || to === '/admin'} className={navClass}>{label}</NavLink>)}
              </nav>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1"><Outlet /></main>

      <footer className="bg-[#103f2d] py-10 text-emerald-50">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Logo inverse />
            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-100">Proyecto académico · TECSUP · Diseño y Desarrollo de Software · 2026-II · Ronaldo Meza Pastrana y Rodrigo Salva Saccatoma</p>
            <p className="mt-2 text-sm text-emerald-200">Docente: Kervin Manco Ponciano</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            <a className="hover:text-sun" href="https://www.gob.pe/minam" target="_blank" rel="noreferrer">MINAM</a>
            <a className="hover:text-sun" href="https://www.itu.int/" target="_blank" rel="noreferrer">UIT</a>
            <a className="hover:text-sun" href="https://unitar.org/" target="_blank" rel="noreferrer">UNITAR</a>
            <a className="hover:text-sun" href="https://sdgs.un.org/goals/goal12" target="_blank" rel="noreferrer">ODS 12</a>
            <NavLink className="hover:text-sun" to="/operadores">Directorio</NavLink>
            <NavLink className="hover:text-sun" to="/acerca">Acerca</NavLink>
          </div>
        </div>
      </footer>

      <ToastViewport />
    </div>
  )
}
