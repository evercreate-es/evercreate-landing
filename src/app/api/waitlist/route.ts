import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const { email, industry } = await request.json()

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const { error: dbError } = await supabase.from('waitlist').upsert(
      {
        email: email.toLowerCase().trim(),
        industry: industry || null,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )

    if (dbError) {
      console.error('Waitlist insert error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Server error' },
        { status: 500 }
      )
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'notifications@evercreate.co',
        to: process.env.NOTIFICATION_EMAIL!,
        subject: `New waitlist signup${industry ? ` — ${industry}` : ''}`,
        text: [
          'Someone just joined the waitlist:',
          '',
          `Email: ${email}`,
          `Industry: ${industry || 'Home page (no industry)'}`,
          `Page: ${industry ? `/${industry}` : '/'}`,
          `Time: ${new Date().toISOString()}`,
        ].join('\n'),
      })
    } catch (emailError) {
      console.error('Resend email failed:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
