'use client'

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Check, 
  X, 
  ArrowRight, 
  Users, 
  Zap, 
  Shield, 
  Clock,
  Star,
  TrendingUp,
  FileText,
  Brain,
  Target,
  Mail,
  Phone,
  HelpCircle
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [priceCounters, setPriceCounters] = useState({ professional: 0, enterprise: 0 })

  // Animate price counters on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPriceCounters({ professional: 20, enterprise: 60 })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const pricingPlans = [
    {
      name: "Starter",
      price: 0,
      annualPrice: 0,
      description: "Perfect for freelancers and small teams getting started",
      features: [
        "Up to 50 resume uploads per month",
        "Basic AI ranking algorithm",
        "Manual candidate filtering",
        "Email support (48hr response)",
        "7-day data retention",
        "Single user account",
        "Basic analytics dashboard",
        "Export to CSV"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false,
      color: "blue"
    },
    {
      name: "Professional",
      price: 20,
      annualPrice: 16,
      description: "Ideal for growing recruitment teams and HR departments",
      features: [
        "Up to 500 resume uploads per month",
        "Advanced AI ranking with skill matching",
        "Smart automated screening filters",
        "Priority email support (24hr response)",
        "90-day data retention",
        "Up to 3 user accounts",
        "Advanced analytics & insights",
        "Custom job requirement templates",
        "Export to CSV, PDF, Excel",
        "API access (basic)",
        "ATS integration (limited)"
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
      popular: true,
      color: "purple"
    },
    {
      name: "Enterprise",
      price: 60,
      annualPrice: 48,
      description: "Built for large agencies and enterprise teams",
      features: [
        "Unlimited resume uploads",
        "Premium AI with machine learning insights",
        "Automated screening + custom workflows",
        "Priority support + dedicated account manager",
        "Unlimited data retention",
        "Unlimited user accounts",
        "Full analytics suite with custom reports",
        "White-label option",
        "Custom integrations",
        "Full API access",
        "ATS integration (unlimited)",
        "Bulk operations & automation",
        "GDPR compliance tools",
        "SSO authentication"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "default" as const,
      popular: false,
      color: "indigo"
    }
  ]

  const comparisonFeatures = [
    {
      category: "Uploads",
      features: [
        { name: "Resume uploads per month", free: "50", professional: "500", enterprise: "Unlimited" },
        { name: "File size limit", free: "5MB", professional: "10MB", enterprise: "50MB" },
        { name: "Supported formats", free: "PDF, DOC", professional: "PDF, DOC, DOCX", enterprise: "All formats" }
      ]
    },
    {
      category: "AI Features",
      features: [
        { name: "AI ranking algorithm", free: "Basic", professional: "Advanced", enterprise: "Premium ML" },
        { name: "Skill matching", free: false, professional: true, enterprise: true },
        { name: "Custom workflows", free: false, professional: false, enterprise: true },
        { name: "Machine learning insights", free: false, professional: false, enterprise: true }
      ]
    },
    {
      category: "Support",
      features: [
        { name: "Email support", free: "48hr response", professional: "24hr response", enterprise: "Priority + Manager" },
        { name: "Phone support", free: false, professional: false, enterprise: true },
        { name: "Dedicated account manager", free: false, professional: false, enterprise: true },
        { name: "Custom onboarding", free: false, professional: false, enterprise: true }
      ]
    },
    {
      category: "Team & Security",
      features: [
        { name: "User accounts", free: "1", professional: "3", enterprise: "Unlimited" },
        { name: "Data retention", free: "7 days", professional: "90 days", enterprise: "Unlimited" },
        { name: "SSO authentication", free: false, professional: false, enterprise: true },
        { name: "GDPR compliance", free: false, professional: false, enterprise: true }
      ]
    },
    {
      category: "Integrations",
      features: [
        { name: "API access", free: false, professional: "Basic", enterprise: "Full" },
        { name: "ATS integration", free: false, professional: "Limited", enterprise: "Unlimited" },
        { name: "Custom integrations", free: false, professional: false, enterprise: true },
        { name: "White-label option", free: false, professional: false, enterprise: true }
      ]
    }
  ]

  const faqs = [
    {
      question: "Can I change plans at any time?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle. We'll prorate any differences in pricing."
    },
    {
      question: "What happens when I hit my upload limit?",
      answer: "When you reach your monthly upload limit, you'll receive a notification. You can either wait until next month for your limit to reset, upgrade your plan for more uploads, or purchase additional uploads as needed."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team within 30 days of your first payment for a full refund."
    },
    {
      question: "Is my candidate data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, SOC 2 compliance, and follow GDPR guidelines. Your data is stored securely and never shared with third parties. We also offer SSO and advanced security features for Enterprise customers."
    },
    {
      question: "Can I try before I buy?",
      answer: "Yes! We offer a 14-day free trial for Professional and Enterprise plans. No credit card required. You can also start with our free Starter plan to test our basic features."
    },
    {
      question: "Do you offer custom enterprise plans?",
      answer: "Yes! For large organizations with specific needs, we offer custom Enterprise plans with tailored features, dedicated support, and volume discounts. Contact our sales team to discuss your requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise customers. All payments are processed securely through Stripe."
    },
    {
      question: "How does the AI ranking work?",
      answer: "Our AI analyzes resumes against your job requirements using natural language processing and machine learning. It considers skills matching, experience relevance, education, and other factors to provide accurate rankings. The algorithm improves over time with your feedback."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-blue-100/20 to-indigo-100/20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that scales with your recruitment needs. Join 1000+ recruiters who are already saving time and finding better candidates.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse">
                Save 20%
              </Badge>
            )}
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card className={`h-full bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group ${plan.popular ? 'border-purple-300 shadow-lg' : ''} flex flex-col`}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${isAnnual ? plan.annualPrice : plan.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                    {isAnnual && plan.price > 0 && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save 20%
                      </div>
                    )}
                  </div>
                  <Button 
                    className={`w-full mb-4 ${
                      plan.buttonVariant === 'outline' 
                        ? 'bg-white/50 backdrop-blur-sm border-purple-200 hover:bg-white/80' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    } shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-8 md:space-x-12 opacity-60">
            <Image 
              src="/logos/salesforce.svg" 
              alt="Salesforce" 
              width={120} 
              height={40}
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
            <Image 
              src="/logos/harvard.svg" 
              alt="Harvard" 
              width={120} 
              height={40}
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
            <Image 
              src="/logos/nbc_universal.svg" 
              alt="NBC Universal" 
              width={120} 
              height={40}
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
            <Image 
              src="/logos/amzon.svg" 
              alt="Amazon" 
              width={120} 
              height={40}
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
            <Image 
              src="/logos/ibm.svg" 
              alt="IBM" 
              width={120} 
              height={40}
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
            <Image 
              src="/logos/logo-grant.svg" 
              alt="Grant" 
              width={120} 
              height={40}
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
            <Image 
              src="/logos/walgreens.svg" 
              alt="Walgreens" 
              width={120} 
              height={40}
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
            <Image 
              src="/logos/mastercard.svg" 
              alt="Mastercard" 
              width={120} 
              height={40}
              className="h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm">
            Comparison
          </Badge>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Compare Plans
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            See exactly what's included in each plan
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                      <TableHead className="font-semibold">Features</TableHead>
                      <TableHead className="text-center font-semibold">Starter</TableHead>
                      <TableHead className="text-center font-semibold">Professional</TableHead>
                      <TableHead className="text-center font-semibold">Enterprise</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonFeatures.map((category, categoryIndex) => (
                      <React.Fragment key={categoryIndex}>
                        <TableRow className="bg-gray-50/50">
                          <TableCell colSpan={4} className="font-semibold text-gray-900 py-3">
                            {category.category}
                          </TableCell>
                        </TableRow>
                        {category.features.map((feature, featureIndex) => (
                          <TableRow key={featureIndex} className="hover:bg-gray-50/50">
                            <TableCell className="font-medium">{feature.name}</TableCell>
                            <TableCell className="text-center">
                              {typeof feature.free === 'boolean' ? (
                                feature.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                              ) : (
                                <span className="text-sm">{feature.free}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {typeof feature.professional === 'boolean' ? (
                                feature.professional ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                              ) : (
                                <span className="text-sm">{feature.professional}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {typeof feature.enterprise === 'boolean' ? (
                                feature.enterprise ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />
                              ) : (
                                <span className="text-sm">{feature.enterprise}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm">
            FAQ
          </Badge>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to know about our pricing and plans
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardContent className="p-8">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-purple-100 rounded-lg px-4">
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 border-purple-200 overflow-hidden">
            <CardContent className="p-12">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
                Our team is here to help you choose the right plan for your recruitment needs. 
                Contact us for personalized recommendations and custom enterprise solutions.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Sales
                </Button>
                <Button size="lg" variant="outline" className="bg-white/50 backdrop-blur-sm border-purple-200 hover:bg-white/80 transition-all duration-300">
                  <FileText className="mr-2 h-4 w-4" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Image 
                src="/Recruit-Helper_Logo.webp" 
                alt="Recruit Assistant Logo" 
                width={24} 
                height={24}
                className="h-6 w-6"
              />
              <span className="font-semibold">Recruit Assistant</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <p className="text-sm text-muted-foreground">
                © 2024 Recruit Assistant. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
