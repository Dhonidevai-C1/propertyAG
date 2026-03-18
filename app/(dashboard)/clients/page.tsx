import React, { Suspense } from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"
import { ClientList } from "@/components/clients/client-list"
import { getClients } from "@/lib/actions/clients"

interface ClientsPageProps {
  searchParams: Promise<{
    search?: string
    budget_min?: string
    budget_max?: string
    property_types?: string
    status?: string
  }>
}

export default async function ClientsPage(props: ClientsPageProps) {
  const searchParams = await props.searchParams
  const filters = {
    search: searchParams.search,
    budget_min: searchParams.budget_min ? parseInt(searchParams.budget_min) : undefined,
    budget_max: searchParams.budget_max ? parseInt(searchParams.budget_max) : undefined,
    property_types: searchParams.property_types ? searchParams.property_types.split(',') : undefined,
    status: searchParams.status,
  }

  const clients = await getClients(filters)

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-sm text-slate-500 font-medium">Your buyer and renter database</p>
        </div>
        <Link 
          href="/clients/new" 
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl h-11 px-6 flex items-center gap-2 font-semibold"
          )}
        >
          <Plus className="w-5 h-5" />
          Add client
        </Link>
      </div>

      <Suspense fallback={<div className="h-40 bg-white animate-pulse rounded-2xl border border-slate-100" />}>
        <ClientList initialClients={clients} />
      </Suspense>
    </div>
  )
}
