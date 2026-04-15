import React from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import {
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Compass,
  CarFront,
  IndianRupee,
  CheckCircle2,
  Phone,
  LayoutGrid,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getPublicProperty } from "@/lib/actions/properties"
import { formatCurrency, formatBudget } from "@/lib/utils/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PropertyImageGallery } from "@/components/properties/property-gallery"

// Force noindex to prevent property leaks to search engines (as requested)
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublicPropertyPage({ params }: Props) {
  const { slug } = await params
  const property = await getPublicProperty(slug)

  if (!property) notFound()

  const agency = property.agency
  const whatsappLink = `https://wa.me/${agency.contact_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hi, I'm interested in this property: ${property.title}. View it here: ${process.env.NEXT_PUBLIC_APP_URL || ''}/p/${property.slug}`
  )}`

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Branding Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {agency.logo_url ? (
            <img src={agency.logo_url} alt={agency.name} className="h-8 w-auto" />
          ) : (
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
          <span className="font-black text-slate-800 tracking-tight">{agency.name}</span>
        </div>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full gap-2 px-4 h-9">
            <Phone className="w-3.5 h-3.5" />
            Contact
          </Button>
        </a>
      </header>

      <main className="max-w-4xl mx-auto pb-32">
        {/* Gallery Section */}
        <section className="bg-white">
          <PropertyImageGallery
            images={property.image_urls || []}
            coverImage={property.cover_image_url}
          />
        </section>

        <div className="px-4 py-8 space-y-8">
          {/* Title & Price */}
          <section className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-slate-900 text-white border-none text-[10px] font-black uppercase px-3 py-1">
                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
              <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50/50 font-bold text-[10px] uppercase px-3 py-1">
                {property.property_type.replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center text-slate-500 font-bold">
                <MapPin className="w-4 h-4 mr-2 text-slate-300" />
                {property.locality}, {property.city}
              </div>
            </div>

            <div className="flex items-baseline gap-4 mt-6">
              <span className="text-4xl font-black text-emerald-600 tracking-tighter">
                {formatCurrency(property.price)}
              </span>
              {property.price_negotiable && (
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Negotiable
                </span>
              )}
            </div>
          </section>

          <Separator className="bg-slate-100" />

          {/* Quick Specs Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {property.bedrooms > 0 && (
              <QuickSpec label="Bedrooms" value={`${property.bedrooms} BHK`} icon={<BedDouble className="w-4 h-4" />} />
            )}
            {property.bathrooms > 0 && (
              <QuickSpec label="Bathrooms" value={`${property.bathrooms}`} icon={<Bath className="w-4 h-4" />} />
            )}
            {property.area_sqft && (
              <QuickSpec
                label="Area"
                value={`${property.area_sqft.toLocaleString()} ${property.area_unit || 'sqft'}`}
                icon={<Maximize2 className="w-4 h-4" />}
              />
            )}
            {property.furnishing && (
              <QuickSpec label="Furnishing" value={property.furnishing} icon={<LayoutGrid className="w-4 h-4" />} capitalize />
            )}
          </section>

          {/* Description */}
          {property.description && (
            <section className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase text-xs">About this property</h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                {property.description}
              </p>
            </section>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase text-xs">Features & Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Floating Sticky CTA (Mobile First) */}
      <footer className="fixed bottom-0 inset-x-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 md:hidden z-50">
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
          <Button className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] gap-3">
            <Zap className="w-5 h-5 fill-white" />
            Contact Agent on WhatsApp
          </Button>
        </a>
      </footer>

      {/* Desktop Desktop "Interested?" floating box */}
      <div className="hidden md:block fixed bottom-8 right-8 w-80 bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-lg font-black">Interested?</h4>
            <p className="text-xs text-slate-400 font-medium">Get in touch with {agency.name} for a site visit.</p>
          </div>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full h-12 bg-emerald-500 cursor-pointer hover:bg-emerald-600 text-white font-black rounded-xl gap-2">
              WhatsApp Now
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

function QuickSpec({ label, value, icon, capitalize }: { label: string; value: string; icon: React.ReactNode; capitalize?: boolean }) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-emerald-100 transition-colors">
      <div className="p-2 w-fit rounded-lg bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={cn("text-sm font-black text-slate-800 tracking-tight", capitalize && "capitalize")}>{value}</p>
      </div>
    </div>
  )
}
