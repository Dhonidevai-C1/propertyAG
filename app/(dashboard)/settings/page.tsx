'use client'

import React, { useState, useEffect } from "react"
import { 
  User, 
  Building2, 
  Lock, 
  Bell, 
  Camera, 
  Trash2, 
  Globe, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Smartphone, 
  Laptop,
  Check,
  AlertCircle
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"

// --- Schemas ---
const profileSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  title: z.string().optional(),
})

const agencySchema = z.object({
  agencyName: z.string().min(2, "Agency name is too short"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  reraNumber: z.string().optional(),
  notificationEmail: z.string().email("Invalid email"),
})

const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const notificationsSchema = z.object({
  newClient: z.boolean(),
  matchFound: z.boolean(),
  statusChange: z.boolean(),
  teamJoined: z.boolean(),
  weeklySummary: z.boolean(),
})

// --- Types ---
type TabType = 'Profile' | 'Agency' | 'Security' | 'Notifications'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('Profile')

  // --- Forms ---
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "Aman Gupta",
      email: "aman@propdesk.com",
      phone: "+91 98765 43210",
      title: "Senior Property Consultant",
    }
  })

  const agencyForm = useForm<z.infer<typeof agencySchema>>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      agencyName: "PropDesk Rajasthan",
      website: "https://propdesk.com",
      address: "Suite 402, Jaipur Business Centre, Jaipur",
      contactPhone: "+91 141 234567",
      reraNumber: "RAJ/P/2023/1234",
      notificationEmail: "alerts@propdesk.com",
    }
  })

  const securityForm = useForm<z.infer<typeof securitySchema>>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  })

  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      newClient: true,
      matchFound: true,
      statusChange: true,
      teamJoined: true,
      weeklySummary: false,
    }
  })

  const onProfileSubmit = (data: any) => {
    console.log("Profile updated:", data)
    toast.success("Profile updated successfully")
    profileForm.reset(data)
  }

  const onAgencySubmit = (data: any) => {
    console.log("Agency updated:", data)
    toast.success("Agency information saved")
    agencyForm.reset(data)
  }

  const onSecuritySubmit = (data: any) => {
    console.log("Password changed:", data)
    toast.success("Password updated successfully")
    securityForm.reset()
  }

  const onNotificationsSubmit = (data: any) => {
    console.log("Notifications updated:", data)
    toast.success("Notification preferences saved")
    notificationsForm.reset(data)
  }

  const TABS = [
    { id: 'Profile', label: 'Profile', icon: User, dirty: profileForm.formState.isDirty },
    { id: 'Agency', label: 'Agency', icon: Building2, dirty: agencyForm.formState.isDirty },
    { id: 'Security', label: 'Security', icon: Lock, dirty: securityForm.formState.isDirty },
    { id: 'Notifications', label: 'Notifications', icon: Bell, dirty: notificationsForm.formState.isDirty },
  ] as const

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-48 lg:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative shrink-0",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20" 
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-emerald-500" : "text-slate-400")} />
                  {tab.label}
                  {tab.dirty && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full border-2 border-white shadow-sm" />
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
            {activeTab === 'Profile' && <ProfileTab form={profileForm} onSubmit={onProfileSubmit} />}
            {activeTab === 'Agency' && <AgencyTab form={agencyForm} onSubmit={onAgencySubmit} />}
            {activeTab === 'Security' && <SecurityTab form={securityForm} onSubmit={onSecuritySubmit} />}
            {activeTab === 'Notifications' && <NotificationsTab form={notificationsForm} onSubmit={onNotificationsSubmit} />}
          </div>
        </main>
      </div>
    </div>
  )
}

// --- Tab Components ---

function ProfileTab({ form, onSubmit }: { form: any, onSubmit: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-slate-100 shadow-sm rounded-3xl bg-white space-y-8">
        <div className="space-y-4">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Profile photo</h3>
           <div className="flex items-center gap-6">
             <Avatar className="h-20 w-20 border-2 border-slate-100 ring-4 ring-slate-50">
               <AvatarFallback className="text-xl font-bold bg-slate-100 text-slate-500">AG</AvatarFallback>
             </Avatar>
             <div className="space-y-2">
               <div className="flex gap-2">
                 <Button variant="outline" className="h-9 px-4 rounded-xl font-bold text-xs">Change photo</Button>
                 <Button variant="ghost" className="h-9 px-4 rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 hover:text-red-600">Remove</Button>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Recommended: Square image, at least 400x400px</p>
             </div>
           </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full name</Label>
              <Input 
                {...form.register("fullName")}
                className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" 
              />
              {form.formState.errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1">{form.formState.errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email address</Label>
              <Input 
                {...form.register("email")}
                className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" 
              />
              {form.formState.errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone number</Label>
              <Input 
                {...form.register("phone")}
                className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Designation / Title</Label>
              <Input 
                {...form.register("title")}
                placeholder="e.g. Senior Property Consultant"
                className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" 
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={!form.formState.isDirty}
              className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none"
            >
              Save profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function AgencyTab({ form, onSubmit }: { form: any, onSubmit: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-slate-100 shadow-sm rounded-3xl bg-white space-y-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="sm:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Agency Branding</h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/10 transition-all">
                  <Camera className="w-6 h-6 text-slate-300 group-hover:text-emerald-400" />
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-500">Upload logo</span>
                </div>
                <div className="flex-1 space-y-3 pt-2">
                   <p className="text-sm font-bold text-slate-700">PropDesk Rajasthan</p>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">This logo will appear on all property reports, client messages, and your agency storefront.</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">SVG, PNG or JPG (max. 800x400px)</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Agency name</Label>
              <Input {...form.register("agencyName")} className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input {...form.register("website")} className="pl-10 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" />
              </div>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Office Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Textarea {...form.register("address")} className="pl-10 h-24 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium resize-none pt-3" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input {...form.register("contactPhone")} className="pl-10 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">RERA Number</Label>
              <Input {...form.register("reraNumber")} className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notification Email</Label>
              <Input {...form.register("notificationEmail")} className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium" />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
                type="submit" 
                disabled={!form.formState.isDirty}
                className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none"
              >
                Save agency info
              </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function SecurityTab({ form, onSubmit }: { form: any, onSubmit: (data: any) => void }) {
  const [strength, setStrength] = useState(0)
  const password = form.watch("newPassword", "")

  useEffect(() => {
    let s = 0
    if (password.length > 5) s = 1
    if (password.length > 8) s = 2
    if (/[A-Z]/.test(password) && /\d/.test(password)) s = 3
    if (/[^A-Za-z0-9]/.test(password)) s = 4
    setStrength(s)
  }, [password])

  const strengthColor = ["bg-slate-200", "bg-red-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500"]
  const strengthLabels = ["Too short", "Weak", "Fair", "Good", "Strong"]

  return (
    <div className="space-y-8">
      <Card className="p-6 border-slate-100 shadow-sm rounded-3xl bg-white space-y-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Change password</h3>
            <div className="space-y-2 max-w-sm">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current password</Label>
              <Input type="password" {...form.register("currentPassword")} className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 transition-all font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New password</Label>
                    <Input type="password" {...form.register("newPassword")} className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 transition-all font-medium" />
                  </div>
                  {password && (
                    <div className="space-y-2 px-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={cn("flex-1 rounded-full bg-slate-100", i <= strength ? strengthColor[strength] : "")} />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-[10px] font-bold uppercase", strength === 0 ? "text-slate-400" : strength < 4 ? "text-amber-500" : "text-emerald-500")}>
                          {strengthLabels[strength]}
                        </span>
                        {strength === 4 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </div>
                  )}
               </div>
               <div className="space-y-2">
                 <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm new password</Label>
                 <Input type="password" {...form.register("confirmPassword")} className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 transition-all font-medium" />
                 {form.formState.errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{form.formState.errors.confirmPassword.message}</p>}
               </div>
            </div>
            
            <Button 
                type="submit" 
                disabled={!form.formState.isDirty}
                className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-black font-bold text-white disabled:opacity-50"
              >
                Update password
              </Button>
          </div>
        </form>

        <div className="pt-8 border-t border-slate-50 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Active sessions</h3>
            <button className="text-xs font-bold text-red-500 hover:underline">Sign out all other sessions</button>
          </div>
          
          <div className="space-y-3">
             <SessionEntry 
               device="Chrome on Windows" 
               location="Jaipur, IN" 
               time="Current session" 
               icon={<Laptop className="w-4 h-4" />} 
               active
             />
             <SessionEntry 
               device="Safari on iPhone" 
               location="New Delhi, IN" 
               time="3 days ago" 
               icon={<Smartphone className="w-4 h-4" />} 
             />
          </div>
        </div>
      </Card>
    </div>
  )
}

function SessionEntry({ device, location, time, icon, active }: { device: string, location: string, time: string, icon: React.ReactNode, active?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <div className="space-y-0.5">
           <div className="flex items-center gap-2">
             <span className="text-sm font-bold text-slate-800">{device}</span>
             {active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
           </div>
           <p className="text-[11px] font-medium text-slate-500">{location} • {time}</p>
        </div>
      </div>
      {!active && (
        <button className="text-[11px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">Revoke</button>
      )}
    </div>
  )
}

function NotificationsTab({ form, onSubmit }: { form: any, onSubmit: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-slate-100 shadow-sm rounded-3xl bg-white space-y-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <PreferenceRow 
            label="New client added" 
            description="Get notified when a team member adds a new client record" 
            checked={form.watch("newClient")} 
            onChange={(v) => form.setValue("newClient", v, { shouldDirty: true })} 
          />
          <PreferenceRow 
            label="Match found" 
            description="Alert when the matching engine finds a property for your clients" 
            checked={form.watch("matchFound")} 
            onChange={(v) => form.setValue("matchFound", v, { shouldDirty: true })} 
          />
          <PreferenceRow 
            label="Property status change" 
            description="When a property is marked as sold, rented or reserved" 
            checked={form.watch("statusChange")} 
            onChange={(v) => form.setValue("statusChange", v, { shouldDirty: true })} 
          />
          <PreferenceRow 
            label="Team member joined" 
            description="When a new team member accepts your invitation" 
            checked={form.watch("teamJoined")} 
            onChange={(v) => form.setValue("teamJoined", v, { shouldDirty: true })} 
          />
          <PreferenceRow 
            label="Weekly summary" 
            description="A comprehensive digest of activity and match stats every Monday morning" 
            checked={form.watch("weeklySummary")} 
            onChange={(v) => form.setValue("weeklySummary", v, { shouldDirty: true })} 
          />

          <div className="flex justify-end pt-8">
            <Button 
                type="submit" 
                disabled={!form.formState.isDirty}
                className="h-12 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none"
              >
                Save preferences
              </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function PreferenceRow({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-6 group border-b border-slate-50 last:border-none">
       <div className="space-y-1 pr-4">
         <Label className="text-sm font-bold text-slate-800">{label}</Label>
         <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">{description}</p>
       </div>
       <Switch checked={checked} onCheckedChange={onChange} className="data-[state=checked]:bg-emerald-500" />
    </div>
  )
}
