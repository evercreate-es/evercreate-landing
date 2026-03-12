'use client'

import { useCallback, useEffect, useState } from 'react'

interface IndustryRow {
  slug: string
  name: string
  url: string
  code: string
  currentUses: number
  maxUses: number
  active: boolean
  codeInDb: boolean
  waitlistCount: number
}

interface Totals {
  totalRedemptions: number
  totalWaitlist: number
  totalIndustries: number
  industriesWithCode: number
}

interface RecentRedemption {
  code: string
  industry: string
  created_at: string
}

interface RecentWaitlist {
  email: string
  industry: string | null
  created_at: string
}

interface SummaryData {
  industries: IndustryRow[]
  totals: Totals
  recentRedemptions: RecentRedemption[]
  recentWaitlist: RecentWaitlist[]
}

export default function SummaryPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [data, setData] = useState<SummaryData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchData = useCallback(async (pw: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/summary', {
        headers: { 'x-admin-password': pw },
      })
      if (res.status === 401) {
        setAuthenticated(false)
        sessionStorage.removeItem('admin-pw')
        setError('Wrong password')
        return
      }
      const json = await res.json()
      setData(json)
      setAuthenticated(true)
      sessionStorage.setItem('admin-pw', pw)
    } catch {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = sessionStorage.getItem('admin-pw')
    if (saved) {
      setPassword(saved)
      fetchData(saved)
    }
  }, [fetchData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData(password)
  }

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
          <h1 className="text-2xl font-bold text-center">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-teal-500"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-teal-600 px-4 py-3 font-medium text-white hover:bg-teal-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Evercreate Summary</h1>
        <button
          onClick={() => fetchData(password)}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/20"
        >
          Refresh
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Industries', value: data.totals.totalIndustries },
          { label: 'With code in DB', value: data.totals.industriesWithCode },
          { label: 'Total redemptions', value: data.totals.totalRedemptions },
          { label: 'Waitlist signups', value: data.totals.totalWaitlist },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/50">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Industries table */}
      <div className="rounded-xl border border-white/10 overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-white/50">
                <th className="px-4 py-3 font-medium">Industry</th>
                <th className="px-4 py-3 font-medium">URL</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium text-center">Uses</th>
                <th className="px-4 py-3 font-medium text-center">Waitlist</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.industries.map((row) => (
                <tr key={row.slug} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300"
                    >
                      {row.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyToClipboard(row.code, `code-${row.slug}`)}
                      className="font-mono text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10"
                      title="Click to copy code"
                    >
                      {copiedCode === `code-${row.slug}` ? 'Copied!' : row.code}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={row.currentUses > 0 ? 'text-teal-400' : 'text-white/30'}>
                      {row.currentUses}
                    </span>
                    <span className="text-white/20">/{row.maxUses}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={row.waitlistCount > 0 ? 'text-teal-400' : 'text-white/30'}>
                      {row.waitlistCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!row.codeInDb ? (
                      <span className="text-yellow-400/70 text-xs">No DB entry</span>
                    ) : row.active ? (
                      <span className="text-green-400/70 text-xs">Active</span>
                    ) : (
                      <span className="text-red-400/70 text-xs">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Recent redemptions */}
        <div className="rounded-xl border border-white/10 p-5">
          <h2 className="font-bold mb-4 text-white/70">Recent Redemptions</h2>
          {data.recentRedemptions.length === 0 ? (
            <p className="text-white/30 text-sm">No redemptions yet</p>
          ) : (
            <div className="space-y-2">
              {data.recentRedemptions.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-white/50">{r.code}</span>
                  <span className="text-white/30 text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent waitlist */}
        <div className="rounded-xl border border-white/10 p-5">
          <h2 className="font-bold mb-4 text-white/70">Recent Waitlist</h2>
          {data.recentWaitlist.length === 0 ? (
            <p className="text-white/30 text-sm">No signups yet</p>
          ) : (
            <div className="space-y-2">
              {data.recentWaitlist.map((w, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{w.email}</span>
                  <div className="flex items-center gap-3">
                    {w.industry && (
                      <span className="text-white/30 text-xs">{w.industry}</span>
                    )}
                    <span className="text-white/30 text-xs">
                      {new Date(w.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
