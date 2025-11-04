'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Users,
  Clock,
  Target,
  Download,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from "@/components/ui/use-toast"
import LoadingLogo from "@/components/LoadingLogo"

export default function ReportsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  
  const [stats, setStats] = useState({
    totalScreenings: 45,
    totalCandidates: 287,
    avgMatchScore: 78.5,
    processingTime: '2.3 min',
    successRate: 94.2,
    topSkills: [
      { skill: 'React', count: 142, trend: 'up' },
      { skill: 'TypeScript', count: 128, trend: 'up' },
      { skill: 'Node.js', count: 115, trend: 'up' },
      { skill: 'Python', count: 98, trend: 'down' },
      { skill: 'AWS', count: 87, trend: 'up' }
    ],
    screeningsByDay: [
      { day: 'Mon', count: 8 },
      { day: 'Tue', count: 12 },
      { day: 'Wed', count: 15 },
      { day: 'Thu', count: 10 },
      { day: 'Fri', count: 14 },
      { day: 'Sat', count: 3 },
      { day: 'Sun', count: 2 }
    ],
    matchScoreDistribution: [
      { range: '90-100%', count: 78, percentage: 27 },
      { range: '80-89%', count: 102, percentage: 36 },
      { range: '70-79%', count: 67, percentage: 23 },
      { range: '60-69%', count: 28, percentage: 10 },
      { range: '<60%', count: 12, percentage: 4 }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'screening_completed',
        title: 'Frontend Developer Screening',
        description: '12 candidates processed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '2',
        type: 'high_match',
        title: 'High Match Found',
        description: 'Sarah Johnson - 96% match for Senior Backend Role',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        status: 'success'
      },
      {
        id: '3',
        type: 'screening_started',
        title: 'DevOps Engineer Screening',
        description: '8 candidates in queue',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'processing'
      }
    ]
  })

  useEffect(() => {
    if (user) {
      loadReports()
    }
  }, [user, timeRange])

  const loadReports = async () => {
    try {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Data is already set in useState
    } catch (error) {
      console.error('Error loading reports:', error)
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportReport = () => {
    toast({
      title: "📊 Export Started",
      description: "Your report is being generated and will download shortly",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingLogo size={48} className="mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Track your recruitment performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{stats.totalScreenings}</p>
            <p className="text-sm text-gray-600">Total Screenings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{stats.totalCandidates}</p>
            <p className="text-sm text-gray-600">Candidates Screened</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3.2%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{stats.avgMatchScore}%</p>
            <p className="text-sm text-gray-600">Avg Match Score</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-red-600 border-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                -15%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{stats.processingTime}</p>
            <p className="text-sm text-gray-600">Avg Processing Time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screening Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Screening Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.screeningsByDay.map((day, index) => {
                const maxCount = Math.max(...stats.screeningsByDay.map(d => d.count))
                const percentage = (day.count / maxCount) * 100
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="font-medium w-12">{day.day}</span>
                      <span className="text-gray-600">{day.count} screenings</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Match Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Match Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.matchScoreDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="font-medium">{item.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{item.count} candidates</span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        item.range === '90-100%' ? 'bg-green-500' :
                        item.range === '80-89%' ? 'bg-blue-500' :
                        item.range === '70-79%' ? 'bg-yellow-500' :
                        item.range === '60-69%' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top In-Demand Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSkills.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.skill}</p>
                      <p className="text-xs text-gray-600">{item.count} mentions</p>
                    </div>
                  </div>
                  {item.trend === 'up' ? (
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-800">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Stable
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`p-2 rounded-lg h-fit ${
                    activity.status === 'success' ? 'bg-green-100' :
                    activity.status === 'processing' ? 'bg-blue-100' :
                    'bg-red-100'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.status === 'processing' ? (
                      <Clock className="h-4 w-4 text-blue-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{stats.successRate}%</p>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-xs text-gray-500 mt-1">Screenings completed successfully</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">156</p>
              <p className="text-sm text-gray-600">High Matches</p>
              <p className="text-xs text-gray-500 mt-1">Candidates with 85%+ match score</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">6.4</p>
              <p className="text-sm text-gray-600">Avg Candidates/Screening</p>
              <p className="text-xs text-gray-500 mt-1">Average pool size per job</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

