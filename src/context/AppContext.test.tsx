import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppProvider, useApp } from './AppContext'
import type { Delivery } from '../types'
import { STORAGE_KEYS } from '../utils/storage'

const deliveries: Delivery[] = [
  { id: 'delivery-1', pointId: 'san-miguel-01', wasteType: 'phone', quantity: 1, deliveryDate: '2026-11-20', status: 'declared', createdAt: '2026-11-20T10:00:00.000Z' },
  { id: 'delivery-2', pointId: 'san-miguel-01', wasteType: 'laptop', quantity: 1, deliveryDate: '2026-11-20', status: 'declared', createdAt: '2026-11-20T11:00:00.000Z' },
]

function OperationsHarness() {
  const { deliveries: current, points, confirmDelivery, rejectDelivery, togglePointVerification } = useApp()
  const point = points.find((item) => item.id === 'san-miguel-01')!
  return (
    <>
      <button onClick={() => confirmDelivery('delivery-1', 2.4)}>Confirmar</button>
      <button onClick={() => rejectDelivery('delivery-2', 'No se presentó el equipo')}>Rechazar</button>
      <button onClick={() => togglePointVerification(point.id)}>Cambiar verificación</button>
      <output>{current.map((item) => `${item.id}:${item.status}:${item.actualWeightKg ?? 0}:${item.rejectionReason ?? ''}`).join('|')}</output>
      <output aria-label="verification">{String(point.verified)}</output>
    </>
  )
}

describe('AppContext operations', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(STORAGE_KEYS.deliveries, JSON.stringify(deliveries))
  })

  it('confirms with actual weight and rejects with a reason', () => {
    render(<AppProvider><OperationsHarness /></AppProvider>)
    fireEvent.click(screen.getByText('Confirmar'))
    fireEvent.click(screen.getByText('Rechazar'))
    expect(screen.getByText(/delivery-1:confirmed:2.4/)).toBeTruthy()
    expect(screen.getByText(/delivery-2:rejected:0:No se presentó el equipo/)).toBeTruthy()
  })

  it('persists a verification override in shared state', () => {
    render(<AppProvider><OperationsHarness /></AppProvider>)
    expect(screen.getByLabelText('verification').textContent).toBe('true')
    fireEvent.click(screen.getByText('Cambiar verificación'))
    expect(screen.getByLabelText('verification').textContent).toBe('false')
  })
})
