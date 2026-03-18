'use client'

import React, { useState } from "react"
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
  Check
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
    price: initialData?.price || 0,
    price_negotiable: initialData?.price_negotiable ?? false,
    locality: initialData?.locality || "",
    city: initialData?.city || "",
    address: initialData?.address || "",
    bhk: initialData?.bhk || 0,
    bedrooms: initialData?.bedrooms || 0,
    bathrooms: initialData?.bathrooms || 0,
    area_sqft: initialData?.area_sqft || 0,
    furnishing: initialData?.furnishing || "unfurnished",
    pincode: initialData?.pincode || "",
    floor_number: initialData?.floor_number || "",
    total_floors: initialData?.total_floors || "",
    facing: initialData?.facing || "",
    parking: initialData?.parking || "",
    maintenance_charge: initialData?.maintenance_charge || 0,
    cover_image_url: initialData?.cover_image_url || "",
    image_urls: initialData?.image_urls || [],
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertyFormSchema),
    defaultValues,
  })

  const propertyTypeValue = watch("property_type")
  const statusValue = watch("status")
  const furnishingValue = watch("furnishing")
  const bedroomsValue = watch("bedrooms") || 0
  const bathroomsValue = watch("bathrooms") || 0
  const negotiableValue = watch("price_negotiable")
  const imageUrls = watch("image_urls") || []
  const coverImageUrl = watch("cover_image_url")

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
        router.push(`/properties/${result.data?.id || ""}`)
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageToCrop(url)
    // Clear input so we can select same file again if aborted
    e.target.value = ""
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setImageToCrop(null)
    setUploadingImage(true)
    const formData = new FormData()
    formData.append("file", croppedBlob, "upload.jpg")
    if (initialData?.id) {
      formData.append("propertyId", initialData.id)
    }

    try {
      const res = await fetch("/api/properties/upload", {
        method: "POST",
        body: formData,
      })
      const result = await res.json()

      if (result.error) {
        toast.error(result.error)
      } else {
        const uploadedUrl = result.url || result.urls?.[0]
        if (!uploadedUrl) throw new Error("No URL returned")

        const newUrls = [...imageUrls, uploadedUrl]
        setValue("image_urls", newUrls, { shouldDirty: true })
        if (!coverImageUrl) {
          setValue("cover_image_url", uploadedUrl, { shouldDirty: true })
        }
        toast.success("Image uploaded successfully")
      }
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (urlToRemove: string) => {
    const newUrls = imageUrls.filter(url => url !== urlToRemove)
    setValue("image_urls", newUrls, { shouldDirty: true })
    if (coverImageUrl === urlToRemove) {
      setValue("cover_image_url", newUrls[0] || "", { shouldDirty: true })
    }
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
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="property_type" className={cn(errors.property_type && "text-red-500")}>Property Type</Label>
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
                  {errors.property_type && <p className="text-xs text-red-500">{errors.property_type.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status" className={cn(errors.status && "text-red-500")}>Status</Label>
                  <Select onValueChange={(v) => setValue("status", v as any, { shouldDirty: true })} value={statusValue}>
                    <SelectTrigger className={cn(errors.status && "border-red-500")}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className={cn(errors.description && "text-red-500")}>Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the property..."
                  rows={4}
                  {...register("description")}
                  className={cn("resize-none", errors.description && "border-red-500")}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>
            </div>
          </Section>

          <Section title="Location">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="locality" className={cn(errors.locality && "text-red-500")}>Locality/Area</Label>
                  <Input id="locality" {...register("locality")} className={cn(errors.locality && "border-red-500")} />
                  {errors.locality && <p className="text-xs text-red-500">{errors.locality.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city" className={cn(errors.city && "text-red-500")}>City</Label>
                  <Input id="city" {...register("city")} className={cn(errors.city && "border-red-500")} />
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">Full Address (Optional)</Label>
                  <Input id="address" {...register("address")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" {...register("pincode")} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Specifications">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NumberStepper
                  label="BHK"
                  value={watch("bhk") || 0}
                  onChange={(val) => setValue("bhk", val, { shouldDirty: true })}
                />
                <NumberStepper
                  label="Bedrooms"
                  value={bedroomsValue}
                  onChange={(val) => setValue("bedrooms", val, { shouldDirty: true })}
                />
                <NumberStepper
                  label="Bathrooms"
                  value={bathroomsValue}
                  onChange={(val) => setValue("bathrooms", val, { shouldDirty: true })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="area_sqft" className={cn(errors.area_sqft && "text-red-500")}>Super Area (sq ft)</Label>
                  <Input
                    id="area_sqft"
                    type="number"
                    placeholder="Area in sq ft"
                    {...register("area_sqft", { valueAsNumber: true })}
                    className={cn(errors.area_sqft && "border-red-500")}
                  />
                  {errors.area_sqft && <p className="text-xs text-red-500">{errors.area_sqft.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label>Furnishing</Label>
                  <Select onValueChange={(v) => setValue("furnishing", v as any, { shouldDirty: true })} value={furnishingValue}>
                    <SelectTrigger><SelectValue placeholder="Furnishing" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                      <SelectItem value="semi_furnished">Semi-furnished</SelectItem>
                      <SelectItem value="fully_furnished">Fully furnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="floor_number">Floor No.</Label>
                  <Input id="floor_number" placeholder="e.g. 5" {...register("floor_number")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_floors">Total Floors</Label>
                  <Input id="total_floors" placeholder="e.g. 12" {...register("total_floors")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="facing">Facing</Label>
                  <Input id="facing" placeholder="e.g. East" {...register("facing")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parking">Parking</Label>
                  <Input id="parking" placeholder="e.g. 1 Covered" {...register("parking")} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Pricing">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="grid gap-2 flex-1">
                  <Label className={cn(errors.price && "text-red-500")}>Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="Total Price"
                    {...register("price", { valueAsNumber: true })}
                    className={cn(errors.price && "border-red-500")}
                  />
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="maintenance_charge">Maintenance / Month (₹)</Label>
                  <Input
                    id="maintenance_charge"
                    type="number"
                    placeholder="Maintenance fee"
                    {...register("maintenance_charge", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch checked={negotiableValue} onCheckedChange={(checked) => setValue("price_negotiable", checked, { shouldDirty: true })} />
                <Label>Price negotiable</Label>
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
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
                        <Image
                          src={url}
                          alt={`Property ${i + 1}`}
                          fill
                          className="object-cover"
                        />
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
                            {coverImageUrl === url ? <Check className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="bg-white rounded-full p-2 text-slate-600 hover:text-red-500 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {coverImageUrl === url && (
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            COVER
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting || uploadingImage} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none h-11 text-base font-semibold rounded-lg shadow-sm">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "edit" ? "Save Changes" : "Publish Property"}
              </Button>
              <Button type="button" variant="ghost" className="text-slate-600 hover:bg-slate-50 rounded-lg" onClick={handleDiscard}>
                {mode === "edit" ? "Discard changes" : "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
        <DialogContent className="bg-white rounded-2xl max-w-[400px]">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">Discard unsaved changes?</DialogTitle>
            <DialogDescription className="text-slate-500 pt-1">
              Your edits will not be saved. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-start pt-4">
            <Button variant="outline" className="flex-1 border-slate-200 rounded-xl h-10" onClick={() => setIsDiscardDialogOpen(false)}>
              Keep editing
            </Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-xl h-10" onClick={confirmDiscard}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    <Card className="p-6 border-slate-100 shadow-sm rounded-xl bg-white">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
      {children}
    </Card>
  )
}

function NumberStepper({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 w-fit">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-500 transition-colors"><Minus className="w-4 h-4" /></button>
        <div className="min-w-10 text-center font-bold text-slate-900">{value}</div>
        <button type="button" onClick={() => onChange(Math.min(20, value + 1))} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-500 transition-colors"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
