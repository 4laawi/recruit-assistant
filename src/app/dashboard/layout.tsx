'use client'

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Home, 
  Briefcase,
  Users,
  BarChart, 
  Settings, 
  HelpCircle
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import type { User } from "@supabase/supabase-js"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const getUserInitials = (user: User) => {
    const fullName = user?.user_metadata?.full_name
    if (fullName) {
      const names = fullName.split(' ')
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase()
      }
      return fullName.substring(0, 2).toUpperCase()
    }
    return user?.email?.split('@')[0].substring(0, 2).toUpperCase() || 'U'
  }

  const getUserDisplayName = (user: User) => {
    const fullName = user?.user_metadata?.full_name
    if (fullName) {
      return fullName
    }
    const email = user?.email || ''
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const getUserAvatar = (user: User) => {
    // Try to get Google profile picture
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url
    }
    // Try alternative Google picture URL
    if (user?.user_metadata?.picture) {
      return user.user_metadata.picture
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f6f6]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Briefcase, label: 'Job listings', href: '/dashboard/jobs' },
    { icon: Users, label: 'Candidates', href: '/dashboard/candidates', badge: 'New' },
    { icon: BarChart, label: 'Reports', href: '/dashboard/reports' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex">
      {/* Sidebar - Seamless with background */}
      <aside className="w-[280px] h-screen sticky top-0 flex flex-col">
        {/* User Profile Section */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <Avatar className="w-10 h-10 border-2 border-gray-200">
              <AvatarImage src={getUserAvatar(user) || undefined} alt={getUserDisplayName(user)} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-black truncate">{getUserDisplayName(user)}</p>
              <p className="text-xs text-[#606160] truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal transition-colors ${
                isActive(item.href)
                  ? 'bg-[#ededed] text-black'
                  : 'text-black hover:bg-[#ededed]/50'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge className="bg-[#d9f7d7] text-[#149610] text-xs px-2 py-0 border-0 hover:bg-[#d9f7d7]">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Help Center - Bottom */}
        <div className="p-3">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal text-black hover:bg-[#ededed]/50 transition-colors">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Help Center</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen pt-4">
        {/* White Container with Rounded Top-Left */}
        <div className="flex-1 bg-white border-l border-[#e7e8e7] rounded-tl-[19px] p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
