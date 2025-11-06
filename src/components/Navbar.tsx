'use client'

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Menu, ArrowRight, Sparkles, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { useState } from "react"

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest === 0) {
      setHidden(false)
    } else {
      setHidden(true)
    }
  })

  const navLinkVariants = {
    initial: { opacity: 0.7 },
    hover: { 
      opacity: 1,
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.95 }
  }

  return (
    <motion.nav 
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.3 }}
      className="fixed top-0 w-full z-50 py-4"
    >
      <div className="container mx-auto px-8 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                src="/Recruit-Helper_Logo.webp" 
                alt="Recruit Assistant Logo" 
                width={220} 
                height={55}
                className="h-14 mr-12"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {[
              { href: "/#features", label: "Features" },
              { href: "/pricing", label: "Pricing" },
              { href: "#documentation", label: "Docs" },
              { href: "#about", label: "About" }
            ].map((link) => (
              <motion.div
                key={link.href}
                variants={navLinkVariants}
                initial="initial"
                whileHover="hover"
              >
                <Link 
                  href={link.href} 
                  className="text-base font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
            
            {/* Vertical Divider */}
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-purple-300 to-transparent" />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg relative overflow-hidden group rounded-full px-6">
                      <span className="relative z-10 flex items-center gap-2">
                        Dashboard
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="hidden sm:block"
                >
                  <Button 
                    variant="outline"
                    onClick={handleLogout}
                    className="rounded-full flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </motion.div>
              </div>
            ) : (
              <>
                <motion.div
                  variants={navLinkVariants}
                  initial="initial"
                  whileHover="hover"
                  className="hidden sm:block"
                >
                  <Link href="/login">
                    <span className="text-base font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200">
                      Login
                    </span>
                  </Link>
                </motion.div>
                <Link href="/login?signup=1">
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg relative overflow-hidden group rounded-full px-6">
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Get Started Free
                      </span>
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-xl">
                <div className="flex flex-col space-y-6 mt-8">
                  {[
                    { href: "/#features", label: "Features" },
                    { href: "/pricing", label: "Pricing" },
                    { href: "#documentation", label: "Documentation" },
                    { href: "#about", label: "About" }
                  ].map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        href={link.href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-semibold text-gray-700 hover:text-purple-600 transition-colors block"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  <Separator />
                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link 
                        href="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-semibold text-gray-700 hover:text-purple-600 transition-colors block"
                      >
                        Login
                      </Link>
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    {user ? (
                      <>
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full">
                            Dashboard
                          </Button>
                        </Link>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            handleLogout()
                            setIsMobileMenuOpen(false)
                          }}
                          className="w-full rounded-full flex items-center gap-2 justify-center"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full">
                          Get Started Free
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
