'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Users, 
  Download, 
  Eye,
  Plus,
  Star,
  MapPin,
  X,
  CheckCircle,
  Upload,
  FileUp,
  Loader2,
  AlertCircle,
  Trash2,
  FileDown,
  ExternalLink
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { ScreeningJob, Candidate } from '@/types/database'
import { startScreening, getScreeningJobs, getCandidates, getUserStats, uploadResume, deleteScreeningJob, getResumeFileUrl } from '@/lib/api'
import { useToast } from "@/components/ui/use-toast"
import LoadingLogo from "@/components/LoadingLogo"

// New Screening Form Component - Moved outside to prevent re-creation on every render
function NewScreeningForm({ 
  user,
  userStats,
  onComplete 
}: { 
  user: any
  userStats: any
  onComplete: () => void 
}) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [jobTitle, setJobTitle] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [skillsTags, setSkillsTags] = useState<string[]>([])
  const [workLocation, setWorkLocation] = useState('')
  const [location, setLocation] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [fieldAnimations, setFieldAnimations] = useState<{[key: string]: boolean}>({})
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false)
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([])
  
  // Processing state
  const [isStartingScreening, setIsStartingScreening] = useState(false)

  // Common skills suggestions based on job title
  const getSkillsSuggestions = (title: string) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('frontend') || titleLower.includes('react')) {
      return ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Next.js', 'Tailwind CSS']
    } else if (titleLower.includes('backend') || titleLower.includes('node')) {
      return ['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker']
    } else if (titleLower.includes('fullstack') || titleLower.includes('full-stack')) {
      return ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'Next.js']
    } else if (titleLower.includes('devops') || titleLower.includes('sre')) {
      return ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Linux', 'Python']
    } else if (titleLower.includes('data') || titleLower.includes('analyst')) {
      return ['Python', 'SQL', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Machine Learning']
    }
    return ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Git']
  }

  const addFieldAnimation = (fieldName: string) => {
    setFieldAnimations(prev => ({ ...prev, [fieldName]: true }))
    setTimeout(() => {
      setFieldAnimations(prev => ({ ...prev, [fieldName]: false }))
    }, 600)
  }

  const handleSkillsInput = (value: string) => {
    setRequiredSkills(value)
    const tags = value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
    setSkillsTags(tags)
    setShowSkillsSuggestions(value.length > 0 && tags.length === 0)
  }

  const addSkillFromSuggestion = (skill: string) => {
    const newTags = [...skillsTags, skill]
    setSkillsTags(newTags)
    setRequiredSkills(newTags.join(', '))
    setShowSkillsSuggestions(false)
    addFieldAnimation('requiredSkills')
  }

  const removeSkillTag = (index: number) => {
    const newTags = skillsTags.filter((_, i) => i !== index)
    setSkillsTags(newTags)
    setRequiredSkills(newTags.join(', '))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
    })
    setUploadedFiles(prev => [...prev, ...validFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getCompletionPercentage = () => {
    let completed = 0
    if (jobTitle.trim()) completed++
    if (skillsTags.length > 0) completed++
    if (yearsExperience) completed++
    if (workLocation) completed++
    if (uploadedFiles.length > 0) completed++
    return Math.round((completed / 5) * 100)
  }

  const handleStartScreening = async () => {
    if (!jobTitle.trim() || !skillsTags.length || !yearsExperience || !workLocation || !uploadedFiles.length) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload resumes",
        variant: "destructive",
      })
      return
    }

    try {
      setIsStartingScreening(true)

      // First, create a temporary screening job ID for organizing uploads
      const tempJobId = `temp_${Date.now()}`
      const fileIds: string[] = []

      // Upload all resumes
      setIsUploading(true)
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        try {
          const result = await uploadResume(file, tempJobId)
          fileIds.push(result.fileId)
          setUploadProgress(((i + 1) / uploadedFiles.length) * 100)
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error)
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          })
        }
      }
      setIsUploading(false)

      if (fileIds.length === 0) {
        throw new Error("No files were uploaded successfully")
      }

      // Start the screening process
      const result = await startScreening({
        jobTitle,
        requiredSkills: skillsTags,
        yearsExperience,
        workLocation,
        location: location || undefined,
        jobDescription: jobDescription || undefined,
        fileIds,
      })

      toast({
        title: "🎉 Screening Started!",
        description: `Processing ${uploadedFiles.length} resumes. Estimated time: ${result.estimatedTime}`,
      })

      // Reset form
      setJobTitle('')
      setRequiredSkills('')
      setSkillsTags([])
      setWorkLocation('')
      setLocation('')
      setYearsExperience('')
      setJobDescription('')
      setUploadedFiles([])
      setUploadedFileIds([])
      setUploadProgress(0)
      
      // Call the completion handler
      onComplete()

    } catch (error: any) {
      console.error('Error starting screening:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to start screening",
        variant: "destructive",
      })
    } finally {
      setIsStartingScreening(false)
    }
  }

  const isFormValid = jobTitle.trim() && skillsTags.length > 0 && yearsExperience.trim() && workLocation.trim() && uploadedFiles.length > 0

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 rounded-lg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Upload Resumes & Let AI Find the Best Match
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload candidate resumes, define your requirements, and get AI-ranked results in minutes.
          </p>
          
          {/* Usage Stats */}
          {userStats?.stats && (
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>Monthly Usage: {userStats.stats.monthlyUsage} / {userStats.stats.monthlyLimit}</span>
              <span className="text-gray-400">|</span>
              <span>Total Resumes: {userStats.stats.totalResumes}</span>
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm max-w-6xl mx-auto mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <FileUp className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Upload Resumes</h3>
              </div>
              
              <div
                className="h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center mb-4"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop resumes
                </p>
                <p className="text-xs text-gray-500">PDF, DOCX files (up to 50 resumes)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
              
              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {uploadedFiles.length} files uploaded
                  </p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm max-w-6xl mx-auto">
          <CardContent className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Basic Info</h3>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="jobTitle" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Job Title *
                    {jobTitle.trim() && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g., Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value)
                      if (e.target.value.trim()) addFieldAnimation('jobTitle')
                    }}
                    className={`h-11 text-base transition-all duration-300 ${fieldAnimations.jobTitle ? 'animate-pulse bg-green-50 border-green-300' : ''}`}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="requiredSkills" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Required Skills *
                    {skillsTags.length > 0 && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <div className="space-y-3">
                    <Input
                      id="requiredSkills"
                      placeholder="Type skills separated by commas..."
                      value={requiredSkills}
                      onChange={(e) => handleSkillsInput(e.target.value)}
                      className={`h-11 text-base transition-all duration-300 ${fieldAnimations.requiredSkills ? 'animate-pulse bg-green-50 border-green-300' : ''}`}
                    />
                    
                    {/* Skills Tags */}
                    {skillsTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skillsTags.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 px-3 py-1 text-sm"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkillTag(index)}
                              className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Skills Suggestions */}
                    {showSkillsSuggestions && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Suggested skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {getSkillsSuggestions(jobTitle).slice(0, 4).map((skill, index) => (
                            <button
                              key={index}
                              onClick={() => addSkillFromSuggestion(skill)}
                              className="px-2 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-xs transition-colors"
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Column - Experience & Location */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Details</h3>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Experience Level *
                    {yearsExperience && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'entry', label: '🚀 Entry', desc: '0-1y' },
                      { value: 'junior', label: '💼 Junior', desc: '1-3y' },
                      { value: 'mid', label: '⚡ Mid', desc: '3-5y' },
                      { value: 'senior', label: '🎯 Senior', desc: '5-8y' },
                      { value: 'lead', label: '👑 Lead', desc: '8+y' }
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => {
                          setYearsExperience(level.value)
                          addFieldAnimation('yearsExperience')
                        }}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 text-center ${
                          yearsExperience === level.value
                            ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="font-semibold text-xs">{level.label}</div>
                        <div className="text-xs text-gray-500">{level.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="workLocation" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Work Location *
                    {workLocation && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </Label>
                  <div className="space-y-2">
                    <Select value={workLocation} onValueChange={(value) => {
                      setWorkLocation(value)
                      addFieldAnimation('workLocation')
                    }}>
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Select work arrangement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">🌍 Remote</SelectItem>
                        <SelectItem value="on-site">🏢 On-site</SelectItem>
                        <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    {(workLocation === 'on-site' || workLocation === 'hybrid') && (
                      <Input
                        id="location"
                        placeholder="e.g., San Francisco, CA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-11 text-base"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="jobDescription" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Job Description
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">Optional</Badge>
                  </Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the full job description for better AI matching..."
                    rows={3}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="text-base resize-none"
                  />
                </div>
              </div>

              {/* Right Column - Live Preview & Action */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Preview</h3>
                </div>

                {/* Progress Ring */}
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - getCompletionPercentage() / 100)}`}
                        className="text-blue-500 transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">{getCompletionPercentage()}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Requirements Complete</p>
                </div>

                {/* Dynamic Preview Card */}
                <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="border-b border-blue-200 pb-3">
                        <h4 className="font-bold text-lg text-gray-800 mb-2">
                          {jobTitle || 'Job Title'}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">
                            {workLocation === 'remote' ? '🌍 Remote' : 
                             workLocation === 'on-site' ? `🏢 On-site${location ? ` - ${location}` : ''}` :
                             workLocation === 'hybrid' ? `🔄 Hybrid${location ? ` - ${location}` : ''}` :
                             'Select location'}
                          </span>
                        </div>
                      </div>
                      
                      {skillsTags.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {skillsTags.slice(0, 4).map((skill, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200 px-2 py-1 text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {skillsTags.length > 4 && (
                              <Badge variant="outline" className="text-xs">+{skillsTags.length - 4}</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {yearsExperience && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Experience:</p>
                          <div className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-blue-200">
                            <span className="text-sm">
                              {yearsExperience === 'entry' ? '🚀' :
                               yearsExperience === 'junior' ? '💼' :
                               yearsExperience === 'mid' ? '⚡' :
                               yearsExperience === 'senior' ? '🎯' :
                               yearsExperience === 'lead' ? '👑' : ''}
                            </span>
                            <span className="font-medium text-gray-700 text-sm">
                              {yearsExperience === 'entry' ? 'Entry Level' :
                               yearsExperience === 'junior' ? 'Junior' :
                               yearsExperience === 'mid' ? 'Mid Level' :
                               yearsExperience === 'senior' ? 'Senior' :
                               yearsExperience === 'lead' ? 'Lead/Staff' :
                               yearsExperience}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Button */}
                <Button
                  onClick={handleStartScreening}
                  disabled={!isFormValid || isStartingScreening || isUploading}
                  className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 sticky top-4"
                >
                  {isStartingScreening || isUploading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      {isUploading ? 'Uploading...' : 'Starting...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-6 w-6" />
                      Start AI Screening
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Progress Dialog */}
      <Dialog open={isUploading}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Uploading Resumes</DialogTitle>
            <DialogDescription>
              Please wait while we upload your files...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-center text-gray-600">
              {Math.round(uploadProgress)}% complete
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Data state
  const [screeningJobs, setScreeningJobs] = useState<ScreeningJob[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [userStats, setUserStats] = useState<any>(null)
  
  // View state
  const [showNewScreeningForm, setShowNewScreeningForm] = useState(false)
  const [selectedJobForResults, setSelectedJobForResults] = useState<string | null>(null)
  const [candidatesForJob, setCandidatesForJob] = useState<Candidate[]>([])
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  
  // Delete state
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [isDeletingJob, setIsDeletingJob] = useState(false)
  
  // Resume download state
  const [downloadingResumeId, setDownloadingResumeId] = useState<string | null>(null)

  // Cache tracking - prevent unnecessary reloads
  const hasInitiallyLoaded = useRef(false)
  const lastFetchTime = useRef<number>(0)
  const CACHE_DURATION = 30000 // 30 seconds cache

  // Define data loading functions
  const loadScreeningJobs = useCallback(async (forceRefresh = false) => {
    // Check cache to avoid unnecessary loads
    const now = Date.now()
    if (!forceRefresh && screeningJobs.length > 0 && (now - lastFetchTime.current) < CACHE_DURATION) {
      console.log('Using cached screening jobs')
      return
    }

    try {
      // Only show loading if we don't have data yet
      if (screeningJobs.length === 0) {
        setIsLoadingJobs(true)
      }
      
      const jobs = await getScreeningJobs(20)
      
      // Check for newly completed jobs and show notification
      if (screeningJobs.length > 0) {
        const previouslyActiveJobs = screeningJobs.filter(
          job => job.status === 'processing' || job.status === 'queued'
        )
        const nowCompletedJobs = jobs.filter(
          job => job.status === 'completed' && 
          previouslyActiveJobs.some(prevJob => prevJob.id === job.id)
        )
        
        nowCompletedJobs.forEach(job => {
          toast({
            title: "🎉 Screening Completed!",
            description: `${job.job_title} - ${job.total_resumes} resumes processed`,
          })
        })
      }
      
      setScreeningJobs(jobs)
      lastFetchTime.current = now
      
      // Check if user has any screenings (only on initial load)
      if (jobs.length === 0 && !hasInitiallyLoaded.current) {
        setShowNewScreeningForm(true)
      }
    } catch (error) {
      console.error('Error loading screening jobs:', error)
      toast({
        title: "Error",
        description: "Failed to load screening jobs",
        variant: "destructive",
      })
    } finally {
      setIsLoadingJobs(false)
    }
  }, [screeningJobs, toast])

  const loadUserStats = async () => {
    try {
      const stats = await getUserStats()
      console.log('User stats loaded:', stats) // Debug log
      setUserStats(stats)
    } catch (error) {
      console.error('Error loading user stats:', error)
      // Set a default stats object to prevent errors
      setUserStats({
        profile: null,
        stats: {
          totalResumes: 0,
          activeScreenings: 0,
          avgProcessingTime: 'N/A',
          monthlyUsage: 0,
          monthlyLimit: 5,
        }
      })
    }
  }

  const loadCandidatesForJob = async (jobId: string) => {
    try {
      setIsLoadingCandidates(true)
      const candidates = await getCandidates(jobId)
      setCandidatesForJob(candidates)
    } catch (error) {
      console.error('Error loading candidates:', error)
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCandidates(false)
    }
  }

  const handleScreeningComplete = async () => {
    setShowNewScreeningForm(false)
    await loadScreeningJobs(true) // Force refresh after completing a screening
    await loadUserStats()
  }

  const viewResults = (jobId: string) => {
    setSelectedJobForResults(jobId)
    loadCandidatesForJob(jobId)
  }

  const handleDeleteScreening = async (jobId: string) => {
    try {
      setIsDeletingJob(true)
      await deleteScreeningJob(jobId)
      
      toast({
        title: "✓ Deleted",
        description: "Screening job and all associated files have been deleted.",
      })
      
      // Refresh the list (force refresh after delete)
      await loadScreeningJobs(true)
      await loadUserStats()
      
      setJobToDelete(null)
    } catch (error: any) {
      console.error('Error deleting screening job:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete screening job",
        variant: "destructive",
      })
    } finally {
      setIsDeletingJob(false)
    }
  }

  const handleViewResume = async (candidateId: string) => {
    try {
      setDownloadingResumeId(candidateId)
      const { signedUrl, filename } = await getResumeFileUrl(candidateId)
      
      // Open in new tab
      window.open(signedUrl, '_blank')
      
      toast({
        title: "✓ Resume Opened",
        description: `Opening ${filename} in a new tab`,
      })
    } catch (error: any) {
      console.error('Error viewing resume:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load resume",
        variant: "destructive",
      })
    } finally {
      setDownloadingResumeId(null)
    }
  }

  const handleDownloadResume = async (candidateId: string, candidateName?: string) => {
    try {
      setDownloadingResumeId(candidateId)
      const { signedUrl, filename } = await getResumeFileUrl(candidateId)
      
      // Download the file
      const response = await fetch(signedUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = candidateName ? `${candidateName.replace(/\s+/g, '_')}_resume.pdf` : filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "✓ Downloaded",
        description: `${filename} has been downloaded`,
      })
    } catch (error: any) {
      console.error('Error downloading resume:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to download resume",
        variant: "destructive",
      })
    } finally {
      setDownloadingResumeId(null)
    }
  }

  // Load user data on mount (only once)
  useEffect(() => {
    if (user && !hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true
      loadScreeningJobs()
      loadUserStats()
    }
  }, [user, loadScreeningJobs])

  // Setup real-time subscriptions for live updates
  useEffect(() => {
    if (!user) return

    // Subscribe to screening jobs updates
    const jobsChannel = supabase
      .channel('screening_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'screening_jobs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔄 Real-time update - Screening job changed:', payload)
          // Force refresh on real-time updates
          loadScreeningJobs(true)
          loadUserStats()
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
      })

    // Subscribe to candidates updates if viewing results
    let candidatesChannel: any = null
    if (selectedJobForResults) {
      candidatesChannel = supabase
        .channel('candidates_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'candidates',
            filter: `screening_job_id=eq.${selectedJobForResults}`,
          },
          (payload) => {
            console.log('🔄 Real-time update - Candidate changed:', payload)
            loadCandidatesForJob(selectedJobForResults)
          }
        )
        .subscribe()
    }

    return () => {
      jobsChannel.unsubscribe()
      if (candidatesChannel) candidatesChannel.unsubscribe()
    }
  }, [user, selectedJobForResults, loadScreeningJobs])

  // Polling for active jobs (fallback in case real-time fails)
  useEffect(() => {
    if (!user || screeningJobs.length === 0) return

    // Check if there are any active jobs (processing or queued)
    const activeJobs = screeningJobs.filter(
      job => job.status === 'processing' || job.status === 'queued'
    )

    if (activeJobs.length === 0) return

    console.log(`🔄 Polling enabled for ${activeJobs.length} active jobs`)

    // Poll every 5 seconds for active jobs
    const pollInterval = setInterval(() => {
      console.log('⏱️ Polling for updates...')
      loadScreeningJobs(true)
      loadUserStats()
    }, 5000)

    return () => {
      console.log('🛑 Polling stopped')
      clearInterval(pollInterval)
    }
  }, [user, screeningJobs, loadScreeningJobs])

  // Loading state - only show full-screen loading on initial load
  if (isLoadingJobs && screeningJobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingLogo size={64} className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your screenings...</p>
        </div>
      </div>
    )
  }

  // Show new screening form if requested
  if (showNewScreeningForm) {
    return <NewScreeningForm user={user} userStats={userStats} onComplete={handleScreeningComplete} />
  }

  // Dashboard view with existing screenings
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Screenings</h1>
          <p className="text-muted-foreground">
            View past results or start a new screening
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => setShowNewScreeningForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Screening
        </Button>
      </div>

      {/* Screenings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screeningJobs.map((screening) => {
          const topCandidate = screening.processed_resumes > 0 ? {
            name: 'Top Candidate',
            score: 95
          } : null

          const isActive = screening.status === 'processing' || screening.status === 'queued'

          return (
            <Card 
              key={screening.id}
              className={`hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                isActive ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{screening.job_title}</CardTitle>
                  <Badge 
                    variant={screening.status === 'completed' ? 'default' : 'secondary'}
                    className={
                      screening.status === 'completed' ? 'bg-green-100 text-green-800' :
                      screening.status === 'processing' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                      screening.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800 animate-pulse'
                    }
                  >
                    {screening.status === 'completed' ? '✓ Completed' :
                     screening.status === 'processing' ? (
                       <span className="flex items-center gap-1">
                         <Loader2 className="h-3 w-3 animate-spin" />
                         Processing
                       </span>
                     ) :
                     screening.status === 'failed' ? '✗ Failed' :
                     (
                       <span className="flex items-center gap-1">
                         <Clock className="h-3 w-3" />
                         Queued
                       </span>
                     )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{screening.total_resumes} resumes</span>
                  </div>
                  {screening.status === 'processing' && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{screening.processed_resumes}/{screening.total_resumes}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar for Processing */}
                {screening.status === 'processing' && (
                  <div className="space-y-1">
                    <Progress 
                      value={(screening.processed_resumes / screening.total_resumes) * 100} 
                    />
                    <p className="text-xs text-gray-500">
                      Processing... {screening.processed_resumes} of {screening.total_resumes} complete
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-sm text-gray-500">
                  Created {new Date(screening.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <div className="px-6 pb-6 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => viewResults(screening.id)}
                  disabled={screening.status !== 'completed'}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Results
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setJobToDelete(screening.id)
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      {userStats?.stats && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">{userStats.stats.totalResumes}</div>
                <div className="text-sm text-gray-600">Total Resumes Screened</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">{userStats.stats.activeScreenings}</div>
                <div className="text-sm text-gray-600">Active Screenings</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">{userStats.stats.avgProcessingTime}</div>
                <div className="text-sm text-gray-600">Avg Processing Time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-600">{userStats.stats.monthlyUsage}/{userStats.stats.monthlyLimit}</div>
                <div className="text-sm text-gray-600">Monthly Usage</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this screening job and all associated data:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>All candidate records</li>
                <li>All uploaded resume files</li>
                <li>All AI analysis results</li>
              </ul>
              <p className="mt-2 font-semibold text-red-600">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingJob}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => jobToDelete && handleDeleteScreening(jobToDelete)}
              disabled={isDeletingJob}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingJob ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Results Dialog */}
      <Dialog open={!!selectedJobForResults} onOpenChange={() => setSelectedJobForResults(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Screening Results</DialogTitle>
            <DialogDescription>
              Top candidates ranked by AI match score
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingCandidates ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {candidatesForJob.map((candidate, index) => (
                <Card key={candidate.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            #{index + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{candidate.candidate_name || candidate.filename}</h3>
                            {candidate.candidate_email && (
                              <p className="text-sm text-gray-600">{candidate.candidate_email}</p>
                            )}
                          </div>
                        </div>
                        
                        {candidate.match_score !== null && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Match Score</span>
                              <span className="text-lg font-bold text-blue-600">{candidate.match_score?.toFixed(1)}%</span>
                            </div>
                            <Progress value={candidate.match_score || 0} />
                          </div>
                        )}
                        
                        {candidate.strengths && candidate.strengths.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-semibold text-green-700 mb-1">Strengths:</p>
                            <ul className="text-sm space-y-1">
                              {candidate.strengths.map((strength, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-1">✓</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {candidate.top_skills && candidate.top_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.top_skills.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {candidate.status === 'failed' && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-700">{candidate.error_message || 'Processing failed'}</p>
                          </div>
                        )}
                        
                        {/* Resume Actions */}
                        {candidate.file_path && candidate.status === 'completed' && (
                          <div className="mt-4 flex gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewResume(candidate.id)}
                              disabled={downloadingResumeId === candidate.id}
                              className="flex-1"
                            >
                              {downloadingResumeId === candidate.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Resume
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadResume(candidate.id, candidate.candidate_name)}
                              disabled={downloadingResumeId === candidate.id}
                              className="flex-1"
                            >
                              {downloadingResumeId === candidate.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <FileDown className="mr-2 h-4 w-4" />
                                  Download
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {candidatesForJob.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No candidates found
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
