import React from "react"
import { getTeamMembers } from "@/lib/actions/team"
import { requireProfile } from "@/lib/auth/get-session"
import { TeamClient } from "@/components/team/team-client"

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1

  const [profile, result] = await Promise.all([
    requireProfile(),
    getTeamMembers(page),
  ])

  return (
    <TeamClient 
      currentProfile={profile} 
      initialMembers={result.data} 
      totalCount={result.count ?? 0}
      totalPages={result.totalPages ?? 0}
      currentPage={page}
    />
  )
}
