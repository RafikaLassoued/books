import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, X, Star, Package } from 'lucide-react'
import { booksApi, categoriesApi, supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY_BOOK = {
  title: '', author: '', description: '', price: '', original_price: '',
  category: '', image_url: '', stock: 0, isbn: '', publisher: '',
  publish_year: '', pages: '', language: 'ar',
  is_featured: false, is_new_release: false, is_active: true, rating: 0,
}

function BookModal({ book, categories, onClose, onSave }) {
  const [form, setForm] = useState(book || EMPTY_BOOK)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const uploadCover = async (file) => {
    setUploading(true)
    setUploadMessage('جاري رفع الغلاف إلى Supabase...')
    try {
      const cleanedName = file.name.replace(/\s+/g, '_')
      const filePath = `covers/${Date.now()}_${cleanedName}`
      const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      const { data: publicUrlData, error: publicUrlError } = supabase.storage.from('covers').getPublicUrl(filePath)
      if (publicUrlError) throw publicUrlError
      if (!publicUrlData?.publicUrl) throw new Error('فشل الحصول على رابط الصورة')

      setForm(f => ({ ...f, image_url: publicUrlData.publicUrl }))
      setUploadMessage('تم رفع الغلاف بنجاح')
      return publicUrlData.publicUrl
    } finally {
      setUploading(false)
    }
  }

  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      await uploadCover(file)
      toast.success('تم رفع صورة الغلاف')
    } catch (e) {
      toast.error('فشل رفع الغلاف: ' + (e?.message || 'حدث خطأ'))
      setUploadMessage('فشل رفع الغلاف')
    } finally {
      event.target.value = null
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.author || !form.price || !form.category) {
      toast.error('يرجى ملء الحقول المطلوبة')
      return
    }
    setSaving(true)
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        stock: parseInt(form.stock) || 0,
        pages: form.pages ? parseInt(form.pages) : null,
        publish_year: form.publish_year ? parseInt(form.publish_year) : null,
        rating: parseFloat(form.rating) || 0,
      }
      if (book?.id) {
        await booksApi.update(book.id, data)
        toast.success('تم تحديث الكتاب')
      } else {
        await booksApi.create(data)
        toast.success('تم إضافة الكتاب')
      }
      await onSave()
      onClose()
    } catch (e) {
      toast.error('حدث خطأ: ' + (e?.message || 'فشل في حفظ الكتاب'))
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-ink text-white rounded-t-3xl">
          <h3 className="text-lg font-bold">{book?.id ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image Preview */}
          {form.image_url && (
            <div className="flex justify-center">
              <img src={form.image_url} alt="غلاف" className="w-32 h-44 object-cover rounded-xl shadow-md" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">رابط صورة الغلاف</label>
            <input className="input text-sm" placeholder="https://..." value={form.image_url} onChange={e => set('image_url', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">رفع صورة الغلاف</label>
            <input type="file" accept="image/*" className="input text-sm" onChange={handleCoverChange} />
            {uploading && <p className="text-xs text-gray-500 mt-2">جاري رفع الصورة...</p>}
            {uploadMessage && !uploading && <p className="text-xs text-green-600 mt-2">{uploadMessage}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">عنوان الكتاب *</label>
              <input className="input text-sm" placeholder="اسم الكتاب" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">المؤلف *</label>
              <input className="input text-sm" placeholder="اسم المؤلف" value={form.author} onChange={e => set('author', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">الوصف</label>
            <textarea className="input text-sm resize-none" rows={3} placeholder="وصف مختصر عن الكتاب..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">السعر (دج) *</label>
              <input className="input text-sm" type="number" min="0" placeholder="45" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">السعر الأصلي</label>
              <input className="input text-sm" type="number" min="0" placeholder="60" value={form.original_price} onChange={e => set('original_price', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">المخزون</label>
              <input className="input text-sm" type="number" min="0" placeholder="100" value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">التصنيف *</label>
              <select className="input text-sm" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">اختر التصنيف</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                <option value="روايات">روايات</option>
                <option value="تطوير ذات">تطوير ذات</option>
                <option value="إدارة وأعمال">إدارة وأعمال</option>
                <option value="خيال علمي">خيال علمي</option>
                <option value="كتب أطفال">كتب أطفال</option>
                <option value="كتب تعليمية">كتب تعليمية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">اللغة</label>
              <select className="input text-sm" value={form.language} onChange={e => set('language', e.target.value)}>
                <option value="ar">العربية</option>
                <option value="en">الإنجليزية</option>
                <option value="fr">الفرنسية</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">دار النشر</label>
              <input className="input text-sm" placeholder="دار النشر" value={form.publisher} onChange={e => set('publisher', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">سنة النشر</label>
              <input className="input text-sm" type="number" placeholder="2024" value={form.publish_year} onChange={e => set('publish_year', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">عدد الصفحات</label>
              <input className="input text-sm" type="number" placeholder="300" value={form.pages} onChange={e => set('pages', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">رقم ISBN</label>
              <input className="input text-sm" placeholder="978-..." value={form.isbn} onChange={e => set('isbn', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">التقييم (0-5)</label>
              <input className="input text-sm" type="number" min="0" max="5" step="0.1" placeholder="4.5" value={form.rating} onChange={e => set('rating', e.target.value)} />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4 pt-2">
            {[
              { key: 'is_featured', label: '⭐ مميز' },
              { key: 'is_new_release', label: '🆕 إصدار جديد' },
              { key: 'is_active', label: '✅ نشط' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${form[key] ? 'bg-gold' : 'bg-gray-200'}`}
                  onClick={() => set(key, !form[key])}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form[key] ? 'right-1' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-outline text-sm">إلغاء</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold text-sm">
            {saving ? 'جاري الحفظ...' : book?.id ? 'حفظ التعديلات' : 'إضافة الكتاب'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [catFilter, setCatFilter] = useState('')
  const [error, setError] = useState(null)

  const fetchBooks = async () => {
    setLoading(true)
    setError(null)
    try {
      const [booksData, categoriesData] = await Promise.all([booksApi.adminGetAll(), categoriesApi.adminGetAll()])
      setBooks(booksData || [])
      setCategories(categoriesData || [])
    } catch (err) {
      setError(err.message || 'فشل في تحميل البيانات')
      console.error('❌ خطأ في جلب الكتب:', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchBooks() }, [])

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return
    await booksApi.delete(id)
    toast.success('تم حذف الكتاب')
    fetchBooks()
  }

  const filtered = books.filter(b => {
    const matchSearch = !search || b.title.includes(search) || b.author.includes(search)
    const matchCat = !catFilter || b.category === catFilter
    return matchSearch && matchCat
  })

  const allCategories = [...new Set(books.map(b => b.category).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">إدارة الكتب</h1>
          <p className="text-gray-500 text-sm mt-1">{books.length} كتاب في المكتبة</p>
        </div>
        <button onClick={() => { setEditBook(null); setModalOpen(true) }} className="btn-gold text-sm">
          <Plus className="w-4 h-4" /> إضافة كتاب
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">⚠️</div>
            <div className="flex-1">
              <p className="text-red-800 font-bold text-base">خطأ: جداول قاعدة البيانات غير موجودة</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <div className="mt-4 bg-red-100 rounded-xl p-3 text-xs text-red-800 space-y-2">
                <p><strong>✅ الحل:</strong></p>
                <p>1. انقر على ملف: <code className="bg-white px-2 py-1 rounded font-mono">FIX_TABLES_ERROR.md</code></p>
                <p>2. اتبع التعليمات البسيطة خطوة بخطوة</p>
                <p>3. تشغيل SQL في Supabase يستغرق دقيقة واحدة فقط</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pr-10 text-sm" placeholder="ابحث عن كتاب..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input text-sm w-44" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">جميع التصنيفات</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الكتب', value: books.length, icon: '📚' },
          { label: 'كتب مميزة', value: books.filter(b => b.is_featured).length, icon: '⭐' },
          { label: 'إصدارات جديدة', value: books.filter(b => b.is_new_release).length, icon: '🆕' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black text-ink">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(book => (
            <div key={book.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative">
                <img src={book.image_url || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'} alt={book.title} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 flex gap-1">
                  {book.is_featured && <span className="bg-gold text-white text-xs px-1.5 py-0.5 rounded-full">مميز</span>}
                  {book.is_new_release && <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">جديد</span>}
                  {!book.is_active && <span className="bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded-full">معطل</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="text-gold text-xs font-medium">{book.category}</p>
                <h3 className="font-bold text-ink text-sm mt-0.5 line-clamp-1">{book.title}</h3>
                <p className="text-gray-500 text-xs mb-2">{book.author}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-ink">{book.price}</span>
                    <span className="text-xs text-gray-400 mr-0.5">دج</span>
                    {book.original_price && <span className="text-xs text-gray-300 line-through mr-1">{book.original_price}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Package className="w-3 h-3" /> {book.stock}
                  </div>
                </div>
                {book.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    <span className="text-xs text-gray-500">{book.rating}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setEditBook(book); setModalOpen(true) }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 rounded-xl text-xs font-semibold hover:bg-gold hover:text-white transition-colors">
                    <Edit2 className="w-3 h-3" /> تعديل
                  </button>
                  <button onClick={() => handleDelete(book.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-400">
              <p>لا توجد كتب مطابقة</p>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <BookModal book={editBook} categories={categories} onClose={() => setModalOpen(false)} onSave={fetchBooks} />
      )}
    </div>
  )
}
