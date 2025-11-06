"use client"

import Image from "next/image"
import React from "react"

type LoadingLogoProps = {
  size?: number
  className?: string
}

export default function LoadingLogo({ size = 48, className = "" }: LoadingLogoProps) {
  return (
    <Image
      src="/LOGO-black.png"
      alt="Loading"
      width={size}
      height={size}
      className={`animate-spin ${className}`}
      priority
    />
  )
}
