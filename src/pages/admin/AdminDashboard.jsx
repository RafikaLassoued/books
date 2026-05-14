import { useState, useEffect } from 'react'
import { ShoppingBag, TrendingUp, BookOpen, DollarSign, Clock, CheckCircle, Truck, XCircle, Users, BarChart4 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { ordersApi } from '../../lib/supabase'
import { format, subDays, startOfDay, isSameDay } from 'date-fns'
import { arSA } from 'date-fns/locale'

const STATUS_CONFIG = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-4 h-4" /> },
  processing: { label: 'قيد التجهيز', color: 'bg-purple-100 text-purple-700', icon: <BookOpen className="w-4 h-4" /> },
  shipped: { label: 'في الطريق', color: 'bg-indigo-100 text-indigo-700', icon: <Truck className="w-4 h-4" /> },
  delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getAll().then(({ data }) => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  // Stats
  const today = startOfDay(new Date())
  const weekStart = subDays(today, 6)
  const monthStart = subDays(today, 29)

  const allOrderItems = orders.flatMap(o => o.order_items || [])
  const topBooks = Object.values(allOrderItems.reduce((acc, item) => {
    const key = `${item.title}||${item.author}`
    if (!acc[key]) acc[key] = {
      title: item.title,
      author: item.author,
      image_url: item.image_url || item.cover_url || '',
      quantity: 0,
      revenue: 0,
    }
    acc[key].quantity += Number(item.quantity || 0)
    acc[key].revenue += Number(item.subtotal || item.price * item.quantity || 0)
    return acc
  }, {})).sort((a, b) => b.quantity - a.quantity).slice(0, 4)

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total || 0), 0)
  const todayOrders = orders.filter(o => new Date(o.created_at) >= today)
  const weekOrders = orders.filter(o => new Date(o.created_at) >= weekStart)
  const monthOrders = orders.filter(o => new Date(o.created_at) >= monthStart)
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const newCustomers = new Set(orders.filter(o => new Date(o.created_at) >= monthStart).map(o => o.customer_phone || o.customer_email)).size

  // Chart data (last 7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayOrders = orders.filter(o => isSameDay(new Date(o.created_at), date))
    return {
      day: format(date, 'EEE', { locale: arSA }),
      طلبات: dayOrders.length,
      مبيعات: dayOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0),
    }
  })

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {})

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">نظرة عامة على أداء المتجر</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'المبيعات اليوم', value: `${todayOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(0)} دج`, icon: <DollarSign className="w-6 h-6" />, color: 'bg-gold/10 text-gold', change: '' },
          { label: 'المبيعات الأسبوعية', value: `${weekOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(0)} دج`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-100 text-green-600', change: '' },
          { label: 'المبيعات الشهرية', value: `${monthOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(0)} دج`, icon: <BarChart4 className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', change: '' },
          { label: 'عملاء جدد', value: newCustomers, icon: <Users className="w-6 h-6" />, color: 'bg-purple-100 text-purple-700', change: '' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-black text-ink mt-1">{stat.value}</p>
                {stat.change && <p className="text-green-600 text-xs font-medium mt-1">{stat.change} هذا الشهر</p>}
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-ink mb-4">الطلبات آخر 7 أيام</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="طلبات" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-ink mb-4">المبيعات آخر 7 أيام</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v} دج`, 'المبيعات']} />
              <Line type="monotone" dataKey="مبيعات" stroke="#C9A84C" strokeWidth={2} dot={{ fill: '#C9A84C' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution + Top Books + Recent Orders */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-ink mb-4">توزيع الطلبات</h3>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`badge ${STATUS_CONFIG[status]?.color}`}>{STATUS_CONFIG[status]?.label}</span>
                </div>
                <span className="font-bold text-ink">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Books */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-ink mb-4">أفضل الكتب مبيعاً</h3>
          <div className="space-y-3">
            {topBooks.length === 0 && <p className="text-gray-400">لا توجد بيانات كافية لعرض الكتب</p>}
            {topBooks.map((book, index) => (
              <div key={book.title + book.author} className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="w-16 h-20 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                  {book.image_url ? <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">لا توجد صورة</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  <div className="text-xs text-gray-400 mt-1">{book.quantity} نسخة · {book.revenue.toLocaleString()} دج</div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500"># {index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-ink mb-4">آخر الطلبات</h3>
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-sm text-ink">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">{order.customer_phone} • {format(new Date(order.created_at), 'dd/MM/yyyy')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge text-xs ${STATUS_CONFIG[order.status]?.color}`}>{STATUS_CONFIG[order.status]?.label}</span>
                  <span className="font-bold text-gold text-sm">{order.total} دج</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-gray-400 py-8">لا توجد طلبات بعد</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
