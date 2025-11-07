'use client'

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

interface SearchParamsHandlerProps {
  onSignupChange: (isSignUp: boolean) => void
}

export default function SearchParamsHandler({ onSignupChange }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if signup parameter is present in URL
    const signup = searchParams.get('signup')
    if (signup === '1') {
      onSignupChange(true)
    }
  }, [searchParams, onSignupChange])

  // This component doesn't render anything visible
  return null
}
