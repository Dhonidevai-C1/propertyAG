'use client'

import React, { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react"
import { type AuthChangeEvent, type Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function AcceptInvitePage() {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  const [step, setStep] = useState<"loading" | "form" | "done" | "error">("loading")
  const [sessionUser, setSessionUser] = useState<{ email: string; agency_id?: string; role?: string } | null>(null)

  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [strength, setStrength] = useState(0)

  const strengthColors = ["bg-slate-200", "bg-red-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500"]
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong ✓"]

  useEffect(() => {
    let s = 0
    if (password.length > 5) s = 1
    if (password.length > 8) s = 2
    if (/[A-Z]/.test(password) && /\d/.test(password)) s = 3
    if (/[^A-Za-z0-9]/.test(password)) s = 4
    setStrength(s)
  }, [password])

  // The Supabase browser client auto-parses the #access_token hash on load
  // and fires a SIGNED_IN / TOKEN_REFRESHED event — we listen for that here.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          const user = session.user
          setSessionUser({
            email: user.email!,
            agency_id: user.user_metadata?.agency_id,
            role: user.user_metadata?.role ?? 'agent',
          })
          if (user.user_metadata?.full_name) {
            setFullName(user.user_metadata.full_name)
          }
          setStep('form')
        }
      }
    )

    // Also try getUser() in case the session was already established
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      if (data.user && step === 'loading') {
        setSessionUser({
          email: data.user.email!,
          agency_id: data.user.user_metadata?.agency_id,
          role: data.user.user_metadata?.role ?? 'agent',
        })
        if (data.user.user_metadata?.full_name) {
          setFullName(data.user.user_metadata.full_name)
        }
        setStep('form')
      }
    })

    // Fallback: if no auth event fires in 20 seconds, show error
    const timeout = setTimeout(() => {
      setStep(prev => prev === 'loading' ? 'error' : prev)
    }, 20000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { toast.error("Please enter your full name"); return }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return }
    if (password !== confirmPwd) { toast.error("Passwords don't match"); return }

    startTransition(async () => {
      // 1. Set a real password (invited users start with a temp session)
      const { error: pwdError } = await supabase.auth.updateUser({ password })
      if (pwdError) { toast.error(pwdError.message); return }

      // 2. Update the profile row with their name
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from("profiles")
          .update({ full_name: fullName, updated_at: new Date().toISOString() })
          .eq("id", user.id)
      }

      setStep("done")
      setTimeout(() => router.push("/dashboard"), 2000)
    })
  }

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Verifying your invite…</p>
      </div>
    )
  }

  if (step === "error") {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-emerald-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invite link expired</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            This invite link is invalid or has already been used. Please ask your admin to send a new invite.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-12 rounded-xl border-slate-200 text-slate-600 font-bold"
            >
              Retry
            </Button>
            <Button
              onClick={() => router.push("/login")}
              className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-emerald-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">You're all set!</h2>
            <p className="text-slate-500">Welcome to the team, <span className="font-bold text-slate-700">{fullName}</span>.</p>
            <p className="text-sm text-slate-400">Redirecting you to the dashboard…</p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            <img src="/logoprop.png" alt="Logo" className="w-12 h-12 object-contain shadow-lg rounded-2xl" />
            <span className="text-2xl font-black text-slate-900 tracking-tight">PropDesk</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">You've been invited!</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Set up your account to join the team.
            </p>
            {sessionUser?.email && (
              <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-100 mt-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                {sessionUser.email}
                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded capitalize font-bold text-[10px]">
                  {sessionUser.role}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full name</Label>
              <Input
                required
                placeholder="Your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-300 focus:ring-emerald-100 transition-all font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Create password</Label>
              <div className="relative">
                <Input
                  required
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-300 transition-all font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1.5 px-1">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={cn("flex-1 rounded-full bg-slate-100 transition-colors", i <= strength ? strengthColors[strength] : "")} />
                    ))}
                  </div>
                  <p className={cn("text-[10px] font-bold", strength < 3 ? "text-amber-500" : "text-emerald-600")}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm password</Label>
              <Input
                required
                type="password"
                placeholder="Repeat password"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                className={cn(
                  "h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white transition-all font-medium",
                  confirmPwd && password !== confirmPwd ? "border-red-300 focus:border-red-300 bg-red-50/30" : "focus:border-emerald-300"
                )}
              />
              {confirmPwd && password !== confirmPwd && (
                <p className="text-[10px] text-red-500 font-bold ml-1">Passwords don't match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending || !fullName || password.length < 8 || password !== confirmPwd}
              className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none transition-all mt-2"
            >
              {isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Setting up your account…</span>
              ) : (
                "Activate my account →"
              )}
            </Button>
          </form>

          <p className="text-center text-[11px] text-slate-400">
            Already have an account?{' '}
            <button onClick={() => router.push("/login")} className="text-emerald-600 font-bold hover:underline">Sign in</button>
          </p>
        </div>

        <p className="text-center text-[11px] text-slate-400">
          Powered by PropDesk · Your real estate CRM
        </p>
      </div>
    </div>
  )
}
