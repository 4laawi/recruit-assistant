import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Search, 
  Brain, 
  Target, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Settings,
  ArrowRight,
  Server
} from "lucide-react"

export default function ServersPage() {
  const servers = [
    {
      id: '1',
      name: 'Resume Ranker AI',
      description: 'Intelligently ranks resumes based on job requirements and skills matching',
      status: 'active',
      icon: Brain,
      lastUpdated: '2 days ago',
    },
    {
      id: '2',
      name: 'Skill Matcher',
      description: 'Matches candidate skills with job descriptions using advanced NLP',
      status: 'inactive',
      icon: Target,
      lastUpdated: '1 week ago',
    },
    {
      id: '3',
      name: 'Language Parser',
      description: 'Analyzes and extracts key information from resume text',
      status: 'active',
      icon: FileText,
      lastUpdated: '3 days ago',
    },
    {
      id: '4',
      name: 'Experience Analyzer',
      description: 'Evaluates work experience relevance and seniority levels',
      status: 'setup',
      icon: Settings,
      lastUpdated: '5 days ago',
    },
    {
      id: '5',
      name: 'Education Verifier',
      description: 'Validates educational credentials and certifications',
      status: 'active',
      icon: CheckCircle,
      lastUpdated: '1 day ago',
    },
    {
      id: '6',
      name: 'Cultural Fit AI',
      description: 'Assesses cultural alignment and soft skills compatibility',
      status: 'setup',
      icon: AlertCircle,
      lastUpdated: '4 days ago',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'setup':
        return <Badge variant="outline" className="border-orange-200 text-orange-800">Setup Required</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Servers</h1>
          <p className="text-muted-foreground">
            Manage your AI-powered recruitment tools
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Server
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search servers..." className="pl-10" />
        </div>
        
        <div className="flex gap-2">
          <Badge variant="default" className="cursor-pointer">All</Badge>
          <Badge variant="outline" className="cursor-pointer">Active</Badge>
          <Badge variant="outline" className="cursor-pointer">Setup</Badge>
        </div>
      </div>

      {/* Server Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <Card 
            key={server.id}
            className="p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                <server.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{server.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {server.description}
              </p>
              
              <div className="mb-4">
                {getStatusBadge(server.status)}
              </div>
              
              <p className="text-xs text-muted-foreground mb-4">
                Last updated: {server.lastUpdated}
              </p>
              
              <Button 
                variant="ghost" 
                className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State (if no servers) */}
      {servers.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Server className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No AI Servers</h3>
          <p className="text-muted-foreground mb-6">
            Get started by adding your first AI server to automate your recruitment process.
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Server
          </Button>
        </Card>
      )}
    </div>
  )
}
