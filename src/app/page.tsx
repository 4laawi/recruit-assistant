'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Brain, 
  Target, 
  Clock, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Star,
  BarChart3,
  Zap,
  Shield,
  Sparkles,
  Rocket
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import Navbar from "@/components/Navbar"

export default function Home() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [isMockupVisible, setIsMockupVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mockupRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const timer = setTimeout(() => setProgress(85), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMockupVisible(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      }
    )

    if (mockupRef.current) {
      observer.observe(mockupRef.current)
    }

    return () => {
      if (mockupRef.current) {
        observer.unobserve(mockupRef.current)
      }
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    setMousePosition({ x: rotateY, y: rotateX })
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-blue-50/40 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-8 lg:px-16 xl:px-24 py-20 lg:py-32 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Side - Copy */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="flex-1 lg:max-w-[50%] flex flex-col items-start justify-center space-y-8"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] tracking-tight"
              >
                <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent animate-gradient">
                  Screen 100+
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  Candidates
                </span>
                <br />
                <span className="text-gray-900">
                  in Minutes
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl font-medium"
              >
                Our AI instantly ranks and analyzes hundreds of resumes. Make better hiring decisions while your competitors are still reading CVs.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                {user ? (
                  <Link href="/dashboard">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 rounded-full px-8 py-7 text-lg font-bold group"
                      >
                        <span className="flex items-center gap-2">
                          Go to Dashboard
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                      </Button>
                    </motion.div>
                  </Link>
                ) : (
                  <>
                    <Link href="/login?signup=1">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 rounded-full px-8 py-7 text-lg font-bold group relative overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Rocket className="w-5 h-5" />
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </span>
                          {/* Animated gradient overlay */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                          />
                        </Button>
                      </motion.div>
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Right Side - 3D Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 100, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="flex-1 lg:max-w-[50%] relative"
              style={{ perspective: "1000px" }}
            >
              <div 
                ref={mockupRef}
                className="relative"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
              >
                {/* 3D tilt wrapper */}
                <div
                  style={{
                    transform: `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
                    transition: "transform 0.3s ease-out"
                  }}
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-pink-500/30 rounded-3xl blur-3xl opacity-70"></div>
                  
                  <Card className="relative bg-white/95 backdrop-blur-xl border-2 border-purple-200/50 shadow-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-purple-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full" />
                          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                          <div className="w-3 h-3 bg-green-400 rounded-full" />
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Dashboard
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Candidate Rankings */}
                        <div className="lg:col-span-2">
                          <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800">
                            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                            Candidate Rankings
                          </h3>
                          <div className="space-y-3">
                            {[
                              { name: "Sarah Johnson", score: 95, role: "Senior Developer", color: "from-green-500 to-emerald-500" },
                              { name: "Mike Chen", score: 88, role: "Full Stack Engineer", color: "from-blue-500 to-cyan-500" },
                              { name: "Emily Davis", score: 82, role: "Frontend Developer", color: "from-purple-500 to-pink-500" },
                              { name: "Alex Rodriguez", score: 78, role: "Backend Developer", color: "from-orange-500 to-red-500" }
                            ].map((candidate, index) => (
                              <motion.div
                                key={candidate.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 bg-gradient-to-r ${candidate.color} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                                    {candidate.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800">{candidate.name}</p>
                                    <p className="text-xs text-gray-500">{candidate.role}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Progress value={candidate.score} className="w-20 h-2" />
                                  <span className="text-sm font-bold text-purple-600 min-w-[3rem] text-right">{candidate.score}%</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold flex items-center text-gray-800">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                            Live Stats
                          </h3>
                          {[
                            { label: "Resumes", value: "247", color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" },
                            { label: "Time Saved", value: "73%", color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
                            { label: "Avg Rating", value: "4.8", color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50" }
                          ].map((stat, index) => (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                            >
                              <Card className={`bg-gradient-to-br ${stat.bg} border-0 shadow-md`}>
                                <CardContent className="p-4">
                                  <div className="text-center">
                                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                                      {stat.value}
                                    </div>
                                    <div className="text-xs font-semibold text-gray-600">{stat.label}</div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-8 lg:px-16 xl:px-24 pb-20 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-semibold text-gray-500 mb-8 uppercase tracking-wider">
            Trusted by leading companies
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {["amazon", "harvard", "ibm", "logo-grant", "mastercard", "nbc_universal", "salesforce", "walgreens"].map((logo, index) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                className="flex items-center justify-center"
              >
                <Image 
                  src={`/logos/${logo === "amazon" ? "amzon" : logo}.svg`}
                  alt={`${logo} logo`}
                  width={100}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section - Bento Grid */}
      <section className="container mx-auto px-8 lg:px-16 xl:px-24 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-6 bg-white/80 backdrop-blur-sm border-purple-300 px-4 py-2 text-sm font-semibold shadow-lg">
            <Zap className="w-3 h-3 mr-2 inline text-purple-600" />
            Features
          </Badge>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-xl font-medium">
            Everything you need to streamline your recruitment process
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Smart Resume Ranking - Large Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
              <Card className="h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-200/50 hover:border-blue-400 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg"
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FileText className="w-7 h-7 text-white" />
                    </motion.div>
                    <Badge className="bg-blue-500 text-white shadow-lg">Core Feature</Badge>
                  </div>
                  <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                    Smart Resume Ranking
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 font-medium">
                    AI algorithms rank resumes based on job requirements and skills matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-inner">
                    <div className="space-y-4">
                      {[
                        { label: "Technical Skills Match", value: 94 },
                        { label: "Experience Relevance", value: 87 },
                        { label: "Cultural Fit", value: 91 }
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                            <span className="text-sm font-bold text-blue-600">{item.value}%</span>
                          </div>
                          <Progress value={item.value} className="h-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Automated Screening */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
              <Card className="h-full bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-2xl transition-all duration-500 group">
                <CardHeader>
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Brain className="w-7 h-7 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                    Automated Screening
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-600">
                    Intelligent screening that learns from your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Keyword Analysis", "Experience Validation", "Skills Assessment"].map((item) => (
                      <motion.div 
                        key={item}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-semibold text-gray-700">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* AI-Powered Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
              <Card className="h-full bg-gradient-to-br from-green-50 via-white to-emerald-50 border-2 border-green-200/50 hover:border-green-400 hover:shadow-2xl transition-all duration-500 group">
                <CardHeader>
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Target className="w-7 h-7 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                    AI-Powered Insights
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-600">
                    Get detailed analytics on candidate performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-inner"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        98%
                      </div>
                      <div className="text-sm font-semibold text-gray-600">Accuracy Rate</div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Time Savings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
              <Card className="bg-gradient-to-br from-orange-50 via-white to-yellow-50 border-2 border-orange-200/50 hover:border-orange-400 hover:shadow-2xl transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                      <motion.div 
                        className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Clock className="w-10 h-10 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-3xl font-extrabold bg-gradient-to-r from-orange-700 to-yellow-700 bg-clip-text text-transparent mb-2">
                          Time Savings
                        </h3>
                        <p className="text-gray-600 font-medium max-w-md">
                          Reduce recruitment time by up to 70% with automated processes
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <motion.div 
                        className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                      >
                        70%
                      </motion.div>
                      <div className="text-sm font-semibold text-gray-600">Time Reduction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-8 lg:px-16 xl:px-24 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-6 bg-white/80 backdrop-blur-sm border-purple-300 px-4 py-2 text-sm font-semibold shadow-lg">
            Process
          </Badge>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-xl font-medium">
            Simple 3-step process to transform your recruitment workflow
          </p>
        </motion.div>

        <Tabs defaultValue="step1" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg p-1">
            <TabsTrigger 
              value="step1" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-300"
            >
              Step 1: Upload
            </TabsTrigger>
            <TabsTrigger 
              value="step2" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-300"
            >
              Step 2: Analyze
            </TabsTrigger>
            <TabsTrigger 
              value="step3" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg font-semibold transition-all duration-300"
            >
              Step 3: Rank
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="step1" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg"
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      >
                        <FileText className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                        Upload Resumes
                      </h3>
                      <p className="text-gray-600 mb-6 font-medium text-lg">
                        Simply drag and drop your resume files or connect your ATS. 
                        Our system supports PDF, DOC, and DOCX formats.
                      </p>
                      <ul className="space-y-3">
                        {["Bulk upload support", "ATS integration", "Secure processing"].map((item) => (
                          <motion.li 
                            key={item}
                            className="flex items-center space-x-3"
                            whileHover={{ x: 4 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-semibold text-gray-700">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="space-y-4">
                        {[
                          { name: "resume_john_doe.pdf", size: "245 KB", color: "blue" },
                          { name: "resume_jane_smith.pdf", size: "312 KB", color: "purple" },
                          { name: "resume_mike_chen.pdf", size: "198 KB", color: "indigo" }
                        ].map((file, index) => (
                          <motion.div
                            key={file.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <div className={`w-10 h-10 bg-${file.color}-500 rounded-xl flex items-center justify-center`}>
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{file.name}</div>
                              <div className="text-sm text-gray-500">{file.size}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="step2" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg"
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      >
                        <Brain className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                        AI Analysis
                      </h3>
                      <p className="text-gray-600 mb-6 font-medium text-lg">
                        Our advanced AI analyzes each resume against your job requirements, 
                        extracting key skills, experience, and qualifications.
                      </p>
                      <ul className="space-y-3">
                        {["Skills extraction", "Experience matching", "Qualification assessment"].map((item) => (
                          <motion.li 
                            key={item}
                            className="flex items-center space-x-3"
                            whileHover={{ x: 4 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-semibold text-gray-700">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                      <div className="space-y-4">
                        {[
                          { label: "Technical Skills", value: 92 },
                          { label: "Experience Match", value: 87 },
                          { label: "Cultural Fit", value: 95 }
                        ].map((item, index) => (
                          <motion.div 
                            key={item.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-5 bg-white rounded-xl border border-purple-200 shadow-md"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-gray-700">{item.label}</span>
                              <span className="text-sm font-bold text-purple-600">{item.value}%</span>
                            </div>
                            <Progress value={item.value} className="h-3" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="step3" className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg"
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      >
                        <Target className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                        Smart Ranking
                      </h3>
                      <p className="text-gray-600 mb-6 font-medium text-lg">
                        Get instant, intelligent rankings of all candidates based on 
                        comprehensive analysis and your specific requirements.
                      </p>
                      <ul className="space-y-3">
                        {["Instant results", "Customizable criteria", "Detailed insights"].map((item) => (
                          <motion.li 
                            key={item}
                            className="flex items-center space-x-3"
                            whileHover={{ x: 4 }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-semibold text-gray-700">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                      <div className="space-y-3">
                        {[
                          { name: "Sarah Johnson", score: 95, rank: 1, color: "green" },
                          { name: "Mike Chen", score: 88, rank: 2, color: "blue" },
                          { name: "Emily Davis", score: 82, rank: 3, color: "purple" }
                        ].map((candidate, index) => (
                          <motion.div
                            key={candidate.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 bg-${candidate.color}-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                                {candidate.rank}
                              </div>
                              <span className="font-semibold text-gray-800">{candidate.name}</span>
                            </div>
                            <div className="text-lg font-bold text-green-600">{candidate.score}%</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-8 lg:px-16 xl:px-24 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-6 bg-white/80 backdrop-blur-sm border-purple-300 px-4 py-2 text-sm font-semibold shadow-lg">
            Results
          </Badge>
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
              Proven Results
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-xl font-medium">
            See the impact our AI-powered platform has on recruitment teams
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Users, value: "10,000+", label: "Resumes Processed", gradient: "from-blue-500 to-blue-600", bg: "from-blue-50 to-blue-100" },
            { icon: TrendingUp, value: "73%", label: "Time Saved", gradient: "from-green-500 to-green-600", bg: "from-green-50 to-green-100" },
            { icon: Star, value: "4.9", label: "User Rating", gradient: "from-yellow-500 to-yellow-600", bg: "from-yellow-50 to-yellow-100" },
            { icon: Shield, value: "99.9%", label: "Uptime", gradient: "from-purple-500 to-purple-600", bg: "from-purple-50 to-purple-100" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
                <Card className={`bg-gradient-to-br ${stat.bg} border-0 hover:shadow-2xl transition-all duration-500 group`}>
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.div 
                      className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 + index * 0.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-gray-600 font-semibold">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator className="my-16" />

      {/* CTA Section */}
      <section className="container mx-auto px-8 lg:px-16 xl:px-24 py-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-purple-300 overflow-hidden relative shadow-2xl">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />
            
            <CardContent className="p-12 lg:p-16 relative">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg px-6 py-3 text-base">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started Today
                </Badge>
              </motion.div>
              <motion.h2 
                className="text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ready to Transform Your Recruitment?
                </span>
              </motion.h2>
              <motion.p 
                className="text-gray-600 mb-8 text-xl max-w-2xl mx-auto font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Join thousands of recruiters who are already saving time and finding better candidates
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {user ? (
                  <Link href="/dashboard">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 rounded-full px-8 py-7 text-lg font-bold group"
                      >
                        Access Dashboard
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </motion.div>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 rounded-full px-8 py-7 text-lg font-bold group"
                        >
                          Start Free Trial
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </motion.div>
                    </Link>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="bg-white/80 backdrop-blur-sm border-2 border-purple-300 hover:bg-white hover:border-purple-400 transition-all duration-300 rounded-full px-8 py-7 text-lg font-bold"
                      >
                        Contact Sales
                      </Button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-200/50 bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-8 lg:px-16 xl:px-24 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Image 
                src="/Recruit-Helper_Logo.webp" 
                alt="Recruit Assistant Logo" 
                width={160} 
                height={40}
                className="h-10"
              />
            </motion.div>
            <div className="flex items-center space-x-8">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" }
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <p className="text-sm text-gray-500 font-medium">
                © 2024 Recruit Assistant
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
