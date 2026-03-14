'use client'

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Plus, 
  Minus, 
  ArrowRight, 
  ImagePlus, 
  X, 
  Loader2,
  AlertCircle,
  Building2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const propertyFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.string().min(1, "Please select a property type"),
  bhk: z.string().min(1, "Please select BHK"),
  status: z.string().min(1, "Please select a status"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area/Locality is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  bedrooms: z.number().min(0).max(10),
  bathrooms: z.number().min(0).max(10),
  floorNumber: z.string().optional(),
  totalFloors: z.string().optional(),
  sqft: z.number().min(1, "Area is required"),
  facing: z.string().optional(),
  furnishing: z.string().optional(),
  parking: z.string().optional(),
  price: z.number().min(1, "Price is required"),
  negotiable: z.boolean(),
  maintenance: z.number().optional(),
})

type PropertyFormValues = z.infer<typeof propertyFormSchema>

interface PropertyFormProps {
  initialData?: Partial<PropertyFormValues> & { id?: string }
  mode?: "add" | "edit"
}

export function PropertyForm({ initialData, mode = "add" }: PropertyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [images, setImages] = useState<string[]>(initialData?.id ? ["img-1", "img-2"] : []) // Mock existing images for edit
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      type: initialData?.type || "",
      bhk: initialData?.bhk || "",
      status: initialData?.status || "Available",
      description: initialData?.description || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      area: initialData?.area || "",
      pincode: initialData?.pincode || "",
      bedrooms: initialData?.bedrooms || 0,
      bathrooms: initialData?.bathrooms || 0,
      sqft: initialData?.sqft || 0,
      price: initialData?.price || 0,
      negotiable: initialData?.negotiable ?? false,
      floorNumber: initialData?.floorNumber || "",
      totalFloors: initialData?.totalFloors || "",
      facing: initialData?.facing || "",
      furnishing: initialData?.furnishing || "",
      parking: initialData?.parking || "",
      maintenance: initialData?.maintenance,
    },
  })

  const bhkValue = watch("bhk")
  const typeValue = watch("type")
  const statusValue = watch("status")
  const facingValue = watch("facing")
  const furnishingValue = watch("furnishing")
  const parkingValue = watch("parking")
  const bedroomsValue = watch("bedrooms")
  const bathroomsValue = watch("bathrooms")
  const negotiableValue = watch("negotiable")

  const onSubmit = async (data: PropertyFormValues) => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success(mode === "edit" ? "Property updated successfully!" : "Property listed successfully!")
    setIsSubmitting(false)
    router.push(mode === "edit" ? `/properties/${initialData?.id}` : "/properties")
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success("Saved as draft")
    setIsSavingDraft(false)
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                  <Label htmlFor="type" className={cn(errors.type && "text-red-500")}>Property Type</Label>
                  <Select onValueChange={(v) => setValue("type", v as string, { shouldDirty: true })} value={typeValue}>
                    <SelectTrigger className={cn(errors.type && "border-red-500")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Villa">Villa</SelectItem>
                      <SelectItem value="Independent House">Independent House</SelectItem>
                      <SelectItem value="Plot">Plot</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Farmhouse">Farmhouse</SelectItem>
                      <SelectItem value="Penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bhk" className={cn(errors.bhk && "text-red-500")}>BHK</Label>
                  <Select onValueChange={(v) => setValue("bhk", v as string, { shouldDirty: true })} value={bhkValue}>
                    <SelectTrigger className={cn(errors.bhk && "border-red-500")}>
                      <SelectValue placeholder="Select BHK" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1 BHK">1 BHK</SelectItem>
                      <SelectItem value="2 BHK">2 BHK</SelectItem>
                      <SelectItem value="3 BHK">3 BHK</SelectItem>
                      <SelectItem value="4 BHK">4 BHK</SelectItem>
                      <SelectItem value="5+ BHK">5+ BHK</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.bhk && <p className="text-xs text-red-500">{errors.bhk.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status" className={cn(errors.status && "text-red-500")}>Status</Label>
                  <Select onValueChange={(v) => setValue("status", v as string, { shouldDirty: true })} value={statusValue}>
                    <SelectTrigger className={cn(errors.status && "border-red-500")}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Rented">Rented</SelectItem>
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
              <div className="grid gap-2">
                <Label htmlFor="address" className={cn(errors.address && "text-red-500")}>Address Line</Label>
                <Input id="address" {...register("address")} className={cn(errors.address && "border-red-500")} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city" className={cn(errors.city && "text-red-500")}>City</Label>
                  <Input id="city" {...register("city")} className={cn(errors.city && "border-red-500")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area" className={cn(errors.area && "text-red-500")}>Area</Label>
                  <Input id="area" {...register("area")} className={cn(errors.area && "border-red-500")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pincode" className={cn(errors.pincode && "text-red-500")}>Pincode</Label>
                  <Input id="pincode" {...register("pincode")} className={cn(errors.pincode && "border-red-500")} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Specifications">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <NumberStepper label="Bedrooms" value={bedroomsValue} onChange={(val) => setValue("bedrooms", val, { shouldDirty: true })} />
                <NumberStepper label="Bathrooms" value={bathroomsValue} onChange={(val) => setValue("bathrooms", val, { shouldDirty: true })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Floor Number</Label>
                  <Input placeholder="Floor No." {...register("floorNumber")} />
                </div>
                <div className="grid gap-2">
                  <Label>Total Floors</Label>
                  <Input placeholder="Total Floors" {...register("totalFloors")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Area (sq ft)</Label>
                  <Input type="number" placeholder="Area (sq ft)" {...register("sqft", { valueAsNumber: true })} />
                </div>
                <div className="grid gap-2">
                  <Label>Facing</Label>
                  <Select onValueChange={(v) => setValue("facing", v as string, { shouldDirty: true })} value={facingValue}>
                    <SelectTrigger><SelectValue placeholder="Facing" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Furnishing</Label>
                  <Select onValueChange={(v) => setValue("furnishing", v as string, { shouldDirty: true })} value={furnishingValue}>
                    <SelectTrigger><SelectValue placeholder="Furnishing" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                      <SelectItem value="Semi-furnished">Semi-furnished</SelectItem>
                      <SelectItem value="Fully furnished">Fully furnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 max-w-[200px]">
                <Label>Parking</Label>
                <Select onValueChange={(v) => setValue("parking", v as string, { shouldDirty: true })} value={parkingValue}>
                  <SelectTrigger><SelectValue placeholder="Parking" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="Covered">Covered</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <Section title="Pricing">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="grid gap-2 flex-1">
                  <Label>Price</Label>
                  <Input type="number" placeholder="Price" {...register("price", { valueAsNumber: true })} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={negotiableValue} onCheckedChange={(checked) => setValue("negotiable", checked, { shouldDirty: true })} />
                  <Label>Price negotiable</Label>
                </div>
              </div>
              <div className="grid gap-2 max-w-[250px]">
                <Label>Maintenance Charge</Label>
                <Input type="number" placeholder="Maintenance" {...register("maintenance", { valueAsNumber: true })} />
              </div>
            </div>
          </Section>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <Section title="Property Images">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setImages([...images, "new-img"])}>
                <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 font-medium">Add more images</p>
              </div>
              {images.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="aspect-square bg-slate-100 rounded-lg relative overflow-hidden group border border-slate-200">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-slate-200" />
                        </div>
                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                      </div>
                    ))}
                  </div>
                  {mode === "edit" && <p className="text-slate-400 text-[10px] font-medium italic">Already uploaded images</p>}
                </div>
              )}
            </Section>
            
            <div className="hidden lg:flex flex-col gap-3">
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white border-none h-11 text-base font-semibold">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "edit" ? "Save Changes" : "Publish Property"}
              </Button>
              <Button type="button" variant="ghost" className="text-slate-600" onClick={handleDiscard}>
                {mode === "edit" ? "Discard changes" : "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Discard Confirmation Dialog */}
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
             <Button variant="outline" className="flex-1 border-slate-200 rounded-xl" onClick={() => setIsDiscardDialogOpen(false)}>
              Keep editing
            </Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-xl" onClick={confirmDiscard}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-500"><Minus className="w-4 h-4" /></button>
        <div className="w-10 text-center font-bold text-slate-900">{value}</div>
        <button type="button" onClick={() => onChange(Math.min(10, value + 1))} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-slate-500"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  )
}
