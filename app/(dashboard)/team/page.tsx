'use client'

import React, { useState, useMemo } from "react"
import { 
  UserPlus, 
  Shield, 
  Briefcase, 
  Eye, 
  MoreVertical, 
  Mail,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  Circle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Role = 'Admin' | 'Agent' | 'Viewer'
type Status = 'Active' | 'Invited' | 'Inactive'

interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  lastActive: string
  isCurrentUser?: boolean
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: "t1",
    name: "Aman Gupta",
    email: "aman@propdesk.com",
    role: "Admin",
    status: "Active",
    lastActive: "Just now",
    isCurrentUser: true
  },
  {
    id: "t2",
    name: "Ravi Kumar",
    email: "ravi@propdesk.com",
    role: "Agent",
    status: "Active",
    lastActive: "2 hours ago"
  },
  {
    id: "t3",
    name: "Sneha Sharma",
    email: "sneha@propdesk.com",
    role: "Agent",
    status: "Active",
    lastActive: "1 day ago"
  },
  {
    id: "t4",
    name: "Vikram Singh",
    email: "vikram@propdesk.com",
    role: "Viewer",
    status: "Active",
    lastActive: "3 days ago"
  }
]

const PENDING_INVITES = [
  { email: "rahul@propdesk.com", role: "Agent", sentAt: "1 day ago" }
]

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM)
  const [pendingInvites, setPendingInvites] = useState(PENDING_INVITES)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Form states
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Role>("Agent")
  const [newRole, setNewRole] = useState<Role>("Agent")

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    const newInvite = { email: inviteEmail, role: inviteRole, sentAt: "Just now" }
    setPendingInvites([newInvite, ...pendingInvites])
    
    toast.success(`Invite sent to ${inviteEmail}`, {
      description: `They will join as an ${inviteRole}.`
    })

    setInviteEmail("")
    setIsInviteDialogOpen(false)
  }

  const handleUpdateRole = () => {
    if (!selectedMember) return

    setTeam(prev => prev.map(m => 
      m.id === selectedMember.id ? { ...m, role: newRole } : m
    ))

    toast.success(`Role updated for ${selectedMember.name}`, {
      description: `New role: ${newRole}`
    })

    setIsRoleDialogOpen(false)
    setSelectedMember(null)
  }

  const handleDeactivate = (member: TeamMember) => {
    setTeam(prev => prev.map(m => 
      m.id === member.id ? { ...m, status: 'Inactive' } : m
    ))
    toast.info(`${member.name} has been deactivated`)
  }

  const handleRemove = (member: TeamMember) => {
    setTeam(prev => prev.filter(m => m.id !== member.id))
    toast.error(`${member.name} removed from team`)
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team</h1>
          <p className="text-sm text-slate-500 font-medium">Manage team members and their access roles</p>
        </div>

        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-xl h-11 px-6 flex items-center gap-2 font-bold shadow-lg shadow-emerald-100">
              <UserPlus className="w-4 h-4" />
              Invite team member
            </Button>
          } />
          <DialogContent className="bg-white rounded-3xl max-w-md border-none ring-1 ring-slate-100 p-8">
            <DialogHeader className="space-y-3 pb-4">
              <DialogTitle className="text-xl font-bold text-slate-900">Invite a team member</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                They will receive an email with instructions to join your workspace.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleInvite} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    required
                    type="email"
                    placeholder="teammate@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent focus:ring-emerald-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-100 shadow-xl rounded-xl">
                    <SelectItem value="Agent">Agent (Recommended)</SelectItem>
                    <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                    <SelectItem value="Viewer">Viewer (Read-only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Personal message (optional)</label>
                <Textarea 
                  placeholder="Hey, welcome to the team!"
                  className="rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-emerald-50 transition-all font-medium resize-none h-24"
                />
              </div>

              <DialogFooter className="pt-4 flex flex-col-reverse! sm:flex-row! gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsInviteDialogOpen(false)} className="h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50">
                  Cancel
                </Button>
                <Button type="submit" className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8">
                  Send invite
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Explanation strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RoleCard 
          icon={<Shield className="w-5 h-5" />} 
          color="red" 
          title="Admin" 
          desc="Full access: manage team, settings, and all business data."
        />
        <RoleCard 
          icon={<Briefcase className="w-5 h-5" />} 
          color="blue" 
          title="Agent" 
          desc="Add/edit properties and clients, view matches, and log activity."
        />
        <RoleCard 
          icon={<Eye className="w-5 h-5" />} 
          color="slate" 
          title="Viewer" 
          desc="Read-only access to all data for monitoring or reporting."
        />
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 border-slate-100 hover:bg-slate-50/50">
              <TableHead className="w-[300px] text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Member</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Role</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Status</TableHead>
              <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Last active</TableHead>
              <TableHead className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member.id} className="group border-slate-50 hover:bg-slate-50/30 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <RoleAvatar role={member.role} name={member.name} />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{member.name}</span>
                        {member.isCurrentUser && (
                          <span className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-tighter">You</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 truncate">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <RoleBadge role={member.role} />
                </TableCell>
                <TableCell className="py-4">
                  <StatusBadge status={member.status} />
                </TableCell>
                <TableCell className="py-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{member.lastActive}</span>
                </TableCell>
                <TableCell className="py-4 text-right">
                  {!member.isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="bg-white rounded-xl border-slate-100 shadow-xl w-48 p-2">
                        <DropdownMenuItem 
                          className="text-xs font-bold text-slate-600 p-2.5 rounded-lg cursor-pointer"
                          onClick={() => {
                            setSelectedMember(member)
                            setNewRole(member.role)
                            setIsRoleDialogOpen(true)
                          }}
                        >
                          Change role
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-xs font-bold text-slate-600 p-2.5 rounded-lg cursor-pointer"
                          onClick={() => handleDeactivate(member)}
                        >
                          Deactivate user
                        </DropdownMenuItem>
                        <div className="h-px bg-slate-50 my-1" />
                        <DropdownMenuItem 
                          className="text-xs font-bold text-red-500 p-2.5 rounded-lg cursor-pointer hover:bg-red-50! hover:text-red-600!"
                          onClick={() => handleRemove(member)}
                        >
                          Remove from team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Pending invites</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
            {pendingInvites.map((invite) => (
              <div key={invite.email} className="flex items-center justify-between p-4 group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                     <Mail className="w-5 h-5" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{invite.email}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Invited as {invite.role} • {invite.sentAt}</span>
                   </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg px-3">
                     <RefreshCw className="w-3.5 h-3.5 mr-2" />
                     Resend
                   </Button>
                   <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg px-3">
                     Cancel
                   </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="bg-white rounded-3xl max-w-md border-none ring-1 ring-slate-100 p-8">
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="text-xl font-bold text-slate-900">Change role for {selectedMember?.name}</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-sm">
              Update their permissions and access level across the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <RoleOption 
              value="Admin" 
              current={newRole} 
              onSelect={() => setNewRole('Admin')} 
              icon={<Shield className="w-4 h-4" />} 
              desc="Full control + team management"
              color="red"
            />
            <RoleOption 
              value="Agent" 
              current={newRole} 
              onSelect={() => setNewRole('Agent')} 
              icon={<Briefcase className="w-4 h-4" />} 
              desc="Standard access to CRM + properties"
              color="blue"
            />
            <RoleOption 
              value="Viewer" 
              current={newRole} 
              onSelect={() => setNewRole('Viewer')} 
              icon={<Eye className="w-4 h-4" />} 
              desc="Read-only monitoring"
              color="slate"
            />
          </div>

          <DialogFooter className="pt-8 flex flex-col-reverse! sm:flex-row! gap-3">
            <Button variant="ghost" onClick={() => setIsRoleDialogOpen(false)} className="h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50 flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 flex-1">
              Update role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RoleCard({ icon, color, title, desc }: { icon: React.ReactNode, color: 'red' | 'blue' | 'slate', title: string, desc: string }) {
  const styles = {
    red: "bg-red-50/50 text-red-600 border-red-50",
    blue: "bg-blue-50/50 text-blue-600 border-blue-50",
    slate: "bg-slate-50 text-slate-600 border-slate-100"
  }

  return (
    <Card className={cn("rounded-2xl border p-4 space-y-3.5 shadow-none", styles[color])}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color === 'red' ? 'bg-red-100/50' : color === 'blue' ? 'bg-blue-100/50' : 'bg-slate-100')}>
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold tracking-tight">{title}</h3>
        <p className="text-[11px] leading-relaxed opacity-80 font-medium">{desc}</p>
      </div>
    </Card>
  )
}

function RoleAvatar({ role, name }: { role: Role, name: string }) {
  const colors = {
    Admin: "bg-red-50 text-red-600 border-red-100",
    Agent: "bg-blue-50 text-blue-600 border-blue-100",
    Viewer: "bg-slate-50 text-slate-600 border-slate-100"
  }

  return (
    <Avatar className={cn("h-10 w-10 border", colors[role])}>
      <AvatarFallback className="font-bold text-xs">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
    </Avatar>
  )
}

function RoleBadge({ role }: { role: Role }) {
  const styles = {
    Admin: "bg-red-100/50 text-red-700 border-red-200",
    Agent: "bg-blue-100/50 text-blue-700 border-blue-200",
    Viewer: "bg-slate-100 text-slate-600 border-slate-200"
  }
  return (
    <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", styles[role])}>
      {role}
    </Badge>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const dots = {
    Active: "bg-emerald-500",
    Invited: "bg-amber-500",
    Inactive: "bg-slate-300"
  }
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", dots[status])} />
      <span className="text-[11px] font-bold text-slate-600 tracking-tight">{status}</span>
    </div>
  )
}

function RoleOption({ value, current, onSelect, icon, desc, color }: { value: string, current: string, onSelect: () => void, icon: React.ReactNode, desc: string, color: 'red' | 'blue' | 'slate' }) {
  const selected = value === current
  const activeColor = color === 'red' ? 'emerald' : color === 'blue' ? 'emerald' : 'emerald' // Simplified check

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all",
        selected 
          ? "border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/10" 
          : "border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        selected ? "bg-emerald-500 text-white" : "bg-white text-slate-400 shadow-sm"
      )}>
        {icon}
      </div>
      <div className="flex-1 space-y-0.5">
        <p className={cn("text-sm font-bold", selected ? "text-emerald-900" : "text-slate-800")}>{value}</p>
        <p className="text-[11px] font-medium text-slate-500">{desc}</p>
      </div>
      {selected && (
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      )}
    </button>
  )
}
