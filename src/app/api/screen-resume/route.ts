import { NextRequest, NextResponse } from 'next/server'
import { analyzeResumeWithFallback } from '@/lib/services/fallbacks'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🔄 API Route: Received request')
    console.log('📊 Job Title:', body.job_requirements?.job_title)
    console.log('📋 Required Skills:', body.job_requirements?.required_skills)
    console.log('🎯 Experience Level:', body.job_requirements?.experience_level)

    console.log('🔁 Trying primary AI, will fallback on error...')
    const data = await analyzeResumeWithFallback(body)
    console.log('✅ AI analysis complete. Provider:', data.used_provider)
    return NextResponse.json(data, {
      headers: { 'x-api-used': data.used_provider || 'primary' }
    })
  } catch (error) {
    console.error('❌ Error in AI screening with fallback:', error)
    return NextResponse.json({ error: 'Both services unavailable. Please try again later.' }, { status: 503 })
  }
}

