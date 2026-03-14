import React from "react"

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 font-sans antialiased text-slate-200">
      {children}
    </div>
  )
}
