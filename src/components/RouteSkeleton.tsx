export default function RouteSkeleton() {
  return (
    <div className="min-h-screen bg-mist" aria-busy="true" aria-label="Cargando contenido">
      <div className="h-16 animate-pulse border-b bg-white" />
      <div className="container-page py-14">
        <div className="h-5 w-32 animate-pulse rounded bg-emerald-100" />
        <div className="mt-5 h-12 max-w-2xl animate-pulse rounded-xl bg-slate-200" />
        <div className="mt-4 h-24 max-w-3xl animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl bg-white" />)}
        </div>
      </div>
    </div>
  )
}
