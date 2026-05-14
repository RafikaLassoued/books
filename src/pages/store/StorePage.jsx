import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Search, Menu, X, Star, Truck, Tag, BookOpen,
  MessageCircle, Instagram, Facebook, Twitter, Youtube, Link2,
  Plus, Minus, Trash2, ArrowLeft, CheckCircle, MapPin, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { booksApi, categoriesApi, ordersApi } from '../../lib/supabase'
import { useReviews } from '../../hooks/useReviews'
import { ReviewsCarousel } from '../../components/ReviewsCarousel'
import { WILAYAS, PAYMENT_METHODS, DELIVERY_TYPES } from '../../lib/algeria'

// ==================== Book Card ====================
function BookCard({ book, onAddToCart, onSelect }) {
  const discount = book.original_price ? Math.round((1 - book.price / book.original_price) * 100) : null
  return (
    <div onClick={() => onSelect?.(book)} className="card group cursor-pointer">
      <div className="relative overflow-hidden">
        <img src={book.image_url || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'} alt={book.title}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
        {discount && <span className="absolute top-3 right-3 bg-rust text-white text-xs font-bold px-2 py-1 rounded-full">-{discount}%</span>}
        {book.is_new_release && <span className="absolute top-3 left-3 bg-gold text-white text-xs font-bold px-2 py-1 rounded-full">جديد</span>}
      </div>
      <div className="p-5">
        <p className="text-gold text-xs font-medium mb-1">{book.category}</p>
        <h3 className="font-bold text-ink text-base mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-gray-500 text-sm mb-3">{book.author}</p>
        {book.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            <span className="text-xs text-gray-600">{book.rating}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-ink">{Number(book.price).toLocaleString()}</span>
            <span className="text-xs text-gray-500 mr-1">دج</span>
            {book.original_price && <span className="text-xs text-gray-400 line-through mr-1">{Number(book.original_price).toLocaleString()}</span>}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onAddToCart(book) }} className="bg-gold text-white p-2.5 rounded-xl hover:bg-gold-dark transition-all hover:shadow-lg hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== Cart Drawer ====================
function CartDrawer({ isOpen, onClose, onCheckout }) {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart()
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed top-0 left-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-cream-dark">
          <h2 className="text-xl font-black text-ink">سلة المشتريات</h2>
          <button onClick={onClose} className="p-2 hover:bg-cream-dark rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>سلتك فارغة</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="bg-white rounded-2xl p-4 flex gap-4">
              <img src={item.image_url} alt={item.title} className="w-16 h-20 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-ink line-clamp-1">{item.title}</h4>
                <p className="text-gold font-bold mt-1">{Number(item.price).toLocaleString()} دج</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 bg-cream-dark rounded-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors"><Minus className="w-3 h-3" /></button>
                  <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 bg-cream-dark rounded-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-rust transition-colors self-start mt-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t border-cream-dark bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">إجمالي الكتب</span>
              <span className="text-2xl font-black text-ink">{subtotal.toLocaleString()} دج</span>
            </div>
            <button onClick={onCheckout} className="btn-gold w-full justify-center text-base py-4">
              إتمام الطلب <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function BookDetailModal({ book, loading, onClose, onAddToCart }) {
  if (!book && !loading) return null
  if (loading && !book) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-10 text-center">
          <p className="text-ink font-black text-lg">جاري تحميل التفاصيل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
            <div className="rounded-full bg-ink/10 px-5 py-3 text-ink font-bold">جاري تحميل التفاصيل...</div>
          </div>
        )}
        <div className="relative">
          <img src={book?.image_url || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200'} alt={book?.title || 'كتاب'}
            className="w-full h-72 object-cover" />
          <button onClick={onClose} className="absolute top-4 left-4 bg-white/90 rounded-full p-2 hover:bg-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.25em] text-gold font-bold">{book.category || 'عام'}</p>
              <h2 className="text-3xl font-black text-ink">{book.title}</h2>
              <p className="text-gray-500">{book.author}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-ink">{Number(book.price).toLocaleString()} دج</p>
              {book.original_price && <p className="text-sm text-gray-400 line-through">{Number(book.original_price).toLocaleString()} دج</p>}
            </div>
          </div>
          {book.description && <p className="text-sm leading-relaxed text-gray-600">{book.description}</p>}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>
              <p className="text-xs text-gray-400">اللغة</p>
              <p className="font-semibold text-ink">{book.language || 'عربية'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">المخزون</p>
              <p className="font-semibold text-ink">{book.stock ?? 'غير محدد'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">عدد الصفحات</p>
              <p className="font-semibold text-ink">{book.pages ?? 'غير متوفر'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">سنة النشر</p>
              <p className="font-semibold text-ink">{book.publish_year ?? 'غير متوفر'}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => { onAddToCart(book); onClose() }} className="btn-gold w-full justify-center py-3">
              إضافة إلى السلة
            </button>
            <button onClick={onClose} className="btn-outline w-full justify-center py-3">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Order Modal ====================
function OrderModal({ isOpen, onClose }) {
  const { cart, subtotal, clearCart } = useCart()
  const { settings } = useSettings()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [wilayaSearch, setWilayaSearch] = useState('')
  const [wilayaOpen, setWilayaOpen] = useState(false)
  const [selectedWilaya, setSelectedWilaya] = useState(null)
  const [deliveryType, setDeliveryType] = useState('home')
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery')
  const [form, setForm] = useState({ name: '', phone: '', address: '', commune: '', notes: '' })

  const deliveryFee = selectedWilaya
    ? (deliveryType === 'home' ? selectedWilaya.home : selectedWilaya.office)
    : 0
  const total = subtotal + deliveryFee

  const filteredWilayas = WILAYAS.filter(w =>
    w.name.includes(wilayaSearch) || w.code.startsWith(wilayaSearch)
  )

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !selectedWilaya) { toast.error('يرجى إكمال جميع البيانات المطلوبة'); return }
    if (deliveryType === 'home' && !form.address) { toast.error('يرجى إدخال عنوان المنزل التفصيلي'); return }
    setLoading(true)
    try {
      const orderData = {
        user_id: null,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: '',
        customer_address: deliveryType === 'home' ? `${form.commune ? form.commune + ' - ' : ''}${form.address}` : `مكتب ياليدين - ${selectedWilaya.name}`,
        customer_city: selectedWilaya.name,
        customer_state: `${selectedWilaya.name} (${selectedWilaya.code})`,
        notes: form.notes,
        payment_method: paymentMethod,
        delivery_company: 'yalidine',
        delivery_type: deliveryType,
        delivery_fee: deliveryFee,
        subtotal, discount: 0, total,
        source: 'website', status: 'pending',
      }
      const order = await ordersApi.create(orderData, cart)

      if (window.fbq) window.fbq('track', 'Purchase', { value: total, currency: 'DZD' })
      if (window.ttq) window.ttq.track('PlaceAnOrder', { value: total, currency: 'DZD' })

      const waNumber = settings.whatsapp_number || '213XXXXXXXXX'
      const dtLabel = DELIVERY_TYPES[deliveryType].label
      const pmLabel = PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label
      const msg =
        `🛍️ *طلب جديد #${order.order_number || ''}*\n\n` +
        `👤 *الاسم:* ${form.name}\n📞 *الهاتف:* ${form.phone}\n` +
        `📍 *الولاية:* ${selectedWilaya.code} - ${selectedWilaya.name}\n` +
        (form.commune ? `🏘️ *البلدية:* ${form.commune}\n` : '') +
        `🚚 *التوصيل:* ياليدين - ${dtLabel}\n` +
        (deliveryType === 'home' ? `🏠 *العنوان:* ${form.address}\n` : '') +
        `\n📚 *الكتب:*\n${cart.map(i => `• ${i.title} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString()} دج`).join('\n')}\n\n` +
        `📦 *رسوم ياليدين:* ${deliveryFee.toLocaleString()} دج\n` +
        `💳 *الدفع:* ${pmLabel}\n` +
        `💰 *الإجمالي:* ${total.toLocaleString()} دج` +
        (form.notes ? `\n📝 *ملاحظة:* ${form.notes}` : '')

      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank')
      clearCart()
      setStep(3)
    } catch (e) { toast.error('حدث خطأ أثناء إرسال الطلب'); console.error(e) }
    setLoading(false)
  }

  const resetAndClose = () => {
    setStep(1); setSelectedWilaya(null); setDeliveryType('home')
    setPaymentMethod('cash_on_delivery'); setForm({ name: '', phone: '', address: '', commune: '', notes: '' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-cream w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-ink text-white p-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-black">{step === 3 ? '✅ تم إرسال طلبك!' : 'إتمام الطلب'}</h3>
            {step !== 3 && <p className="text-white/50 text-xs mt-0.5">🚚 شركة التوصيل: ياليدين Express</p>}
          </div>
          {step !== 3 && <button onClick={resetAndClose} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>}
        </div>

        {step !== 3 && (
          <div className="flex bg-white border-b border-gray-100 flex-shrink-0">
            {['بيانات التوصيل', 'الدفع والتأكيد'].map((s, i) => (
              <div key={i} className={`flex-1 py-2.5 text-center text-xs font-bold transition-colors cursor-pointer ${step === i + 1 ? 'text-gold border-b-2 border-gold' : 'text-gray-400'}`}
                onClick={() => i === 0 && setStep(1)}>{s}</div>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-5">

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-2xl font-black text-ink mb-2">تم إرسال طلبك!</h4>
              <p className="text-gray-500 text-sm mb-1">تم إرسال تفاصيل طلبك عبر واتساب</p>
              <p className="text-gray-400 text-xs mb-5">سيتواصل معك فريقنا قريباً لتأكيد الطلب</p>
              <div className="bg-gold/10 border border-gold/20 rounded-2xl p-4 text-right space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">الولاية</span><strong>{selectedWilaya?.name}</strong></div>
                <div className="flex justify-between"><span className="text-gray-500">نوع التوصيل</span><strong>{DELIVERY_TYPES[deliveryType]?.label} - ياليدين</strong></div>
                <div className="flex justify-between"><span className="text-gray-500">رسوم التوصيل</span><strong className="text-gold">{deliveryFee.toLocaleString()} دج</strong></div>
                <div className="flex justify-between border-t border-gold/20 pt-2"><span className="font-bold">الإجمالي الكلي</span><strong className="text-ink text-base">{total.toLocaleString()} دج</strong></div>
              </div>
              <button onClick={resetAndClose} className="btn-gold mt-5 w-full justify-center">العودة للمتجر</button>
            </div>
          )}

          {/* Step 1: Delivery */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">الاسم الكامل *</label>
                  <input className="input text-sm" placeholder="محمد أحمد" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">رقم الهاتف *</label>
                  <input className="input text-sm" dir="ltr" type="tel" placeholder="0XXXXXXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              {/* Wilaya */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">الولاية *</label>
                <div className="relative">
                  <button type="button" onClick={() => setWilayaOpen(!wilayaOpen)}
                    className={`input text-sm flex items-center justify-between w-full text-right ${!selectedWilaya && 'text-gray-400'}`}>
                    <span>{selectedWilaya ? `(${selectedWilaya.code}) ${selectedWilaya.name}` : 'اختر الولاية...'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${wilayaOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {wilayaOpen && (
                    <div className="absolute top-full right-0 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 mt-1 overflow-hidden">
                      <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <input className="input text-sm py-2" placeholder="🔍 ابحث بالاسم أو الرقم..." value={wilayaSearch} onChange={e => setWilayaSearch(e.target.value)} autoFocus />
                      </div>
                      <div className="overflow-y-auto max-h-48">
                        {filteredWilayas.map(w => (
                          <button key={w.code} type="button"
                            onClick={() => { setSelectedWilaya(w); setWilayaOpen(false); setWilayaSearch('') }}
                            className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gold/10 text-sm transition-colors text-right">
                            <span><span className="text-gray-400 text-xs ml-2 font-mono">{w.code}</span>{w.name}</span>
                            <div className="text-xs text-right space-y-0.5 mr-2">
                              <div className="text-gray-600">🏠 {w.home.toLocaleString()} دج</div>
                              <div className="text-gray-400">🏢 {w.office.toLocaleString()} دج</div>
                            </div>
                          </button>
                        ))}
                        {filteredWilayas.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">لا توجد نتائج</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery type */}
              <div>
                <label className="block text-xs font-bold text-ink mb-2">نوع التوصيل *</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(DELIVERY_TYPES).map(([key, dt]) => {
                    const fee = selectedWilaya ? (key === 'home' ? selectedWilaya.home : selectedWilaya.office) : null
                    const selected = deliveryType === key
                    return (
                      <button key={key} type="button" onClick={() => setDeliveryType(key)}
                        className={`flex flex-col items-start p-3.5 rounded-2xl border-2 text-right transition-all ${selected ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold/40 bg-white'}`}>
                        <div className="flex items-center gap-2 mb-1 w-full">
                          <span className="text-xl">{dt.icon}</span>
                          <span className={`font-bold text-sm ${selected ? 'text-gold' : 'text-ink'}`}>{dt.label}</span>
                          {selected && <CheckCircle className="w-4 h-4 text-gold mr-auto" />}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{dt.desc}</p>
                        {fee !== null
                          ? <span className={`font-black text-sm ${selected ? 'text-gold' : 'text-gray-700'}`}>{fee.toLocaleString()} دج</span>
                          : <span className="text-xs text-gray-300">اختر الولاية أولاً</span>
                        }
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Address fields (home only) */}
              {deliveryType === 'home' && (
                <div className="space-y-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs font-bold text-blue-700 flex items-center gap-1"><MapPin className="w-3 h-3" /> عنوان التوصيل</p>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">البلدية</label>
                    <input className="input text-sm bg-white" placeholder="مثال: حيدرة، باب الزوار، سيدي موسى..." value={form.commune} onChange={e => setForm(f => ({ ...f, commune: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">العنوان التفصيلي *</label>
                    <textarea className="input text-sm resize-none bg-white" rows={2} placeholder="الشارع، الحي، رقم المبنى، الطابق..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                </div>
              )}

              {deliveryType === 'office' && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-xs text-amber-700">
                  <p className="font-bold mb-1">📦 استلام من مكتب ياليدين</p>
                  <p>سيتم إعلامك برقم الطرد ومعلومات المكتب عبر واتساب بعد شحن الطلب.</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">ملاحظات إضافية</label>
                <textarea className="input text-sm resize-none" rows={2} placeholder="أي تعليمات خاصة..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <button onClick={() => setStep(2)} className="btn-gold w-full justify-center py-3.5 text-base">
                التالي: اختيار الدفع <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Payment + Summary */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-2">طريقة الدفع *</label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(pm => (
                    <label key={pm.value}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === pm.value ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold/40 bg-white'}`}>
                      <input type="radio" name="payment" value={pm.value} checked={paymentMethod === pm.value} onChange={() => setPaymentMethod(pm.value)} className="hidden" />
                      <span className="text-3xl">{pm.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-ink">{pm.label}</p>
                        <p className="text-xs text-gray-500">{pm.desc}</p>
                      </div>
                      {paymentMethod === pm.value && <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />}
                    </label>
                  ))}
                </div>

                {paymentMethod === 'baridimob' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-3">
                    <p className="font-bold text-yellow-800 mb-2 text-sm">📱 كيفية الدفع ببريدي موب:</p>
                    <ol className="text-yellow-700 space-y-1 text-xs list-decimal list-inside">
                      <li>افتح تطبيق <strong>بريدي موب</strong> أو <strong>Baridi Pay</strong></li>
                      <li>اذهب إلى "تحويل" → "تحويل إلى حساب CCP"</li>
                      <li>أدخل رقم CCP الخاص بالمتجر: <strong className="font-mono">XXXXXXXX / مفتاح XX</strong></li>
                      <li>أدخل مبلغ: <strong>{total.toLocaleString()} دج</strong></li>
                      <li>أرسل صورة الإيصال على واتساب بعد التأكيد</li>
                    </ol>
                    <p className="text-xs text-yellow-600 mt-2 font-medium">⚠️ لن يُشحن الطلب إلا بعد التأكد من استلام الدفع</p>
                  </div>
                )}
              </div>

              {/* Order summary */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <h4 className="font-bold text-ink mb-3 text-sm border-b pb-2">ملخص الطلب</h4>
                <div className="space-y-1.5 mb-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-600">
                      <span className="flex-1 ml-2 line-clamp-1">{item.title} × {item.quantity}</span>
                      <span className="font-medium whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} دج</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600"><span>مجموع الكتب</span><span>{subtotal.toLocaleString()} دج</span></div>
                  <div className="flex justify-between text-gray-600">
                    <span>رسوم ياليدين ({DELIVERY_TYPES[deliveryType]?.label})</span>
                    <span className="text-gold font-semibold">{deliveryFee.toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between font-black text-ink text-base border-t pt-2 mt-1">
                    <span>المبلغ الإجمالي</span><span>{total.toLocaleString()} دج</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 mt-3 text-xs text-gray-500 flex flex-wrap gap-2">
                  <span>📍 {selectedWilaya?.name}</span>
                  <span>•</span>
                  <span>{DELIVERY_TYPES[deliveryType]?.icon} {DELIVERY_TYPES[deliveryType]?.label}</span>
                  <span>•</span>
                  <span>{PAYMENT_METHODS.find(p => p.value === paymentMethod)?.icon} {PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 justify-center text-sm py-3">رجوع</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-gold flex-1 justify-center text-sm py-3">
                  {loading ? 'جاري الإرسال...' : '✓ تأكيد الطلب'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== Main Store Page ====================
export default function StorePage() {
  const { addToCart, totalItems } = useCart()
  const { settings } = useSettings()
  const { reviews, loading: reviewsLoading, error: reviewsError } = useReviews(true)
  const [books, setBooks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedBookLoading, setSelectedBookLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [cartOpen, setCartOpen] = useState(false)
  const [orderOpen, setOrderOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loadingBooks, setLoadingBooks] = useState(true)
  const booksRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      setLoadingBooks(true)
      try {
        const [booksData, categoriesData] = await Promise.all([booksApi.getAll(), categoriesApi.getAll()])
        setBooks(booksData || [])
        setFiltered(booksData || [])
        setCategories(categoriesData || [])
      } catch (error) {
        toast.error('تعذر تحميل الكتب. حاول مرة أخرى لاحقاً.')
      }
      setLoadingBooks(false)
    }

    loadData()
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let result = [...books]
    if (activeCategory !== 'الكل') result = result.filter(b => b.category === activeCategory)
    if (searchQuery) result = result.filter(b => b.title.includes(searchQuery) || b.author.includes(searchQuery))
    if (sort === 'featured') result = [...result.filter(b => b.is_featured), ...result.filter(b => !b.is_featured)]
    else if (sort === 'price_asc') result.sort((a, b) => a.price - b.price)
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price)
    else if (sort === 'newest') result = [...result.filter(b => b.is_new_release), ...result.filter(b => !b.is_new_release)]
    setFiltered(result)
  }, [activeCategory, searchQuery, sort, books])

  const handleAddToCart = (book) => {
    addToCart(book)
    toast.success(`تمت إضافة "${book.title}"`, { icon: '📚' })
  }

  const handleSelectBook = async (book) => {
    setSelectedBookLoading(true)
    try {
      const latestBook = await booksApi.getById(book.id)
      setSelectedBook(latestBook || book)
    } catch (error) {
      console.error('Error fetching latest book details:', error)
      setSelectedBook(book)
    } finally {
      setSelectedBookLoading(false)
    }
  }

  const categoryList = [{ name: 'الكل', icon: '📚' }, ...categories.filter(c => c.name).map(c => ({ name: c.name, icon: c.icon || '🏷️' }))]

  const storeName = settings.store_name || 'مكتبة الكتب'
  const whatsapp = settings.whatsapp_number || '213XXXXXXXXX'
  const heroTitle = settings.hero_title || 'اكتشف أفضل الكتب التي تستحق القراءة'
  const heroSubtitle = settings.hero_subtitle || 'توصيل ياليدين لجميع ولايات الجزائر الـ 58 | دفع عند الاستلام أو بريدي موب'

  return (
    <div className="min-h-screen bg-cream font-body">
      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-30 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <span className="text-2xl font-display font-bold">
              <span className="text-gold">{storeName.slice(0, 3)}</span>{storeName.slice(3)}
            </span>
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
              {[['#home','الرئيسية'],['#books','الكتب'],['#categories','التصنيفات'],['#testimonials','التقييمات']].map(([h,l]) => (
                <a key={h} href={h} className="hover:text-gold transition-colors">{l}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => setCartOpen(true)} className="relative p-2.5 bg-ink text-white rounded-xl hover:bg-gold transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-rust text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
              </button>
            </div>
            <div className="md:hidden flex items-center gap-3">
              <button onClick={() => setCartOpen(true)} className="relative p-2.5 bg-ink text-white rounded-xl hover:bg-gold transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-1 -right-1 bg-rust text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2"><Menu className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-cream-dark px-4 py-4 space-y-3">
            {[['#home','الرئيسية'],['#books','الكتب'],['#categories','التصنيفات'],['#testimonials','التقييمات']].map(([h,l]) => (
              <a key={h} href={h} onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold hover:text-gold py-1">{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-light to-[#2D1B00]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("${settings.hero_image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400'}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/30 text-gold text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Truck className="w-4 h-4" /> توصيل ياليدين · 58 ولاية
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">{heroTitle}</h1>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">{heroSubtitle}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => booksRef.current?.scrollIntoView({ behavior: 'smooth' })} className="btn-gold text-base px-8 py-4">
              تصفح الكتب <ArrowLeft className="w-5 h-5" />
            </button>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#20BA5A] transition-all hover:shadow-lg">
              <MessageCircle className="w-5 h-5" /> واتساب
            </a>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[['58 ولاية','التغطية'],['ياليدين','التوصيل'],['4.9★','التقييم']].map(([n,l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-black text-gold">{n}</div>
                <div className="text-white/60 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <BookOpen className="w-6 h-6" />, title: 'مكتبة ضخمة', desc: 'آلاف الكتب في مختلف المجالات والتصنيفات' },
              { icon: <Truck className="w-6 h-6" />, title: 'ياليدين Express', desc: 'توصيل للمنزل أو استلام من أقرب مكتب · جميع الولايات' },
              { icon: <Tag className="w-6 h-6" />, title: 'دفع مرن', desc: 'نقداً عند الاستلام أو إلكترونياً ببريدي موب' },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl hover:bg-cream transition-colors">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold flex-shrink-0">{f.icon}</div>
                <div><h3 className="font-bold text-ink mb-1">{f.title}</h3><p className="text-gray-500 text-sm">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12 bg-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categoryList.map(cat => (
              <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-sm font-semibold ${activeCategory === cat.name ? 'bg-gold text-white border-gold shadow-md shadow-gold/20' : 'bg-white text-ink border-white/80 hover:bg-gold/10 hover:text-gold'}`}>
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Books */}
      <section id="books" ref={booksRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-ink">مجموعة الكتب</h2>
              <p className="text-gray-500 mt-1">{filtered.length} كتاب متاح</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pr-10 w-48 text-sm" placeholder="ابحث عن كتاب..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <select className="input text-sm w-40" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="featured">الأكثر مبيعاً</option>
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: الأقل</option>
                <option value="price_desc">السعر: الأعلى</option>
              </select>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>لا توجد كتب مطابقة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(book => (
                <BookCard key={book.id} book={book} onAddToCart={handleAddToCart} onSelect={handleSelectBook} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-3">آراء عملائنا</h2>
            <p className="text-white/60">تجارب حقيقية من قراء في مختلف الولايات</p>
          </div>
          
          {/* Dynamic Reviews Carousel */}
          {reviews && reviews.length > 0 ? (
            <ReviewsCarousel reviews={reviews} loading={reviewsLoading} error={reviewsError} />
          ) : (
            /* Fallback Static Reviews */
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'أحمد - الجزائر العاصمة', rating: 5, text: 'توصيل ياليدين سريع جداً، استلمت كتبي في 24 ساعة فقط. خدمة ممتازة!' },
                { name: 'سارة - وهران', rating: 5, text: 'دفعت ببريدي موب وكان سهلاً جداً. الكتب وصلت بحالة مثالية. أنصح بهذا المتجر.' },
                { name: 'كريم - قسنطينة', rating: 5, text: 'اخترت الاستلام من مكتب ياليدين وكان الأسرع. سعر التوصيل مناسب جداً.' },
              ].map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <div className="flex gap-1 mb-4">{Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-gold text-gold" />)}</div>
                  <p className="text-white/80 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center text-gold font-bold text-sm">{t.name[0]}</div>
                    <p className="font-semibold text-sm">{t.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-display font-bold mb-3"><span className="text-gold">{storeName.slice(0,3)}</span>{storeName.slice(3)}</h3>
              <p className="text-white/60 text-sm leading-relaxed">توصيل عبر ياليدين لجميع ولايات الجزائر. الدفع نقداً عند الاستلام أو ببريدي موب.</p>
              <div className="flex items-center gap-2 mt-3 text-white/40 text-xs"><MapPin className="w-3 h-3" /> الجزائر · 58 ولاية</div>
            </div>
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-white/60">
                {[['#home','الرئيسية'],['#books','الكتب'],['#categories','التصنيفات'],['#testimonials','التقييمات']].map(([h,l]) => (
                  <li key={h}><a href={h} className="hover:text-gold transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">تابعنا</h4>
              <div className="flex flex-wrap gap-3">
              {settings.facebook_url && <a key="fb" href={settings.facebook_url} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors"><Facebook className="w-4 h-4" /></a>}
              {settings.instagram_url && <a key="ig" href={settings.instagram_url} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors"><Instagram className="w-4 h-4" /></a>}
              {settings.twitter_url && <a key="tw" href={settings.twitter_url} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors"><Twitter className="w-4 h-4" /></a>}
              {settings.youtube_url && <a key="yt" href={settings.youtube_url} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors"><Youtube className="w-4 h-4" /></a>}
              {settings.tiktok_url && <a key="tt" href={settings.tiktok_url} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors" title="TikTok"><Link2 className="w-4 h-4" /></a>}
              {settings.snapchat_url && <a key="sc" href={settings.snapchat_url} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors" title="Snapchat"><Link2 className="w-4 h-4" /></a>}
              {settings.whatsapp_number && <a key="wa" href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors" title="WhatsApp"><MessageCircle className="w-4 h-4" /></a>}
            </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-white/40 text-xs">
            <p>© 2024 {storeName} | التوصيل عبر ياليدين | الدفع نقداً أو بريدي موب | جميع الولايات الـ 58</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${whatsapp}?text=مرحباً، أود الاستفسار عن الكتب المتوفرة`} target="_blank" rel="noreferrer"
        className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform border-2 border-white">
        <MessageCircle className="w-7 h-7 text-white" />
      </a>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setOrderOpen(true) }} />
      <BookDetailModal book={selectedBook} loading={selectedBookLoading} onClose={() => setSelectedBook(null)} onAddToCart={handleAddToCart} />
      <OrderModal isOpen={orderOpen} onClose={() => setOrderOpen(false)} />
    </div>
  )
}
