import { useState, useEffect, useMemo } from 'react'
import { Search, Eye, ShieldCheck, UserPlus, ArrowRight, Download } from 'lucide-react'
import { ordersApi } from '../../lib/supabase'
import { format } from 'date-fns'

function CustomerDetailModal({ customer, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">تفاصيل العميل</h3>
            <p className="text-sm text-gray-500 mt-1">{customer.name} · {customer.orders.length} طلبات</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-ink">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">الاسم</p>
              <p className="font-semibold text-ink">{customer.name}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">الهاتف</p>
              <p className="font-semibold text-ink" dir="ltr">{customer.phone || 'غير متوفر'}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">البريد</p>
              <p className="font-semibold text-ink">{customer.email || 'غير متوفر'}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">إجمالي مشتريات</p>
              <p className="font-bold text-gold text-xl">{customer.total.toLocaleString()} دج</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-5 py-4 font-semibold text-ink">سجل الطلبات</div>
            <div className="divide-y divide-gray-100">
              {customer.orders.map(order => (
                <div key={order.id} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">طلب #{order.order_number}</p>
                    <p className="text-xs text-gray-500 mt-1">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">الحالة</p>
                    <p className="font-semibold text-ink mt-1">{order.status}</p>
                  </div>
                  <div className="sm:col-span-2 flex flex-wrap gap-2 items-center justify-between">
                    <span className="text-xs text-gray-500">العنوان: {order.customer_address || 'غير متوفر'}</span>
                    <span className="text-sm font-bold text-gold">{Number(order.total || 0).toLocaleString()} دج</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminCustomers() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getAll().then(({ data }) => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  const customers = useMemo(() => {
    const map = new Map()
    orders.forEach(order => {
      const key = order.customer_phone || order.customer_email || order.customer_name || `customer-${order.id}`
      const existing = map.get(key) || {
        name: order.customer_name || 'عميل',
        phone: order.customer_phone,
        email: order.customer_email,
        orders: [],
        total: 0,
      }
      existing.orders.push(order)
      existing.total += Number(order.total || 0)
      map.set(key, existing)
    })
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [orders])

  const filtered = customers.filter(customer => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return [customer.name, customer.phone, customer.email].some(value => value?.toLowerCase().includes(term))
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">إدارة العملاء</h1>
          <p className="text-gray-500 text-sm mt-1">تابع تفاصيل العملاء ومشترياتهم بسهولة.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button className="btn-outline flex items-center gap-2 text-sm">
            <ShieldCheck className="w-4 h-4" /> إدارة الصلاحيات
          </button>
          <button className="btn-gold flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> إضافة عميل يدوي
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">عدد العملاء</p>
          <p className="text-3xl font-black text-ink mt-2">{customers.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">إجمالي المشتريات</p>
          <p className="text-3xl font-black text-gold mt-2">{customers.reduce((sum, item) => sum + item.total, 0).toLocaleString()} دج</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">معدل الطلب لكل عميل</p>
          <p className="text-3xl font-black text-ink mt-2">{customers.length ? (orders.length / customers.length).toFixed(1) : 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن عميل..." className="input pr-10 text-sm" />
        </div>
        <button onClick={() => window.print()} className="btn-outline text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> تصدير التقرير
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
        <table className="min-w-full text-sm text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['العميل', 'الهاتف', 'البريد', 'الطلبات', 'إجمالي المشتريات', 'آخر طلب'].map(header => (
                <th key={header} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((customer, index) => (
              <tr key={`${customer.phone}-${index}`} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(customer)}>
                <td className="px-4 py-4 font-semibold text-ink">{customer.name}</td>
                <td className="px-4 py-4 text-gray-500" dir="ltr">{customer.phone || '-'}</td>
                <td className="px-4 py-4 text-gray-500">{customer.email || '-'}</td>
                <td className="px-4 py-4 font-semibold text-ink">{customer.orders.length}</td>
                <td className="px-4 py-4 font-bold text-gold">{customer.total.toLocaleString()} دج</td>
                <td className="px-4 py-4 text-gray-500">{customer.orders[0] ? format(new Date(customer.orders[0].created_at), 'dd/MM/yyyy') : '-'}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-gray-400">لم يتم العثور على عملاء</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
