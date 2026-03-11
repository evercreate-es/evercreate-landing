# Evercreate Landing Page Redesign — "Branded Shapes"

## Overview

Complete visual redesign of the Evercreate landing page, replacing the current RayBackground concentric rings with floating diagonal bar shapes inspired by the Evercreate logo. The redesign elevates the visual quality to match premium SaaS standards (reference: 21st.dev Shape Landing Hero) while maintaining Evercreate's brand identity, existing copy, color palette, and all functional logic.

## What Changes

- Background visual: RayBackground (concentric rings) → DiagonalShapes (floating branded bars)
- Layout: inline header in layout.tsx → logo integrated into hero, no fixed header
- Typography: plain white text → gradient headline with badge pill
- CTA styling: solid white buttons → primary CTA stays high-contrast, secondary elements get glassmorphism
- Overall spacing and visual hierarchy improvements
- Add Evercreate logo to the hero
- Background color: `#09090b` → `#030303` (applied in globals.css `--background` variable and layout.tsx)

## What Stays

- All copy (headlines, subtitles, sublines per industry)
- Color palette: teal (#14b8a6), yellow (#eab308), dark background
- All functional logic: CodeEntry state machine, WaitlistForm, Cal.com embed
- Industry-specific pages and routing
- API endpoints and Supabase integration
- Framer Motion as animation library
- Tailwind CSS as styling framework
- `animate-shake` keyframe in globals.css (used by CodeEntry error state)

## Design Specification

### 1. Layout & Structure

- Full viewport hero (100vh), background color `#030303` (update `--background` CSS variable in globals.css from `#09090b` to `#030303`, and update any `bg-zinc-950` references in layout.tsx)
- Logo Evercreate centered at top of hero (not in a fixed header/navbar)
  - Use existing `public/logo-evercreate-white.svg` (already in repo — white text variant)
  - Icon square retains original colors (yellow #FDCD21, teal #53C0A7, dark #1A1A1A)
- Content vertically centered below logo: badge → headline → subtitle → CTAs
- Generous spacing between elements (premium feel)
- No fixed header — logo lives inside the hero component
- Remove the inline `<header>` element from layout.tsx (it is not a separate component — it's an inline `<header>` tag with an anchor)

### 2. Background — Floating Diagonal Bars

New component: `DiagonalShapes.tsx` (replaces `RayBackground.tsx`)

**Shapes:**
- 5-6 diagonal bar shapes distributed across the viewport
- Inspired by the three diagonal stripes in the Evercreate logo icon (~45° angle, bottom-left to top-right)
- Colors: teal (#14b8a6), yellow (#eab308), and white — each at 10-15% opacity
- `backdrop-blur` applied for frosted glass effect
- Semi-transparent borders (white/10)
- Sizes vary: large bars (600×80px) near edges, small bars (150×30px) closer to center
- Positioned asymmetrically: 2-3 on left side, 2-3 on right side, center kept clear for content

**Animations:**
- Staggered entrance: each bar fades in with slight rotation adjustment, delays 0.3-0.8s
- Continuous floating: vertical oscillation `y: [0, 15, 0]` in 10-14 second loops
- Each bar has slightly different duration to prevent synchronization
- Respects `prefers-reduced-motion` media query (disables floating, reduces entrance to simple fade)
- No scroll-based parallax (unlike current RayBackground which uses useScroll/useTransform). The floating oscillation is sufficient motion.

**Glow:**
- Radial gradient centered behind content
- Colors: teal and yellow, very diffused (large radius, low opacity)
- Provides subtle depth and focal point

### 3. Typography & Text

**Badge/pill (above headline):**
- Home page: "Exclusive Early Access"
- Industry pages: use industry display name (e.g., "Construction", "Insurance") from the industries config
- Background: `white/5`, border: `white/10`, rounded-full
- Small teal dot (animated pulse) before text
- Text: `text-sm`, `white/60`
- New prop added to `LandingHeroProps`: `badge?: string`

**Headline:**
- Size: `text-5xl` (mobile) → `text-7xl` (desktop)
- `font-bold`, `tracking-tight`
- Gradient fill: teal (#14b8a6) → white (center, dominant) → yellow (#eab308)
- Applied via `bg-gradient-to-r` + `bg-clip-text` + `text-transparent`
- White dominates the center ~60% of the gradient so short headlines don't look garish. Teal and yellow are accent touches at the edges.
- Works for both single-line and multi-line headlines because white dominates

**Subtitle:**
- Size: `text-lg` (mobile) → `text-xl` (desktop)
- Color: `white/60`
- Max width: `max-w-2xl`, centered
- Line height comfortable for readability

**Subline (industry pages):**
- Size: `text-sm`
- Color: `white/40`
- This is a separate element from the badge. Badge = above headline, subline = below subtitle (same as current)

**Entrance animations (staggered from below):**
1. Badge pill (delay 0)
2. Headline (delay ~0.15s)
3. Subtitle (delay ~0.30s)
4. CTAs (delay ~0.45s)
- Each: `opacity: 0→1`, `y: 20→0`
- Easing: smooth cubic bezier `[0.23, 0.86, 0.39, 0.96]`

### 4. Interaction Components (CodeEntry + WaitlistForm)

**Visual updates only — no logic changes.**

**"I have a code" button (primary CTA):**
- Background: solid white (`bg-white`)
- Text: black (`text-black`)
- Hover: subtle teal glow (box-shadow with teal at low opacity), slight scale
- Rounded: `rounded-xl`
- Padding: generous (`px-8 py-3`)
- This remains the highest-contrast element on the page to draw attention

**Code input field:**
- Background: `white/5`
- Border: `white/10`, on focus: border-teal with subtle glow
- Font: Geist Mono
- Text: white
- Placeholder: `white/30`

**Validate button ("Go"):**
- Background: solid white (`bg-white`)
- Text: black
- Hover: subtle teal glow
- Consistent with "I have a code" button style

**"Join the waitlist" link:**
- Color: `white/40`
- Hover: `white/60`
- Positioned below primary CTA with more spacing

**WaitlistForm expanded:**
- Email input: same glassmorphism style as code input (`white/5` bg, `white/10` border)
- Submit button: solid white like other primary CTAs

**Cal.com calendar:**
- Appears with same scale animation as current implementation
- No visual changes needed

**Shake animation on error:**
- Retained as-is (keyframe defined in globals.css — do NOT remove)

### 5. Files to Modify

| File | Action | Notes |
|------|--------|-------|
| `src/components/landing/DiagonalShapes.tsx` | CREATE | New background component replacing RayBackground |
| `src/components/landing/RayBackground.tsx` | DELETE | Replaced by DiagonalShapes |
| `src/components/landing/LandingHero.tsx` | MODIFY | New layout, logo, badge pill, gradient text, DiagonalShapes, new `badge` prop |
| `src/components/landing/CodeEntry.tsx` | MODIFY | Visual styling only (button styles, input styles) |
| `src/components/landing/WaitlistForm.tsx` | MODIFY | Visual styling only (input/button styles) |
| `src/app/layout.tsx` | MODIFY | Remove inline `<header>` element, update `bg-zinc-950` to `bg-[#030303]` |
| `src/app/page.tsx` | MODIFY | Pass `badge="Exclusive Early Access"` to LandingHero |
| `src/app/[industry]/page.tsx` | MODIFY | Pass `badge={industry display name}` to LandingHero |
| `src/app/globals.css` | MODIFY | Update `--background` to `#030303`. Preserve `animate-shake` keyframe |

**Logo:** Use existing `public/logo-evercreate-white.svg` (already in repo). No new file needed.

### 6. Responsive Behavior

- Mobile: shapes smaller and fewer visible (hide 2 largest), headline scales down to text-5xl
- Tablet: intermediate sizing
- Desktop: full effect with all shapes, text-7xl headline
- Shapes that would overlap content on small screens are hidden via responsive classes

### 7. Performance Considerations

- Shapes use CSS transforms (GPU-accelerated) for animations
- `will-change: transform` on animated elements
- Backdrop-blur limited to shape elements only (not full-screen)
- Reduced motion: static shapes with simple fade-in, no floating
- Lazy animation initialization (shapes animate on mount, not before)

### 8. Accessibility

- `prefers-reduced-motion` respected throughout
- All text maintains sufficient contrast on dark background
- Interactive elements have visible focus states (teal glow)
- Form inputs have proper labels/aria attributes (maintained from current)

### 9. Updated Props Contract

```typescript
interface LandingHeroProps {
  headline: string;
  subtitle: string;
  subline?: string;
  industry?: string;
  badge?: string;        // NEW — text for the pill above headline
}
```
