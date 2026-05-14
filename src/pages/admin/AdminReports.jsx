import { useState, useEffect, useMemo } from 'react'
import { Printer, FileText, Download, BarChart3, PieChart, TrendingUp } from 'lucide-react'
import { ordersApi } from '../../lib/supabase'
import { format, subMonths } from 'date-fns'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart as RePieChart, Pie, Cell } from 'recharts'

const COLORS = ['#C9A84C', '#4F46E5', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444']

function exportCsv(filename, rows) {
  const csvContent = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function AdminReports() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getAll().then(({ data }) => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  const monthSales = useMemo(() => {
    const start = subMonths(new Date(), 5)
    const months = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(start.getFullYear(), start.getMonth() + idx, 1)
      return { label: format(date, 'MMM', { locale: undefined }), month: date.getMonth() + 1, year: date.getFullYear(), sales: 0, orders: 0 }
    })

    orders.forEach(order => {
      const date = new Date(order.created_at)
      const m = date.getMonth() + 1
      const y = date.getFullYear()
      const slot = months.find(item => item.month === m && item.year === y)
      if (slot) {
        slot.sales += Number(order.total || 0)
        slot.orders += 1
      }
    })
    return months
  }, [orders])

  const topBooks = useMemo(() => {
    const map = new Map()
    orders.flatMap(order => order.order_items || []).forEach(item => {
      const key = `${item.title}||${item.author}`
      const existing = map.get(key) || { title: item.title, author: item.author, quantity: 0, revenue: 0 }
      existing.quantity += Number(item.quantity || 0)
      existing.revenue += Number(item.subtotal || item.price * item.quantity || 0)
      map.set(key, existing)
    })
    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 6)
  }, [orders])

  const byState = useMemo(() => {
    const map = new Map()
    orders.forEach(order => {
      const key = order.customer_city || 'غير محدد'
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }))
  }, [orders])

  const reportSummary = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    const totalOrders = orders.length
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0
    return { totalRevenue, totalOrders, avgOrder }
  }, [orders])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">التقارير والإحصائيات</h1>
          <p className="text-gray-500 text-sm mt-1">لوحة تحكم وصفية للبيانات الشهرية والمبيعات والولايات.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => window.print()} className="btn-outline flex items-center gap-2 text-sm"><Printer className="w-4 h-4" /> طباعة التقرير</button>
          <button onClick={() => exportCsv('sales-report.csv', [['الشهر', 'الطلبات', 'المبيعات']].concat(monthSales.map(row => [row.label, row.orders, row.sales.toFixed(0)])))} className="btn-gold flex items-center gap-2 text-sm"><Download className="w-4 h-4" /> تصدير إلى CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">إجمالي المبيعات</p>
          <p className="text-3xl font-black text-gold mt-2">{reportSummary.totalRevenue.toLocaleString()} دج</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">عدد الطلبات</p>
          <p className="text-3xl font-black text-ink mt-2">{reportSummary.totalOrders}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">متوسط قيمة الطلب</p>
          <p className="text-3xl font-black text-ink mt-2">{reportSummary.avgOrder.toFixed(0)} دج</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-ink">مبيعات الأشهر الستة الماضية</h2>
              <p className="text-xs text-gray-500">رصد ديناميكي لحركة المبيعات الشهرية.</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gold" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthSales} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={value => [`${value.toLocaleString()} دج`, 'المبيعات']} />
                <Area type="monotone" dataKey="sales" stroke="#C9A84C" strokeWidth={2} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-ink">الطلبات حسب الولايات</h2>
              <p className="text-xs text-gray-500">أكثر الولايات نشاطاً في الطلبات.</p>
            </div>
            <PieChart className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart data={byState} innerRadius={55} outerRadius={90} paddingAngle={4}>
                {byState.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {byState.map((entry, index) => (
              <div key={entry.name} className="rounded-2xl bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-2.5 rounded-full w-10" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-gray-500">{entry.value} طلب</span>
                </div>
                <p className="text-sm font-semibold text-ink mt-2 truncate">{entry.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-ink">الكتب الأكثر مبيعاً</h2>
            <p className="text-xs text-gray-500">الكتب التي ساهمت في أكبر عدد من المبيعات.</p>
          </div>
          <FileText className="w-5 h-5 text-ink" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topBooks.map((book, index) => (
            <div key={book.title + index} className="bg-gray-50 rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-400">#{index + 1}</p>
                  <p className="font-semibold text-ink mt-1 truncate">{book.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{book.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gold">{book.quantity} نسخة</p>
                  <p className="text-xs text-gray-500">{book.revenue.toLocaleString()} دج</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
