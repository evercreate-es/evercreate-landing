'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface BarConfig {
  width: number
  height: number
  rotation: number
  x: string
  y: string
  color: string
  delay: number
  duration: number
}

const bars: BarConfig[] = [
  { width: 500, height: 70, rotation: -45, x: '5%',  y: '15%', color: 'rgba(20,184,166,0.12)',  delay: 0.3, duration: 14 },
  { width: 350, height: 50, rotation: -45, x: '12%', y: '65%', color: 'rgba(234,179,8,0.10)',   delay: 0.5, duration: 12 },
  { width: 200, height: 35, rotation: -45, x: '20%', y: '40%', color: 'rgba(255,255,255,0.08)', delay: 0.7, duration: 11 },
  { width: 450, height: 60, rotation: -45, x: '78%', y: '20%', color: 'rgba(234,179,8,0.10)',   delay: 0.4, duration: 13 },
  { width: 300, height: 45, rotation: -45, x: '85%', y: '70%', color: 'rgba(20,184,166,0.12)',  delay: 0.6, duration: 10 },
  { width: 180, height: 30, rotation: -45, x: '72%', y: '50%', color: 'rgba(255,255,255,0.06)', delay: 0.8, duration: 12 },
]

export function DiagonalShapes() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full select-none overflow-hidden">
      {/* Central radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(20,184,166,0.08) 0%, rgba(234,179,8,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Floating diagonal bars */}
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-lg ${i < 2 ? 'hidden md:block' : ''}`}
          style={{
            left: bar.x,
            top: bar.y,
            width: bar.width,
            height: bar.height,
            background: bar.color,
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
          initial={
            prefersReducedMotion
              ? { opacity: 1, rotate: bar.rotation }
              : { opacity: 0, rotate: bar.rotation - 5 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1, rotate: bar.rotation }
              : {
                  opacity: 1,
                  rotate: bar.rotation,
                  y: [0, 15, 0],
                  transition: {
                    opacity: {
                      delay: bar.delay,
                      duration: 0.8,
                      ease: [0.23, 0.86, 0.39, 0.96],
                    },
                    rotate: {
                      delay: bar.delay,
                      duration: 0.8,
                      ease: [0.23, 0.86, 0.39, 0.96],
                    },
                    y: {
                      delay: bar.delay + 0.8,
                      duration: bar.duration,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  },
                }
          }
        />
      ))}

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  )
}
