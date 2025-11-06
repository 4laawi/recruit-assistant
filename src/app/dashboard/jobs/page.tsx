'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  Briefcase, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/components/ui/use-toast"
import LoadingLogo from "@/components/LoadingLogo"

interface Job {
  id: string
  title: string
  description: string
  location: string
  work_location: 'remote' | 'on-site' | 'hybrid'
  experience_level: string
  required_skills: string[]
  status: 'active' | 'closed' | 'draft'
  created_at: string
  updated_at: string
  applications_count: number
}

export default function JobListingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // Form state
  const [formData, setFormData] = useState<{
    title: string
    description: string
    location: string
    work_location: 'remote' | 'on-site' | 'hybrid'
    experience_level: string
    required_skills: string
    status: 'active' | 'closed' | 'draft'
  }>({
    title: '',
    description: '',
    location: '',
    work_location: 'remote',
    experience_level: 'mid',
    required_skills: '',
    status: 'active'
  })

  useEffect(() => {
    const loadJobsInternal = async () => {
      try {
        setIsLoading(true)
        
        // Mock data for now - replace with actual Supabase query
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Senior Frontend Developer',
            description: 'Looking for an experienced React developer to join our team...',
            location: 'San Francisco, CA',
            work_location: 'hybrid',
            experience_level: 'senior',
            required_skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            applications_count: 24
          },
          {
            id: '2',
            title: 'Full Stack Engineer',
            description: 'Join our growing startup as a full stack engineer...',
            location: 'Remote',
            work_location: 'remote',
            experience_level: 'mid',
            required_skills: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            applications_count: 18
          },
          {
            id: '3',
            title: 'DevOps Engineer',
            description: 'Seeking a DevOps expert to manage our infrastructure...',
            location: 'New York, NY',
            work_location: 'on-site',
            experience_level: 'senior',
            required_skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            applications_count: 12
          }
        ]
        
        setJobs(mockJobs)
      } catch (error) {
        console.error('Error loading jobs:', error)
        toast({
          title: "Error",
          description: "Failed to load job listings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadJobsInternal()
    }
  }, [user, toast])

  const handleCreateJob = async () => {
    try {
      const newJob: Job = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        work_location: formData.work_location,
        experience_level: formData.experience_level,
        required_skills: formData.required_skills.split(',').map(s => s.trim()),
        status: formData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        applications_count: 0
      }
      
      setJobs(prev => [newJob, ...prev])
      setShowCreateDialog(false)
      resetForm()
      
      toast({
        title: "✓ Job Created",
        description: "Your job listing has been created successfully",
      })
    } catch (error) {
      console.error('Error creating job:', error)
      toast({
        title: "Error",
        description: "Failed to create job listing",
        variant: "destructive",
      })
    }
  }

  const handleUpdateJob = async () => {
    if (!editingJob) return
    
    try {
      const updatedJob: Job = {
        ...editingJob,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        work_location: formData.work_location,
        experience_level: formData.experience_level,
        required_skills: formData.required_skills.split(',').map(s => s.trim()),
        status: formData.status,
        updated_at: new Date().toISOString(),
      }
      
      setJobs(prev => prev.map(job => job.id === editingJob.id ? updatedJob : job))
      setEditingJob(null)
      resetForm()
      
      toast({
        title: "✓ Job Updated",
        description: "Job listing has been updated successfully",
      })
    } catch (error) {
      console.error('Error updating job:', error)
      toast({
        title: "Error",
        description: "Failed to update job listing",
        variant: "destructive",
      })
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      setJobs(prev => prev.filter(job => job.id !== jobId))
      
      toast({
        title: "✓ Job Deleted",
        description: "Job listing has been deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: "Error",
        description: "Failed to delete job listing",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      work_location: 'remote',
      experience_level: 'mid',
      required_skills: '',
      status: 'active'
    })
  }

  const openEditDialog = (job: Job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      work_location: job.work_location,
      experience_level: job.experience_level,
      required_skills: job.required_skills.join(', '),
      status: job.status
    })
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingLogo size={48} className="mx-auto mb-4" />
          <p className="text-gray-600">Loading job listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Listings</h1>
          <p className="text-muted-foreground">Manage your open positions</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Job Posting
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{jobs.length}</p>
                <p className="text-sm text-gray-600">Total Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'active').length}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + job.applications_count, 0)}</p>
                <p className="text-sm text-gray-600">Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'draft').length}</p>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{job.title}</h3>
                    <Badge 
                      variant="secondary"
                      className={
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {job.work_location === 'remote' ? '🌍 Remote' :
                         job.work_location === 'on-site' ? `🏢 ${job.location}` :
                         `🔄 Hybrid - ${job.location}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{job.applications_count} applications</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.required_skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.required_skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(job)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No job listings found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                Create Your First Job Posting
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingJob} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false)
          setEditingJob(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job Listing' : 'Create New Job Listing'}</DialogTitle>
            <DialogDescription>
              Fill in the details for your job posting
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Senior Frontend Developer"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="work_location">Work Type *</Label>
                <Select value={formData.work_location} onValueChange={(value) => setFormData(prev => ({ ...prev, work_location: value as 'remote' | 'on-site' | 'hybrid' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="remote">🌍 Remote</SelectItem>
                    <SelectItem value="on-site">🏢 On-site</SelectItem>
                    <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_level">Experience Level *</Label>
                <Select value={formData.experience_level} onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead/Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'closed' | 'draft' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="required_skills">Required Skills (comma separated) *</Label>
              <Input
                id="required_skills"
                placeholder="e.g., React, TypeScript, Node.js"
                value={formData.required_skills}
                onChange={(e) => setFormData(prev => ({ ...prev, required_skills: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1"
                onClick={editingJob ? handleUpdateJob : handleCreateJob}
                disabled={!formData.title || !formData.description}
              >
                {editingJob ? 'Update Job' : 'Create Job'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false)
                  setEditingJob(null)
                  resetForm()
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
