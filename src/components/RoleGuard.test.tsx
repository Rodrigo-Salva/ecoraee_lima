import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import { STORAGE_KEYS } from '../utils/storage'
import RoleGuard from './RoleGuard'

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <AppProvider>
        <Routes>
          <Route path="/" element={<p>Inicio ciudadano</p>} />
          <Route path="/admin" element={<RoleGuard allowed="admin"><p>Panel administrador</p></RoleGuard>} />
        </Routes>
      </AppProvider>
    </MemoryRouter>,
  )
}

describe('RoleGuard', () => {
  beforeEach(() => window.localStorage.clear())

  it('redirects a citizen away from the admin route', async () => {
    renderAdminRoute()
    expect(await screen.findByText('Inicio ciudadano')).toBeTruthy()
    expect(screen.queryByText('Panel administrador')).toBeNull()
  })

  it('allows the matching role', async () => {
    window.localStorage.setItem(STORAGE_KEYS.role, JSON.stringify('admin'))
    renderAdminRoute()
    expect(await screen.findByText('Panel administrador')).toBeTruthy()
  })
})
