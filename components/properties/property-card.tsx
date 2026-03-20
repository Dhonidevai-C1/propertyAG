'use client'

import React, { useTransition } from "react"
import { 
  Building2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Trash2, 
  Eye, 
  Pencil,
  Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
import { Property, PropertyStatus } from "@/lib/types/database"
import { deleteProperty } from "@/lib/actions/properties"
import { toast } from "sonner"

interface PropertyCardProps {
  property: Property
  viewMode: "grid" | "list"
}

const statusColors: Record<PropertyStatus, string> = {
  available: "bg-emerald-100 text-emerald-700",
  sold: "bg-red-100 text-red-700",
  rented: "bg-amber-100 text-amber-700",
  reserved: "bg-blue-100 text-blue-700",
}

export function PropertyCard({ property, viewMode }: PropertyCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteProperty(property.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Property moved to trash")
        router.refresh()
      }
    })
  }

  const coverImage = property.cover_image_url || null

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-3 flex gap-4 items-center group hover:bg-slate-50 transition-colors">
        <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
          {coverImage ? (
            <Image 
              src={coverImage} 
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-slate-300" />
          )}
          <Badge className={cn("absolute top-1 left-1 text-[10px] px-1.5 py-0 border-none", statusColors[property.status])}>
            {property.status}
          </Badge>
        </div>
        
        <div className="flex-1 min-w-0 py-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{property.title}</h3>
            <span className="text-emerald-600 font-bold">{formatPrice(property.price)}</span>
          </div>
          
          <div className="flex items-center text-slate-500 text-xs mb-3">
            <MapPin className="w-3 h-3 mr-1" />
            {property.locality}, {property.city}
          </div>
          
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <div className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" />
              <span>{property.bedrooms || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              <span>{property.bathrooms || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="capitalize">{property.area_sqft} {property.area_unit.replace('sq', 'sq. ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 pl-4 border-l border-slate-100">
          <Link href={`/properties/${property.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-slate-400 hover:text-emerald-600")}>
            <Eye className="w-4 h-4" />
          </Link>
          <Link href={`/properties/${property.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-slate-400 hover:text-blue-600")}>
            <Pencil className="w-4 h-4" />
          </Link>
          <DeleteDialog propertyTitle={property.title} onDelete={handleDelete} isPending={isPending} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col group cursor-pointer bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all">
      <div className="aspect-video bg-slate-100 relative flex items-center justify-center overflow-hidden">
        {coverImage ? (
          <Image 
            src={coverImage} 
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Building2 className="w-12 h-12 text-slate-300" />
        )}
        <Badge className={cn("absolute top-3 left-3 border-none shadow-sm", statusColors[property.status])}>
          {property.status}
        </Badge>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-xl font-bold text-slate-900">{formatPrice(property.price)}</p>
          <h3 className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-600 transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-slate-500 text-sm">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {property.locality}, {property.city}
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4" />
            <span className="text-slate-600 font-medium">{property.bedrooms || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span className="text-slate-600 font-medium">{property.bathrooms || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 text-[13px] capitalize">{property.area_sqft} {property.area_unit.replace('sq', 'sq. ')}</span>
          </div>
        </div>

        <Separator className="bg-slate-50" />

        <div className="flex items-center gap-2 pt-1">
          <Link href={`/properties/${property.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 text-xs h-8 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg")}>
            View
          </Link>
          <Link href={`/properties/${property.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 text-slate-400 hover:text-blue-600 transition-colors")}>
            <Pencil className="w-4 h-4" />
          </Link>
          <DeleteDialog propertyTitle={property.title} onDelete={handleDelete} isPending={isPending} />
        </div>
      </div>
    </div>
  )
}

function DeleteDialog({ propertyTitle, onDelete, isPending }: { propertyTitle: string, onDelete: () => void, isPending: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger 
        render={
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-slate-400 hover:text-red-500 transition-colors"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        }
      />
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Move to trash?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to move <strong>"{propertyTitle}"</strong> to trash? It will be hidden from listings but can be recovered by an admin.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            render={<Button variant="outline" className="border-slate-200 rounded-lg px-6 h-10" />}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete} 
            className="bg-red-500 text-white hover:bg-red-600 border-none rounded-lg px-6 h-10"
          >
            Move to trash
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
    <div className="flex flex-col border border-slate-100 rounded-xl overflow-hidden">
      <div className="aspect-video bg-slate-100 animate-pulse" />
      <div className="p-4 bg-white space-y-4">
        <div className="space-y-2">
          <div className="h-6 w-1/3 bg-slate-100 animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded" />
          <div className="h-3 w-1/2 bg-slate-50 animate-pulse rounded" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-10 bg-slate-50 animate-pulse rounded" />
          <div className="h-4 w-10 bg-slate-50 animate-pulse rounded" />
          <div className="h-4 w-10 bg-slate-50 animate-pulse rounded" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 flex-1 bg-slate-100 animate-pulse rounded-lg" />
          <div className="h-8 w-8 bg-slate-100 animate-pulse rounded-lg" />
          <div className="h-8 w-8 bg-slate-100 animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  )
}
