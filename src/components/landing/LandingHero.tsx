'use client'

import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { DiagonalShapes } from './DiagonalShapes'
import { CodeEntry } from './CodeEntry'

interface LandingHeroProps {
  headline: string
  tagline: { line1: string; line2: string }
  bullets: string[]
  subline?: string
  industry?: string
  badge?: string
}

const ease = [0.23, 0.86, 0.39, 0.96] as const

function stagger(index: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.15, duration: 0.7, ease },
    },
  }
}

export function LandingHero({ headline, tagline, bullets, subline, industry, badge }: LandingHeroProps) {
  const reducedMotion = useReducedMotion()
  const [showCalendar, setShowCalendar] = useState(false)

  const motionProps = (index: number) =>
    reducedMotion ? {} : stagger(index)

  const handleStateChange = (state: string) => {
    if (state === 'calendar' || state === 'validated') {
      setShowCalendar(true)
    }
  }

  return (
    <div className={`relative flex min-h-screen flex-col items-center px-6 text-center ${showCalendar ? 'pt-[6vh]' : 'justify-center pb-[8vh]'}`}>
      <DiagonalShapes />

      <div className={`relative z-10 flex flex-col items-center gap-6 ${showCalendar ? 'w-full max-w-4xl' : 'max-w-3xl'}`}>
        {/* Logo — always visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease }}
        >
          <Image
            src="/logo-evercreate-white.svg"
            alt="Evercreate"
            width={180}
            height={72}
            priority
            className="mb-2"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {!showCalendar ? (
            <motion.div
              key="hero-content"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
              className="flex flex-col items-center gap-6"
            >
              {/* Badge pill */}
              {badge && (
                <motion.div
                  {...motionProps(0)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
                  </span>
                  <span className="text-sm text-white/60">{badge}</span>
                </motion.div>
              )}

              {/* Headline + Tagline */}
              <motion.div {...motionProps(1)} className="flex flex-col items-center gap-3">
                <h1
                  className="text-5xl font-bold tracking-tight bg-clip-text text-transparent sm:text-6xl lg:text-7xl"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #2dd4bf 0%, white 30%, white 70%, #facc15 100%)',
                  }}
                >
                  {headline}
                </h1>
                <p className="text-2xl font-medium text-white/80 sm:text-3xl">
                  {tagline.line1}
                  <br />
                  {tagline.line2}
                </p>
              </motion.div>

              {/* Bullets */}
              <motion.ul
                {...motionProps(2)}
                className="flex flex-col items-start gap-2 text-left"
              >
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2.5 text-base text-white/55 sm:text-lg">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-400 text-xs">&#10003;</span>
                    {bullet}
                  </li>
                ))}
              </motion.ul>

              {/* Subline — social proof */}
              {subline && (
                <motion.div
                  {...motionProps(3)}
                  className="flex items-center gap-2"
                >
                  <span className="h-px w-8 bg-white/20" />
                  <span className="text-sm font-medium tracking-wide text-white/60 uppercase">{subline}</span>
                  <span className="h-px w-8 bg-white/20" />
                </motion.div>
              )}

              {/* CTAs */}
              <motion.div {...motionProps(4)} className="mt-4">
                <CodeEntry industry={industry} onStateChange={handleStateChange} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="calendar-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center gap-6"
            >
              <p className="text-2xl font-medium text-white/80">
                You&rsquo;re in. Book your 30-min call.
              </p>
              <CodeEntry industry={industry} onStateChange={handleStateChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
