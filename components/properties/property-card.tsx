'use client'

import React from "react"
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Trash2, 
  Eye, 
  Pencil 
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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

export type PropertyStatus = "Available" | "Sold" | "Rented" | "Reserved"

export interface Property {
  id: string
  title: string
  price: string
  location: string
  type: string
  status: PropertyStatus
  beds: number
  baths: number
  sqft: number
  image?: string
}

interface PropertyCardProps {
  property: Property
  viewMode: "grid" | "list"
}

export function PropertyCard({ property, viewMode }: PropertyCardProps) {
  const statusColors: Record<PropertyStatus, string> = {
    Available: "bg-emerald-100 text-emerald-700",
    Sold: "bg-red-100 text-red-700",
    Rented: "bg-amber-100 text-amber-700",
    Reserved: "bg-blue-100 text-blue-700",
  }

  const handleDelete = () => {
    console.log("Deleting property:", property.id)
    // In a real app, this would be an API call
  }

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-3 flex gap-4 items-center group hover:bg-slate-50 transition-colors">
        <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
          <Building2 className="w-8 h-8 text-slate-300" />
          <Badge className={cn("absolute top-1 left-1 text-[10px] px-1.5 py-0", statusColors[property.status])}>
            {property.status}
          </Badge>
        </div>
        
        <div className="flex-1 min-w-0 py-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{property.title}</h3>
            <span className="text-emerald-600 font-bold">{property.price}</span>
          </div>
          
          <div className="flex items-center text-slate-500 text-xs mb-3">
            <MapPin className="w-3 h-3 mr-1" />
            {property.location}
          </div>
          
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <div className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" />
              <span>{property.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              <span>{property.baths}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{property.sqft} sqft</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 pl-4 border-l border-slate-100">
          <Link href={`/properties/${property.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-slate-400 hover:text-emerald-600")}>
            <Eye className="w-4 h-4" />
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
            <Pencil className="w-4 h-4" />
          </Button>
          <DeleteDialog propertyTitle={property.title} onDelete={handleDelete} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col group cursor-pointer">
      <div className="aspect-video bg-slate-200 rounded-t-xl relative flex items-center justify-center overflow-hidden">
        <Building2 className="w-12 h-12 text-slate-300" />
        <Badge className={cn("absolute top-3 left-3 border-none", statusColors[property.status])}>
          {property.status}
        </Badge>
      </div>

      <div className="p-4 bg-white rounded-b-xl border border-slate-100 border-t-0 space-y-3">
        <div className="space-y-1">
          <p className="text-xl font-bold text-slate-900">{property.price}</p>
          <h3 className="text-sm font-medium text-slate-700 truncate group-hover:text-emerald-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-slate-500 text-sm">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {property.location}
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4" />
            <span className="text-slate-600">{property.beds}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span className="text-slate-600">{property.baths}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4" />
            <span className="text-slate-600">{property.sqft}</span>
          </div>
        </div>

        <Separator className="bg-slate-50" />

        <div className="flex items-center gap-2 pt-1">
          <Link href={`/properties/${property.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 text-xs h-8 border-slate-200 text-slate-600 hover:bg-slate-50")}>
            View
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil className="w-4 h-4" />
          </Button>
          <DeleteDialog propertyTitle={property.title} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  )
}

function DeleteDialog({ propertyTitle, onDelete }: { propertyTitle: string, onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </Button>
      } />
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the property <strong>"{propertyTitle}"</strong> from your portfolio. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-slate-200">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-red-500 text-white hover:bg-red-600 border-none">
            Delete Property
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function PropertyCardSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-3 flex gap-4 items-center">
        <div className="w-24 h-24 rounded-lg bg-slate-100 animate-pulse shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded" />
            <div className="h-4 w-20 bg-slate-100 animate-pulse rounded" />
          </div>
          <div className="h-3 w-1/3 bg-slate-50 animate-pulse rounded" />
          <div className="h-3 w-1/4 bg-slate-50 animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="aspect-video bg-slate-100 rounded-t-xl animate-pulse" />
      <div className="p-4 bg-white rounded-b-xl border border-slate-100 border-t-0 space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-1/2 bg-slate-100 animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded" />
          <div className="h-3 w-1/2 bg-slate-50 animate-pulse rounded" />
        </div>
        <div className="h-4 w-full bg-slate-50 animate-pulse rounded mt-4" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 flex-1 bg-slate-100 animate-pulse rounded-lg" />
          <div className="h-8 w-8 bg-slate-100 animate-pulse rounded-lg" />
          <div className="h-8 w-8 bg-slate-100 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  )
}
