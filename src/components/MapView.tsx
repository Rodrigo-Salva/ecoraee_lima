import L from 'leaflet'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Point } from '../types'

function MapController({ selected, userPosition, layoutKey }: { selected?: Point; userPosition?: { lat: number; lng: number } | null; layoutKey: boolean }) {
  const map = useMap()
  useEffect(() => { window.setTimeout(() => map.invalidateSize(), 100) }, [layoutKey, map])
  useEffect(() => { if (selected) map.flyTo([selected.lat, selected.lng], 15, { duration: 0.7 }); else if (userPosition) map.flyTo([userPosition.lat, userPosition.lng], 13, { duration: 0.7 }) }, [map, selected, userPosition])
  return null
}

const iconFor = (point: Point, selected: boolean) => L.divIcon({ className: '', html: `<div class="eco-marker eco-marker--${point.type} ${selected ? 'eco-marker--selected' : ''}"><span>${point.type === 'campaign' ? '★' : '●'}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 30] })
const clusterIcon = (count: number) => L.divIcon({ className: '', html: `<div style="display:grid;place-items:center;width:42px;height:42px;border:4px solid white;border-radius:50%;background:#1B5E20;color:white;font-weight:800;box-shadow:0 6px 18px #0004">${count}</div>`, iconSize: [42, 42], iconAnchor: [21, 21] })

function ClusteredMarkers({ points, selectedId, onSelect }: { points: Point[]; selectedId?: string; onSelect?: (point: Point) => void }) {
  const [zoom, setZoom] = useState(11)
  const map = useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  const groups = useMemo(() => {
    if (zoom >= 13) return points.map((point) => ({ key: point.id, points: [point], lat: point.lat, lng: point.lng }))
    const size = zoom <= 10 ? 0.12 : 0.06
    const mapGroups = new Map<string, Point[]>()
    points.forEach((point) => { const key = `${Math.round(point.lat / size)}:${Math.round(point.lng / size)}`; mapGroups.set(key, [...(mapGroups.get(key) ?? []), point]) })
    return [...mapGroups.entries()].map(([key, grouped]) => ({ key, points: grouped, lat: grouped.reduce((sum, point) => sum + point.lat, 0) / grouped.length, lng: grouped.reduce((sum, point) => sum + point.lng, 0) / grouped.length }))
  }, [points, zoom])
  return <>{groups.map((group) => group.points.length > 1 ? <Marker key={group.key} position={[group.lat, group.lng]} icon={clusterIcon(group.points.length)} eventHandlers={{ click: () => map.flyTo([group.lat, group.lng], Math.min(15, zoom + 2)) }}><Popup>{group.points.length} puntos de ejemplo en esta zona</Popup></Marker> : (() => { const point = group.points[0]; return <Marker key={point.id} position={[point.lat, point.lng]} icon={iconFor(point, point.id === selectedId)} eventHandlers={{ click: () => onSelect?.(point) }}><Popup><span style={{ fontSize: 20 }}>♻</span> <strong>{point.name}</strong><br />{point.district}<br /><small>{point.type === 'campaign' ? 'Campaña temporal' : 'Punto permanente'}</small></Popup></Marker> })())}</>
}

export default function MapView({ points, selectedId, onSelect, userPosition, className = 'h-[520px]' }: { points: Point[]; selectedId?: string; onSelect?: (point: Point) => void; userPosition?: { lat: number; lng: number } | null; className?: string }) {
  const [fullscreen, setFullscreen] = useState(false)
  const selected = points.find((point) => point.id === selectedId)
  return <div className={fullscreen ? 'fixed inset-0 z-[1100] bg-white p-2' : 'relative'}><button type="button" onClick={() => setFullscreen((value) => !value)} className="absolute right-3 top-3 z-[500] grid h-11 w-11 place-items-center rounded-xl bg-white text-forest shadow-lg" aria-label={fullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}>{fullscreen ? <Minimize2 /> : <Maximize2 />}</button><MapContainer center={[-12.072, -77.043]} zoom={11} scrollWheelZoom className={`${fullscreen ? 'h-full' : className} w-full rounded-2xl`}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><ClusteredMarkers points={points} selectedId={selectedId} onSelect={onSelect} />{userPosition && <Marker position={[userPosition.lat, userPosition.lng]} icon={L.divIcon({ className: '', html: '<div style="width:18px;height:18px;border:4px solid white;border-radius:50%;background:#1976d2;box-shadow:0 0 0 3px rgba(25,118,210,.25)"></div>', iconSize: [18, 18] })}><Popup>Tu ubicación aproximada</Popup></Marker>}{userPosition && selected && <Polyline positions={[[userPosition.lat, userPosition.lng], [selected.lat, selected.lng]]} pathOptions={{ color: '#006064', weight: 4, dashArray: '8 8' }} />}<MapController selected={selected} userPosition={userPosition} layoutKey={fullscreen} /></MapContainer>{userPosition && selected && <p className="absolute bottom-3 right-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-petrol shadow">Ruta orientativa en línea recta</p>}</div>
}
