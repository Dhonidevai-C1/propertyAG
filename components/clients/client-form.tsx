'use client'

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Plus, 
  Minus, 
  X, 
  Loader2,
  Sparkles,
  Search,
  CalendarIcon,
  Check,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

const clientFormSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  source: z.string().optional(),
  notes: z.string().optional(),
  
  lookingFor: z.enum(["Buy", "Rent"]),
  propertyTypes: z.array(z.string()).min(1, "Select at least one property type"),
  locations: z.array(z.string()),
  
  minBudget: z.number().min(0),
  maxBudget: z.number().min(0),
  
  minBeds: z.string().optional(),
  minArea: z.number().optional(),
  furnishing: z.string().optional(),
  timeline: z.string().optional(),
  
  priority: z.enum(["Low", "Medium", "High"]),
  followUpDate: z.date().optional(),
  assignedTo: z.string().optional(),
}).refine(data => data.maxBudget === 0 || data.maxBudget >= data.minBudget, {
  message: "Max budget must be greater than or equal to min budget",
  path: ["maxBudget"],
})

type ClientFormValues = z.infer<typeof clientFormSchema>

interface ClientFormProps {
  initialData?: Partial<ClientFormValues> & { id?: string }
  mode?: "add" | "edit"
}

export function ClientForm({ initialData, mode = "add" }: ClientFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      lookingFor: initialData?.lookingFor || "Buy",
      propertyTypes: initialData?.propertyTypes || [],
      locations: initialData?.locations || [],
      minBudget: initialData?.minBudget || 0,
      maxBudget: initialData?.maxBudget || 0,
      priority: initialData?.priority || "Medium",
      minBeds: initialData?.minBeds || "Any",
      minArea: initialData?.minArea,
      furnishing: initialData?.furnishing || "Any",
      timeline: initialData?.timeline || "Flexible",
      source: initialData?.source || "Walk-in",
      assignedTo: initialData?.assignedTo || "Ravi Kumar",
      notes: initialData?.notes || "",
    },
  })

  const lookingFor = watch("lookingFor")
  const propertyTypes = watch("propertyTypes")
  const locations = watch("locations")
  const minBudget = watch("minBudget")
  const maxBudget = watch("maxBudget")
  const priority = watch("priority")
  const followUpDate = watch("followUpDate")
  const minBeds = watch("minBeds")
  const furnishing = watch("furnishing")
  const timeline = watch("timeline")
  const source = watch("source")
  const assignedTo = watch("assignedTo")
  
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [isMatching, setIsMatching] = useState(false)

  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (mode === "add") {
      toast.success("Client added! Searching for matches...")
      // Simulate matching engine for new client
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.info("3 matches found for this client.", {
        description: "Based on their location and budget preferences.",
        duration: 5000,
      })
    } else {
      toast.success("Client updated successfully!")
    }
    
    setIsSubmitting(false)
    router.push(mode === "add" ? "/clients" : `/clients/${initialData?.id}`)
  }

  const handleDiscard = () => {
    if (isDirty) {
      setShowDiscardDialog(true)
    } else {
      router.back()
    }
  }

  const runSmartMatch = async () => {
    setIsMatching(true)
    toast.loading("Running match engine...", { id: "match-toast" })
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success("Found 5 matching properties!", {
      id: "match-toast",
      description: "Match results updated based on new requirements.",
    })
    setIsMatching(false)
  }

  // Budget formatting helper
  const formatCurrencyInWords = (value: number) => {
    if (value === 0) return ""
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} Lakh`
    return `₹${value.toLocaleString()}`
  }

  const budgetDisplay = `${formatCurrencyInWords(minBudget)}${minBudget && maxBudget ? " – " : ""}${formatCurrencyInWords(maxBudget)}`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Details */}
      <Section title="Personal details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={cn(errors.name && "text-red-500")}>Full Name *</Label>
            <Input 
              placeholder="e.g. Anil Sharma" 
              {...register("name")}
              className={cn("h-11 rounded-xl", errors.name && "border-red-500")}
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label className={cn(errors.phone && "text-red-500")}>Phone Number *</Label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">+91</span>
              <Input 
                type="tel"
                placeholder="98290XXXXX" 
                {...register("phone")}
                className={cn("h-11 rounded-xl pl-12", errors.phone && "border-red-500")}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input 
              type="email"
              placeholder="anil.sharma@example.com" 
              {...register("email")}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Select onValueChange={(v) => setValue("source", v as string)} value={source}>
              <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Social media">Social media</SelectItem>
                <SelectItem value="Property portal">Property portal</SelectItem>
                <SelectItem value="Cold call">Cold call</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <Label>Notes</Label>
            <Textarea 
              placeholder="Any additional notes about this client..."
              {...register("notes")}
              className="rounded-xl min-h-[100px] bg-white border-slate-200 resize-none"
            />
          </div>
        </div>
      </Section>

      {/* Property Requirements */}
      <Card className="p-6 border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">What they're looking for</h3>
        </div>
        <p className="text-sm text-slate-400 font-medium mb-8">
          These fields are used by the smart matching engine.
        </p>

        <div className="space-y-10">
          {/* Looking for Toggle */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Looking for</Label>
            <div className="flex gap-3">
              {["Buy", "Rent"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setValue("lookingFor", option as any, { shouldDirty: true })}
                  className={cn(
                    "flex-1 h-12 rounded-2xl font-bold text-sm transition-all border-2",
                    lookingFor === option 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {option === "Buy" ? "Buying" : "Renting"}
                </button>
              ))}
            </div>
          </div>

          {/* Property Types - Multi select pill toggles */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Property type</Label>
            <div className="flex flex-wrap gap-2.5">
              {["Apartment", "Villa", "Independent House", "Plot", "Commercial", "Farmhouse", "Penthouse"].map((type) => {
                const isSelected = propertyTypes.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      const current = [...propertyTypes]
                      if (isSelected) {
                        setValue("propertyTypes", current.filter(t => t !== type), { shouldDirty: true })
                      } else {
                        setValue("propertyTypes", [...current, type], { shouldDirty: true })
                      }
                    }}
                    className={cn(
                      "px-4 py-2.5 rounded-full text-xs font-bold transition-all border-2",
                      isSelected 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-500" 
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                    )}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
            {errors.propertyTypes && <p className="text-xs text-red-500 font-medium">{errors.propertyTypes.message}</p>}
          </div>

          {/* Tag Input for Locations */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Preferred location(s)</Label>
            <div className="space-y-3">
               <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Type a locality and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val && !locations.includes(val)) {
                        setValue("locations", [...locations, val], { shouldDirty: true });
                        (e.target as HTMLInputElement).value = ""
                      }
                    }
                  }}
                  className="h-11 pl-10 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {locations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 group animate-in zoom-in-95">
                    {loc}
                    <button 
                      type="button" 
                      onClick={() => setValue("locations", locations.filter(l => l !== loc), { shouldDirty: true })}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div className="space-y-4">
            <Label className="text-sm font-bold text-slate-700">Budget range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r pr-2 h-5 flex items-center">₹</span>
                <Input 
                  type="number"
                  placeholder="Min" 
                  {...register("minBudget", { valueAsNumber: true })}
                  className="h-11 pl-10 rounded-xl bg-white border-slate-200 focus:border-emerald-500 transition-all font-bold"
                />
              </div>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold border-r pr-2 h-5 flex items-center">₹</span>
                <Input 
                  type="number"
                  placeholder="Max" 
                  {...register("maxBudget", { valueAsNumber: true })}
                  className={cn(
                    "h-11 pl-10 rounded-xl bg-white border-slate-200 focus:border-emerald-500 transition-all font-bold",
                    errors.maxBudget && "border-red-500"
                  )}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 inline-block min-w-[200px] text-center">
                {budgetDisplay || "Enter amount range"}
              </p>
              {errors.maxBudget && <p className="text-xs text-red-500 font-bold italic">{errors.maxBudget.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <Label className="text-sm font-bold text-slate-700">Minimum bedrooms</Label>
              <div className="flex gap-2">
                {["Any", "1", "2", "3", "4", "5+"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setValue("minBeds", opt, { shouldDirty: true })}
                    className={cn(
                      "w-10 h-10 rounded-xl text-xs font-bold transition-all border-2",
                      minBeds === opt 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-bold text-slate-700">Minimum area (sq ft)</Label>
              <Input 
                type="number"
                placeholder="e.g. 1200"
                {...register("minArea", { valueAsNumber: true })}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-4">
              <Label className="text-sm font-bold text-slate-700">Furnishing preference</Label>
              <Select onValueChange={(v) => setValue("furnishing", v as string)} value={furnishing}>
                <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 font-medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Any">Any</SelectItem>
                  <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                  <SelectItem value="Semi">Semi-furnished</SelectItem>
                  <SelectItem value="Fully furnished">Fully furnished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-bold text-slate-700">Possession timeline</Label>
              <Select onValueChange={(v) => setValue("timeline", v as string)} value={timeline}>
                <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 font-medium">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Immediate">Immediate</SelectItem>
                  <SelectItem value="Within 3 months">Within 3 months</SelectItem>
                  <SelectItem value="Within 6 months">Within 6 months</SelectItem>
                  <SelectItem value="Within 1 year">Within 1 year</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Priority & Follow-up */}
      <Section title="Priority & follow-up">
        <div className="space-y-8">
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700">Lead priority</Label>
            <div className="flex gap-4">
              {["Low", "Medium", "High"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue("priority", p as any, { shouldDirty: true })}
                  className={cn(
                    "flex-1 h-12 rounded-2xl font-bold text-sm transition-all border-2",
                    priority === p 
                      ? p === "High" 
                        ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100"
                        : "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label>Next Follow-up Date</Label>
              <Popover>
                <PopoverTrigger>
                  <Button
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "w-full h-11 rounded-xl text-left font-medium border-slate-200 bg-white",
                      !followUpDate && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {followUpDate ? format(followUpDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white shadow-xl rounded-2xl border-none" align="start">
                  <Calendar
                    mode="single"
                    selected={followUpDate}
                    onSelect={(date) => setValue("followUpDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select onValueChange={(v) => setValue("assignedTo", v as string)} value={assignedTo}>
                <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 font-medium">
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Ravi Kumar">Ravi Kumar</SelectItem>
                  <SelectItem value="Sneha Sharma">Sneha Sharma</SelectItem>
                  <SelectItem value="Anil Singh">Anil Singh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Section>

      {/* Action Bar */}
      <div className="flex flex-col gap-4 sticky bottom-6 z-30">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            className="flex-1 h-12 rounded-2xl font-bold text-slate-500 hover:text-slate-900 bg-white/80 backdrop-blur"
            onClick={handleDiscard}
          >
            Discard changes
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-2 h-12 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-xl shadow-emerald-100"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === "add" ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add client + find matches
                  </>
                ) : (
                  "Save changes"
                )}
              </>
            )}
          </Button>
        </div>
        
        {mode === "edit" && (
          <button 
            type="button"
            onClick={runSmartMatch}
            disabled={isMatching}
            className="w-full flex items-center justify-center gap-2 text-amber-600 hover:text-amber-700 font-bold py-2 transition-colors disabled:opacity-50"
          >
            <Sparkles className={cn("w-4 h-4", isMatching && "animate-pulse")} />
            <span className="text-sm border-b border-amber-200">Re-run smart match with updated requirements</span>
          </button>
        )}
      </div>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="bg-white rounded-2xl max-w-[400px]">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 text-center">Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-center pt-1">
              You have unsaved changes. Leaving this page will lose all modifications made to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <AlertDialogCancel className="flex-1 border-slate-200 rounded-xl font-bold h-11">
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none rounded-xl font-bold h-11"
              onClick={() => router.back()}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6 border-slate-100 shadow-sm rounded-3xl bg-white">
      <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">{title}</h3>
      {children}
    </Card>
  )
}
