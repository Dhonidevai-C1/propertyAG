import React from "react"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { BrokerForm } from "@/components/brokers/broker-form"

export default function NewBrokerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="space-y-4">
        <Link 
          href="/brokers" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to Network
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add New Broker</h1>
          <p className="text-slate-500 font-medium">Expand your network by adding a new agency partner or independent agent.</p>
        </div>
      </div>

      <BrokerForm />
    </div>
  )
}
