'use client'

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MapPin,
  IndianRupee,
  ChevronDown,
  Search,
  Bed,
  Home,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  // Handle Supabase auth redirect
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=invite') && hash.includes('access_token=')) {
      router.replace('/accept-invite' + hash)
    }
  }, [router])

  // Add scroll listener for Navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950">

      {/* --- Navigation --- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-300 ${scrolled ? "bg-white/70 backdrop-blur-lg border-b border-slate-200/50 shadow-sm py-3" : "bg-transparent py-6"
          }`}
      >
        <Link href="/" className="flex rounded items-center gap-3">
          <img src="/logoprop.png" alt="Logo" className="w-10 h-10 object-contain shadow-lg rounded-xl" />
          <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
            PropDesk
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/60 bg-white/50 backdrop-blur-md text-xs font-bold text-slate-700 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            Jaipur, IN
          </div>
          <Link href="/login">
            <Button className="rounded-full px-7 py-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">
              Log in
            </Button>
          </Link>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-32 px-4 overflow-hidden">
        {/* Background Image with Elegant Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/bg.png"
            alt="Luxury modern home"
            className="w-full h-full object-cover scale-105 animate-in fade-in duration-[2000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-slate-50" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-12">
          {/* Headline area */}
          <div className="relative inline-block px-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-slate-900 leading-[1.1] font-playfair animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10 drop-shadow-sm">
              Discover the <span className="italic font-light text-[#051a67]">perfect home</span><br />
              for your lifestyle
            </h1>
          </div>


        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="py-32 px-6 md:px-12 bg-slate-50 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-50 blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <h2 className="text-6xl md:text-8xl font-medium font-playfair tracking-tighter text-slate-900 leading-none">
              Elevating <br />
              <span className="text-slate-400 italic font-light">Real Estate</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-4">
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                We help clients find, sell, and invest in property across India's most desirable regions. Our approach combines local market expertise with transparent processes.
              </p>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Whether you're buying your first home or expanding a portfolio, our advisors guide you through every stage with absolute confidence and clarity.
              </p>
            </div>
          </div>

          <div className="mt-32 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <CircularStat value="980+" label="Successful deals" />
            <CircularStat value="1.3k" label="Active listings" />
            <CircularStat value="24" label="Years experience" />
            <CircularStat value="85" label="Cities covered" />
          </div>
        </div>
      </section>

      {/* --- Footer CTA --- */}
      <section className="bg-white py-32 px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-5xl md:text-6xl font-medium font-playfair text-slate-900 leading-tight">
            Ready to experience a modern <br className="hidden md:block" />
            property ecosystem?
          </h2>
          <div className="flex justify-center pt-4">
            <Link href="/login">
              <Button className="h-16 px-10 rounded-full bg-slate-900 hover:bg-black text-white font-semibold text-lg shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 flex items-center gap-3">
                Get started today
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- Simple Footer --- */}
      <footer className="py-8 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logoprop.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-slate-900 text-lg">PropDesk</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            The future of real estate management.
          </p>
          <span className="text-slate-400 text-sm font-medium">© 2026 All rights reserved.</span>
        </div>
      </footer>
    </main>
  )
}

function SearchItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-all rounded-2xl w-full group">
      <div className="w-12 h-12 rounded-full bg-slate-100/80 group-hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-colors">
        {icon}
      </div>
      <div className="flex flex-col text-left overflow-hidden">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-sm font-semibold text-slate-900 truncate">{value}</span>
      </div>
    </div>
  )
}

function CircularStat({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center gap-5 group">
      <div className="w-36 h-36 md:w-48 md:h-48 rounded-full border border-slate-200 bg-white flex flex-col items-center justify-center shadow-sm group-hover:border-[#051a67]/40 group-hover:shadow-2xl group-hover:shadow-[#051a67]/40 transition-all duration-500 ease-out group-hover:-translate-y-2">
        <span className="text-4xl md:text-6xl font-playfair font-semibold text-slate-900 tracking-tight group-hover:text-[#051a67] transition-colors">{value}</span>
      </div>
      <span className="text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] text-slate-500 group-hover:text-slate-900 transition-colors text-center">
        {label}
      </span>
    </div>
  )
}