import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [useDevMode, setUseDevMode] = useState(false)
  
  const secretParam = new URLSearchParams(location.search).get('secret')
  const requiredSecret = import.meta.env.VITE_ADMIN_SECRET || 'admin-dev-key'
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const isAuthorized = Boolean(secretParam === requiredSecret) || useDevMode
  const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

  // سماح بدخول مباشر للتطوير
  const handleDevLogin = () => {
    localStorage.setItem('admin_auth', 'true')
    navigate('/admin/dashboard')
  }

  if (!isAuthorized && !useDevMode) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center text-white">
          <h1 className="text-3xl font-display font-bold mb-4">لوحة التحكم</h1>
          <p className="text-white/70 mb-8 text-sm">
            للدخول: استخدم إما البريد والكلمة المرور أعلاه، أو اضغط "دخول مباشر للتطوير"
          </p>
          <button 
            onClick={() => setUseDevMode(true)}
            className="w-full bg-gold text-white py-3 rounded-xl font-bold hover:bg-gold-dark transition-all mb-4"
          >
            دخول مباشر للتطوير
          </button>
          <a href="/" className="text-gold underline text-sm block mt-6">العودة للمتجر</a>
        </div>
      </div>
    )
  }

  if (useDevMode) {
    // في وضع التطوير، ادخل مباشرة
    handleDevLogin()
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!supabase || !supabase.auth) throw new Error('Supabase not configured')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })
      if (error) throw error
      localStorage.setItem('admin_auth', 'true')
      navigate('/admin/dashboard')
    } catch (error) {
      toast.error('تعذر تسجيل الدخول — تحقق من إعدادات الخادم أو المتغيرات البيئية')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">لوحة التحكم</h1>
          <p className="text-white/50 mt-2">مكتبة الكتب الاحترافية</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-gold focus:bg-white/15 transition-all" placeholder="أدخل البريد الإلكتروني" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="password" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white placeholder-white/30 focus:outline-none focus:border-gold focus:bg-white/15 transition-all" placeholder="أدخل كلمة المرور" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gold text-white py-3.5 rounded-xl font-bold hover:bg-gold-dark transition-all disabled:opacity-50">
              {loading ? 'جاري التحقق...' : 'دخول للوحة التحكم'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
