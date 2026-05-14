import { useState } from 'react'
import { Trash2, Edit2, Eye, EyeOff, Plus, Search, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useReviews } from '../../hooks/useReviews'
import { StarRating } from '../../components/ReviewCard'

function AddReviewModal({ isOpen, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', rating: 5, comment: '', source: 'manual', avatar: '' })

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.comment.trim()) {
      toast.error('يرجى إدخال الاسم والتعليق')
      return
    }
    await onSubmit(form)
    setForm({ name: '', rating: 5, comment: '', source: 'manual', avatar: '' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="bg-ink text-white p-6 border-b">
          <h3 className="text-xl font-bold">إضافة تقييم جديد</h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">الاسم *</label>
            <input
              type="text"
              className="input text-sm"
              placeholder="اسم العميل"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">التقييم *</label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setForm(f => ({ ...f, rating: num }))}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    form.rating >= num
                      ? 'bg-gold text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gold/30'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">المصدر</label>
            <select
              className="input text-sm"
              value={form.source}
              onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
            >
              <option value="manual">⭐ تقييم يدوي</option>
              <option value="facebook">📘 فيسبوك</option>
              <option value="instagram">📷 إنستاجرام</option>
              <option value="whatsapp">💬 واتساب</option>
              <option value="google">🔍 جوجل</option>
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">التعليق *</label>
            <textarea
              className="input text-sm resize-none"
              rows={4}
              placeholder="نص التقييم..."
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            />
          </div>

          {/* Avatar URL (optional) */}
          <div>
            <label className="block text-xs font-bold text-ink mb-2">رابط الصورة (اختياري)</label>
            <input
              type="url"
              className="input text-sm"
              placeholder="https://..."
              value={form.avatar}
              onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t">
          <button onClick={onClose} className="btn-outline flex-1">إلغاء</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-gold flex-1">
            {loading ? 'جاري الحفظ...' : '✓ حفظ'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminReviews() {
  const { reviews, loading, addReview, updateReview, deleteReview } = useReviews(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredReviews = reviews.filter(r =>
    r.name.includes(searchQuery) ||
    r.comment.includes(searchQuery)
  )

  const handleAddReview = async (formData) => {
    setSubmitting(true)
    try {
      await addReview({
        ...formData,
        is_published: true,
        created_at: new Date().toISOString(),
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding review:', error)
      toast.error(error?.message || 'فشل إضافة التقييم، يرجى المحاولة لاحقاً')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublish = async (review) => {
    try {
      await updateReview(review.id, { is_published: !review.is_published })
    } catch (error) {
      console.error('Error updating review:', error)
    }
  }

  const handleDeleteReview = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      try {
        await deleteReview(id)
      } catch (error) {
        console.error('Error deleting review:', error)
      }
    }
  }

  const stats = {
    total: reviews.length,
    published: reviews.filter(r => r.is_published).length,
    unpublished: reviews.filter(r => !r.is_published).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">التقييمات</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة تقييمات العملاء</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-gold gap-2">
          <Plus className="w-4 h-4" /> تقييم جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي التقييمات', value: stats.total, color: 'blue' },
          { label: 'منشورة', value: stats.published, color: 'green' },
          { label: 'غير منشورة', value: stats.unpublished, color: 'amber' },
          { label: 'متوسط التقييم', value: `${stats.avgRating}⭐`, color: 'gold' },
        ].map((stat, i) => (
          <div key={i} className={`bg-${stat.color}-50 border border-${stat.color}-200 rounded-2xl p-4`}>
            <p className={`text-sm font-medium text-${stat.color}-700`}>{stat.label}</p>
            <p className={`text-2xl font-black text-${stat.color}-900 mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="input pr-10 w-full"
          placeholder="ابحث حسب الاسم أو التعليق..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>لا توجد تقييمات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-dark border-b">
                <tr>
                  <th className="px-6 py-3 text-right font-bold text-ink">الاسم</th>
                  <th className="px-6 py-3 text-right font-bold text-ink">التقييم</th>
                  <th className="px-6 py-3 text-right font-bold text-ink">التعليق</th>
                  <th className="px-6 py-3 text-right font-bold text-ink">المصدر</th>
                  <th className="px-6 py-3 text-right font-bold text-ink">الحالة</th>
                  <th className="px-6 py-3 text-right font-bold text-ink">التاريخ</th>
                  <th className="px-6 py-3 text-center font-bold text-ink">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review, i) => (
                  <tr key={review.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
                    <td className="px-6 py-4 font-semibold text-ink">{review.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">
                        {Array(review.rating).fill(0).map((_, j) => (
                          <span key={j} className="text-gold">⭐</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 line-clamp-2 text-gray-600">{review.comment}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-gold/20 text-gold">
                        {review.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        review.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {review.is_published ? '✓ منشور' : '⏸ مخفي'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(review.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(review)}
                          className={`p-2 rounded-lg transition-colors ${
                            review.is_published
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={review.is_published ? 'إخفاء' : 'نشر'}
                        >
                          {review.is_published ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 rounded-lg bg-rust/10 text-rust hover:bg-rust/20 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Review Modal */}
      <AddReviewModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddReview}
        loading={submitting}
      />
    </div>
  )
}
