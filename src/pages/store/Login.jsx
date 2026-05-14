import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Lock, Mail, ArrowRight } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      await signIn(form)
      toast.success('تم تسجيل الدخول بنجاح')
      navigate('/account')
    } catch (error) {
      toast.error(error.message || 'تعذر تسجيل الدخول. حاول مرة أخرى')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-ink mb-2">تسجيل الدخول</h1>
        <p className="text-sm text-gray-500 mb-8">قم بتسجيل الدخول للوصول إلى طلباتك وحسابك.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                className="input pr-10"
                placeholder="example@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                className="input pr-10"
                placeholder="كلمة المرور"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3">
            {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-6 text-center">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-gold font-semibold hover:text-gold-dark">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  )
}
