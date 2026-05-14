import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ordersApi } from '../../lib/supabase'
import { ArrowLeft, Clock, CheckCircle, Truck, Tag } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_LABEL = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  processing: 'قيد التجهيز',
  shipped: 'في الطريق',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
  returned: 'مرتجع',
}

export default function Account() {
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoadingOrders(true)
      try {
        const { data, error } = await ordersApi.getByUser(user.id)
        if (error) throw error
        setOrders(data || [])
      } catch (error) {
        toast.error('تعذر تحميل الطلبات')
      }
      setLoadingOrders(false)
    }
    load()
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-ink">حسابي</h1>
            <p className="text-gray-500 mt-2">أنت مسجل دخول بحساب {user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => signOut().then(() => navigate('/'))} className="btn-outline">
              تسجيل الخروج
            </button>
            <button onClick={() => navigate('/')} className="btn-gold">
              العودة للمتجر
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="text-sm text-gray-500">معلومات الحساب</div>
            <div className="text-2xl font-bold text-ink">{user.email}</div>
            <div className="text-sm text-gray-600">معرّف المستخدم: <span className="font-medium">{user.id}</span></div>
            <div className="rounded-2xl bg-gold/10 border border-gold/20 p-4 text-sm text-gold">أي طلب تقوم به سيتم ربطه بهذا الحساب وحفظه في تاريخ طلباتك.</div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-ink">سجل الطلبات</h2>
                <p className="text-sm text-gray-500 mt-1">عرض أحدث الطلبات المرتبطة بحسابك.</p>
              </div>
              <button onClick={() => navigate('/')} className="text-sm font-semibold text-gold hover:text-gold-dark">تصفح الكتب</button>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-semibold mb-2">لم تقم بأي طلبات بعد</p>
                <p className="text-sm">ابدأ الآن باختيار كتبك المفضلة وإتمام الطلب.</p>
                <button onClick={() => navigate('/')} className="btn-gold mt-6">اذهب للمتجر</button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-3xl p-5 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">طلب #{order.order_number}</p>
                        <p className="text-lg font-bold text-ink">{STATUS_LABEL[order.status] || order.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">التاريخ</p>
                        <p className="font-semibold text-ink">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm text-gray-600">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.1em] text-gray-400">المدفوع</p>
                        <p className="font-bold text-ink mt-2">{Number(order.total).toLocaleString()} دج</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.1em] text-gray-400">طريقة الدفع</p>
                        <p className="font-bold mt-2">{order.payment_method.replace('_', ' ')}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.1em] text-gray-400">التوصيل</p>
                        <p className="font-bold mt-2">{order.delivery_type === 'home' ? 'للمنزل' : 'مكتب ياليدين'}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-3xl bg-white p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                        <Tag className="w-4 h-4" /> <span>الكتب في الطلب</span>
                      </div>
                      <div className="space-y-3">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-ink">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.quantity} × {Number(item.price).toLocaleString()} دج</p>
                            </div>
                            <p className="font-bold text-gold">{Number(item.subtotal).toLocaleString()} دج</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
