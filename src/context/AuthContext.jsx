import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data?.session ?? null)
      setUser(data?.session?.user ?? null)
      setLoading(false)
    }

    initializeAuth()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setSession(data.session ?? null)
    setUser(data.session?.user ?? null)
    return data
  }

  const signUp = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    setSession(data.session ?? null)
    setUser(data.session?.user ?? null)
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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
