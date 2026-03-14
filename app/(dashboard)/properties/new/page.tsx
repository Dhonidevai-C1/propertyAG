import React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { PropertyForm } from "@/components/properties/property-form"

export default function NewPropertyPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/properties" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to properties
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add new property</h1>
          <p className="text-slate-500 font-medium">Fill in the details below to list a new property</p>
        </div>
      </div>

      {/* Form */}
      <PropertyForm />
    </div>
  )
}
