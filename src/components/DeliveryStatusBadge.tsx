import type { DeliveryStatus } from '../types'
import Badge from './ui/Badge'

export default function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const confirmed = status === 'confirmed'
  const rejected = status === 'rejected'
  return <Badge tone={confirmed ? 'green' : rejected ? 'red' : 'yellow'}>{confirmed ? 'Confirmada por el punto' : rejected ? 'Rechazada por el punto' : 'Declarada por el usuario'}</Badge>
}
