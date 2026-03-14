'use client'

import React from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  Building2, 
  Users, 
  Sparkles, 
  ChevronDown,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      {/* --- Section 1: Hero --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center overflow-hidden">
        {/* Background is handled by layout (slate-950) */}
        
        {/* Pill Badge */}
        <div className="inline-flex items-center rounded-full border border-slate-700 px-4 py-1 text-xs text-slate-400 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
          Built for real estate professionals
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <span className="block text-white">Manage properties.</span>
          <span className="block text-emerald-400">Match clients.</span>
          <span className="block text-white">Close faster.</span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 max-w-md mx-auto text-slate-400 text-base md:text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          PropDesk gives your team one place to list properties, track clients,
          and automatically match buyers to the right home.
        </p>

        {/* CTA buttons row */}
        <div className="mt-10 flex gap-3 justify-center flex-wrap w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-8 py-6 text-sm font-bold shadow-lg shadow-emerald-500/20 group transition-all">
              Sign in to PropDesk
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#how-it-works" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 rounded-lg px-8 py-6 text-sm font-bold bg-transparent">
              Learn how it works
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 animate-in fade-in delay-700 duration-1000">
          <StatItem value="500+" label="Properties managed" />
          <div className="hidden sm:block w-px h-8 bg-slate-700" />
          <StatItem value="200+" label="Clients matched" />
          <div className="hidden sm:block w-px h-8 bg-slate-700" />
          <StatItem value="50+" label="Teams using PropDesk" />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-600" />
        </div>
      </section>

      {/* --- Section 2: Features strip --- */}
      <section className="bg-slate-900 py-24 px-4 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <span className="text-xs text-emerald-500 uppercase tracking-widest font-bold">Features</span>
            <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight">Everything your team needs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Building2 className="w-5 h-5 text-emerald-400" />}
              iconBg="bg-emerald-500/10"
              borderColor="hover:border-emerald-500/40"
              title="Property listings"
              body="Add, edit and organize your full property portfolio with photos, specs, pricing and status tracking."
            />
            <FeatureCard 
              icon={<Users className="w-5 h-5 text-purple-400" />}
              iconBg="bg-purple-500/10"
              borderColor="hover:border-purple-500/40"
              title="Client database"
              body="Track every buyer and renter with their preferences, budget, timeline and communication history."
            />
            <FeatureCard 
              icon={<Sparkles className="w-5 h-5 text-amber-400" />}
              iconBg="bg-amber-500/10"
              borderColor="hover:border-amber-500/40"
              title="Smart match engine"
              body="Automatically match clients to properties the moment they're added. Get instant alerts when a fit is found."
            />
          </div>
        </div>
      </section>

      {/* --- Section 3: How it works --- */}
      <section id="how-it-works" className="bg-slate-950 py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <span className="text-xs text-emerald-500 uppercase tracking-widest font-bold">How it works</span>
            <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight">From listing to closing in 3 steps</h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Step 1 */}
            <StepItem 
              number="1"
              bg="bg-emerald-500"
              title="Add your properties & clients"
              body="List properties with full details and images. Add clients with their exact requirements and budget."
            />
            {/* Step 2 */}
            <StepItem 
              number="2"
              bg="bg-purple-500"
              title="Smart matching runs instantly"
              body="The engine scores every property against each client's needs and surfaces the best fits automatically."
            />
            {/* Step 3 */}
            <StepItem 
              number="3"
              bg="bg-amber-500"
              title="Get notified, close the deal"
              body="Your team gets instant alerts. View match breakdowns, contact clients, and track the outcome."
            />
            
            {/* Dashed Connector Line - Desktop Only */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px border-t border-dashed border-slate-700 -z-10" />
          </div>
        </div>
      </section>

      {/* --- Section 4: Footer CTA + footer --- */}
      <section className="bg-slate-900 pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="text-slate-400 mt-4 text-base md:text-lg">Sign in and set up your team workspace in minutes.</p>
          
          <div className="mt-10">
            <Link href="/login">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-10 py-7 text-base font-bold shadow-xl shadow-emerald-500/20 group transition-all">
                Sign in to PropDesk
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {/* Footer Bar */}
          <div className="mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold tracking-tight">PropDesk</span>
              <span className="text-slate-600 text-sm">© 2025</span>
            </div>
            <div className="text-slate-600 text-xs font-medium tracking-wide">
              MADE FOR REAL ESTATE TEAMS.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
      <span className="text-white text-xl font-bold tracking-tight">{value}</span>
      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{label}</span>
    </div>
  )
}

function FeatureCard({ icon, title, body, iconBg, borderColor }: { icon: React.ReactNode, title: string, body: string, iconBg: string, borderColor: string }) {
  return (
    <div className={cn(
      "bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50 transition-all duration-300 cursor-pointer",
      borderColor
    )}>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg", iconBg)}>
        {icon}
      </div>
      <h3 className="text-white text-lg font-bold mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed font-medium">
        {body}
      </p>
    </div>
  )
}

function StepItem({ number, title, body, bg }: { number: string, title: string, body: string, bg: string }) {
  return (
    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
      <div className={cn(
        "w-12 h-12 rounded-full text-white font-black flex items-center justify-center shadow-lg transform transition-transform hover:scale-110",
        bg
      )}>
        {number}
      </div>
      <div className="space-y-2">
        <h3 className="text-white text-lg font-bold tracking-tight">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
          {body}
        </p>
      </div>
    </div>
  )
}
