'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { 
  Users, 
  Search, 
  Filter, 
  Mail,
  Phone,
  Briefcase,
  Download,
  ExternalLink,
  Loader2,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { Candidate } from '@/types/database'
import { useToast } from "@/components/ui/use-toast"
import LoadingLogo from "@/components/LoadingLogo"

export default function CandidatesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterScore, setFilterScore] = useState<string>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const loadAllCandidates = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Mock data - replace with actual API call
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          screening_job_id: 'job1',
          filename: 'john_doe_resume.pdf',
          file_path: '/resumes/john_doe.pdf',
          candidate_name: 'John Doe',
          candidate_email: 'john.doe@email.com',
          candidate_phone: '+1 (555) 123-4567',
          match_score: 95.5,
          top_skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
          years_of_experience: 8,
          strengths: [
            'Strong experience with React and TypeScript',
            'Led multiple successful projects',
            'Excellent problem-solving skills'
          ],
          weaknesses: ['Limited experience with mobile development'],
          summary: 'Senior software engineer with 8 years of experience...',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user?.id || ''
        },
        {
          id: '2',
          screening_job_id: 'job1',
          filename: 'jane_smith_resume.pdf',
          file_path: '/resumes/jane_smith.pdf',
          candidate_name: 'Jane Smith',
          candidate_email: 'jane.smith@email.com',
          candidate_phone: '+1 (555) 234-5678',
          match_score: 88.0,
          top_skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
          years_of_experience: 5,
          strengths: [
            'Strong backend development skills',
            'Experience with microservices architecture'
          ],
          weaknesses: ['Limited frontend experience'],
          summary: 'Full-stack developer with focus on backend...',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user?.id || ''
        },
        {
          id: '3',
          screening_job_id: 'job2',
          filename: 'mike_johnson_resume.pdf',
          file_path: '/resumes/mike_johnson.pdf',
          candidate_name: 'Mike Johnson',
          candidate_email: 'mike.j@email.com',
          match_score: 92.3,
          top_skills: ['DevOps', 'Kubernetes', 'AWS', 'Terraform'],
          years_of_experience: 6,
          strengths: [
            'Expert in cloud infrastructure',
            'Strong automation skills',
            'Excellent documentation'
          ],
          weaknesses: [],
          summary: 'DevOps engineer with extensive cloud experience...',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user?.id || ''
        }
      ]
      
      setCandidates(mockCandidates)
    } catch (error) {
      console.error('Error loading candidates:', error)
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    if (user) {
      loadAllCandidates()
    }
  }, [user, loadAllCandidates])

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.candidate_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.top_skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus
    
    const matchesScore = 
      filterScore === 'all' ||
      (filterScore === 'excellent' && (candidate.match_score || 0) >= 90) ||
      (filterScore === 'good' && (candidate.match_score || 0) >= 75 && (candidate.match_score || 0) < 90) ||
      (filterScore === 'fair' && (candidate.match_score || 0) < 75)
    
    return matchesSearch && matchesStatus && matchesScore
  })

  const getScoreBadge = (score: number | null) => {
    if (!score) return null
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent Match</Badge>
    if (score >= 75) return <Badge className="bg-blue-100 text-blue-800">Good Match</Badge>
    return <Badge className="bg-yellow-100 text-yellow-800">Fair Match</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingLogo size={48} className="mx-auto mb-4" />
          <p className="text-gray-600">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Candidates
            <Badge variant="secondary" className="bg-green-100 text-green-800">New</Badge>
          </h1>
          <p className="text-muted-foreground">View and manage all candidates</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterScore} onValueChange={setFilterScore}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Scores</SelectItem>
            <SelectItem value="excellent">90%+ (Excellent)</SelectItem>
            <SelectItem value="good">75-89% (Good)</SelectItem>
            <SelectItem value="fair">&lt;75% (Fair)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-sm text-gray-600">Total Candidates</p>
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
                <p className="text-2xl font-bold">
                  {candidates.filter(c => (c.match_score || 0) >= 90).length}
                </p>
                <p className="text-sm text-gray-600">Excellent Match</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {candidates.length > 0 
                    ? Math.round(candidates.reduce((sum, c) => sum + (c.match_score || 0), 0) / candidates.length)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Avg Match Score</p>
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
                <p className="text-2xl font-bold">
                  {candidates.filter(c => c.status === 'processing').length}
                </p>
                <p className="text-sm text-gray-600">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate) => (
          <Card 
            key={candidate.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedCandidate(candidate)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {candidate.candidate_name?.split(' ').map(n => n[0]).join('') || 'C'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{candidate.candidate_name || candidate.filename}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        {candidate.candidate_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {candidate.candidate_email}
                          </div>
                        )}
                        {candidate.candidate_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {candidate.candidate_phone}
                          </div>
                        )}
                      </div>
                    </div>
                    {candidate.match_score !== null && getScoreBadge(candidate.match_score)}
                  </div>
                  
                  {candidate.match_score !== null && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Match Score</span>
                        <span className="text-sm font-bold text-blue-600">
                          {candidate.match_score.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={candidate.match_score} className="h-2" />
                    </div>
                  )}
                  
                  {candidate.summary && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{candidate.summary}</p>
                  )}
                  
                  {candidate.top_skills && candidate.top_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.top_skills.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.top_skills.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.top_skills.length - 6} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {candidate.years_of_experience && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {candidate.years_of_experience} years exp.
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(candidate.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCandidates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No candidates found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedCandidate.candidate_name || selectedCandidate.filename}
                </DialogTitle>
                <DialogDescription>
                  Candidate Details & Analysis
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    {selectedCandidate.candidate_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a href={`mailto:${selectedCandidate.candidate_email}`} className="text-blue-600 hover:underline">
                          {selectedCandidate.candidate_email}
                        </a>
                      </div>
                    )}
                    {selectedCandidate.candidate_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        {selectedCandidate.candidate_phone}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Match Score */}
                {selectedCandidate.match_score !== null && (
                  <div>
                    <h3 className="font-semibold mb-2">Match Score</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={selectedCandidate.match_score} className="h-3" />
                      </div>
                      <span className="text-2xl font-bold text-blue-600">
                        {selectedCandidate.match_score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Skills */}
                {selectedCandidate.top_skills && selectedCandidate.top_skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.top_skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Strengths */}
                {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-green-700">Strengths</h3>
                    <ul className="space-y-2">
                      {selectedCandidate.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Weaknesses */}
                {selectedCandidate.weaknesses && selectedCandidate.weaknesses.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-orange-700">Areas for Development</h3>
                    <ul className="space-y-2">
                      {selectedCandidate.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Summary */}
                {selectedCandidate.summary && (
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-sm text-gray-600">{selectedCandidate.summary}</p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Candidate
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Resume
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

