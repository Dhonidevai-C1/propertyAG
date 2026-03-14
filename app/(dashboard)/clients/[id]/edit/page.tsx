'use client'

import React, { use, useState } from "react"
import Link from "next/link"
import { ChevronLeft, AlertTriangle, Trash2, CheckCircle2 } from "lucide-react"
import { ClientForm } from "@/components/clients/client-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Mock existing data for Priya Sharma
const existingClientData = {
  id: "c101",
  name: "Priya Sharma",
  phone: "9829088776",
  email: "priya.sharma@example.com",
  lookingFor: "Buy" as const,
  propertyTypes: ["Apartment", "Villa"],
  locations: ["Vaishali Nagar", "Bani Park"],
  minBudget: 6000000,
  maxBudget: 12000000,
  priority: "High" as const,
  minBeds: "3+",
  minArea: 1200,
  furnishing: "Semi-furnished",
  timeline: "Within 3 months",
  source: "Walk-in customer",
  assignedTo: "Ravi Kumar",
  notes: "Looking for a quiet neighborhood near Vaishali Nagar. Prefers west-facing if possible.",
  addedDate: "January 15, 2025",
  addedBy: "Ravi Kumar"
}

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isAdmin] = useState(true) // Mocking admin role

  const handleCloseClient = () => {
    toast.success("Client marked as closed", {
      description: `${existingClientData.name}'s requirement has been archived.`
    })
  }

  const handleDeleteClient = () => {
    toast.error("Client deleted permanently")
    // In real app, redirect after delete
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href={`/clients/${id}`} 
          className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to client profile
        </Link>
        
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Edit client — {existingClientData.name}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Client added on {existingClientData.addedDate} by {existingClientData.addedBy}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <ClientForm mode="edit" initialData={existingClientData} />

      {/* Danger Zone - Admin Only */}
      {isAdmin && (
        <Card className="border-l-4 border-red-400 border-t-slate-100 border-r-slate-100 border-b-slate-100 shadow-sm rounded-2xl p-6 bg-red-50/20">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold tracking-tight">Danger zone</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-red-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Mark client as closed</p>
                <p className="text-xs text-slate-500 font-medium">Use this if the client has bought/rented or is no longer looking.</p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button variant="outline" className="w-full sm:w-auto border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-lg h-9">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Close lead
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white rounded-2xl max-w-[400px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-bold">Close this requirement?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 pt-1">
                      This will archive {existingClientData.name}'s requirements. They will no longer appear in active matches.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-3 pt-4">
                    <AlertDialogCancel className="flex-1 border-slate-200 rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-xl font-bold"
                      onClick={handleCloseClient}
                    >
                      Archive client
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-red-100 shadow-sm">
              <div>
                <p className="text-sm font-bold text-slate-900">Delete client permanently</p>
                <p className="text-xs text-slate-500 font-medium">This action is irreversible and deletes all history.</p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white border-none font-bold rounded-lg h-9">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete permanently
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white rounded-2xl max-w-[400px]">
                  <AlertDialogHeader>
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <AlertDialogTitle className="font-bold text-center text-red-600">Irreversible Action</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 text-center pt-1 font-medium italic">
                      "This will permanently delete {existingClientData.name} and all associated match data. This cannot be undone."
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-col gap-2 pt-4">
                    <AlertDialogAction 
                      className="w-full bg-red-600 hover:bg-red-700 text-white border-none rounded-xl font-bold h-11"
                      onClick={handleDeleteClient}
                    >
                      Delete permanently
                    </AlertDialogAction>
                    <AlertDialogCancel className="w-full border-slate-200 rounded-xl font-bold h-11">
                      Cancel
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
