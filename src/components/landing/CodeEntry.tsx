'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Cal, { getCalApi } from '@calcom/embed-react'
import { WaitlistForm } from './WaitlistForm'

const STORAGE_KEY = 'evercreate:promo-code'

interface StoredCode {
  code: string
  industry: string
  validatedAt: string
}

interface CodeEntryProps {
  industry?: string
}

export function CodeEntry({ industry }: CodeEntryProps) {
  const [state, setState] = useState<'initial' | 'input' | 'waitlist' | 'validated' | 'calendar'>('initial')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: StoredCode = JSON.parse(stored)
        if (parsed.code && parsed.validatedAt) {
          setState('calendar')
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  useEffect(() => {
    if (state === 'calendar') {
      ;(async () => {
        const cal = await getCalApi()
        cal('ui', {
          theme: 'dark',
          hideEventTypeDetails: false,
        })
      })()
    }
  }, [state])

  const handleValidate = useCallback(async () => {
    if (!code.trim()) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/code/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })

      const data = await res.json()

      if (data.valid) {
        const stored: StoredCode = {
          code: code.trim().toUpperCase(),
          industry: data.industry,
          validatedAt: new Date().toISOString(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
        setState('validated')
        setTimeout(() => setState('calendar'), 600)
      } else {
        if (data.reason === 'exhausted') {
          setError('This code has expired. Join the waitlist instead.')
        } else {
          setError('Invalid code. Try again or join the waitlist.')
        }
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }, [code])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleValidate()
    }
  }

  const calUrl = process.env.NEXT_PUBLIC_CALCOM_URL || ''

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence mode="wait">
        {state === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              onClick={() => setState('input')}
              className="rounded-2xl bg-white px-10 py-4 text-lg font-medium text-black transition-all hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] hover:scale-[1.04]"
              style={{ cursor: 'pointer' }}
            >
              I have a code
            </button>
            <button
              onClick={() => setState('waitlist')}
              className="text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer"
            >
              Join the waitlist
            </button>
          </motion.div>
        )}

        {state === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex flex-col items-center gap-3 ${shake ? 'animate-shake' : ''}`}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter your code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                autoFocus
                className="rounded-xl bg-white border border-white px-5 py-3.5 text-base text-black placeholder-black/30 outline-none focus:shadow-[0_0_16px_rgba(20,184,166,0.3)] transition-all text-center tracking-wider font-mono uppercase"
              />
              <button
                onClick={handleValidate}
                disabled={loading}
                className="rounded-xl bg-teal-500 px-6 py-3.5 text-base font-semibold text-white transition-all disabled:opacity-50 cursor-pointer hover:bg-teal-400 hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02]"
              >
                {loading ? '...' : 'Go'}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {state === 'waitlist' && (
          <motion.div
            key="waitlist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WaitlistForm industry={industry} defaultOpen />
          </motion.div>
        )}

        {state === 'validated' && (
          <motion.div
            key="validated"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-white/60 text-sm"
          >
            Code accepted. Loading calendar...
          </motion.div>
        )}

        {state === 'calendar' && calUrl && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl"
          >
            <Cal
              calLink={calUrl}
              config={{ theme: 'dark' }}
              style={{ width: '100%', height: '100%', overflow: 'auto' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
