import React from "react"
import { Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"
import { PropertyList } from "@/components/properties/property-list"
import { getProperties } from "@/lib/actions/properties"

export default async function PropertiesPage() {
  // Fetch all properties unfiltered — filtering is done client-side for instant search
  const properties = await getProperties({})

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

      <PropertyList initialProperties={properties} />
    </div>
  )
}
