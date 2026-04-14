import React from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"
import { PropertyList } from "@/components/properties/property-list"
import { getProperties } from "@/lib/actions/properties"

interface PropertiesPageProps {
  searchParams: Promise<{
    search?: string
    property_type?: string
    status?: string
    listing_type?: string
    approval_type?: string
    bhk?: string
    price_min?: string
    price_max?: string
    page?: string
  }>
}

export default async function PropertiesPage(props: PropertiesPageProps) {
  const searchParams = await props.searchParams
  const filters = {
    search: searchParams.search,
    property_type: searchParams.property_type,
    status: searchParams.status,
    listing_type: searchParams.listing_type,
    approval_type: searchParams.approval_type,
    bhk: searchParams.bhk,
    price_min: searchParams.price_min ? parseInt(searchParams.price_min) : undefined,
    price_max: searchParams.price_max ? parseInt(searchParams.price_max) : undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
  }

  const { data: properties, count: totalCount } = await getProperties(filters)

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Properties</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your property portfolio</p>
        </div>
        <Link
          href="/properties/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl h-10 px-5 flex items-center gap-2 font-bold"
          )}
        >
          <Plus className="w-4 h-4" />
          Add property
        </Link>
      </div>

      <PropertyList initialProperties={properties} totalCount={totalCount} />
    </div>
  )
}
