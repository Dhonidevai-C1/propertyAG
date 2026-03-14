'use client'

import React, { use } from "react"
import Link from "next/link"
import { ChevronLeft, Clock } from "lucide-react"
import { PropertyForm } from "@/components/properties/property-form"

// Same sample properties for hydration
const sampleProperties = [
  {
    id: "1",
    title: "Luxury 3BHK Apartment in Bani Park",
    price: 8500000,
    location: "Bani Park, Jaipur",
    address: "Bani Park, Jaipur, Rajasthan 302006",
    city: "Jaipur",
    area: "Bani Park",
    pincode: "302006",
    status: "Available",
    type: "Apartment",
    bhk: "3 BHK",
    description: "Experience the epitome of luxury living in this spacious 3BHK apartment located in the prestigious Bani Park area. This north-facing property offers panoramic city views, modern amenities, and a strategic location close to major landmarks.",
    beds: 3,
    baths: 3,
    sqft: 1850,
    bedrooms: 3,
    bathrooms: 3,
    negotiable: true,
    maintenance: 2500,
    facing: "North",
    furnishing: "Semi-furnished",
    parking: "2 Covered",
  },
  {
    id: "2",
    title: "Modern Villa with Garden",
    price: 12000000,
    location: "Vaishali Nagar, Jaipur",
    address: "Vaishali Nagar, Jaipur, Rajasthan 302021",
    city: "Jaipur",
    area: "Vaishali Nagar",
    pincode: "302021",
    status: "Available",
    type: "Villa",
    bhk: "4 BHK",
    description: "A stunning modern villa featuring a private garden, spacious interiors, and top-of-the-line amenities. Located in the serene neighborhood of Vaishali Nagar.",
    beds: 4,
    baths: 4,
    sqft: 3200,
    bedrooms: 4,
    bathrooms: 4,
    negotiable: false,
    maintenance: 4000,
    facing: "East",
    furnishing: "Fully furnished",
    parking: "3 Covered",
  },
]

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  const property = sampleProperties.find(p => p.id === id) || sampleProperties[0]

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href={`/properties/${id}`} 
          className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
          Back to property detail
        </Link>
        
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit property</h1>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Last edited by Ravi Kumar · 2 hours ago</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <PropertyForm initialData={property} mode="edit" />
    </div>
  )
}
