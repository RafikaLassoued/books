import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    if (!supabase || !supabase.auth) {
      // Supabase not configured — don't attempt auth calls
      setLoading(false)
      return () => { mounted = false }
    }

    const initializeAuth = async () => {
      try {
        const res = await supabase.auth.getSession()
        if (!mounted) return
        const data = res?.data ?? res
        setSession(data?.session ?? null)
        setUser(data?.session?.user ?? null)
      } catch (err) {
        console.warn('Auth initialization failed:', err?.message ?? err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    const onChangeRes = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session ?? null)
      setUser(session?.user ?? null)
    })

    const subscription = onChangeRes?.data?.subscription ?? onChangeRes?.subscription ?? onChangeRes

    return () => {
      mounted = false
      try {
        if (subscription?.unsubscribe) subscription.unsubscribe()
        else if (subscription?.subscription?.unsubscribe) subscription.subscription.unsubscribe()
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const signIn = async ({ email, password }) => {
    if (!supabase || !supabase.auth) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setSession(data.session ?? null)
    setUser(data.session?.user ?? null)
    return data
  }

  const signUp = async ({ email, password }) => {
    if (!supabase || !supabase.auth) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    setSession(data.session ?? null)
    setUser(data.session?.user ?? null)
    return data
  }

  const signOut = async () => {
    if (!supabase || !supabase.auth) {
      setSession(null)
      setUser(null)
      return
    }
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('signOut failed:', e?.message ?? e)
    }
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
