import React from "react"
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  StopCircle, 
  PauseCircle, 
  PlayCircle, 
  Calendar,
  Search,
  Zap,
  Clock,
  ExternalLink
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { requireSuperAdmin } from "@/lib/auth/get-session"
import { getAllAgencies, updateAgencySubscription } from "@/lib/actions/admin"
import { addDays } from "date-fns"
import { CreateAgencyDialog } from "@/components/admin/create-agency-dialog"
import { InviteButtons } from "@/components/admin/invite-buttons"

export default async function SuperAdminPage() {
  await requireSuperAdmin()
  const agencies = await getAllAgencies()

  // Calculate platform metrics
  const totalAgencies = agencies.length
  const totalMembers = agencies.reduce((acc, a) => acc + (a.profiles?.[0]?.count || 0), 0)
  const activeTrials = agencies.filter(a => a.subscription_status === 'trial').length
  const activePaid = agencies.filter(a => a.subscription_status === 'active').length

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      {/* Header & Stats Bundle */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin Control
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Platform <br className="md:hidden" /> Dashboard
            </h1>
            <p className="text-slate-500 font-medium text-lg">Manage global agency subscriptions and access.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
             <div className="relative group w-full md:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
               <Input 
                 id="platform-agency-search"
                 placeholder="Search agencies..."
                 className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus-visible:ring-emerald-500"
               />
             </div>
             <CreateAgencyDialog />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Agencies" value={totalAgencies} sub="Registered" icon={Building2} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Total Members" value={totalMembers} sub="Platform-wide" icon={Users} color="text-purple-600" bg="bg-purple-50" />
          <StatCard label="Active Trials" value={activeTrials} sub="Prospects" icon={Zap} color="text-amber-600" bg="bg-amber-50" />
          <StatCard label="Paid Members" value={activePaid} sub="Revenue Generating" icon={ShieldCheck} color="text-emerald-600" bg="bg-emerald-50" />
        </div>
      </div>

      {/* Agency List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Agencies
            <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">{agencies.length}</Badge>
          </h2>
        </div>

        {agencies.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-10 h-10 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">No Agencies Yet</h3>
              <p className="text-slate-500 font-medium max-w-sm">The platform is ready. New agencies will appear here as soon as they sign up or are created.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {agencies.map((agency) => (
              <AgencyRow key={agency.id} agency={agency} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-slate-100 bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl", bg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      </div>
    </Card>
  )
}

function AgencyRow({ agency }: { agency: any }) {
  const isExpired = agency.subscription_status === 'expired'
  const isTrial = agency.subscription_status === 'trial'
  const isPaused = agency.subscription_status === 'paused'

  return (
    <Card className="overflow-hidden border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group rounded-[2rem]">
      <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        
        {/* Left: Identity & Invites */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 flex-1 min-w-0">
          <div className="w-16 h-16 rounded-[1.25rem] bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-white transition-colors shadow-inner">
            {agency.logo_url ? (
              <img src={agency.logo_url} alt={agency.name} className="w-full h-full object-contain p-3" />
            ) : (
              <Building2 className="w-8 h-8 text-slate-300" />
            )}
          </div>
          
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black text-slate-900 truncate tracking-tight">{agency.name}</h3>
              <Badge className={cn(
                "border-none text-[10px] font-black uppercase px-3 py-1 rounded-full",
                agency.subscription_status === 'trial' && "bg-amber-100 text-amber-700",
                agency.subscription_status === 'active' && "bg-emerald-100 text-emerald-700",
                agency.subscription_status === 'paused' && "bg-slate-900 text-white",
                agency.subscription_status === 'expired' && "bg-red-100 text-red-700"
              )}>
                {agency.subscription_status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock className="w-4 h-4 text-slate-300" />
                <span>Joined {new Date(agency.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                <Users className="w-4 h-4" />
                <span>{agency.profiles?.[0]?.count || 0} Members</span>
              </div>
            </div>

            <div className="pt-1">
              <InviteButtons 
                agencyId={agency.id} 
                agencyName={agency.name} 
                contactEmail={agency.contact_email} 
              />
            </div>
          </div>
        </div>

        {/* Right: Status & Admin Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:shrink-0 lg:pl-8 lg:border-l border-slate-100">
          <div className="flex flex-col items-center sm:items-start lg:min-w-[120px]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Expires On</span>
            <span className="text-lg font-black text-slate-900">
              {agency.subscription_end_date ? new Date(agency.subscription_end_date).toLocaleDateString('en-GB') : '—'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <form action={async () => {
              "use server"
              // Extend by 7 days from current expiry or today
              const baseDate = agency.subscription_end_date ? new Date(agency.subscription_end_date) : new Date()
              const nextDate = addDays(baseDate, 7).toISOString()
              await updateAgencySubscription(agency.id, { 
                subscription_status: 'trial', 
                subscription_end_date: nextDate 
              })
            }}>
              <Button size="sm" variant="outline" className="h-11 border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 rounded-xl font-bold bg-white shadow-sm">
                +7d
              </Button>
            </form>

            <form action={async () => {
              "use server"
              const nextDate = addDays(new Date(), 30).toISOString()
              await updateAgencySubscription(agency.id, { 
                subscription_status: 'active', 
                subscription_end_date: nextDate,
                plan_type: 'monthly'
              })
            }}>
              <Button size="sm" className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 border-none px-6">
                Active
              </Button>
            </form>

            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-100 pl-3">
              {agency.subscription_status === 'paused' ? (
                <form action={async () => {
                  "use server"
                  await updateAgencySubscription(agency.id, { subscription_status: 'active' })
                }}>
                  <Button size="sm" variant="ghost" className="h-11 w-11 p-0 text-emerald-600 hover:bg-emerald-50 rounded-xl">
                    <PlayCircle className="w-6 h-6" />
                  </Button>
                </form>
              ) : (
                <form action={async () => {
                  "use server"
                  await updateAgencySubscription(agency.id, { subscription_status: 'paused' })
                }}>
                  <Button size="sm" variant="ghost" className="h-11 w-11 p-0 text-slate-400 hover:bg-slate-100 rounded-xl">
                    <PauseCircle className="w-6 h-6" />
                  </Button>
                </form>
              )}

              <form action={async () => {
                "use server"
                await updateAgencySubscription(agency.id, { subscription_status: 'expired' })
              }}>
                <Button size="sm" variant="ghost" className="h-11 w-11 p-0 text-red-400 hover:bg-red-50 rounded-xl">
                  <StopCircle className="w-6 h-6" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


