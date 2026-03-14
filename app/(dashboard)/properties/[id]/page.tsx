'use client'

import React, { useState, use } from "react"
import Link from "next/link"
import { 
  ChevronLeft, 
  PencilLine, 
  MoreVertical, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  Layers, 
  Armchair, 
  Car, 
  Share2, 
  Printer, 
  Sparkles, 
  Building2, 
  Calendar, 
  User, 
  Eye
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Sample data for hydration based on ID
const sampleProperties = [
  {
    id: "1",
    title: "Luxury 3BHK Apartment in Bani Park",
    price: "₹85,00,000",
    location: "Bani Park, Jaipur, Rajasthan 302006",
    status: "Available",
    type: "Apartment",
    description: "Experience the epitome of luxury living in this spacious 3BHK apartment located in the prestigious Bani Park area. This north-facing property offers panoramic city views, modern amenities, and a strategic location close to major landmarks.",
    specs: [
      { icon: BedDouble, label: "Bedrooms", value: "3 BHK" },
      { icon: Bath, label: "Bathrooms", value: "3" },
      { icon: Maximize2, label: "Total Area", value: "1,850 sq ft" },
      { icon: Layers, label: "Floor", value: "5th (of 10)" },
      { icon: Armchair, label: "Furnishing", value: "Semi-furnished" },
      { icon: Car, label: "Parking", value: "2 Covered" },
    ],
  },
  {
    id: "2",
    title: "Modern Villa with Garden",
    price: "₹1,20,00,000",
    location: "Vaishali Nagar, Jaipur, Rajasthan 302021",
    status: "Available",
    type: "Villa",
    description: "A stunning modern villa featuring a private garden, spacious interiors, and top-of-the-line amenities. Located in the serene neighborhood of Vaishali Nagar.",
    specs: [
      { icon: BedDouble, label: "Bedrooms", value: "4 BHK" },
      { icon: Bath, label: "Bathrooms", value: "4" },
      { icon: Maximize2, label: "Total Area", value: "3,200 sq ft" },
      { icon: Layers, label: "Floor", value: "Ground + 1" },
      { icon: Armchair, label: "Furnishing", value: "Fully furnished" },
      { icon: Car, label: "Parking", value: "3 Covered" },
    ],
  },
]

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  const property = sampleProperties.find(p => p.id === id) || sampleProperties[0]
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Mock common data
  const details = [
    { label: "Property type", value: property.type },
    { label: "Status", value: property.status },
    { label: "Facing", value: "North" },
    { label: "Total area", value: property.specs.find(s => s.label === "Total Area")?.value || "N/A" },
    { label: "Floor", value: property.specs.find(s => s.label === "Floor")?.value || "N/A" },
    { label: "Maintenance", value: "₹2,500/month" },
    { label: "Listed on", value: "Mar 10, 2026" },
    { label: "Listed by", value: "Ravi Kumar (Agent)" },
  ]

  const matchedClients = [
    { id: "c1", name: "Anil Sharma", score: "92%", initials: "AS" },
    { id: "c2", name: "Megha Gupta", score: "88%", initials: "MG" },
    { id: "c3", name: "Vikram Singh", score: "85%", initials: "VS" },
  ]

  const activity = [
    { icon: User, text: "Listed by Ravi Kumar", date: "2 days ago" },
    { icon: Eye, text: "Viewed by 3 clients", date: "1 day ago" },
    { icon: Sparkles, text: "Matched with Anil Sharma", date: "5 hours ago" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link 
            href="/properties" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to properties
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 truncate max-w-md">{property.title}</h1>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 text-xs">
              {property.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            href={`/properties/${property.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-slate-200 text-slate-600 h-10 px-4"
            )}
          >
            <PencilLine className="w-4 h-4 mr-2" />
            Edit property
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 text-slate-400">
                <MoreVertical className="w-5 h-5" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="bg-white min-w-48">
              <DropdownMenuItem className="text-slate-600 cursor-pointer">Mark as Sold</DropdownMenuItem>
              <DropdownMenuItem className="text-slate-600 cursor-pointer">Mark as Rented</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuItem className="text-red-500 cursor-pointer">Delete Property</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="aspect-video bg-slate-100 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-200">
          <Building2 className="w-24 h-24 text-slate-200" />
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
            Featured Image: Image {selectedImage + 1}
          </div>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {[1,2,3,4,5].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "w-24 h-20 rounded-xl bg-slate-100 shrink-0 border-2 transition-all flex items-center justify-center relative overflow-hidden",
                selectedImage === idx ? "border-emerald-500 ring-2 ring-emerald-50" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Building2 className="w-8 h-8 text-slate-200" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Overview */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white space-y-6">
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{property.price}</p>
              <h2 className="text-xl font-semibold text-slate-800">{property.title}</h2>
              <div className="flex items-start text-slate-500 text-sm">
                <MapPin className="w-4 h-4 mr-1.5 mt-0.5 shrink-0" />
                {property.location}
              </div>
            </div>

            <Separator className="bg-slate-50" />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {property.specs.map((spec, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <spec.icon className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-semibold">{spec.label}</span>
                  </div>
                  <p className="text-slate-700 font-bold">{spec.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-4">About this property</h3>
            <div className="relative">
              <p className={cn(
                "text-slate-600 leading-relaxed text-sm whitespace-pre-wrap",
                !showFullDescription && "line-clamp-3"
              )}>
                {property.description}
              </p>
              <button 
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 mt-2 transition-colors"
              >
                {showFullDescription ? "Read less" : "Read more"}
              </button>
            </div>
          </Card>

          {/* Key Details */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Key details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {details.map((detail, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0 italic-last">
                  <span className="text-slate-500 text-sm">{detail.label}</span>
                  <span className="text-slate-900 text-sm font-semibold">{detail.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white space-y-3">
             <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none h-11 text-base font-semibold rounded-xl">
              Edit property
            </Button>
            <Button variant="outline" className="w-full border-slate-200 text-slate-600 h-11 rounded-xl">
              <Share2 className="w-4 h-4 mr-2" />
              Share listing
            </Button>
            <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-900 h-10 rounded-xl">
              <Printer className="w-4 h-4 mr-2" />
              Print details
            </Button>
          </Card>

          {/* Matched Clients */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">Matched clients</h3>
            </div>
            
            <div className="space-y-4">
              {matchedClients.map((client, idx) => (
                <Link 
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-100">
                      <AvatarFallback className="bg-slate-50 text-slate-600 text-xs font-bold">
                        {client.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors">
                      {client.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-bold">
                    {client.score} match
                  </Badge>
                </Link>
              ))}
            </div>

            <Link href="#" className="flex items-center justify-center text-emerald-600 text-sm font-bold hover:underline py-2">
              View all matches →
            </Link>
          </Card>

          {/* Activity Timeline */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Property activity</h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
              {activity.map((event, idx) => (
                <div key={idx} className="relative pl-7 group">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-slate-200 group-first:border-emerald-500 z-10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-first:bg-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-700 font-medium">{event.text}</p>
                    <p className="text-xs text-slate-400">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
