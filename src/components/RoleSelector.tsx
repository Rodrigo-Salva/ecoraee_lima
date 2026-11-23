import { ShieldCheck, UserRound, Warehouse } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROLE_HOME, ROLE_LABELS } from '../constants'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../types'

const roleIcons = { citizen: UserRound, point: Warehouse, admin: ShieldCheck }

export default function RoleSelector({ compact = false }: { compact?: boolean }) {
  const { role, setRole, notify } = useApp()
  const navigate = useNavigate()
  const Icon = roleIcons[role]

  const changeRole = (nextRole: UserRole) => {
    setRole(nextRole)
    notify(`Vista cambiada a ${ROLE_LABELS[nextRole]}.`, 'info')
    navigate(ROLE_HOME[nextRole])
  }

  return (
    <label className={`block ${compact ? 'w-48' : 'w-full'}`}>
      {!compact && <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Vista de demostración</span>}
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-forest" aria-hidden="true" />
        <select className="field h-11 py-2 pl-9 text-sm font-semibold" aria-label="Seleccionar rol de demostración" value={role} onChange={(event) => changeRole(event.target.value as UserRole)}>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}
        </select>
      </span>
    </label>
  )
}
