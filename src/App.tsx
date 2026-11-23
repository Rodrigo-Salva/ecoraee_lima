import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RoleGuard from './components/RoleGuard'
import RouteSkeleton from './components/RouteSkeleton'

const HomePage = lazy(() => import('./pages/HomePage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const PointDetailPage = lazy(() => import('./pages/PointDetailPage'))
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const DeliveriesPage = lazy(() => import('./pages/DeliveriesPage'))
const IndicatorsPage = lazy(() => import('./pages/IndicatorsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const AssistantPage = lazy(() => import('./pages/AssistantPage'))
const PointPortalPage = lazy(() => import('./pages/PointPortalPage'))
const AdminPortalPage = lazy(() => import('./pages/AdminPortalPage'))
const OperatorsPage = lazy(() => import('./pages/OperatorsPage'))

export default function App() {
  return (
    <Suspense fallback={<RouteSkeleton />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="mapa" element={<MapPage />} />
          <Route path="puntos/:id" element={<PointDetailPage />} />
          <Route path="campanas" element={<CampaignsPage />} />
          <Route path="aprende" element={<LearnPage />} />
          <Route path="asistente" element={<RoleGuard allowed="citizen"><AssistantPage /></RoleGuard>} />
          <Route path="entregas" element={<RoleGuard allowed="citizen"><DeliveriesPage /></RoleGuard>} />
          <Route path="indicadores" element={<IndicatorsPage />} />
          <Route path="acerca" element={<AboutPage />} />
          <Route path="operadores" element={<OperatorsPage />} />
          <Route path="punto" element={<RoleGuard allowed="point"><PointPortalPage /></RoleGuard>} />
          <Route path="admin" element={<RoleGuard allowed="admin"><AdminPortalPage /></RoleGuard>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
