# Admin Dashboard — Tabs + Campaign Groups — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin dashboard from a single scrollable page into a tabbed interface (Industries, Campaigns, Interested Leads) with Instantly tag-based campaign grouping.

**Architecture:** Three tabs, each with its own API route that lazy-loads on first activation. Campaigns tab fetches campaign groups from Instantly tags, then analytics per group. Shared Instantly API helpers extracted to `src/lib/instantly.ts`.

**Tech Stack:** Next.js 16, React, TypeScript, Supabase, Instantly API v2, Tailwind CSS

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/instantly.ts` | Shared `instantlyGet` / `instantlyPost` helpers |
| Rename | `src/app/api/admin/summary/` → `src/app/api/admin/industries/` | Industries-only API route |
| Modify | `src/app/api/admin/industries/route.ts` | Remove campaign/interested data, keep industries only |
| Create | `src/app/api/admin/campaigns/route.ts` | Campaign groups + per-group analytics |
| Create | `src/app/api/admin/interested-leads/route.ts` | Interested leads from Supabase |
| Modify | `src/app/api/webhook/instantly/route.ts` | Import from shared `@/lib/instantly` |
| Modify | `src/app/api/cron/follow-up/route.ts` | Import from shared `@/lib/instantly` |
| Rewrite | `src/app/admin/page.tsx` | Tabbed UI with lazy-loaded data per tab |

---

## Chunk 1: Extract shared Instantly helpers + rename industries route

### Task 1: Create shared Instantly helpers

**Files:**
- Create: `src/lib/instantly.ts`

- [ ] **Step 1: Create `src/lib/instantly.ts`**

```typescript
const INSTANTLY_API = 'https://api.instantly.ai/api/v2'

export async function instantlyGet(endpoint: string) {
  const resp = await fetch(`${INSTANTLY_API}${endpoint}`, {
    headers: { Authorization: `Bearer ${process.env.INSTANTLY_API_KEY}` },
  })
  return resp.json()
}

export async function instantlyPost(endpoint: string, body: Record<string, unknown>) {
  const resp = await fetch(`${INSTANTLY_API}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.INSTANTLY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  return resp.json()
}
```

- [ ] **Step 2: Update webhook route to use shared helpers**

In `src/app/api/webhook/instantly/route.ts`:
- Add import: `import { instantlyGet, instantlyPost } from '@/lib/instantly'`
- Remove lines 6-7 (the `INSTANTLY_API_KEY` and `INSTANTLY_API` constants)
- Remove lines 26-43 (the local `instantlyGet` and `instantlyPost` functions)

- [ ] **Step 3: Update cron route to use shared helpers**

In `src/app/api/cron/follow-up/route.ts`:
- Add import: `import { instantlyGet, instantlyPost } from '@/lib/instantly'`
- Remove lines 4-5 (the `INSTANTLY_API_KEY` and `INSTANTLY_API` constants)
- Remove lines 9-26 (the local `instantlyGet` and `instantlyPost` functions)

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Compiles successfully, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/instantly.ts src/app/api/webhook/instantly/route.ts src/app/api/cron/follow-up/route.ts
git commit -m "refactor: extract shared Instantly API helpers to src/lib/instantly.ts"
```

### Task 2: Rename summary route to industries + strip campaign data

**Files:**
- Rename: `src/app/api/admin/summary/route.ts` → `src/app/api/admin/industries/route.ts`
- Modify: `src/app/api/admin/industries/route.ts`

- [ ] **Step 1: Rename the directory**

```bash
mv src/app/api/admin/summary src/app/api/admin/industries
```

- [ ] **Step 2: Strip campaign and interested leads data from the route**

In `src/app/api/admin/industries/route.ts`, revert to the original industries-only version:
- Remove `interestedRes` and `campaignAnalytics` from the `Promise.all` (keep only `codesRes`, `waitlistRes`, `redemptionsRes`)
- Remove all campaign metrics/totals computation (lines 58-97)
- Remove `campaignMetrics`, `campaignTotals`, `interestedLeads` from the response JSON
- Remove the Instantly `fetch` import (no longer needed in this route)

The final route should return only:
```json
{
  "industries": [...],
  "totals": { "totalRedemptions", "totalWaitlist", "totalIndustries", "industriesWithCode" },
  "recentRedemptions": [...],
  "recentWaitlist": [...]
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build fails because `page.tsx` still fetches `/api/admin/summary`. That's expected — we'll fix it in Task 6.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/industries/route.ts
git commit -m "refactor: rename /api/admin/summary to /api/admin/industries, remove campaign data"
```

Note: Git will detect the rename automatically. Also delete the old directory if it wasn't moved:
```bash
rm -rf src/app/api/admin/summary 2>/dev/null; true
```

---

## Chunk 2: New API routes (campaigns + interested leads)

### Task 3: Create campaigns API route

**Files:**
- Create: `src/app/api/admin/campaigns/route.ts`

- [ ] **Step 1: Create the campaigns route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { instantlyGet } from '@/lib/instantly'

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tagId = req.nextUrl.searchParams.get('tag_id')

  // Mode 1: Return campaign groups (tags)
  if (!tagId) {
    try {
      const tags = await instantlyGet('/custom-tags')
      const groups = (tags?.items || tags || [])
        .filter((t: Record<string, unknown>) => t.name && t.id)
        .map((t: Record<string, unknown>) => ({ id: t.id, name: t.name }))
      return NextResponse.json({ groups })
    } catch {
      return NextResponse.json({ groups: [], error: 'Failed to fetch campaign groups' })
    }
  }

  // Mode 2: Return analytics for a specific campaign group
  try {
    // Step 1: List all campaigns with this tag (paginated)
    const campaignIds: string[] = []
    let cursor: string | undefined
    do {
      const params = new URLSearchParams({ tag_ids: tagId, limit: '100' })
      if (cursor) params.set('starting_after', cursor)
      const res = await instantlyGet(`/campaigns?${params}`)
      const items = res?.items || res?.data || []
      for (const c of items) {
        if (c.id) campaignIds.push(c.id)
      }
      cursor = res?.next_starting_after
    } while (cursor)

    if (campaignIds.length === 0) {
      return NextResponse.json({
        groupTotals: { total_leads: 0, sent: 0, contacted: 0, opens: 0, replies: 0, bounced: 0, interested: 0, open_rate: 0, reply_rate: 0, bounce_rate: 0 },
        campaigns: [],
      })
    }

    // Step 2: Fetch analytics in batches of 20
    const BATCH_SIZE = 20
    const allAnalytics: Record<string, unknown>[] = []
    for (let i = 0; i < campaignIds.length; i += BATCH_SIZE) {
      const batch = campaignIds.slice(i, i + BATCH_SIZE)
      const idsParam = batch.map(id => `ids=${id}`).join('&')
      const analytics = await instantlyGet(`/campaigns/analytics?${idsParam}`)
      const items = Array.isArray(analytics) ? analytics : analytics?.items || analytics?.data || []
      allAnalytics.push(...items)
    }

    // Step 3: Map to response shape
    // Field names match the Instantly API v2 analytics response
    // (verified from the existing working code in summary/route.ts)
    const campaigns = allAnalytics.map((c: Record<string, unknown>) => ({
      name: (c.campaign_name as string) || '',
      campaign_id: (c.campaign_id as string) || '',
      leads: (c.leads_count as number) ?? 0,
      sent: (c.sent as number) ?? 0,
      contacted: (c.contacted as number) ?? 0,
      opens: (c.opens as number) ?? 0,
      unique_opens: (c.unique_opens as number) ?? 0,
      replies: (c.replies as number) ?? 0,
      unique_replies: (c.unique_replies as number) ?? 0,
      bounced: (c.bounced as number) ?? 0,
      interested: (c.interested as number) ?? 0,
    }))

    // Step 4: Aggregate totals
    const groupTotals = {
      total_leads: campaigns.reduce((s, c) => s + c.leads, 0),
      sent: campaigns.reduce((s, c) => s + c.sent, 0),
      contacted: campaigns.reduce((s, c) => s + c.contacted, 0),
      opens: campaigns.reduce((s, c) => s + c.opens, 0),
      replies: campaigns.reduce((s, c) => s + c.replies, 0),
      bounced: campaigns.reduce((s, c) => s + c.bounced, 0),
      interested: campaigns.reduce((s, c) => s + c.interested, 0),
      open_rate: 0,
      reply_rate: 0,
      bounce_rate: 0,
    }
    if (groupTotals.sent > 0) {
      groupTotals.open_rate = Math.round((groupTotals.opens / groupTotals.sent) * 1000) / 10
      groupTotals.reply_rate = Math.round((groupTotals.replies / groupTotals.sent) * 1000) / 10
      groupTotals.bounce_rate = Math.round((groupTotals.bounced / groupTotals.sent) * 1000) / 10
    }

    return NextResponse.json({ groupTotals, campaigns })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics' },
      { status: 500 }
    )
  }
}
```

Note: Field names (`sent`, `contacted`, `opens`, `replies`, `bounced`, `interested`) match the existing working code in `summary/route.ts`. If the analytics endpoint returns different fields when filtered by campaign IDs, log the response and adjust.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/campaigns/route.ts
git commit -m "feat: add /api/admin/campaigns route with tag-based grouping"
```

### Task 4: Create interested-leads API route

**Files:**
- Create: `src/app/api/admin/interested-leads/route.ts`

- [ ] **Step 1: Create the interested-leads route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('interested_leads')
    .select('email, slug, campaign_name, auto_replied_at, booked_at, followed_up')
    .order('auto_replied_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const leads = (data ?? []).map((l) => ({
    email: l.email,
    slug: l.slug,
    campaign_name: l.campaign_name,
    auto_replied_at: l.auto_replied_at,
    booked_at: l.booked_at,
    followed_up: l.followed_up,
  }))

  return NextResponse.json({ leads, total: leads.length })
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/interested-leads/route.ts
git commit -m "feat: add /api/admin/interested-leads route"
```

---

## Chunk 3: Rewrite admin page with tabs

### Task 5: Rewrite `page.tsx` — interfaces and auth (unchanged parts)

**Files:**
- Rewrite: `src/app/admin/page.tsx`

This task rewrites the entire file. The auth flow, login form, and password handling remain the same. The main change is the tabbed structure and per-tab data fetching.

- [ ] **Step 1: Write the complete new `page.tsx`**

The file structure:

```typescript
'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
```

The component must be wrapped in `Suspense` because `useSearchParams()` requires it in Next.js 14+. Export a wrapper as the default:

```typescript
export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  )
}

function AdminDashboard() {
  // ... all the component logic below
}
```

**Interfaces:**

```typescript
// ── Industries tab types (unchanged) ────────────────────
interface IndustryRow {
  slug: string; name: string; url: string; code: string
  currentUses: number; maxUses: number; active: boolean; codeInDb: boolean; waitlistCount: number
}
interface Totals {
  totalRedemptions: number; totalWaitlist: number; totalIndustries: number; industriesWithCode: number
}
interface RecentRedemption { code: string; industry: string; created_at: string }
interface RecentWaitlist { email: string; industry: string | null; created_at: string }
interface IndustriesData {
  industries: IndustryRow[]; totals: Totals
  recentRedemptions: RecentRedemption[]; recentWaitlist: RecentWaitlist[]
}

// ── Campaigns tab types ─────────────────────────────────
interface CampaignGroup { id: string; name: string }
interface CampaignMetric {
  name: string; campaign_id: string; leads: number; sent: number; contacted: number
  opens: number; unique_opens: number; replies: number; unique_replies: number
  bounced: number; interested: number
}
interface CampaignGroupTotals {
  total_leads: number; sent: number; contacted: number; opens: number; replies: number
  bounced: number; interested: number; open_rate: number; reply_rate: number; bounce_rate: number
}

// ── Interested leads tab types ──────────────────────────
interface InterestedLead {
  email: string; slug: string; campaign_name: string
  auto_replied_at: string; booked_at: string | null; followed_up: boolean
}

type TabKey = 'industries' | 'campaigns' | 'leads'
type CampaignSortKey = 'name' | 'leads' | 'sent' | 'opens' | 'open_rate' | 'replies' | 'reply_rate' | 'bounced' | 'interested'
```

**Component state:**

```typescript
export default function AdminPage() {
  // Auth
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Tabs
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = (searchParams.get('tab') as TabKey) || 'industries'
  const setActiveTab = (tab: TabKey) => {
    router.replace(`?tab=${tab}`, { scroll: false })
  }

  // Industries tab
  const [industriesData, setIndustriesData] = useState<IndustriesData | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Campaigns tab
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroup[] | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [groupTotals, setGroupTotals] = useState<CampaignGroupTotals | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignMetric[] | null>(null)
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [campaignsError, setCampaignsError] = useState('')
  const [campaignSort, setCampaignSort] = useState<{ key: CampaignSortKey; desc: boolean }>({ key: 'reply_rate', desc: true })

  // Interested leads tab
  const [interestedLeads, setInterestedLeads] = useState<InterestedLead[] | null>(null)
  const [leadsTotal, setLeadsTotal] = useState(0)
```

**Auth + fetch functions:**

Tab-specific fetch functions:
```typescript
  const fetchIndustries = useCallback(async (pw: string) => {
    const res = await fetch('/api/admin/industries', { headers: { 'x-admin-password': pw } })
    if (!res.ok) throw new Error('unauthorized')
    setIndustriesData(await res.json())
  }, [])

  const fetchCampaignGroups = useCallback(async (pw: string) => {
    setCampaignsLoading(true)
    setCampaignsError('')
    try {
      const res = await fetch('/api/admin/campaigns', { headers: { 'x-admin-password': pw } })
      if (!res.ok) throw new Error('unauthorized')
      const json = await res.json()
      setCampaignGroups(json.groups || [])
      // Auto-select first group
      if (json.groups?.length > 0 && !selectedGroup) {
        setSelectedGroup(json.groups[0].id)
      }
    } catch {
      setCampaignsError('Could not load campaign groups. Instantly API may be unavailable.')
    } finally {
      setCampaignsLoading(false)
    }
  }, [selectedGroup])

  const fetchGroupAnalytics = useCallback(async (pw: string, tagId: string) => {
    setCampaignsLoading(true)
    setCampaignsError('')
    try {
      const res = await fetch(`/api/admin/campaigns?tag_id=${tagId}`, { headers: { 'x-admin-password': pw } })
      if (!res.ok) throw new Error('failed')
      const json = await res.json()
      setGroupTotals(json.groupTotals)
      setCampaigns(json.campaigns || [])
    } catch {
      setCampaignsError('Failed to load campaign analytics.')
    } finally {
      setCampaignsLoading(false)
    }
  }, [])

  const fetchInterestedLeads = useCallback(async (pw: string) => {
    const res = await fetch('/api/admin/interested-leads', { headers: { 'x-admin-password': pw } })
    if (!res.ok) throw new Error('unauthorized')
    const json = await res.json()
    setInterestedLeads(json.leads || [])
    setLeadsTotal(json.total || 0)
  }, [])
```

**Initial auth + lazy loading per tab:**

```typescript
  // Initial auth check
  const handleAuth = useCallback(async (pw: string) => {
    setLoading(true)
    setError('')
    try {
      await fetchIndustries(pw) // Industries tab loads first as auth check
      setAuthenticated(true)
      sessionStorage.setItem('admin-pw', pw)
    } catch {
      setAuthenticated(false)
      sessionStorage.removeItem('admin-pw')
      setError('Wrong password')
    } finally {
      setLoading(false)
    }
  }, [fetchIndustries])

  useEffect(() => {
    const saved = sessionStorage.getItem('admin-pw')
    if (saved) { setPassword(saved); handleAuth(saved) }
  }, [handleAuth])

  // Lazy load tab data on first activation
  useEffect(() => {
    if (!authenticated) return
    const pw = sessionStorage.getItem('admin-pw')
    if (!pw) return

    if (activeTab === 'campaigns' && !campaignGroups) {
      fetchCampaignGroups(pw)
    }
    if (activeTab === 'leads' && !interestedLeads) {
      fetchInterestedLeads(pw)
    }
  }, [activeTab, authenticated, campaignGroups, interestedLeads, fetchCampaignGroups, fetchInterestedLeads])

  // Fetch analytics when group selection changes
  useEffect(() => {
    if (!authenticated || !selectedGroup) return
    const pw = sessionStorage.getItem('admin-pw')
    if (!pw) return
    fetchGroupAnalytics(pw, selectedGroup)
  }, [selectedGroup, authenticated, fetchGroupAnalytics])
```

**Helper functions (sort, clean name, copy):**

```typescript
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleAuth(password) }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(key)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  const toggleSort = (key: CampaignSortKey) => {
    setCampaignSort(prev => ({ key, desc: prev.key === key ? !prev.desc : true }))
  }

  const cleanCampaignName = (name: string) =>
    name.replace(/^Evercreate\s*[-—–]\s*/i, '')

  const sortedCampaigns = campaigns
    ? [...campaigns].sort((a, b) => {
        const k = campaignSort.key
        let aVal: number | string, bVal: number | string
        if (k === 'open_rate') { aVal = a.sent > 0 ? a.opens / a.sent : 0; bVal = b.sent > 0 ? b.opens / b.sent : 0 }
        else if (k === 'reply_rate') { aVal = a.sent > 0 ? a.replies / a.sent : 0; bVal = b.sent > 0 ? b.replies / b.sent : 0 }
        else if (k === 'name') { aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase() }
        else { aVal = a[k]; bVal = b[k] }
        if (aVal < bVal) return campaignSort.desc ? 1 : -1
        if (aVal > bVal) return campaignSort.desc ? -1 : 1
        return 0
      })
    : []
```

**Tab bar + refresh button:**

The tab bar sits below the header. Each tab is an underline-style button. The "Interested Leads" tab shows the count as a badge.

```tsx
  // Login form — same as current, no changes needed. Uses handleSubmit.

  // After auth, the main layout:
  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Evercreate Admin</h1>
        <button onClick={() => { /* reload current tab data */ }} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/20">
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-white/10 mb-8">
        {([
          ['industries', 'Industries'],
          ['campaigns', 'Campaigns'],
          ['leads', `Interested Leads${leadsTotal > 0 ? ` (${leadsTotal})` : ''}`],
        ] as [TabKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-3 text-sm font-medium -mb-px border-b-2 transition-colors ${
              activeTab === key
                ? 'border-teal-500 text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'industries' && industriesData && ( /* Industries content — same JSX as current */ )}
      {activeTab === 'campaigns' && ( /* Campaigns content — see below */ )}
      {activeTab === 'leads' && ( /* Interested leads content — see below */ )}
    </div>
  )
```

**Industries tab content:**

Move the existing industries JSX into the `activeTab === 'industries'` block. This is the same code as the current page: 4 stat cards, industries table, recent activity panels. Only change: `data.xxx` becomes `industriesData.xxx`.

**Campaigns tab content:**

```tsx
{activeTab === 'campaigns' && (
  <div>
    {/* Group selector */}
    {campaignGroups && campaignGroups.length > 0 && (
      <div className="mb-6">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-teal-500"
        >
          {campaignGroups.map(g => (
            <option key={g.id} value={g.id} className="bg-zinc-900">{g.name}</option>
          ))}
        </select>
      </div>
    )}

    {/* Loading / error states */}
    {campaignsLoading && <p className="text-white/40 text-sm">Loading campaign data...</p>}
    {campaignsError && <p className="text-red-400 text-sm">{campaignsError}</p>}

    {/* 7 stat cards */}
    {groupTotals && !campaignsLoading && (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
          {[
            { label: 'Total Leads', value: groupTotals.total_leads.toLocaleString() },
            { label: 'Emails Sent', value: groupTotals.sent.toLocaleString() },
            { label: 'Contacted', value: groupTotals.contacted.toLocaleString() },
            { label: 'Open Rate', value: `${groupTotals.open_rate}%` },
            { label: 'Reply Rate', value: `${groupTotals.reply_rate}%` },
            { label: 'Bounce Rate', value: `${groupTotals.bounce_rate}%` },
            { label: 'Interested', value: groupTotals.interested.toLocaleString() },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/50">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Campaigns table — same sortable table pattern as current, using sortedCampaigns */}
        {/* Columns: Campaign, Leads, Sent, Opens, Open%, Replies, Reply%, Bounced, Interested */}
        {/* Uses toggleSort, campaignSort state, cleanCampaignName */}
      </>
    )}

    {/* Empty state */}
    {!campaignsLoading && campaigns?.length === 0 && (
      <p className="text-white/30 text-sm">No campaigns found in this group.</p>
    )}
  </div>
)}
```

The campaigns table JSX is identical to what's already in the current `page.tsx` (lines 246-298) — reuse it directly with `sortedCampaigns`.

**Interested leads tab content:**

```tsx
{activeTab === 'leads' && interestedLeads && (
  <div className="rounded-xl border border-white/10 overflow-hidden">
    {/* Same table as current page lines 301-356 */}
    {/* Columns: Email, Industry (slug), Date, Status */}
    {/* Status badges: green Booked, yellow Awaiting, blue Followed up */}
  </div>
)}
```

This is identical to the existing interested leads JSX from the current page.

**Refresh button logic:**

```typescript
const handleRefresh = () => {
  const pw = sessionStorage.getItem('admin-pw')
  if (!pw) return
  if (activeTab === 'industries') { setIndustriesData(null); fetchIndustries(pw) }
  if (activeTab === 'campaigns' && selectedGroup) { fetchGroupAnalytics(pw, selectedGroup) }
  if (activeTab === 'leads') { setInterestedLeads(null); fetchInterestedLeads(pw) }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Compiles successfully. All routes resolve (`/admin`, `/api/admin/industries`, `/api/admin/campaigns`, `/api/admin/interested-leads`).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: rewrite admin dashboard with tabs (Industries, Campaigns, Interested Leads)"
```

### Task 6: Clean up deleted summary route

**Files:**
- Delete: `src/app/api/admin/summary/` (if still exists after rename)

- [ ] **Step 1: Ensure old route is gone**

```bash
rm -rf src/app/api/admin/summary 2>/dev/null; true
```

- [ ] **Step 2: Final build verification**

Run: `npm run build`
Expected: Clean build with these routes:
```
○ /admin
ƒ /api/admin/industries
ƒ /api/admin/campaigns
ƒ /api/admin/interested-leads
ƒ /api/webhook/instantly
ƒ /api/cron/follow-up
```

- [ ] **Step 3: Commit if anything changed**

```bash
git add -A && git diff --cached --quiet || git commit -m "chore: remove old /api/admin/summary route"
```

---

## Chunk 4: Manual verification checklist

After all code is committed, verify manually:

- [ ] Run `npm run dev` and navigate to `/admin`
- [ ] Login works — Industries tab loads by default
- [ ] Industries tab shows stat cards, table, recent activity (same as before)
- [ ] Click Campaigns tab — group selector loads, first group auto-selected
- [ ] 7 stat cards show with correct values
- [ ] Campaigns table sorts by reply rate desc by default
- [ ] Click column headers to re-sort — arrows toggle
- [ ] Campaign names stripped of "Evercreate — " prefix
- [ ] Click Interested Leads tab — table loads with status badges
- [ ] Tab badge shows total count
- [ ] Refresh button reloads current tab's data
- [ ] URL updates with `?tab=campaigns` / `?tab=leads` — survives page refresh
- [ ] Switching tabs doesn't re-fetch already loaded data
