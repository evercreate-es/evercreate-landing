# Admin Dashboard — Tabs + Campaign Groups

## Overview

Redesign the admin dashboard from a single scrollable page into a tabbed interface with three sections: Industries, Campaigns, and Interested Leads. The Campaigns tab introduces a campaign group hierarchy using Instantly tags, where each group (e.g. "Campaign 1") contains multiple sub-campaigns (e.g. the 36 industry-specific campaigns).

## Tabs

### Tab 1: Industries
Existing content moved into its own tab:
- 4 stat cards (Industries, With code in DB, Total redemptions, Waitlist signups)
- Industries table (name, URL, code, uses, waitlist, status)
- Recent Redemptions + Recent Waitlist panels

### Tab 2: Campaigns
Campaign group hierarchy with per-group analytics:
- **Group selector** (dropdown) — lists campaign groups fetched from Instantly tags
- **7 stat cards** mapping to `groupTotals` fields:
  - Total Leads → `total_leads`
  - Emails Sent → `sent`
  - Leads Contacted → `contacted`
  - Open Rate % → `open_rate`
  - Reply Rate % → `reply_rate`
  - Bounce Rate % → `bounce_rate`
  - Interested → `interested`
- Raw `opens`, `replies`, `bounced` counts are only shown in the per-campaign table, not in the overview cards.
- **Sub-campaigns table** — all campaigns in the selected group with columns: Campaign, Leads, Sent, Opens, Open %, Replies, Reply %, Bounced, Interested
  - Default sort: reply rate desc
  - Clickable column headers to re-sort
  - Strip "Evercreate — " prefix from campaign names

### Tab 3: Interested Leads
- Total count shown as badge on tab
- Table columns: Email, Industry (slug), Date, Status
- Status badges (color-coded):
  - Green "Booked" — booked_at is set
  - Yellow "Awaiting" — no booked_at, not followed up
  - Blue "Followed up" — followed_up = true, no booked_at
- Sorted by date desc (newest first)

## API Routes

### `GET /api/admin/industries` (renamed from `/api/admin/summary`)
Returns existing data: industries, totals, recentRedemptions, recentWaitlist.
No changes to response shape. Frontend fetch URL updated simultaneously.

### `GET /api/admin/campaigns` (new)
Two modes based on query params:

**Without params** — returns campaign groups:
```json
{
  "groups": [
    { "id": "uuid", "name": "Campaign 1" }
  ]
}
```
Implementation: `GET https://api.instantly.ai/api/v2/custom-tags` → filter/map to return id + name.

**With `?tag_id=xxx`** — returns group analytics:
```json
{
  "groupTotals": {
    "total_leads": 0,
    "sent": 0,
    "contacted": 0,
    "opens": 0,
    "replies": 0,
    "bounced": 0,
    "interested": 0,
    "open_rate": 0,
    "reply_rate": 0,
    "bounce_rate": 0
  },
  "campaigns": [
    {
      "name": "Evercreate — Construction",
      "campaign_id": "uuid",
      "leads": 0,
      "sent": 0,
      "contacted": 0,
      "opens": 0,
      "unique_opens": 0,
      "replies": 0,
      "unique_replies": 0,
      "bounced": 0,
      "interested": 0
    }
  ]
}
```

#### Implementation flow:

**Step 1 — List campaigns by tag (paginated):**
```
Loop:
  GET /api/v2/campaigns?tag_ids={tag_id}&limit=100&starting_after={cursor}
  Collect campaign IDs from response.
  If response contains `next_starting_after`, continue with that cursor.
  If no `next_starting_after`, stop.
```

**Step 2 — Fetch analytics (batched):**
The analytics endpoint accepts multiple `ids` query params. To avoid URL length issues with 36+ campaigns, batch in groups of 20:
```
Batch campaign IDs into chunks of 20.
For each chunk:
  GET /api/v2/campaigns/analytics?ids={id1}&ids={id2}&...&ids={id20}
Merge all responses into a single array.
```

**Step 3 — Aggregate:**
Sum all campaign metrics into `groupTotals`. Compute rates:
- `open_rate = round(opens / sent * 100, 1)` (0 if sent = 0)
- `reply_rate = round(replies / sent * 100, 1)`
- `bounce_rate = round(bounced / sent * 100, 1)`

### `GET /api/admin/interested-leads` (new)
```json
{
  "leads": [
    {
      "email": "...",
      "slug": "...",
      "campaign_name": "...",
      "auto_replied_at": "...",
      "booked_at": null,
      "followed_up": false
    }
  ],
  "total": 28
}
```
Implementation: Supabase query on `interested_leads` table, ordered by `auto_replied_at` desc.
No Supabase migrations needed — the table and columns (`email`, `slug`, `campaign_name`, `auto_replied_at`, `booked_at`, `followed_up`) already exist.

## Auth
All three routes use the same `x-admin-password` header check against `ADMIN_PASSWORD` env var.

## Frontend Architecture

All within `src/app/admin/page.tsx`:
- `SummaryPage` component manages tab state + auth (existing auth flow unchanged)
- Tab state synced to URL via `?tab=campaigns` query param (so refresh preserves active tab)
- Tab content rendered conditionally based on active tab
- Each tab fetches its data on first activation (lazy loading)
- Cached in state so switching tabs doesn't re-fetch

### Interfaces (replace existing campaign-related interfaces):
- `CampaignGroup` — { id, name }
- `CampaignMetric` — per-campaign analytics row (replaces old `CampaignMetric`)
- `CampaignGroupTotals` — aggregate totals with rates (replaces old `CampaignTotals`)
- `InterestedLead` — lead row with status fields (replaces old `InterestedLead`)

### Loading/error/empty states for Campaigns tab:
- **Groups loading**: spinner or "Loading campaign groups..."
- **Groups error** (Instantly API down): "Could not load campaign groups. Instantly API may be unavailable."
- **Analytics loading**: spinner below the group selector while fetching
- **Empty group** (0 campaigns): "No campaigns found in this group."

## Shared Instantly helpers

Extract `instantlyGet` and `instantlyPost` from `webhook/instantly/route.ts` into `src/lib/instantly.ts` for reuse across:
- `/api/admin/campaigns/route.ts`
- `/api/webhook/instantly/route.ts`
- `/api/cron/follow-up/route.ts`

## Instantly Tag Setup
- Tag "Campaign 1" already created and assigned to the 36 existing campaigns
- Future campaign groups: create new tag in Instantly, assign to campaigns — dashboard picks it up automatically

## Styling
- Reuse existing dark theme: `border-white/10`, `bg-white/5`, teal accents
- Tab bar: simple underline-style tabs matching the dark theme
- Same card and table patterns as current page

## Verification
```
npm run build
```
