'use client'

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Plus,
  Minus,
  ImagePlus,
  X,
  Loader2,
  AlertCircle,
  Building2,
  Check,
  Star,
  Zap,
  ShieldCheck
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

import { ImageCropperDialog } from "@/components/properties/image-cropper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { PropertyFormSchema, PropertyFormValues } from "@/lib/validations/property"
import { createProperty, updateProperty } from "@/lib/actions/properties"

interface PropertyFormProps {
  initialData?: Partial<PropertyFormValues> & { id?: string }
  mode?: "add" | "edit"
}

const AMENITIES_OPTIONS = [
  "Swimming Pool", "Gym", "Clubhouse", "Park", "Security 24/7", 
  "Power Backup", "Car Parking", "CCTV", "Lift", "Fire Safety",
  "Gas Pipeline", "Jogging Track", "Intercom", "Maintenance Staff"
]

const APPROVAL_OPTIONS = ["JDA", "HBA", "Society", "90B", "Other"]

const FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"]

export function PropertyForm({ initialData, mode = "add" }: PropertyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  // Map initialData ensuring nulls from DB are handled correctly for the form
  const defaultValues: PropertyFormValues = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    property_type: initialData?.property_type || "apartment",
    status: initialData?.status || "available",
    listing_type: initialData?.listing_type || "sale",
    price: initialData?.price || 0,
    price_negotiable: initialData?.price_negotiable ?? false,
    locality: initialData?.locality || "",
    city: initialData?.city || "",
    address: initialData?.address || "",
    bhk: initialData?.bhk || 0,
    bedrooms: initialData?.bedrooms || 0,
    bathrooms: initialData?.bathrooms || 0,
    area_sqft: initialData?.area_sqft || 0,
    area_unit: initialData?.area_unit || "sqft",
    road_info: initialData?.road_info || "",
    furnishing: initialData?.furnishing || "unfurnished",
    pincode: initialData?.pincode || "",
    floor_number: initialData?.floor_number || "",
    total_floors: initialData?.total_floors || "",
    facing: initialData?.facing || "",
    parking: initialData?.parking || "",
    maintenance_charge: initialData?.maintenance_charge || 0,
    cover_image_url: initialData?.cover_image_url || "",
    image_urls: initialData?.image_urls || [],
    // New fields
    seller_name: initialData?.seller_name || "",
    seller_phone: initialData?.seller_phone || "",
    approval_type: initialData?.approval_type || "",
    slug: initialData?.slug || "",
    is_featured: initialData?.is_featured ?? false,
    is_new: initialData?.is_new ?? true,
    amenities: initialData?.amenities || [],
    balconies: initialData?.balconies || 0,
    google_maps_url: initialData?.google_maps_url || "",
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertyFormSchema) as any,
    defaultValues: defaultValues as any,
  })

  const propertyTypeValue = watch("property_type")
  const statusValue = watch("status")
  const listingTypeValue = watch("listing_type")
  const approvalTypeValue = watch("approval_type")
  const areaUnitValue = watch("area_unit")
  const furnishingValue = watch("furnishing")
  const bedroomsValue = watch("bedrooms") || 0
  const bathroomsValue = watch("bathrooms") || 0
  const negotiableValue = watch("price_negotiable")
  const imageUrls = watch("image_urls") || []
  const coverImageUrl = watch("cover_image_url")
  const isFeatured = watch("is_featured")
  const isNew = watch("is_new")
  const selectedAmenities = watch("amenities") || []

  // Auto-generate slug from title if empty
  const titleValue = watch("title")
  useEffect(() => {
    if (mode === "add" && titleValue && !watch("slug")) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setValue("slug", generatedSlug)
    }
  }, [titleValue, setValue, mode])

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true)
    try {
      const result = mode === "edit" && initialData?.id
        ? await updateProperty(initialData.id, data)
        : await createProperty(data)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(mode === "edit" ? "Property updated successfully!" : "Property listed successfully!")
        router.push("/properties")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImageToCrop(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (base64: string) => {
    const newUrls = [...imageUrls, base64]
    setValue("image_urls", newUrls, { shouldDirty: true })
    if (!coverImageUrl) {
      setValue("cover_image_url", base64, { shouldDirty: true })
    }
    setImageToCrop(null)
  }

  const removeImage = (urlToRemove: string) => {
    const newUrls = imageUrls.filter(url => url !== urlToRemove)
    setValue("image_urls", newUrls, { shouldDirty: true })
    if (coverImageUrl === urlToRemove) {
      setValue("cover_image_url", newUrls[0] || "", { shouldDirty: true })
    }
  }

  const toggleAmenity = (amenity: string) => {
    const next = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity]
    setValue("amenities", next, { shouldDirty: true })
  }

  const handleDiscard = () => {
    if (isDirty) {
      setIsDiscardDialogOpen(true)
    } else {
      router.back()
    }
  }

  const confirmDiscard = () => {
    setIsDiscardDialogOpen(false)
    router.back()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Section title="Basic Info">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className={cn(errors.title && "text-red-500")}>Property Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. 3BHK Luxury Apartment"
                  {...register("title")}
                  className={cn(errors.title && "border-red-500")}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="listing_type">Listing Type</Label>
                  <Select onValueChange={(v) => setValue("listing_type", v as any, { shouldDirty: true })} value={listingTypeValue}>
                    <SelectTrigger className="bg-emerald-50 border-none font-bold text-emerald-700">
                      <SelectValue placeholder="Sale/Rent" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select onValueChange={(v) => setValue("property_type", v as any, { shouldDirty: true })} value={propertyTypeValue}>
                    <SelectTrigger className={cn(errors.property_type && "border-red-500")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="independent_house">Independent House</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="farmhouse">Farmhouse</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(v) => setValue("status", v as any, { shouldDirty: true })} value={statusValue}>
                    <SelectTrigger className="bg-slate-50 border-none font-bold text-slate-700">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className={cn(errors.description && "text-red-500")}>Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the property..."
                  rows={4}
                  {...register("description")}
                  className={cn("rounded-2xl bg-slate-50 border-transparent focus:bg-white transition-all", errors.description && "border-red-500")}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>
            </div>
          </Section>

          <Section title="Specifications">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label>Area & Measurement</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Area"
                      {...register("area_sqft", { valueAsNumber: true })}
                      className="flex-1"
                    />
                    <Select onValueChange={(v) => setValue("area_unit", v as any, { shouldDirty: true })} value={areaUnitValue}>
                      <SelectTrigger className="w-28 bg-slate-50 border-none font-medium">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="sqft">Sq. Ft</SelectItem>
                        <SelectItem value="sqyard">Sq. Yard</SelectItem>
                        <SelectItem value="sqm">Sq. Meter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="road_info">Road Information</Label>
                  <Input id="road_info" placeholder="e.g. 40ft wide road" {...register("road_info")} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bhk">BHK</Label>
                  <Input id="bhk" type="number" {...register("bhk", { valueAsNumber: true })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input id="bedrooms" type="number" {...register("bedrooms", { valueAsNumber: true })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input id="bathrooms" type="number" {...register("bathrooms", { valueAsNumber: true })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balconies">Balconies</Label>
                  <Input id="balconies" type="number" {...register("balconies", { valueAsNumber: true })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="furnishing">Furnishing</Label>
                  <Select onValueChange={(v) => setValue("furnishing", v as any, { shouldDirty: true })} value={furnishingValue}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                      <SelectItem value="semi_furnished">Semi Furnished</SelectItem>
                      <SelectItem value="fully_furnished">Fully Furnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                <div className="grid gap-2">
                  <Label htmlFor="facing">Facing Direction</Label>
                  <Select onValueChange={(v) => setValue("facing", v, { shouldDirty: true })} value={watch("facing") || ""}>
                    <SelectTrigger><SelectValue placeholder="Select Facing" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {FACING_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="floor_number">Floor Number</Label>
                  <Input id="floor_number" placeholder="e.g. 4th" {...register("floor_number")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_floors">Total Floors</Label>
                  <Input id="total_floors" placeholder="e.g. 10" {...register("total_floors")} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-50 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="approval_type">Approval Authority</Label>
                  <Select onValueChange={(v) => setValue("approval_type", v, { shouldDirty: true })} value={approvalTypeValue}>
                    <SelectTrigger className="bg-blue-50 border-none font-bold text-blue-700">
                      <SelectValue placeholder="Select Authority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white font-bold">
                      {APPROVAL_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Property Slug (URL)</Label>
                  <Input id="slug" placeholder="e.g. luxury-3bhk-villa" {...register("slug")} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="locality">Locality</Label>
                <Input id="locality" placeholder="e.g. Mansarovar" {...register("locality")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="e.g. Jaipur" {...register("city")} />
              </div>
              <div className="grid gap-2 text-left">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" placeholder="e.g. 302001" {...register("pincode")} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea id="address" placeholder="Complete property address..." rows={2} {...register("address")} />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="google_maps_url">Google Maps URL</Label>
                <Input id="google_maps_url" placeholder="https://goo.gl/maps/..." {...register("google_maps_url")} />
                <p className="text-[10px] text-slate-400 italic">Paste the link from Google Maps to help buyers find the exact location.</p>
              </div>
            </div>
          </Section>

          <Section title="Seller Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="seller_name">Seller Name</Label>
                <Input id="seller_name" placeholder="Contact person name" {...register("seller_name")} defaultValue={initialData?.seller_name || ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seller_phone">Seller Phone</Label>
                <Input id="seller_phone" placeholder="+91 XXXXX XXXXX" {...register("seller_phone")} defaultValue={initialData?.seller_phone || ""} />
              </div>
            </div>
          </Section>

          <Section title="Amenities">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAmenity(item)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all text-left",
                    selectedAmenities.includes(item)
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                      : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                    selectedAmenities.includes(item) ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                  )}>
                    {selectedAmenities.includes(item) && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {item}
                </button>
              ))}
            </div>
          </Section>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <Section title="Status & Badges">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-slate-900">Featured Property</Label>
                      <p className="text-[10px] text-slate-500">Show on the homepage</p>
                    </div>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={(c) => setValue("is_featured", c, { shouldDirty: true })} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold text-slate-900">New Listing</Label>
                      <p className="text-[10px] text-slate-500">Add 'NEW' badge icon</p>
                    </div>
                  </div>
                  <Switch checked={isNew} onCheckedChange={(c) => setValue("is_new", c, { shouldDirty: true })} />
                </div>
              </div>
            </Section>

            <Section title="Pricing">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label className={cn(errors.price && "text-red-500")}>Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Total Price"
                    {...register("price", { valueAsNumber: true })}
                    className={cn(errors.price && "border-red-500 h-12 text-lg font-bold text-emerald-600")}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={negotiableValue} onCheckedChange={(checked) => setValue("price_negotiable", checked, { shouldDirty: true })} />
                  <Label className="font-bold text-slate-700">Price negotiable</Label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maintenance_charge">Maintenance / Month (₹)</Label>
                  <Input
                    id="maintenance_charge"
                    type="number"
                    placeholder="Maintenance fee"
                    {...register("maintenance_charge", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </Section>

            <Section title="Property Images">
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
                  )}
                  <p className="text-xs text-slate-500 font-medium">
                    {uploadingImage ? "Uploading..." : "Click to upload images"}
                  </p>
                </div>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {imageUrls.map((url, i) => (
                      <div key={url} className="aspect-square rounded-lg relative overflow-hidden group border border-slate-200 shadow-sm">
                        <Image src={url} alt={`Property ${i + 1}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setValue("cover_image_url", url, { shouldDirty: true })}
                            className={cn(
                              "bg-white rounded-full p-2 text-slate-600 hover:text-emerald-500 transition-colors",
                              coverImageUrl === url && "text-emerald-500 bg-emerald-50"
                            )}
                            title="Set as cover image"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => removeImage(url)} className="bg-white rounded-full p-2 text-slate-600 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting || uploadingImage} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none h-12 text-base font-bold rounded-xl shadow-lg shadow-emerald-100">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "edit" ? "Save Changes" : "Publish Property →"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {imageToCrop && (
        <ImageCropperDialog
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
        {title}
      </h3>
      {children}
    </Card>
  )
}
