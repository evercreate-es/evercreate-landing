# Landing Page Redesign — "Branded Shapes" Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Evercreate landing page with floating diagonal bar shapes inspired by the logo, gradient typography, and premium visual polish — keeping all copy, colors, and functional logic intact.

**Architecture:** Replace RayBackground with a new DiagonalShapes component. Restructure LandingHero to include the logo and a badge pill. Update CTA styling in CodeEntry and WaitlistForm. Remove the inline header from layout.tsx.

**Tech Stack:** Next.js 16, React 19, Framer Motion, Tailwind CSS 4, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-11-landing-redesign-design.md`

---

## Chunk 1: Foundation (globals, layout, background component)

### Task 1: Update globals.css background color

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update --background variable**

Change `--background: #09090b;` to `--background: #030303;` in the `:root` block. Everything else stays (including the `animate-shake` keyframe).

```css
:root {
  --background: #030303;
  --foreground: #fafafa;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "style: update background color to #030303"
```

---

### Task 2: Update layout.tsx — remove header, update bg color

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Remove the inline `<header>` element and update bg class**

Replace `bg-zinc-950` with `bg-[#030303]`. Remove the entire `<header>...</header>` block. The logo will live inside the hero instead.

Updated `RootLayout` body:

```tsx
<body
  className={`${geistSans.variable} ${geistMono.variable} bg-[#030303] text-white antialiased`}
>
  {children}
</body>
```

- [ ] **Step 2: Verify the dev server runs without errors**

Run: `npm run dev` — check http://localhost:3000 loads (no header, darker bg).

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "style: remove inline header, update body bg to #030303"
```

---

### Task 3: Create DiagonalShapes component

**Files:**
- Create: `src/components/landing/DiagonalShapes.tsx`

- [ ] **Step 1: Create the DiagonalShapes component**

This component renders 6 floating diagonal bar shapes + a central radial glow. Each bar is a rotated rectangle with brand colors at low opacity, backdrop-blur, and a continuous floating animation.

```tsx
'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface BarConfig {
  width: number
  height: number
  rotation: number
  x: string        // CSS position (e.g., '10%', '85%')
  y: string
  color: string     // teal, yellow, or white
  delay: number
  duration: number  // floating loop duration
}

const bars: BarConfig[] = [
  // Left side — large bars near edges
  { width: 500, height: 70, rotation: -45, x: '5%',  y: '15%', color: 'rgba(20,184,166,0.12)',  delay: 0.3, duration: 14 },
  { width: 350, height: 50, rotation: -45, x: '12%', y: '65%', color: 'rgba(234,179,8,0.10)',   delay: 0.5, duration: 12 },
  { width: 200, height: 35, rotation: -45, x: '20%', y: '40%', color: 'rgba(255,255,255,0.08)', delay: 0.7, duration: 11 },
  // Right side — mirrored asymmetrically
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
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/DiagonalShapes.tsx
git commit -m "feat: add DiagonalShapes background component with branded floating bars"
```

---

## Chunk 2: Hero redesign (logo, badge, gradient text)

### Task 4: Rewrite LandingHero with new layout

**Files:**
- Modify: `src/components/landing/LandingHero.tsx`

- [ ] **Step 1: Rewrite LandingHero**

Replace the entire content of `LandingHero.tsx` with:

```tsx
'use client'

import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { DiagonalShapes } from './DiagonalShapes'
import { CodeEntry } from './CodeEntry'

interface LandingHeroProps {
  headline: string
  subtitle: string
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

export function LandingHero({ headline, subtitle, subline, industry, badge }: LandingHeroProps) {
  const reducedMotion = useReducedMotion()

  const motionProps = (index: number) =>
    reducedMotion ? {} : stagger(index)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <DiagonalShapes />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        {/* Logo — appears first, before the stagger sequence */}
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

        {/* Badge pill — stagger index 0 (delay 0) */}
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

        {/* Headline with gradient — stagger index 1 */}
        <motion.h1
          {...motionProps(1)}
          className="text-5xl font-bold tracking-tight bg-clip-text text-transparent sm:text-6xl lg:text-7xl"
          style={{
            backgroundImage: 'linear-gradient(to right, #2dd4bf 0%, white 20%, white 80%, #facc15 100%)',
          }}
        >
          {headline}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...motionProps(2)}
          className="max-w-2xl text-lg text-white/60 sm:text-xl"
        >
          {subtitle}
        </motion.p>

        {/* Subline */}
        {subline && (
          <motion.p
            {...motionProps(3)}
            className="text-sm text-white/40"
          >
            {subline}
          </motion.p>
        )}

        {/* CTAs */}
        <motion.div {...motionProps(4)} className="mt-4">
          <CodeEntry industry={industry} />
        </motion.div>
      </div>
    </div>
  )
}
```

Key changes from current:
- Imports `DiagonalShapes` instead of `RayBackground`
- Imports `Image` from next/image for the logo
- New `badge` prop in interface
- Logo rendered at top with `priority` loading, separate fade-in (not part of stagger sequence)
- Badge pill with pulsing teal dot — stagger index 0 (no delay)
- Headline uses inline style gradient (`linear-gradient`) for white-dominant center effect
- Stagger: badge(0) → headline(1) → subtitle(2) → subline(3) → CTAs(4), base delay 0
- Easing uses the cubic bezier from the spec

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/LandingHero.tsx
git commit -m "feat: redesign LandingHero with logo, badge pill, gradient text, diagonal shapes"
```

---

### Task 5: Update page.tsx and [industry]/page.tsx to pass badge prop

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/[industry]/page.tsx`

- [ ] **Step 1: Update home page**

Add `badge="Exclusive Early Access"` to the LandingHero call:

```tsx
export default function HomePage() {
  return (
    <LandingHero
      headline="We build your company's custom platform."
      subtitle={LANDING_SUBLINE}
      subline=""
      industry={undefined}
      badge="Exclusive Early Access"
    />
  )
}
```

- [ ] **Step 2: Update industry page**

Pass `badge={industry.name}`:

```tsx
return (
  <LandingHero
    headline={industry.headline}
    subtitle={industry.subtitle}
    subline={LANDING_SUBLINE}
    industry={industry.slug}
    badge={industry.name}
  />
)
```

- [ ] **Step 3: Verify dev server renders both pages**

Run: `npm run dev` — check http://localhost:3000 and http://localhost:3000/construction

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/[industry]/page.tsx
git commit -m "feat: pass badge prop to LandingHero on home and industry pages"
```

---

## Chunk 3: CTA styling updates

### Task 6: Update CodeEntry visual styling

**Files:**
- Modify: `src/components/landing/CodeEntry.tsx`

- [ ] **Step 1: Update button and input styles**

Only CSS class changes — no logic changes. Apply these replacements:

**"I have a code" button (line 119):**
Replace:
```
className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors cursor-pointer"
```
With:
```
className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-black transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
```

**Code input (line 143):**
Replace:
```
className="rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 transition-colors text-center tracking-wider font-mono uppercase"
```
With:
```
className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-teal-500 focus:shadow-[0_0_12px_rgba(20,184,166,0.2)] transition-all text-center tracking-wider font-mono uppercase"
```

**"Go" button (line 148):**
Replace:
```
className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors disabled:opacity-50 cursor-pointer"
```
With:
```
className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all disabled:opacity-50 cursor-pointer hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
```

- [ ] **Step 2: Verify no TypeScript errors and visual check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/CodeEntry.tsx
git commit -m "style: update CodeEntry with glassmorphism inputs and teal glow hover"
```

---

### Task 7: Update WaitlistForm visual styling

**Files:**
- Modify: `src/components/landing/WaitlistForm.tsx`

- [ ] **Step 1: Update form styles**

Only CSS class changes:

**"Join the waitlist" button (line 59) — already correct:** `text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer` — no change needed.

**Email input (line 81):**
Replace:
```
className="rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/40 transition-colors"
```
With:
```
className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-teal-500 focus:shadow-[0_0_12px_rgba(20,184,166,0.2)] transition-all"
```

**"Join" submit button (line 86):**
Replace:
```
className="rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
```
With:
```
className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-all disabled:opacity-50 cursor-pointer hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/WaitlistForm.tsx
git commit -m "style: update WaitlistForm with glassmorphism input and solid white submit"
```

---

## Chunk 4: Cleanup

### Task 8: Delete RayBackground and verify build

**Files:**
- Delete: `src/components/landing/RayBackground.tsx`

- [ ] **Step 1: Delete RayBackground.tsx**

```bash
rm src/components/landing/RayBackground.tsx
```

- [ ] **Step 2: Verify no imports reference RayBackground**

Search for any remaining imports of `RayBackground` — there should be none since LandingHero now imports DiagonalShapes.

Run: `grep -r "RayBackground" src/`

Expected: no matches.

- [ ] **Step 3: Run build to verify everything compiles**

Run: `npm run build`

Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git rm src/components/landing/RayBackground.tsx
git commit -m "chore: remove deprecated RayBackground component"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Update background color in globals.css | globals.css |
| 2 | Remove header from layout, update bg | layout.tsx |
| 3 | Create DiagonalShapes component | DiagonalShapes.tsx (new) |
| 4 | Rewrite LandingHero | LandingHero.tsx |
| 5 | Pass badge prop to pages | page.tsx, [industry]/page.tsx |
| 6 | Update CodeEntry styling | CodeEntry.tsx |
| 7 | Update WaitlistForm styling | WaitlistForm.tsx |
| 8 | Delete RayBackground, verify build | RayBackground.tsx (delete) |

Total: 8 tasks, ~8 commits. All functional logic untouched.
