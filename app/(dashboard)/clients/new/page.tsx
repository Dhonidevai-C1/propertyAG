'use client'

import React from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ClientForm } from "@/components/clients/client-form"

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href="/clients" 
          className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to clients
        </Link>
        
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add new client</h1>
          <p className="text-sm text-slate-500 font-medium">Add a potential buyer or renter and their requirements</p>
        </div>
      </div>

      {/* Form Section */}
      <ClientForm />
    </div>
  )
}
