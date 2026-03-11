'use client'

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

interface RayBackgroundProps {
  accentColor?: string
}

// Each arc is an ellipse with a conic-gradient border mixing the 3 brand colors
interface ArcConfig {
  gradient: string       // conic-gradient for the border
  thickness: number      // border thickness in px
  glow: string           // box-shadow glow
  scaleY: number         // vertical squish (< 1 = flatter)
  offsetY: number        // vertical offset from baseline
  width: string          // width of the ellipse
  height: string         // height of the ellipse
}

const arcs: ArcConfig[] = [
  // Arc 1 (outermost): teal dominant with yellow and white accents, wide glow
  {
    gradient:
      'conic-gradient(from 200deg, #0a7a6e 0deg, #53C0A7 60deg, #FDCD21 120deg, #53C0A7 180deg, #FDCD21 230deg, #53C0A7 280deg, #0a7a6e 360deg)',
    thickness: 3,
    glow: '0 0 100px rgba(83,192,167,0.35), 0 0 250px rgba(83,192,167,0.1), 0 0 60px rgba(253,205,33,0.1)',
    scaleY: 0.32,
    offsetY: 0,
    width: '220%',
    height: '180%',
  },
  // Arc 2: yellow dominant, medium glow
  {
    gradient:
      'conic-gradient(from 190deg, #FDCD21 0deg, #53C0A7 80deg, white 140deg, #53C0A7 200deg, #FDCD21 260deg, white 320deg, #FDCD21 360deg)',
    thickness: 2,
    glow: '0 0 80px rgba(253,205,33,0.25), 0 0 180px rgba(253,205,33,0.08)',
    scaleY: 0.30,
    offsetY: 6,
    width: '200%',
    height: '170%',
  },
  // Arc 3: white/teal blend, tight glow
  {
    gradient:
      'conic-gradient(from 210deg, white 0deg, #53C0A7 70deg, #FDCD21 130deg, white 180deg, #FDCD21 230deg, #53C0A7 300deg, white 360deg)',
    thickness: 2,
    glow: '0 0 40px rgba(255,255,255,0.2), 0 0 100px rgba(83,192,167,0.12)',
    scaleY: 0.28,
    offsetY: 12,
    width: '180%',
    height: '160%',
  },
  // Arc 4 (innermost): thin bright white edge
  {
    gradient:
      'conic-gradient(from 180deg, rgba(255,255,255,0.9) 0deg, rgba(83,192,167,0.6) 90deg, rgba(253,205,33,0.5) 180deg, rgba(83,192,167,0.6) 270deg, rgba(255,255,255,0.9) 360deg)',
    thickness: 1,
    glow: '0 0 20px rgba(255,255,255,0.15)',
    scaleY: 0.26,
    offsetY: 18,
    width: '160%',
    height: '150%',
  },
]

export function RayBackground({
  accentColor = '#53C0A7',
}: RayBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -250])

  // suppress unused var lint — kept for API compat with industry pages
  void accentColor

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full select-none overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      <motion.div
        style={{ y: prefersReducedMotion ? 0 : y }}
        className="absolute inset-0"
      >
        {/* Atmospheric glow layers */}
        {/* Center teal glow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-[200%] h-[120%]"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 85%, rgba(83,192,167,0.18) 0%, rgba(83,192,167,0.05) 40%, transparent 70%)',
          }}
        />
        {/* Left yellow glow */}
        <div
          className="absolute w-[100%] h-[100%]"
          style={{
            left: '10%',
            top: '10%',
            background:
              'radial-gradient(ellipse 50% 40% at 30% 80%, rgba(253,205,33,0.1) 0%, transparent 60%)',
          }}
        />
        {/* Right teal glow */}
        <div
          className="absolute w-[100%] h-[100%]"
          style={{
            right: '0',
            top: '5%',
            background:
              'radial-gradient(ellipse 50% 40% at 70% 80%, rgba(83,192,167,0.08) 0%, transparent 60%)',
          }}
        />

        {/* Arc container — anchored to bottom of hero */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: '-5%', width: '100%', height: '100%' }}
        >
          {arcs.map((arc, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: '50%',
                bottom: '0',
                width: arc.width,
                height: arc.height,
                transform: `translateX(-50%) scaleY(${arc.scaleY}) translateY(${arc.offsetY}px)`,
                transformOrigin: 'center bottom',
                border: `${arc.thickness}px solid transparent`,
                backgroundImage: `${arc.gradient}`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'border-box',
                // Use mask to only show the border (hollow ellipse)
                WebkitMask:
                  `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                padding: `${arc.thickness}px`,
                boxShadow: arc.glow,
                zIndex: 10 - i,
              }}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { delay: i * 0.1, duration: 0.6 }
              }
            />
          ))}

          {/* Dark fill inside innermost arc */}
          <div
            className="absolute rounded-full"
            style={{
              left: '50%',
              bottom: '0',
              width: '155%',
              height: '145%',
              transform: `translateX(-50%) scaleY(0.25)`,
              transformOrigin: 'center bottom',
              background: 'radial-gradient(ellipse at 50% 20%, #0f0f10 70%, #0a0a0a 100%)',
              zIndex: 11,
            }}
          />
        </div>

        {/* Subtle noise */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px 128px',
          }}
        />
      </motion.div>
    </div>
  )
}
