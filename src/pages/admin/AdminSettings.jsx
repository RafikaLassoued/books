import { useState, useEffect } from 'react'
import { Save, Store, Truck, CreditCard, Share2, Code, Eye, EyeOff, RefreshCw, MapPin, ChevronDown, ChevronUp, UserPlus, ShieldCheck, Trash2, Plus } from 'lucide-react'
import { settingsApi } from '../../lib/supabase'
import { WILAYAS } from '../../lib/algeria'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'store',    label: 'المتجر',               icon: '🏪' },
  { id: 'delivery', label: 'التوصيل - ياليدين',    icon: '🚚' },
  { id: 'payment',  label: 'الدفع',                icon: '💳' },
  { id: 'social',   label: 'التواصل الاجتماعي',    icon: '📱' },
  { id: 'pixels',   label: 'بيكسل التتبع',         icon: '📊' },
]

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-sm text-ink">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <div className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative flex-shrink-0 ${value ? 'bg-gold' : 'bg-gray-200'}`} onClick={() => onChange(!value)}>
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${value ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  )
}

function SecretField({ label, hint, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input type={show ? 'text' : 'password'} className="input text-sm pl-10" placeholder={placeholder || 'أدخل القيمة...'} value={value || ''} onChange={e => onChange(e.target.value)} dir="ltr" />
        <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  )
}

// ==================== Wilaya Price Editor ====================
function WilayaPriceEditor({ settings, onUpdate }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)

  // Parse custom prices from settings JSON (fallback to defaults)
  const customPrices = (() => {
    try { return JSON.parse(settings.yalidine_custom_prices || '{}') }
    catch { return {} }
  })()

  const getPrice = (code, type) => {
    const w = WILAYAS.find(w => w.code === code)
    if (!w) return 0
    const custom = customPrices[code]
    if (custom && custom[type] !== undefined) return custom[type]
    return w[type]
  }

  const updatePrice = (code, type, val) => {
    const updated = { ...customPrices, [code]: { ...customPrices[code], [type]: parseInt(val) || 0 } }
    onUpdate({ yalidine_custom_prices: JSON.stringify(updated) })
  }

  const resetAll = () => {
    if (!confirm('هل تريد إعادة ضبط جميع الأسعار للقيم الافتراضية؟')) return
    onUpdate({ yalidine_custom_prices: '{}' })
    toast.success('تم إعادة الضبط')
  }

  const filtered = WILAYAS.filter(w => w.name.includes(search) || w.code.startsWith(search))
  const displayed = expanded ? filtered : filtered.slice(0, 12)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-ink">أسعار التوصيل حسب الولاية</h3>
          <p className="text-xs text-gray-500 mt-0.5">عدّل سعر أي ولاية، اتركه فارغاً للسعر الافتراضي</p>
        </div>
        <button onClick={resetAll} className="text-xs text-rust hover:underline">إعادة ضبط الكل</button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold"><span>🏠</span> للمنزل (دج)</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold"><span>🏢</span> مكتب ياليدين (دج)</div>
      </div>

      <div className="relative mb-3">
        <input className="input text-sm pr-10" placeholder="🔍 ابحث عن ولاية..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displayed.map(w => {
          const hasCustom = customPrices[w.code]
          return (
            <div key={w.code} className={`bg-white rounded-xl p-3 border ${hasCustom ? 'border-gold/50 bg-gold/5' : 'border-gray-100'} flex items-center gap-3`}>
              <div className="flex-shrink-0 text-center w-8">
                <span className="text-xs font-mono text-gray-400 block">{w.code}</span>
                <span className="text-xs font-bold text-ink">{w.name.slice(0, 6)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink truncate">{w.name}</p>
                {hasCustom && <span className="text-xs text-gold">✏️ مخصص</span>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <div className="text-center">
                  <span className="text-xs text-blue-400 block mb-0.5">🏠</span>
                  <input
                    type="number" min="0" step="50"
                    className="w-20 border border-blue-200 rounded-lg px-1.5 py-1 text-xs text-center focus:outline-none focus:border-gold"
                    value={getPrice(w.code, 'home')}
                    onChange={e => updatePrice(w.code, 'home', e.target.value)}
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-400 block mb-0.5">🏢</span>
                  <input
                    type="number" min="0" step="50"
                    className="w-20 border border-gray-200 rounded-lg px-1.5 py-1 text-xs text-center focus:outline-none focus:border-gold"
                    value={getPrice(w.code, 'office')}
                    onChange={e => updatePrice(w.code, 'office', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length > 12 && (
        <button onClick={() => setExpanded(!expanded)} className="w-full mt-3 py-2 text-sm text-gold hover:text-gold-dark font-semibold flex items-center justify-center gap-1 transition-colors">
          {expanded ? <><ChevronUp className="w-4 h-4" /> إخفاء</>  : <><ChevronDown className="w-4 h-4" /> عرض جميع الولايات ({filtered.length})</>}
        </button>
      )}
    </div>
  )
}

// ==================== Main Settings ====================
export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('store')
  const [settings, setSettings] = useState({})
  const [adminUsers, setAdminUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi.getAll().then(data => { setSettings(data); setLoading(false) })
  }, [])

  useEffect(() => {
    if (settings.admins) {
      try { setAdminUsers(JSON.parse(settings.admins)) }
      catch { setAdminUsers([]) }
    } else if (!adminUsers.length && !loading) {
      setAdminUsers([{ id: 1, name: 'مدير النظام', email: 'admin@bookstore.com', role: 'مدير', status: 'نشط' }])
    }
  }, [settings, loading])

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))
  const setMany = (obj) => setSettings(s => ({ ...s, ...obj }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...settings, admins: JSON.stringify(adminUsers) }
      await settingsApi.update(payload)
      setSettings(payload)
      toast.success('تم حفظ الإعدادات ✓')
    } catch { toast.error('حدث خطأ أثناء الحفظ') }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">إعدادات المتجر</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة جميع إعدادات المنصة</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-gold text-sm">
          {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : <><Save className="w-4 h-4" /> حفظ الإعدادات</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-ink text-white shadow-sm' : 'text-gray-500 hover:text-ink hover:bg-gray-50'}`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

        {/* ===== STORE TAB ===== */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-ink border-b pb-3">معلومات المتجر الأساسية</h2>
            <div className="grid grid-cols-2 gap-5">
              <Field label="اسم المتجر">
                <input className="input text-sm" value={settings.store_name || ''} onChange={e => set('store_name', e.target.value)} />
              </Field>
              <Field label="رقم واتساب" hint="بدون + أو 00 — مثال: 213XXXXXXXXX">
                <input className="input text-sm" dir="ltr" placeholder="213XXXXXXXXX" value={settings.whatsapp_number || ''} onChange={e => set('whatsapp_number', e.target.value)} />
              </Field>
              <Field label="هاتف المتجر">
                <input className="input text-sm" dir="ltr" value={settings.store_phone || ''} onChange={e => set('store_phone', e.target.value)} />
              </Field>
              <Field label="البريد الإلكتروني">
                <input className="input text-sm" type="email" value={settings.store_email || ''} onChange={e => set('store_email', e.target.value)} />
              </Field>
            </div>
            <Field label="عنوان المتجر / الولاية">
              <input className="input text-sm" placeholder="مثال: الجزائر العاصمة" value={settings.store_address || ''} onChange={e => set('store_address', e.target.value)} />
            </Field>

            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-ink">إدارة المستخدمين</h3>
                  <p className="text-sm text-gray-500">تحكم في حسابات الأدمن وصلاحيات الوصول.</p>
                </div>
                <button type="button" onClick={() => setAdminUsers(prev => [...prev, { id: Date.now(), name: '', email: '', role: 'محرر', status: 'نشط' }])}
                  className="btn-outline text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> إضافة مستخدم
                </button>
              </div>
              <div className="space-y-3">
                {adminUsers.map((user, index) => (
                  <div key={user.id} className="grid grid-cols-1 gap-3 rounded-3xl bg-white border border-gray-100 p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{user.name || 'مستخدم جديد'}</p>
                        <p className="text-xs text-gray-400">{user.role}</p>
                      </div>
                      <button type="button" onClick={() => setAdminUsers(adminUsers.filter((_, idx) => idx !== index))}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> حذف
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input className="input text-sm" placeholder="الاسم" value={user.name} onChange={e => setAdminUsers(adminUsers.map((item, idx) => idx === index ? { ...item, name: e.target.value } : item))} />
                      <input className="input text-sm" placeholder="البريد الإلكتروني" value={user.email} onChange={e => setAdminUsers(adminUsers.map((item, idx) => idx === index ? { ...item, email: e.target.value } : item))} />
                      <select className="input text-sm" value={user.role} onChange={e => setAdminUsers(adminUsers.map((item, idx) => idx === index ? { ...item, role: e.target.value } : item))}>
                        <option value="مدير">مدير</option>
                        <option value="محرر">محرر</option>
                        <option value="مشرف">مشرف</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center justify-between text-xs text-gray-500">
                      <span>الحالة: {user.status}</span>
                      <button type="button" onClick={() => setAdminUsers(adminUsers.map((item, idx) => idx === index ? { ...item, status: item.status === 'نشط' ? 'معطل' : 'نشط' } : item))}
                        className="text-ink hover:text-gold transition-colors">
                        {user.status === 'نشط' ? 'تعطيل المستخدم' : 'تفعيل المستخدم'}
                      </button>
                    </div>
                  </div>
                ))}
                {!adminUsers.length && <p className="text-gray-400 text-sm">لا يوجد مستخدمين بعد.</p>}
              </div>
            </div>

            <h2 className="text-lg font-bold text-ink border-b pb-3 pt-2">محتوى الصفحة الرئيسية</h2>
            <Field label="عنوان الهيرو الرئيسي">
              <input className="input text-sm" value={settings.hero_title || ''} onChange={e => set('hero_title', e.target.value)} />
            </Field>
            <Field label="النص التوضيحي">
              <textarea className="input text-sm resize-none" rows={2} value={settings.hero_subtitle || ''} onChange={e => set('hero_subtitle', e.target.value)} />
            </Field>
            <Field label="صورة الخلفية (URL)">
              <input className="input text-sm" dir="ltr" placeholder="https://..." value={settings.hero_image || ''} onChange={e => set('hero_image', e.target.value)} />
              {settings.hero_image && <img src={settings.hero_image} alt="" className="mt-2 h-24 w-full object-cover rounded-xl" />}
            </Field>
            <div className="grid grid-cols-2 gap-5">
              <Field label="العملة">
                <select className="input text-sm" value={settings.currency || 'DZD'} onChange={e => set('currency', e.target.value)}>
                  <option value="DZD">دينار جزائري (DZD)</option>
                  {/*<option value="SAR">دولار أمريكي (US)</option>
                  <option value="MAD"> أورو فرنسي (EU)</option>*/}
                </select>
              </Field>
              <Field label="رمز العملة">
                <input className="input text-sm" placeholder="دج" value={settings.currency_symbol || ''} onChange={e => set('currency_symbol', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* ===== DELIVERY TAB ===== */}
        {activeTab === 'delivery' && (
          <div className="space-y-8">

            {/* Yalidine header */}
            <div className="bg-gradient-to-l from-yellow-50 to-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="text-4xl">🚚</div>
              <div>
                <h3 className="font-black text-ink text-lg">ياليدين Express – Yalidine</h3>
                <p className="text-sm text-gray-600 mt-0.5">شركة التوصيل المعتمدة للمتجر | تغطية 58 ولاية</p>
                <div className="flex gap-3 mt-2">
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">🏠 توصيل للمنزل</span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-semibold">🏢 استلام من مكتب</span>
                </div>
              </div>
            </div>

            {/* Yalidine API */}
            <div>
              <h3 className="font-bold text-ink mb-4 border-b pb-2">ربط حساب ياليدين (API)</h3>
              <div className="grid grid-cols-2 gap-4">
                <SecretField label="API Token" hint="من لوحة تحكم ياليدين → API Keys" value={settings.yalidine_token} onChange={v => set('yalidine_token', v)} placeholder="eyJ..." />
                <SecretField label="Refresh Token" value={settings.yalidine_refresh_token} onChange={v => set('yalidine_refresh_token', v)} placeholder="eyJ..." />
              </div>
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                💡 للحصول على API Token: سجّل دخولك على <strong>yalidine.app</strong> → إعدادات الحساب → API Keys
              </div>
            </div>

            {/* Delivery toggles */}
            <div>
              <h3 className="font-bold text-ink mb-4 border-b pb-2">خيارات التوصيل</h3>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                <Toggle label="🏠 التوصيل للمنزل" desc="يصل المندوب لباب المنزل مباشرة" value={settings.delivery_home_enabled !== 'false'} onChange={v => set('delivery_home_enabled', String(v))} />
                <Toggle label="🏢 الاستلام من المكتب (Stop Desk)" desc="يستلم العميل من أقرب نقطة ياليدين بسعر أقل" value={settings.delivery_office_enabled !== 'false'} onChange={v => set('delivery_office_enabled', String(v))} />
              </div>
            </div>

            {/* Custom wilaya prices */}
            <div>
              <h3 className="font-bold text-ink mb-2 border-b pb-2">تخصيص أسعار الولايات</h3>
              <WilayaPriceEditor settings={settings} onUpdate={setMany} />
            </div>

            {/* Free delivery */}
            <div>
              <h3 className="font-bold text-ink mb-4 border-b pb-2">الشحن المجاني</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="حد الشحن المجاني (دج)" hint="يصبح التوصيل مجانياً عند بلوغ هذا المبلغ. 0 = معطّل">
                  <input className="input text-sm" type="number" min="0" step="100" value={settings.free_delivery_threshold || '0'} onChange={e => set('free_delivery_threshold', e.target.value)} />
                </Field>
                <div className="flex flex-col justify-end pb-1">
                  {parseInt(settings.free_delivery_threshold || 0) > 0
                    ? <p className="text-sm text-green-600 font-semibold">✅ شحن مجاني عند {parseInt(settings.free_delivery_threshold).toLocaleString()} دج</p>
                    : <p className="text-sm text-gray-400">الشحن المجاني معطّل</p>
                  }
                </div>
              </div>
            </div>

            {/* Wilaya preview table */}
            <div>
              <h3 className="font-bold text-ink mb-3 border-b pb-2">معاينة جدول الأسعار</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right px-3 py-2 text-gray-500 font-semibold">#</th>
                      <th className="text-right px-3 py-2 text-gray-500 font-semibold">الولاية</th>
                      <th className="text-right px-3 py-2 text-blue-500 font-semibold">🏠 للمنزل</th>
                      <th className="text-right px-3 py-2 text-gray-500 font-semibold">🏢 للمكتب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {WILAYAS.slice(0, 10).map(w => {
                      const custom = (() => { try { return JSON.parse(settings.yalidine_custom_prices || '{}')[w.code] } catch { return null } })()
                      return (
                        <tr key={w.code} className={custom ? 'bg-gold/5' : ''}>
                          <td className="px-3 py-2 font-mono text-gray-400">{w.code}</td>
                          <td className="px-3 py-2 font-semibold text-ink">{w.name}</td>
                          <td className="px-3 py-2 text-blue-600 font-bold">{(custom?.home ?? w.home).toLocaleString()} دج</td>
                          <td className="px-3 py-2 text-gray-500">{(custom?.office ?? w.office).toLocaleString()} دج</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p className="text-center text-xs text-gray-400 py-2">عرض أول 10 ولايات – عدّل الأسعار أعلاه لتغييرها</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== PAYMENT TAB ===== */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-ink border-b pb-3">طرق الدفع المتاحة</h2>

            <div className="bg-gray-50 rounded-2xl p-4">
              <Toggle label="💵 الدفع عند الاستلام" desc="يدفع العميل نقداً للمندوب عند استلام الطلب" value={settings.payment_cod_enabled !== 'false'} onChange={v => set('payment_cod_enabled', String(v))} />
              <Toggle label="📱 بريدي موب / Baridi Pay" desc="دفع إلكتروني عبر تطبيق بريدي موب أو الدفع عبر CCP" value={settings.payment_baridimob_enabled !== 'false'} onChange={v => set('payment_baridimob_enabled', String(v))} />
            </div>

            {/* Baridimob settings */}
            {settings.payment_baridimob_enabled !== 'false' && (
              <div className="border border-yellow-200 rounded-2xl overflow-hidden">
                <div className="bg-yellow-50 px-5 py-3 flex items-center gap-3 border-b border-yellow-200">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="font-bold text-ink text-sm">إعدادات بريدي موب / CCP</h3>
                    <p className="text-xs text-gray-500">هذه المعلومات تظهر للعميل عند اختيار هذه الطريقة</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="رقم حساب CCP">
                      <input className="input text-sm" dir="ltr" placeholder="XXXXXXXX" value={settings.baridimob_ccp || ''} onChange={e => set('baridimob_ccp', e.target.value)} />
                    </Field>
                    <Field label="المفتاح (Clé)">
                      <input className="input text-sm" dir="ltr" placeholder="XX" value={settings.baridimob_key || ''} onChange={e => set('baridimob_key', e.target.value)} />
                    </Field>
                    <Field label="الاسم الكامل لصاحب الحساب">
                      <input className="input text-sm" placeholder="محمد أحمد..." value={settings.baridimob_name || ''} onChange={e => set('baridimob_name', e.target.value)} />
                    </Field>
                    <Field label="رقم RIP (اختياري)">
                      <input className="input text-sm" dir="ltr" placeholder="00799999XXXXXXXX XX" value={settings.baridimob_rip || ''} onChange={e => set('baridimob_rip', e.target.value)} />
                    </Field>
                  </div>
                  <Field label="تعليمات إضافية للعميل">
                    <textarea className="input text-sm resize-none" rows={2} placeholder="أي تعليمات تريد إظهارها للعميل عند اختيار بريدي موب..." value={settings.baridimob_instructions || ''} onChange={e => set('baridimob_instructions', e.target.value)} />
                  </Field>
                  {/* Preview */}
                  {(settings.baridimob_ccp || settings.baridimob_name) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                      <p className="font-bold text-yellow-800 mb-2">📱 معاينة ما يراه العميل:</p>
                      <ol className="text-yellow-700 space-y-1 text-xs list-decimal list-inside">
                        <li>افتح تطبيق بريدي موب أو Baridi Pay</li>
                        <li>اختر "تحويل" → "تحويل إلى حساب CCP"</li>
                        {settings.baridimob_ccp && <li>رقم CCP: <strong className="font-mono">{settings.baridimob_ccp}{settings.baridimob_key ? ` / مفتاح ${settings.baridimob_key}` : ''}</strong></li>}
                        {settings.baridimob_name && <li>باسم: <strong>{settings.baridimob_name}</strong></li>}
                        <li>أرسل صورة الإيصال على واتساب بعد الدفع</li>
                        {settings.baridimob_instructions && <li>{settings.baridimob_instructions}</li>}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== SOCIAL TAB ===== */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-ink border-b pb-3">روابط وسائل التواصل الاجتماعي</h2>
            <div className="space-y-4">
              {[
                { key: 'facebook_url',   label: '📘 فيسبوك',   placeholder: 'https://facebook.com/yourpage' },
                { key: 'instagram_url',  label: '📸 إنستغرام', placeholder: 'https://instagram.com/yourpage' },
                { key: 'twitter_url',    label: '🐦 تويتر / X', placeholder: 'https://twitter.com/yourpage' },
                { key: 'tiktok_url',     label: '🎵 تيك توك',  placeholder: 'https://tiktok.com/@yourpage' },
                { key: 'snapchat_url',   label: '👻 سناب شات', placeholder: 'https://snapchat.com/add/yourpage' },
                { key: 'youtube_url',    label: '▶️ يوتيوب',   placeholder: 'https://youtube.com/@yourpage' },
                { key: 'whatsapp_number', label: '💬 رقم واتساب', placeholder: '213XXXXXXXXX' },
              ].map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <input className="input text-sm" dir="ltr" placeholder={placeholder} value={settings[key] || ''} onChange={e => set(key, e.target.value)} />
                </Field>
              ))}
            </div>
          </div>
        )}

        {/* ===== PIXELS TAB ===== */}
        {activeTab === 'pixels' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">📊 أين أجد معرفات البيكسل؟</p>
              <ul className="space-y-1 text-blue-700 text-xs">
                <li>• <strong>Facebook:</strong> Business Manager → Events Manager → Pixels → إنشاء بيكسل</li>
                <li>• <strong>TikTok:</strong> TikTok Ads Manager → Assets → Events → Web Events</li>
                <li>• <strong>Google Analytics:</strong> analytics.google.com → الإعدادات → معرّف القياس</li>
              </ul>
            </div>

            <div className="space-y-5">
              <SecretField label="📘 معرف بيكسل فيسبوك" hint="مثال: 1234567890123456" value={settings.facebook_pixel} onChange={v => set('facebook_pixel', v)} placeholder="XXXXXXXXXXXXXXXX" />
              <div className="bg-gray-50 rounded-xl p-3 text-xs">
                <p className="font-semibold text-gray-600 mb-1">أحداث Facebook مفعّلة تلقائياً:</p>
                <div className="flex flex-wrap gap-2">
                  {['PageView','ViewContent','AddToCart','Purchase'].map(e => <span key={e} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{e}</span>)}
                </div>
              </div>

              <SecretField label="🎵 معرف بيكسل تيك توك" hint="مثال: CXXXXXXXXXXXXXXXXX" value={settings.tiktok_pixel} onChange={v => set('tiktok_pixel', v)} placeholder="CXXXXXXXXXXXXXXXXX" />
              <div className="bg-gray-50 rounded-xl p-3 text-xs">
                <p className="font-semibold text-gray-600 mb-1">أحداث TikTok مفعّلة تلقائياً:</p>
                <div className="flex flex-wrap gap-2">
                  {['PageView','ViewContent','AddToCart','PlaceAnOrder'].map(e => <span key={e} className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">{e}</span>)}
                </div>
              </div>

              <SecretField label="📊 معرف Google Analytics" hint="مثال: G-XXXXXXXXXX" value={settings.google_analytics} onChange={v => set('google_analytics', v)} placeholder="G-XXXXXXXXXX" />

              <Field label="🔧 سكريبت مخصص (يُضاف في رأس الصفحة)">
                <textarea className="input text-xs resize-none font-mono" rows={5} dir="ltr"
                  placeholder={'<!-- Custom tracking script -->\n<script>...</script>'}
                  value={settings.custom_head_script || ''} onChange={e => set('custom_head_script', e.target.value)} />
              </Field>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
              ⚠️ تأكد دائماً من صحة معرّفات البيكسل قبل الحفظ لضمان دقة إحصائيات حملاتك الإعلانية.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pb-4">
        <button onClick={handleSave} disabled={saving} className="btn-gold">
          {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> جاري الحفظ...</> : <><Save className="w-4 h-4" /> حفظ جميع الإعدادات</>}
        </button>
      </div>
    </div>
  )
}
