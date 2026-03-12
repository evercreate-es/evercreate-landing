import type { Metadata } from 'next'
import { LandingHero } from '@/components/landing/LandingHero'
import { buildTagline, LANDING_BULLETS, LANDING_SUBLINE } from '@/lib/landing/industries'

export const metadata: Metadata = {
  title: 'Evercreate — One custom platform that runs your entire operation',
  description: LANDING_BULLETS.join('. ') + '.',
}

export default function HomePage() {
  return (
    <LandingHero
      headline="What if your company had its own software?"
      tagline={buildTagline('company')}
      bullets={LANDING_BULLETS}
      subline={LANDING_SUBLINE}
      industry={undefined}
      badge="Exclusive Early Access"
    />
  )
}
