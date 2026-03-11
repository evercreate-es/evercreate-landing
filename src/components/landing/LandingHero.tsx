'use client'

import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import { RayBackground } from './RayBackground'
import { CodeEntry } from './CodeEntry'

interface LandingHeroProps {
  headline: string
  subtitle: string
  subline: string
  industry?: string
}

function stagger(index: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 + index * 0.15, duration: 0.6, ease: 'easeOut' },
    },
  }
}

export function LandingHero({ headline, subtitle, subline, industry }: LandingHeroProps) {
  const reducedMotion = useReducedMotion()

  const motionProps = (index: number) =>
    reducedMotion ? {} : stagger(index)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <RayBackground />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <motion.h1
          {...motionProps(0)}
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {headline}
        </motion.h1>

        <motion.p
          {...motionProps(1)}
          className="max-w-2xl text-lg text-white/60 sm:text-xl"
        >
          {subtitle}
        </motion.p>

        {subline && (
          <motion.p
            {...motionProps(2)}
            className="text-sm text-white/40"
          >
            {subline}
          </motion.p>
        )}

        <motion.div {...motionProps(3)} className="mt-4">
          <CodeEntry industry={industry} />
        </motion.div>
      </div>
    </div>
  )
}
