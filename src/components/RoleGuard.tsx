import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { ROLE_HOME, ROLE_LABELS } from '../constants'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../types'

export default function RoleGuard({ allowed, children }: { allowed: UserRole; children: ReactNode }) {
  const { role, notify } = useApp()
  const blocked = role !== allowed

  useEffect(() => {
    if (blocked) notify(`Esta sección requiere la vista ${ROLE_LABELS[allowed]}.`, 'error')
  }, [allowed, blocked, notify])

  if (blocked) return <Navigate to={ROLE_HOME[role]} replace />
  return children
}
