'use client'

import React, { useState, useEffect } from "react"
import { Plus, Building2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { PropertyCard, PropertyCardSkeleton, Property, PropertyStatus } from "@/components/properties/property-card"
import { PropertyFilters } from "@/components/properties/property-filters"

const sampleProperties: Property[] = [
  {
    id: "1",
    title: "Luxury 3BHK Apartment",
    price: "₹85,00,000",
    location: "Bani Park, Jaipur",
    type: "Apartment",
    status: "Available",
    beds: 3,
    baths: 3,
    sqft: 1850,
  },
  {
    id: "2",
    title: "Modern Villa with Garden",
    price: "₹1,20,00,000",
    location: "Vaishali Nagar, Jaipur",
    type: "Villa",
    status: "Available",
    beds: 4,
    baths: 4,
    sqft: 3200,
  },
  {
    id: "3",
    title: "Cozy 2BHK Flat",
    price: "₹45,00,000",
    location: "Malviya Nagar, Jaipur",
    type: "Apartment",
    status: "Rented",
    beds: 2,
    baths: 2,
    sqft: 1200,
  },
  {
    id: "4",
    title: "Commercial Office Space",
    price: "₹2,50,00,000",
    location: "C-Scheme, Jaipur",
    type: "Commercial",
    status: "Available",
    beds: 0,
    baths: 2,
    sqft: 4500,
  },
  {
    id: "5",
    title: "Spacious Farmhouse",
    price: "₹3,75,00,000",
    location: "Agra Road, Jaipur",
    type: "Farmhouse",
    status: "Sold",
    beds: 5,
    baths: 5,
    sqft: 8500,
  },
  {
    id: "6",
    title: "Prime Residential Plot",
    price: "₹65,00,000",
    location: "Jagatpura, Jaipur",
    type: "Plot",
    status: "Available",
    beds: 0,
    baths: 0,
    sqft: 2500,
  },
  {
    id: "7",
    title: "Penthouses at The Heights",
    price: "₹1,10,00,000",
    location: "Mansarovar, Jaipur",
    type: "Apartment",
    status: "Reserved",
    beds: 4,
    baths: 4,
    sqft: 2800,
  },
  {
    id: "8",
    title: "Renovated 3BHK Bungalow",
    price: "₹95,00,000",
    location: "Raja Park, Jaipur",
    type: "Villa",
    status: "Available",
    beds: 3,
    baths: 3,
    sqft: 2100,
  },
]

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    bedrooms: "all",
    price: "all",
  })

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setFilters({
      type: "all",
      status: "all",
      bedrooms: "all",
      price: "all",
    })
    setSearchQuery("")
  }

  const filteredProperties = sampleProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          property.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filters.type === "all" || property.type === filters.type
    const matchesStatus = filters.status === "all" || property.status === filters.status
    const matchesBeds = filters.bedrooms === "all" || 
                        (filters.bedrooms === "5" ? property.beds >= 5 : property.beds === parseInt(filters.bedrooms))
    
    // Price filtering logic (simple placeholder logic)
    let matchesPrice = true
    if (filters.price !== "all") {
      const numericPrice = parseInt(property.price.replace(/[^\d]/g, ""))
      if (filters.price === "under-50l") matchesPrice = numericPrice < 5000000
      else if (filters.price === "50l-1cr") matchesPrice = numericPrice >= 5000000 && numericPrice <= 10000000
      else if (filters.price === "1cr-2cr") matchesPrice = numericPrice > 10000000 && numericPrice <= 20000000
      else if (filters.price === "above-2cr") matchesPrice = numericPrice > 20000000
    }

    return matchesSearch && matchesType && matchesStatus && matchesBeds && matchesPrice
  })

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
            "bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-lg h-10 px-4 flex items-center gap-2"
          )}
        >
          <Plus className="w-4 h-4" />
          Add property
        </Link>
      </div>

      <PropertyFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          Showing <span className="text-slate-900">{filteredProperties.length}</span> properties
        </p>
      </div>

      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {[...Array(6)].map((_, i) => (
            <PropertyCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-slate-200" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No properties found</h2>
          <p className="text-slate-500 text-center max-w-sm mb-8">
            Try adjusting your filters or search query to find what you're looking for, or add a new property.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleReset} className="border-slate-200 text-slate-600">
              Clear all filters
            </Button>
            <Link 
              href="/properties/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-emerald-500 hover:bg-emerald-600 text-white border-none"
              )}
            >
              Add property
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
