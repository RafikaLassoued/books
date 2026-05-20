import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, LogOut, ShieldCheck, ShieldAlert } from 'lucide-react'

const STORAGE_KEY = 'secret_admin_authenticated'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'MySecret123'

export default function SecretAdminPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) === 'true'
    setAuthenticated(saved)
  }, [])

  const handleLogin = (event) => {
    event.preventDefault()
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setAuthenticated(true)
      setError('')
      return
    }

    setError('اسم المستخدم أو كلمة المرور غير صحيح')
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthenticated(false)
    setUsername('')
    setPassword('')
    navigate('/admin-secret-2024')
  }

  if (authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4" dir="rtl">
        <div className="mx-auto max-w-4xl bg-white shadow-xl rounded-3xl border border-slate-200 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-8 bg-slate-900 text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">لوحة سرية</p>
              <h1 className="mt-3 text-3xl font-semibold">لوحة إدارة مخفية</h1>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
            >
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </button>
          </header>

          <main className="p-8 space-y-6">
            <section className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-slate-900">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  <h2 className="text-lg font-semibold">الوصول الآمن</h2>
                </div>
                <p className="mt-4 text-slate-600">أنت الآن داخل نطاق لوحة الإدارة المحمية. هذا المحتوى محمي برابط سري ومفعل عبر التخزين المحلي.</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-slate-900">
                  <ShieldAlert className="w-6 h-6 text-amber-500" />
                  <h2 className="text-lg font-semibold">معلومات هامة</h2>
                </div>
                <p className="mt-4 text-slate-600">لا تُشارك هذا الرابط أو بيانات الدخول مع أي شخص. المخطط المصاحب لا يظهر في التنقل العام.</p>
              </article>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-300">حالة المستخدم</p>
                <p className="mt-4 text-3xl font-semibold">مفعل</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">إجمالي التقارير</p>
                <p className="mt-4 text-3xl font-semibold">12</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">الطلبات المعلقة</p>
                <p className="mt-4 text-3xl font-semibold">4</p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">مرحباً بك في لوحة الإدارة السرية</h3>
              <p className="mt-3 text-slate-600">هذا القسم مخصص للمسؤولين الذين يعرفون رابط الدخول السري فقط. يمكنك إضافة هنا أي بيانات أو روابط داخلية خاصة بالإدارة.</p>
            </section>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">الدخول السري</p>
          <h1 className="mt-4 text-3xl font-semibold">لوحة الإدارة المخفية</h1>
          <p className="mt-3 text-slate-400">أدخل اسم المستخدم وكلمة المرور للمتابعة.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-300">اسم المستخدم</label>
            <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
              <User className="w-5 h-5 text-slate-500" />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300">كلمة المرور</label>
            <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3">
              <Lock className="w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-3xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            تسجيل الدخول
          </button>

          <p className="text-center text-xs text-slate-500">
            الرابط لا يظهر في القائمة الرئيسية، وتحتاج الرابط السري للوصول.
          </p>
        </form>
      </div>
    </div>
  )
}
