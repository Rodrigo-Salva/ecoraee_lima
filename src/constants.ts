import type { UserRole, WasteType } from './types'

export const WASTE_LABELS: Record<WasteType, string> = {
  phone: 'Celulares',
  laptop: 'Laptops',
  computer: 'Computadoras',
  cables: 'Cargadores y cables',
  tv: 'Televisores',
  printer: 'Impresoras',
  battery: 'Baterías',
  smallAppliance: 'Electrodomésticos pequeños',
}

export const EXAMPLE_DATA_NOTICE =
  'Datos de ejemplo para el prototipo. En la versión real se usarán puntos verificados con el MINAM, municipalidades y operadores autorizados.'

export const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'Ciudadano',
  point: 'Punto de recolección',
  admin: 'Administrador',
}

export const ROLE_HOME: Record<UserRole, string> = {
  citizen: '/',
  point: '/punto',
  admin: '/admin',
}
