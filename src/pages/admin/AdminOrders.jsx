import { useState, useEffect } from 'react'
import { Search, Eye, MessageCircle, Printer, X, CheckCircle, MapPin, Package } from 'lucide-react'
import { ordersApi } from '../../lib/supabase'
import { WILAYAS, PAYMENT_METHODS, DELIVERY_TYPES } from '../../lib/algeria'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'قيد الانتظار',    color: 'bg-yellow-100 text-yellow-700  border-yellow-200' },
  { value: 'confirmed',  label: 'مؤكد',            color: 'bg-blue-100   text-blue-700    border-blue-200'   },
  { value: 'processing', label: 'قيد التجهيز',     color: 'bg-purple-100 text-purple-700  border-purple-200' },
  { value: 'shipped', label: 'تم الشحن – ياليدين', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'delivered',  label: 'تم التوصيل',      color: 'bg-green-100  text-green-700   border-green-200'  },
  { value: 'cancelled',  label: 'ملغي',             color: 'bg-red-100    text-red-700     border-red-200'    },
  { value: 'returned',   label: 'مرتجع',            color: 'bg-gray-100   text-gray-600    border-gray-200'   },
]

const PAYMENT_LABELS = {
  cash_on_delivery: { label: 'عند الاستلام', icon: '💵' },
  baridimob:        { label: 'بريدي موب',    icon: '📱' },
  card:             { label: 'بطاقة',        icon: '💳' },
  transfer:         { label: 'تحويل',        icon: '🏦' },
}

const DELIVERY_LABELS = {
  home:   { label: 'للمنزل',      icon: '🏠' },
  office: { label: 'مكتب ياليدين', icon: '🏢' },
}

function StatusBadge({ status }) {
  const c = STATUS_OPTIONS.find(s => s.value === status)
  return <span className={`badge border text-xs font-semibold ${c?.color}`}>{c?.label || status}</span>
}

// ==================== Order Detail Modal ====================
function OrderDetailModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '')
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '')
  const [saving, setSaving] = useState(false)

  const wilaya = WILAYAS.find(w => w.name === order.customer_city || w.code === order.customer_state?.match(/\((\d+)\)/)?.[1])
  const deliveryInfo = DELIVERY_LABELS[order.delivery_type] || { label: order.delivery_type, icon: '🚚' }
  const paymentInfo = PAYMENT_LABELS[order.payment_method] || { label: order.payment_method, icon: '💰' }

  const handleSave = async () => {
    setSaving(true)
    try {
      await ordersApi.update(order.id, { tracking_number: trackingNumber, admin_notes: adminNotes })
      if (status !== order.status) {
        await ordersApi.updateStatus(order.id, status, `تم تغيير الحالة إلى ${STATUS_OPTIONS.find(s => s.value === status)?.label}`)
      }
      toast.success('تم تحديث الطلب')
      onUpdate()
      onClose()
    } catch { toast.error('حدث خطأ') }
    setSaving(false)
  }

  const sendWhatsApp = (type = 'confirm') => {
    const phone = order.customer_phone.replace(/^0/, '213')
    let msg = ''
    if (type === 'confirm') {
      msg = `مرحباً ${order.customer_name}،\n\n✅ تم تأكيد طلبك رقم #${order.order_number}.\n\n`
        + `📚 الكتب:\n${order.order_items?.map(i => `• ${i.title} × ${i.quantity}`).join('\n')}\n\n`
        + `🚚 التوصيل عبر ياليدين – ${deliveryInfo.label}\n`
        + `💰 الإجمالي: ${Number(order.total).toLocaleString()} دج\n`
        + `💳 الدفع: ${paymentInfo.label}\n\n`
        + `شكراً لثقتكم بنا 😊`
    } else if (type === 'shipped') {
      msg = `مرحباً ${order.customer_name}،\n\n📦 تم شحن طلبك رقم #${order.order_number} عبر ياليدين!\n\n`
        + (trackingNumber ? `🔍 رقم التتبع: *${trackingNumber}*\n` : '')
        + `${deliveryInfo.icon} ${deliveryInfo.label}\n\n`
        + `يمكنك تتبع طلبك على: https://www.yalidine.app/tracking\n\nشكراً لثقتكم 😊`
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="p-6 bg-ink text-white rounded-t-3xl flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">طلب #{order.order_number}</h3>
            <p className="text-white/60 text-xs mt-0.5">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">

          {/* Customer + Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-semibold mb-2">👤 بيانات العميل</p>
              <p className="font-bold text-ink">{order.customer_name}</p>
              <p className="text-sm text-gray-600 mt-0.5" dir="ltr">{order.customer_phone}</p>
              {order.customer_email && <p className="text-xs text-gray-500 mt-0.5">{order.customer_email}</p>}
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-semibold mb-2">📍 بيانات التوصيل</p>
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span className="font-bold text-ink text-sm">{order.customer_city}</span>
                {wilaya && <span className="text-xs text-gray-400 font-mono">(0{wilaya.code})</span>}
              </div>
              <p className="text-xs text-gray-600">{order.customer_address}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                  🚚 ياليدين {deliveryInfo.icon} {deliveryInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Payment + Prices */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 font-semibold mb-3">💰 المالية والدفع</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">الكتب</p>
                <p className="font-black text-ink">{Number(order.subtotal).toLocaleString()}<span className="text-xs font-normal text-gray-400"> دج</span></p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">رسوم ياليدين</p>
                <p className="font-black text-gold">{Number(order.delivery_fee || 0).toLocaleString()}<span className="text-xs font-normal text-gray-400"> دج</span></p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-400">الإجمالي</p>
                <p className="font-black text-ink text-lg">{Number(order.total).toLocaleString()}<span className="text-xs font-normal text-gray-400"> دج</span></p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">طريقة الدفع</span>
              <span className="font-semibold text-sm">{paymentInfo.icon} {paymentInfo.label}</span>
            </div>
            {order.payment_method === 'baridimob' && (
              <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-xl p-2 text-xs text-yellow-700">
                📱 تحقق من إيصال بريدي موب قبل شحن الطلب
              </div>
            )}
          </div>

          {/* Order items */}
          <div>
            <p className="font-bold text-ink mb-3 text-sm">📚 الكتب المطلوبة</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              {order.order_items?.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium text-ink">{item.title}</span>
                    <span className="text-gray-400 text-xs mr-1"> × {item.quantity}</span>
                  </div>
                  <span className="font-bold text-gold">{Number(item.subtotal).toLocaleString()} دج</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status update */}
          <div>
            <p className="font-bold text-ink mb-2 text-sm">تحديث حالة الطلب</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} onClick={() => setStatus(s.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${status === s.value ? s.color + ' border-current' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {status === s.value && '✓ '}{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tracking number */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">رقم تتبع ياليدين</label>
            <div className="flex gap-2">
              <input className="input text-sm flex-1" dir="ltr" placeholder="أدخل رقم التتبع من لوحة ياليدين..." value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
              {trackingNumber && (
                <a href={`https://www.yalidine.app/tracking?id=${trackingNumber}`} target="_blank" rel="noreferrer"
                  className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-200 transition-colors whitespace-nowrap">
                  تتبع
                </a>
              )}
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">ملاحظات داخلية (للأدمن فقط)</label>
            <textarea className="input text-sm resize-none" rows={2} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} />
          </div>

          {/* Customer notes */}
          {order.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-yellow-700 mb-1">📝 ملاحظات العميل:</p>
              <p className="text-sm text-yellow-800">{order.notes}</p>
            </div>
          )}

          {/* Order history */}
          {order.order_history?.length > 0 && (
            <div>
              <p className="font-bold text-ink mb-3 text-sm">سجل الأحداث</p>
              <div className="space-y-2 border-r-2 border-gold/30 pr-4">
                {order.order_history.map(h => (
                  <div key={h.id} className="relative">
                    <div className="absolute -right-5 top-1 w-2.5 h-2.5 bg-gold rounded-full border-2 border-white" />
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm text-gray-700">{h.note || STATUS_OPTIONS.find(s => s.value === h.status)?.label}</p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{format(new Date(h.created_at), 'dd/MM HH:mm')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex flex-wrap gap-2">
          <button onClick={() => sendWhatsApp('confirm')}
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:bg-[#20BA5A] transition-colors">
            <MessageCircle className="w-4 h-4" /> تأكيد الطلب
          </button>
          <button onClick={() => sendWhatsApp('shipped')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-200 transition-colors">
            <Package className="w-4 h-4" /> إشعار الشحن
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
            <Printer className="w-4 h-4" /> طباعة
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-gold text-xs mr-auto">
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Main AdminOrders ====================
export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await ordersApi.getAll({ search, status: statusFilter })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [search, statusFilter])

  const filtered = orders.filter(o => {
    if (paymentFilter && o.payment_method !== paymentFilter) return false
    if (deliveryFilter && o.delivery_type !== deliveryFilter) return false
    return true
  })

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cod: orders.filter(o => o.payment_method === 'cash_on_delivery').length,
    baridimob: orders.filter(o => o.payment_method === 'baridimob').length,
    home: orders.filter(o => o.delivery_type === 'home').length,
    office: orders.filter(o => o.delivery_type === 'office').length,
    revenue: orders.filter(o => !['cancelled','returned'].includes(o.status)).reduce((s, o) => s + Number(o.total || 0), 0),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">الطلبات</h1>
        <p className="text-gray-500 text-sm mt-1">إدارة طلبات المتجر وشحنات ياليدين</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات', value: stats.total, color: 'bg-white', icon: '📦' },
          { label: 'قيد الانتظار',   value: stats.pending, color: 'bg-yellow-50 border-yellow-200', icon: '⏳' },
          { label: 'تم الشحن',       value: stats.shipped, color: 'bg-indigo-50 border-indigo-200', icon: '🚚' },
          { label: 'تم التوصيل',     value: stats.delivered, color: 'bg-green-50 border-green-200', icon: '✅' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl p-4 border text-center`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-ink">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '🏠 توصيل للمنزل', value: stats.home },
          { label: '🏢 مكتب ياليدين', value: stats.office },
          { label: '💵 عند الاستلام',  value: stats.cod },
          { label: '📱 بريدي موب',    value: stats.baridimob },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-3 border border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">{s.label}</span>
            <span className="font-black text-ink">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">إجمالي الإيرادات (بدون الملغية)</p>
          <p className="text-3xl font-black text-ink mt-0.5">{stats.revenue.toLocaleString()} <span className="text-base font-normal text-gray-500">دج</span></p>
        </div>
        <div className="text-4xl">💰</div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pr-10 text-sm" placeholder="ابحث بالاسم أو الهاتف أو المدينة..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input text-sm w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">جميع الحالات</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select className="input text-sm w-40" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="">جميع طرق الدفع</option>
          <option value="cash_on_delivery">💵 عند الاستلام</option>
          <option value="baridimob">📱 بريدي موب</option>
        </select>
        <select className="input text-sm w-44" value={deliveryFilter} onChange={e => setDeliveryFilter(e.target.value)}>
          <option value="">جميع أنواع التوصيل</option>
          <option value="home">🏠 توصيل للمنزل</option>
          <option value="office">🏢 مكتب ياليدين</option>
        </select>
        {(search || statusFilter || paymentFilter || deliveryFilter) && (
          <button onClick={() => { setSearch(''); setStatusFilter(''); setPaymentFilter(''); setDeliveryFilter('') }}
            className="flex items-center gap-1 text-sm text-rust hover:underline">
            <X className="w-4 h-4" /> مسح
          </button>
        )}
      </div>

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${!statusFilter ? 'bg-ink text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
          الكل ({orders.length})
        </button>
        {STATUS_OPTIONS.map(s => {
          const count = orders.filter(o => o.status === s.value).length
          return count > 0 ? (
            <button key={s.value} onClick={() => setStatusFilter(s.value === statusFilter ? '' : s.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${statusFilter === s.value ? s.color : 'bg-white border-gray-200 text-gray-600'}`}>
              {s.label} ({count})
            </button>
          ) : null
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد طلبات مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#', 'العميل', 'الولاية', 'التوصيل', 'الدفع', 'الإجمالي', 'رسوم ياليدين', 'الحالة', 'التاريخ', ''].map(h => (
                    <th key={h} className="text-right px-3 py-3 text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => {
                  const pm = PAYMENT_LABELS[order.payment_method]
                  const dt = DELIVERY_LABELS[order.delivery_type]
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <td className="px-3 py-3 font-bold text-ink text-xs">#{order.order_number}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-ink text-sm">{order.customer_name}</p>
                        <p className="text-gray-400 text-xs" dir="ltr">{order.customer_phone}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-medium text-ink">{order.customer_city}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`badge text-xs ${order.delivery_type === 'home' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {dt?.icon} {dt?.label || order.delivery_type}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`badge text-xs ${order.payment_method === 'baridimob' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {pm?.icon} {pm?.label || order.payment_method}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-ink">{Number(order.total).toLocaleString()} <span className="text-xs text-gray-400 font-normal">دج</span></td>
                      <td className="px-3 py-3 text-gold font-semibold text-xs">{Number(order.delivery_fee || 0).toLocaleString()} دج</td>
                      <td className="px-3 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-3 py-3 text-gray-400 text-xs">{format(new Date(order.created_at), 'dd/MM/yy')}</td>
                      <td className="px-3 py-3">
                        <button onClick={e => { e.stopPropagation(); setSelectedOrder(order) }}
                          className="p-1.5 bg-gray-100 rounded-lg hover:bg-gold hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchOrders}
        />
      )}
    </div>
  )
}
