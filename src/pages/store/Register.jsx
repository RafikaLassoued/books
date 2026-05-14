import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { UserPlus, Mail, Lock } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const { data } = await signUp(form)
      toast.success('تم إنشاء الحساب. تحقق من بريدك الإلكتروني إذا طُلب ذلك.')
      if (data?.session) {
        navigate('/account')
      } else {
        navigate('/login')
      }
    } catch (error) {
      toast.error(error.message || 'تعذر إنشاء الحساب. حاول مرة أخرى')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-ink mb-2">إنشاء حساب جديد</h1>
        <p className="text-sm text-gray-500 mb-8">سجّل حسابك لحفظ الطلبات ومتابعة تاريخ الشراء.</p>
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
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-6 text-center">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-gold font-semibold hover:text-gold-dark">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
