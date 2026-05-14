import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react'
import { categoriesApi } from '../../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY_CATEGORY = {
  name: '',
  slug: '',
  icon: '🏷️',
  sort_order: 0,
  is_active: true,
}

function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState(category || EMPTY_CATEGORY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(category || EMPTY_CATEGORY)
  }, [category])

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast.error('يرجى إدخال الاسم والslug')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        sort_order: Number(form.sort_order) || 0,
      }
      await onSave(payload)
      toast.success(category?.id ? 'تم تحديث التصنيف' : 'تم إضافة التصنيف')
      onClose()
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ')
      console.error(error)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-ink text-white">
          <h3 className="text-lg font-bold">{category?.id ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">الاسم *</label>
            <input className="input text-sm" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="مثال: روايات" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">slug *</label>
            <input className="input text-sm" value={form.slug} onChange={e => setField('slug', e.target.value)} placeholder="مثال: novels" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">الأيقونة</label>
              <input className="input text-sm" value={form.icon} onChange={e => setField('icon', e.target.value)} placeholder="🏷️" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">الترتيب</label>
              <input type="number" className="input text-sm" value={form.sort_order} onChange={e => setField('sort_order', e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setField('is_active', e.target.checked)} className="accent-gold" />
              <span className="text-sm text-gray-600">نشط</span>
            </label>
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline text-sm">إلغاء</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold text-sm">
            {saving ? 'جاري الحفظ...' : category?.id ? 'حفظ التعديلات' : 'إضافة'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCategory, setEditCategory] = useState(null)
  const [search, setSearch] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoriesApi.adminGetAll()
      setCategories(data || [])
    } catch (error) {
      console.error(error)
      toast.error('فشل في تحميل التصنيفات')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSave = async (category) => {
    if (category.id) {
      await categoriesApi.update(category.id, category)
    } else {
      await categoriesApi.create(category)
    }
    await fetchCategories()
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return
    try {
      await categoriesApi.delete(id)
      toast.success('تم حذف التصنيف')
      await fetchCategories()
    } catch (error) {
      console.error(error)
      toast.error('فشل في حذف التصنيف')
    }
  }

  const filtered = categories.filter(item => item.name.includes(search) || item.slug.includes(search) || item.icon.includes(search))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">إدارة التصنيفات</h1>
          <p className="text-gray-500 text-sm mt-1">إنشاء وتحديث وحذف التصنيفات المرتبطة بالمتجر.</p>
        </div>
        <button onClick={() => { setEditCategory(null); setModalOpen(true) }} className="btn-gold text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة تصنيف
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">إجمالي التصنيفات</p>
          <p className="text-3xl font-black text-ink mt-2">{categories.length}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">تصنيفات نشطة</p>
          <p className="text-3xl font-black text-ink mt-2">{categories.filter(c => c.is_active).length}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400">تصنيفات معطلة</p>
          <p className="text-3xl font-black text-ink mt-2">{categories.filter(c => !c.is_active).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pr-10 text-sm" placeholder="ابحث عن تصنيف..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="text-xs text-gray-500">يمكنك البحث بالاسم أو slug أو الأيقونة</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
          <table className="min-w-full text-sm text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['الأيقونة', 'الاسم', 'slug', 'الترتيب', 'الحالة', 'إجراءات'].map(header => (
                  <th key={header} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(category => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-center text-lg">{category.icon}</td>
                  <td className="px-4 py-4 font-semibold text-ink">{category.name}</td>
                  <td className="px-4 py-4 text-gray-500">{category.slug}</td>
                  <td className="px-4 py-4 text-gray-500">{category.sort_order}</td>
                  <td className="px-4 py-4">
                    <span className={`badge text-xs ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {category.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-4 py-4 flex gap-2">
                    <button onClick={() => { setEditCategory(category); setModalOpen(true) }} className="btn-outline text-xs">تعديل</button>
                    <button onClick={() => handleDelete(category.id)} className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50">حذف</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400">لا توجد تصنيفات</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <CategoryModal category={editCategory} onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  )
}
