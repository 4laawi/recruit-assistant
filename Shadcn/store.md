# Recruit Assistant - Cursor Build Instructions

## 🎯 Project Overview
Build a modern SaaS web application called **Recruit Assistant** - an AI-powered HR recruitment platform that helps recruiters manage and rank resumes efficiently.

## 🛠️ Technology Stack & Setup

### Framework & Libraries
```bash
# Use Next.js 14+ with TypeScript
npx create-next-app@latest recruit-assistant --typescript --tailwind --app

# Install shadcn/ui
npx shadcn-ui@latest init

# Select these options:
- Style: Default
- Base color: Slate
- CSS variables: Yes
```

### Required shadcn/ui Components
Install these components from shadcn/ui:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add sheet
```

### Additional Dependencies
```bash
npm install lucide-react  # For icons
npm install class-variance-authority clsx tailwind-merge  # Utility functions
```

---

## 🎨 Design System Configuration

### Update tailwind.config.js
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        },
        accent: '#8b5cf6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #3b82f6, #8b5cf6)',
      },
    },
  },
}
```

### Global Styles (globals.css)
```css
@layer base {
  :root {
    --radius: 0.5rem;
  }
}

body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

---

## 📄 Pages to Build

### File Structure
```
app/
├── page.tsx                 # Homepage (landing)
├── login/
│   └── page.tsx            # Login/Signup page
├── dashboard/
│   ├── layout.tsx          # Dashboard layout with sidebar
│   ├── page.tsx            # Dashboard home
│   └── servers/
│       ├── page.tsx        # MCP Servers list
│       └── [id]/
│           └── page.tsx    # Server detail page
└── components/
    ├── Navigation.tsx
    ├── Sidebar.tsx
    ├── ServerCard.tsx
    └── InstallationStep.tsx
```

---

## 1️⃣ HOMEPAGE (Landing Page)

### Layout
Create a modern landing page with:

**Navigation Bar:**
- Use shadcn `Button` components
- Fixed position with backdrop blur
- Logo on left, "Login" and "Get Started" buttons on right
- Buttons: variant="ghost" for Login, variant="default" with gradient for Get Started

**Hero Section:**
```tsx
<section className="container mx-auto px-4 py-24 text-center">
  <h1 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
    AI-Powered Recruitment Made Simple
  </h1>
  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
    Rank and manage hundreds of resumes with intelligent automation
  </p>
  <div className="flex gap-4 justify-center">
    <Button size="lg" className="bg-gradient-primary">Get Started Free</Button>
    <Button size="lg" variant="outline">Watch Demo</Button>
  </div>
</section>
```

**Features Section:**
- Use shadcn `Card` components in a 3-column grid
- Each card should have an icon (from lucide-react), title, and description
- Example features:
  - Smart Resume Ranking
  - Automated Screening
  - AI-Powered Insights
  - Time Savings

```tsx
<Card className="p-6 hover:shadow-lg transition-shadow">
  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
    <FileText className="w-6 h-6 text-white" />
  </div>
  <h3 className="text-xl font-semibold mb-2">Smart Resume Ranking</h3>
  <p className="text-muted-foreground">
    AI algorithms rank resumes based on job requirements
  </p>
</Card>
```

---

## 2️⃣ LOGIN/SIGNUP PAGE

### Layout
Centered authentication form using shadcn components:

```tsx
<div className="min-h-screen flex items-center justify-center bg-slate-50">
  <Card className="w-full max-w-md p-8">
    <div className="text-center mb-8">
      <h1 className="text-2xl font-bold">Welcome Back</h1>
      <p className="text-muted-foreground">Sign in to continue</p>
    </div>

    {/* Google OAuth Button */}
    <Button variant="outline" className="w-full mb-4">
      <Chrome className="mr-2 h-4 w-4" />
      Continue with Google
    </Button>

    <Separator className="my-6">
      <span className="px-2 text-muted-foreground">or</span>
    </Separator>

    {/* Email/Password Form */}
    <form className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>
      <Button className="w-full bg-gradient-primary">Sign In</Button>
    </form>

    <p className="text-center text-sm text-muted-foreground mt-4">
      Don't have an account? <a href="#" className="text-primary">Sign up</a>
    </p>
  </Card>
</div>
```

**Important:**
- Use shadcn `Input`, `Label`, `Button`, `Card`, and `Separator`
- Add form validation states (red border for errors)
- Include loading state on button (disabled + spinner)

---

## 3️⃣ DASHBOARD LAYOUT

### Create Dashboard Layout Component

**Sidebar (Desktop):**
```tsx
// components/Sidebar.tsx
import { Home, Server, FileText, BarChart, Settings } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Server, label: 'AI Servers', href: '/dashboard/servers' },
  { icon: FileText, label: 'Resumes', href: '/dashboard/resumes' },
  { icon: BarChart, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-background h-screen sticky top-0">
      <div className="p-6">
        <h2 className="font-bold text-xl">Recruit Assistant</h2>
      </div>
      <nav className="px-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  )
}
```

**Top Navigation Bar:**
```tsx
// components/Navigation.tsx
<header className="border-b bg-background sticky top-0 z-10">
  <div className="flex h-16 items-center px-6 gap-4">
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
    
    <div className="flex-1" />
    
    <Button variant="ghost" size="icon">
      <Bell className="h-5 w-5" />
    </Button>
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {/* Dropdown menu items */}
    </DropdownMenu>
  </div>
</header>
```

### Dashboard Home Page

**Stats Cards:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Total Resumes</p>
        <p className="text-3xl font-bold">247</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </Card>
  
  {/* Repeat for other stats */}
</div>
```

---

## 4️⃣ AI SERVERS PAGE (Main Feature)

### Page Header & Actions
```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold">AI Servers</h1>
    <p className="text-muted-foreground">
      Manage your AI-powered recruitment tools
    </p>
  </div>
  <Button className="bg-gradient-primary">
    <Plus className="mr-2 h-4 w-4" />
    Add New Server
  </Button>
</div>
```

### Search & Filters
```tsx
<div className="flex gap-4 mb-6">
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
```

### Server Cards Grid

**Create ServerCard Component:**
```tsx
// components/ServerCard.tsx
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ServerCardProps {
  name: string
  description: string
  status: 'active' | 'inactive' | 'setup'
  icon: React.ReactNode
  onClick: () => void
}

export function ServerCard({ name, description, status, icon, onClick }: ServerCardProps) {
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
          {icon}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        
        <Badge 
          variant={status === 'active' ? 'default' : 'secondary'}
          className="mb-4"
        >
          {status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        
        <Button 
          variant="ghost" 
          className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View Details →
        </Button>
      </div>
    </Card>
  )
}
```

**Grid Layout:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <ServerCard
    name="Resume Ranker AI"
    description="Intelligently ranks resumes based on job requirements and skills matching"
    status="active"
    icon={<Brain className="w-8 h-8 text-white" />}
    onClick={() => router.push('/dashboard/servers/1')}
  />
  
  <ServerCard
    name="Skill Matcher"
    description="Matches candidate skills with job descriptions using advanced NLP"
    status="inactive"
    icon={<Target className="w-8 h-8 text-white" />}
    onClick={() => router.push('/dashboard/servers/2')}
  />
  
  {/* Add more server cards */}
</div>
```

**Example AI Servers to Display:**
1. Resume Ranker AI - Active
2. Skill Matcher - Inactive
3. Language Parser - Active
4. Experience Analyzer - Setup Required
5. Education Verifier - Active
6. Cultural Fit AI - Setup Required

---

## 5️⃣ SERVER DETAIL PAGE

### Page Layout
```tsx
<div className="max-w-4xl mx-auto">
  <Button variant="ghost" className="mb-6">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to Servers
  </Button>

  {/* Server Header */}
  <div className="text-center mb-8">
    <div className="w-32 h-32 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
      <Brain className="w-16 h-16 text-white" />
    </div>
    <h1 className="text-3xl font-bold mb-2">Resume Ranker AI</h1>
    <div className="flex gap-2 justify-center">
      <Badge variant="default">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
      <Badge variant="outline">v2.1.4</Badge>
    </div>
  </div>

  {/* Description Card */}
  <Card className="p-6 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <FileText className="w-5 h-5" />
      <h2 className="text-xl font-semibold">Description</h2>
    </div>
    <Separator className="mb-4" />
    <p className="text-muted-foreground leading-relaxed">
      This AI server uses advanced machine learning algorithms to analyze and rank resumes 
      based on job requirements, skills matching, experience levels, and cultural fit indicators. 
      It processes hundreds of resumes in seconds and provides detailed scoring breakdowns.
    </p>
  </Card>

  {/* Details Card */}
  <Card className="p-6 mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Settings className="w-5 h-5" />
      <h2 className="text-xl font-semibold">Details</h2>
    </div>
    <Separator className="mb-4" />
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm font-medium">Version</p>
        <p className="text-muted-foreground">2.1.4</p>
      </div>
      <div>
        <p className="text-sm font-medium">Status</p>
        <p className="text-muted-foreground">✓ Active</p>
      </div>
      <div>
        <p className="text-sm font-medium">Last Updated</p>
        <p className="text-muted-foreground">2 days ago</p>
      </div>
      <div>
        <p className="text-sm font-medium">Endpoint</p>
        <p className="text-muted-foreground text-sm">api.recruit.ai/mcp/resume</p>
      </div>
    </div>
  </Card>

  {/* Installation Section */}
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-4">
      <Package className="w-5 h-5" />
      <h2 className="text-xl font-semibold">Installation & Setup</h2>
    </div>
  </div>
</div>
```

### Installation Step Cards

**Create InstallationStep Component:**
```tsx
// components/InstallationStep.tsx
'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

interface InstallationStepProps {
  step: number
  title: string
  code: string
  variant?: 'blue' | 'purple' | 'cyan'
}

export function InstallationStep({ step, title, code, variant = 'blue' }: InstallationStepProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const gradientClasses = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200',
    purple: 'from-purple-50 to-pink-50 border-purple-200',
    cyan: 'from-cyan-50 to-teal-50 border-cyan-200',
  }

  return (
    <Card className={`p-6 bg-gradient-to-br ${gradientClasses[variant]} border-2`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
          {step}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      
      <div className="relative">
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
          <code className="text-sm font-mono">{code}</code>
        </pre>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  )
}
```

**Usage:**
```tsx
<div className="space-y-4">
  <InstallationStep
    step={1}
    title="Install Dependencies"
    code="npm install @recruit/mcp-resume"
    variant="blue"
  />
  
  <InstallationStep
    step={2}
    title="Configure API Key"
    code="export RECRUIT_API_KEY=your_api_key_here"
    variant="purple"
  />
  
  <InstallationStep
    step={3}
    title="Initialize Server"
    code="mcp-resume init --config config.yml"
    variant="cyan"
  />
</div>
```

### Action Buttons
```tsx
<div className="flex gap-4 justify-center mt-8">
  <Button size="lg" className="bg-gradient-primary">
    Activate Server
  </Button>
  <Button size="lg" variant="outline">
    <Settings className="mr-2 h-4 w-4" />
    Configure Settings
  </Button>
</div>
```

---

## 🎨 Additional Styling

### Custom CSS for Gradients
```css
/* globals.css */
.bg-gradient-primary {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
}

.text-gradient {
  background: linear-gradient(to right, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Animations
```css
/* Add smooth transitions */
@layer utilities {
  .animate-in {
    animation: fadeIn 0.3s ease-in;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

---

## 📱 Responsive Design

### Mobile Navigation
For mobile, replace sidebar with Sheet (drawer):
```tsx
// In layout.tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    {/* Sidebar content */}
  </SheetContent>
</Sheet>
```

### Breakpoint Adjustments
```tsx
// Use Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

---

## 🎯 Mock Data

Create a data file for development:
```typescript
// lib/mock-data.ts
export const aiServers = [
  {
    id: '1',
    name: 'Resume Ranker AI',
    description: 'Intelligently ranks resumes based on job requirements and skills matching',
    status: 'active',
    version: '2.1.4',
    endpoint: 'api.recruit.ai/mcp/resume',
    icon: 'Brain',
    lastUpdated: '2 days ago',
  },
  {
    id: '2',
    name: 'Skill Matcher',
    description: 'Matches candidate skills with job descriptions using advanced NLP',
    status: 'inactive',
    version: '1.8.2',
    endpoint: 'api.recruit.ai/mcp/skills',
    icon: 'Target',
    lastUpdated: '1 week ago',
  },
  // Add more...
]
```

---

## ✅ Development Checklist

### Phase 1: Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Install and configure shadcn/ui
- [ ] Install all required components
- [ ] Set up Tailwind config with custom colors
- [ ] Create basic file structure

### Phase 2: Core Pages
- [ ] Build Homepage (landing)
- [ ] Build Login/Signup page
- [ ] Create Dashboard layout with Sidebar
- [ ] Build Dashboard home with stat cards

### Phase 3: Main Feature
- [ ] Build AI Servers list page
- [ ] Create ServerCard component
- [ ] Implement search and filter UI
- [ ] Build Server detail page
- [ ] Create InstallationStep component

### Phase 4: Polish
- [ ] Add loading states (Skeleton components)
- [ ] Add toast notifications for actions
- [ ] Implement responsive mobile menu
- [ ] Add hover effects and animations
- [ ] Test all interactions

### Phase 5: Refinement
- [ ] Add empty states
- [ ] Implement error handling UI
- [ ] Add keyboard navigation
- [ ] Test responsive design on all breakpoints
- [ ] Final styling polish

---

## 🚫 Important Notes

**DO NOT IMPLEMENT:**
- No real authentication logic
- No database connections
- No API calls (use mock data)
- No state management libraries needed yet
- No backend services

**FOCUS ON:**
- Beautiful, modern UI using shadcn/ui
- Smooth interactions and animations
- Responsive design
- Component reusability
- Clean, readable code

---

## 💡 Tips for Cursor

1. **Use shadcn/ui components** for all UI elements - don't create custom components from scratch
2. **Keep it simple** - focus on visual polish, not complex logic
3. **Use Tailwind classes** for styling - avoid custom CSS unless needed for gradients
4. **Mock all data** - hardcode sample data in components or use the mock-data file
5. **Copy button functionality** - use `navigator.clipboard.writeText()` for copy actions
6. **Icons** - use lucide-react for all icons
7. **Responsive** - use Tailwind's responsive prefixes (md:, lg:, etc.)

---

This specification is ready to paste into a .md file for Cursor to build your modern SaaS UI! 🚀