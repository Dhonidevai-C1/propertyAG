import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ChevronLeft,
  PencilLine,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Armchair,
  Sparkles,
  CarFront,
  Compass,
  Layers,
  IndianRupee,
  Hash,
  Phone,
  User,
  CheckCircle2,
  Star,
  Zap,
  Navigation,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { getProperty } from "@/lib/actions/properties"
import { PropertyImageGallery } from "@/components/properties/property-gallery"
import { PropertyDetailActions } from "@/components/properties/property-detail-actions"
import { PrintButton } from "@/components/properties/print-button"
import { formatCurrency } from "@/lib/utils"
import { getMatchesForProperty } from "@/lib/actions/matches"
import { SingleMatchButton } from "@/components/matches/match-button"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [property, matchResults] = await Promise.all([
    getProperty(id),
    getMatchesForProperty(id).catch(() => []),
  ])

  if (!property) notFound()

  const formatFloor = () => {
    if (!property.floor_number && !property.total_floors) return null
    if (property.floor_number && property.total_floors) return `${property.floor_number} of ${property.total_floors}`
    if (property.floor_number) return property.floor_number
    return `Total ${property.total_floors} floors`
  }
  const floorValue = formatFloor()

  const leftDetails = [
    { label: "Property type", value: property.property_type.replace(/_/g, " ") },
    property.commercial_type ? { label: "Commercial Type", value: property.commercial_type } : null,
    { label: "Listing type", value: property.listing_type },
    { label: "Status", value: property.status },
    { label: "Approval Authority", value: property.approval_type || "General" },
    { label: "Source", value: property.contact_type === "broker" ? "Broker" : "Direct Client" },
    property.group && (property.property_type === 'plot' || property.property_type === 'farmhouse' || property.property_type === 'farmer_land')
      ? { label: "Plot Group", value: property.group } : null,
    (property.bhk && property.bhk.length > 0) ? { label: "BHK", value: `${property.bhk.sort((a, b) => a - b).join(", ")} BHK` } : null,
    property.bedrooms && property.bedrooms > 0 ? { label: "Bedrooms", value: String(property.bedrooms) } : null,
    property.bathrooms && property.bathrooms > 0 ? { label: "Bathrooms", value: String(property.bathrooms) } : null,
    { label: "Total area", value: property.area_sqft ? `${Number(property.area_sqft).toLocaleString()} ${(property.area_unit || 'sqft').replace('sq', 'sq. ')}` : "—" },
  ].filter(Boolean) as { label: string; value: string }[]

  const isLand = property.property_type === 'plot' || property.property_type === 'farmhouse' || property.property_type === 'farmer_land'

  const rightDetails = [
    !isLand ? { label: "Furnishing", value: (property.furnishing || "none").replace(/_/g, " ") } : null,
    property.facing ? { label: "Facing", value: property.facing } : null,
    property.parking ? { label: "Parking", value: property.parking } : null,
    floorValue ? { label: "Floor", value: floorValue } : null,
    property.dimensions ? { label: "Dimensions", value: property.dimensions } : null,
    property.road_info ? { label: "Road Information", value: property.road_info } : null,
    property.maintenance_charge && Number(property.maintenance_charge) > 0
      ? { label: "Maintenance", value: `₹${Number(property.maintenance_charge).toLocaleString()}/mo` }
      : null,
    { label: "Price negotiable", value: property.price_negotiable ? "Yes" : "No" },
    { label: "Listed on", value: new Date(property.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), printHidden: true },
  ].filter(d => d && !d.printHidden) as { label: string; value: string }[]

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 print:space-y-4 print:pb-0">
      {/* Print Header */}
      <div className="hidden print:block mb-6 pb-4 border-b border-slate-200">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900">PropDesk</h1>
            <p className="text-sm text-slate-500 font-medium">Property Details Report</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{new Date().toLocaleDateString()}</p>
            <p className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <Link href="/properties" className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to properties
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-sans text-slate-900 truncate max-w-md">{property.title}</h1>
            <Badge className={cn(
              "text-xs capitalize px-3 py-1 border-none",
              property.status === "sold" && "bg-red-100 text-red-700 hover:bg-red-100",
              property.status === "rented" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
              (property.status === "available" || property.status === "reserved") && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
            )}>
              {property.status}
            </Badge>
            {property.is_new && (
              <Badge className="bg-blue-500 text-white border-none gap-1 font-black px-2">
                <Zap className="w-3 h-3 fill-white" /> NEW
              </Badge>
            )}
            {property.is_featured && (
              <Badge className="bg-orange-400 text-white border-none gap-1 font-black px-2">
                <Star className="w-3 h-3 fill-white" /> FEATURED
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SingleMatchButton propertyId={property.id} label="Find Buyers" />
          <Link href={`/properties/${property.id}/edit`} className={cn(buttonVariants({ variant: "outline" }), "border-slate-200 text-slate-600 h-10 px-4")}>
            <PencilLine className="w-4 h-4 mr-2" />
            Edit property
          </Link>
          <PropertyDetailActions propertyId={property.id} currentStatus={property.status} />
        </div>
      </div>

      {/* Print Title */}
      <div className="hidden print:block mb-4">
        <h3 className="text-2xl font-sans font-black text-slate-900">{property.title}</h3>
        <p className="text-slate-500 text-sm mt-1">{[property.locality, property.city].filter(Boolean).join(", ")}</p>
      </div>

      {/* Gallery */}
      <PropertyImageGallery images={property.image_urls || []} coverImage={property.cover_image_url} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6 print:col-span-12">

          {/* Price + stat row */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white space-y-6 print:shadow-none print:border-none print:p-0">
            <div className="space-y-2 print:hidden">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{property.listing_type}</span>
                {property.approval_type && <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full uppercase">✓ {property.approval_type}</span>}
                {property.group && (isLand) && <span className="text-[10px] bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-full uppercase">📍 {property.group}</span>}
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatCurrency(property.price)}</p>
                {property.price_negotiable && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Negotiable</span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-slate-800">{property.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{[property.locality, property.city, property.pincode].filter(Boolean).join(", ")}</span>
                </div>
                {property.address && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Hash className="w-3.5 h-3.5" />
                    {property.address}
                  </div>
                )}
                {property.google_maps_url && (
                  <a
                    href={property.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-emerald-600 font-bold hover:underline print:hidden"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-emerald-600/10" />
                    View on Google Maps
                  </a>
                )}
              </div>
            </div>

            <div className="hidden print:block mb-2">
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(property.price)}</p>
            </div>

            <Separator className="bg-slate-50 print:bg-slate-200" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {property.bhk && property.bhk.length > 0 && (
                <StatTile icon={<BedDouble className="w-4 h-4" />} label="BHK" value={`${property.bhk.sort((a, b) => a - b).join(", ")} BHK`} />
              )}
              {property.bathrooms && property.bathrooms > 0 ? (
                <StatTile icon={<Bath className="w-4 h-4" />} label="Bathrooms" value={String(property.bathrooms)} />
              ) : null}
              {property.balconies !== null && property.balconies > 0 && (
                <StatTile icon={<Zap className="w-4 h-4" />} label="Balconies" value={String(property.balconies)} />
              )}
              <StatTile icon={<Maximize2 className="w-4 h-4" />} label="Area" value={property.area_sqft ? `${Number(property.area_sqft).toLocaleString()} ${(property.area_unit || 'sqft').replace('sq', 'sq. ')}` : "—"} />
              {!isLand && (
                <StatTile icon={<Armchair className="w-4 h-4" />} label="Furnishing" value={(property.furnishing || "None").replace(/_/g, " ")} capitalize />
              )}
              {property.facing && <StatTile icon={<Compass className="w-4 h-4" />} label="Facing" value={property.facing} />}
              {(property.parking && property.parking !== 'null' && property.parking !== '') && <StatTile icon={<CarFront className="w-4 h-4" />} label="Parking" value={property.parking} />}
              {floorValue && <StatTile icon={<Layers className="w-4 h-4" />} label="Floor" value={floorValue} />}
              {property.maintenance_charge && Number(property.maintenance_charge) > 0 && (
                <StatTile icon={<IndianRupee className="w-4 h-4" />} label="Maintenance" value={`₹${Number(property.maintenance_charge).toLocaleString()}/mo`} />
              )}
            </div>
          </Card>

          {/* Description */}
          {property.description && (
            <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white print:shadow-none print:border-none print:p-0">
              <h3 className="text-lg font-bold text-slate-900 mb-4">About this property</h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{property.description}</p>
            </Card>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-600">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Key Details — two-column table */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white print:shadow-none print:border-none print:p-0">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Key details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div>
                {leftDetails.map((d, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500 text-sm">{d.label}</span>
                    <span className="text-slate-900 text-sm font-semibold capitalize">{d.value}</span>
                  </div>
                ))}
              </div>
              <div className="md:pl-6 md:border-l border-slate-50">
                {rightDetails.map((d, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500 text-sm">{d.label}</span>
                    <span className="text-slate-900 text-sm font-semibold capitalize">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          {/* Seller Details */}
          {(property.seller_name || property.seller_phone) && (
            <Card className="p-6 border-slate-100 shadow-sm rounded-2xl bg-slate-900 text-white space-y-4 print:hidden">
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">Seller Contact</h3>
              <div className="space-y-4">
                {property.seller_name && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Owner/Agent</p>
                      <p className="font-bold text-lg">{property.seller_name}</p>
                    </div>
                  </div>
                )}
                {property.seller_phone && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Phone Number</p>
                      <p className="font-bold text-lg">{property.seller_phone}</p>
                    </div>
                  </div>
                )}
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none h-12 font-bold rounded-xl mt-2">
                  <Phone className="w-4 h-4 mr-2" /> Call Seller Now
                </Button>
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white space-y-3">
            <Link href={`/properties/${property.id}/edit`} className={cn(buttonVariants({ variant: "default" }), "w-full bg-emerald-500 hover:bg-emerald-600 text-white border-none h-11 text-base font-semibold rounded-xl")}>
              Edit property
            </Link>
            <PrintButton />
          </Card>

          {/* Matched Clients */}
          <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">Matched clients</h3>
              {matchResults.length > 0 && (
                <Badge className="ml-auto bg-amber-50 text-amber-600 border-none text-[10px] font-bold">{matchResults.length}</Badge>
              )}
            </div>

            {matchResults.length > 0 ? (
              <div className="space-y-2">
                {matchResults.slice(0, 5).map((m) => {
                  const initials = m.client?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?"
                  return (
                    <Link key={m.id} href={`/clients/${m.client_id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-100">
                          <AvatarFallback className="bg-slate-50 text-slate-600 text-xs font-bold">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors block truncate max-w-[110px]">
                            {m.client?.full_name}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">{m.client?.looking_for || "buyer"}</span>
                        </div>
                      </div>
                      <Badge className={cn(
                        "border-none text-[10px] font-bold",
                        m.score >= 90 ? "bg-emerald-50 text-emerald-600" :
                          m.score >= 75 ? "bg-amber-50 text-amber-600" :
                            "bg-slate-50 text-slate-500"
                      )}>
                        {m.score}% match
                      </Badge>
                    </Link>
                  )
                })}
                {matchResults.length > 5 && (
                  <Link href="/matches" className="flex items-center justify-center text-emerald-600 text-sm font-bold hover:underline py-2">
                    View all {matchResults.length} matches →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                <p className="text-sm font-medium">No matches yet</p>
                <p className="text-xs mt-1">Run the match engine to find leads</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { 
            margin: 0; 
            size: auto;
          }
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact;
            background: white !important;
            margin: 0 !important;
            padding: 1.5cm !important;
          }
          /* Hide default browser headers and footers (URL, Date, Title) */
          header, footer, .no-print, .print\\:hidden { display: none !important; }
          
          /* Custom layout fixes for print */
          .max-w-7xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { shadow: none !important; box-shadow: none !important; }
          
          /* Ensure PropDesk header is always clearly at the top */
          .print\\:block { display: block !important; }
        }
      `}} />
    </div>
  )
}

function StatTile({ icon, label, value, capitalize }: { icon: React.ReactNode; label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className={cn("text-slate-700 font-bold text-sm", capitalize && "capitalize")}>{value}</p>
    </div>
  )
}
