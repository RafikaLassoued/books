import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutDashboard, ShoppingBag, BookOpen, Settings, Tag, LogOut, Menu, X, ExternalLink, Bell, Users, BarChart4, Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'الرئيسية' },
  { to: '/admin/reports', icon: <BarChart4 className="w-5 h-5" />, label: 'التقارير' },
  { to: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" />, label: 'الطلبات' },
  { to: '/admin/books', icon: <BookOpen className="w-5 h-5" />, label: 'الكتب' },
  { to: '/admin/categories', icon: <Tag className="w-5 h-5" />, label: 'التصنيفات' },
  { to: '/admin/customers', icon: <Users className="w-5 h-5" />, label: 'العملاء' },
  { to: '/admin/reviews', icon: <Star className="w-5 h-5" />, label: 'التقييمات' },
  { to: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'الإعدادات' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newOrders, setNewOrders] = useState(0)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (!auth) navigate('/admin/login')

    // Listen for new orders
    const channel = supabase.channel('admin_orders').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
      setNewOrders(p => p + 1)
    }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-display font-bold text-white">لوحة التحكم</h1>
        <p className="text-white/50 text-xs mt-0.5">مكتبة الكتب</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${isActive ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            {item.icon}
            {item.label}
            {item.to === '/admin/orders' && newOrders > 0 && (
              <span className="mr-auto bg-rust text-white text-xs px-1.5 py-0.5 rounded-full">{newOrders}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-2">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/10 hover:text-white text-sm font-medium transition-all">
          <ExternalLink className="w-5 h-5" /> عرض المتجر
        </a>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-rust/20 hover:text-rust text-sm font-medium transition-all w-full">
          <LogOut className="w-5 h-5" /> تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex font-body" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-ink flex-col fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed right-0 top-0 h-full w-64 bg-ink z-40 lg:hidden">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-4 text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:mr-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mr-auto">
            {newOrders > 0 && (
              <button onClick={() => { setNewOrders(0); navigate('/admin/orders') }} className="relative p-2 bg-rust/10 text-rust rounded-xl hover:bg-rust/20 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rust text-white text-xs rounded-full flex items-center justify-center">{newOrders}</span>
              </button>
            )}
            <div className="w-9 h-9 bg-gold rounded-xl flex items-center justify-center text-white font-bold text-sm">أ</div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
