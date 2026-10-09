'use client'

import { ModuleForm } from '@/components/admin/module-form'
import { createModule } from '@/lib/module-store'

export default function NewModulePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">New module</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create the module, then upload its PDF on the next screen so students can read it in-app.
        </p>
      </header>
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_3px_rgb(16_24_40/0.05)]">
        <ModuleForm
          submitLabel="Create module"
          onSubmit={async (values) => {
            const mod = await createModule(values)
            return `/admin/modules/${mod.id}/edit`
          }}
        />
      </div>
    </div>
  )
}
