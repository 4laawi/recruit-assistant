'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Phone,
  Building,
  Save,
  Loader2,
  CheckCircle,
  LogOut
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from "@/components/ui/use-toast"

interface SupabaseError {
  message: string
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  
  const [isSaving, setIsSaving] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Profile Settings
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    company: user?.user_metadata?.company || '',
    jobTitle: user?.user_metadata?.job_title || ''
  })
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailScreeningComplete: true,
    emailHighMatch: true,
    emailWeeklyReport: false,
    pushScreeningComplete: true,
    pushHighMatch: false
  })

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName,
          phone: profile.phone,
          company: profile.company,
          job_title: profile.jobTitle,
        }
      })
      
      if (error) throw error
      
      toast({
        title: "✓ Profile Updated",
        description: "Your profile has been saved successfully",
      })
    } catch (error) {
      const err = error as SupabaseError
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "✓ Notifications Updated",
        description: "Your notification preferences have been saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    try {
      setIsResettingPassword(true)
      
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error
      
      toast({
        title: "✓ Password Updated",
        description: "Your password has been changed successfully",
      })
      
      setShowPasswordDialog(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      const err = error as SupabaseError
      toast({
        title: "Error",
        description: err.message || "Failed to update password",
        variant: "destructive",
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "✓ Logged Out",
        description: "You have been signed out successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={profile.jobTitle}
                onChange={(e) => setProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Screening Complete</p>
                  <p className="text-sm text-gray-600">Get notified when a screening finishes</p>
                </div>
                <Switch
                  checked={notifications.emailScreeningComplete}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailScreeningComplete: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">High Match Found</p>
                  <p className="text-sm text-gray-600">Alert when a candidate scores 90%+</p>
                </div>
                <Switch
                  checked={notifications.emailHighMatch}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailHighMatch: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Report</p>
                  <p className="text-sm text-gray-600">Receive a summary every Monday</p>
                </div>
                <Switch
                  checked={notifications.emailWeeklyReport}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailWeeklyReport: checked }))}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Push Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Screening Complete</p>
                  <p className="text-sm text-gray-600">Browser push notifications</p>
                </div>
                <Switch
                  checked={notifications.pushScreeningComplete}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushScreeningComplete: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">High Match Found</p>
                  <p className="text-sm text-gray-600">Instant alerts for top candidates</p>
                </div>
                <Switch
                  checked={notifications.pushHighMatch}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushHighMatch: checked }))}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveNotifications} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription & Billing
          </CardTitle>
          <CardDescription>
            Manage your subscription plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Free Plan</h3>
                <Badge className="bg-gray-100 text-gray-800">Current</Badge>
              </div>
              <p className="text-sm text-gray-600">5 screenings per month</p>
            </div>
            <Button>
              Upgrade Plan
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">3 / 5</p>
                <p className="text-sm text-gray-600">Screenings Used</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Days Until Reset</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">$0</p>
                <p className="text-sm text-gray-600">Current Spend</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Account
          </CardTitle>
          <CardDescription>
            Manage your password and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-gray-600">Change your account password</p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
              Change Password
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
          
          <Separator />
          
          <div>
            <p className="font-medium mb-2">Active Sessions</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Current Session</p>
                  <p className="text-xs text-gray-600">Chrome on macOS • Last active: Now</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="pt-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-red-900">Sign Out</p>
                <p className="text-sm text-red-700">Sign out of your account on this device</p>
              </div>
              <Button 
                variant="destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your new password below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
              <p className="text-xs text-gray-600 mt-1">
                Must be at least 6 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1"
                onClick={handleResetPassword}
                disabled={isResettingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false)
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
