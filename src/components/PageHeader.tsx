import type { ReactNode } from 'react'

export default function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return (
    <section className="border-b border-emerald-950/10 bg-white py-10 sm:py-14">
      <div className="container-page flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
        </div>
        {actions}
      </div>
    </section>
  )
}
