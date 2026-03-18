import React from "react"
import { getTeamMembers } from "@/lib/actions/team"
import { requireProfile } from "@/lib/auth/get-session"
import { TeamClient } from "@/components/team/team-client"

export default async function TeamPage() {
  const [profile, members] = await Promise.all([
    requireProfile(),
    getTeamMembers(),
  ])

  return <TeamClient currentProfile={profile} initialMembers={members} />
}
