import { useState, useEffect } from 'react'
import { reviewsApi } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useReviews = (publishedOnly = true) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = publishedOnly ? await reviewsApi.getPublished() : await reviewsApi.getAll()
      setReviews(data)
    } catch (err) {
      setError(err.message)
      console.error('Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [publishedOnly])

  const addReview = async (reviewData) => {
    try {
      const newReview = await reviewsApi.create(reviewData)
      setReviews(prev => [newReview, ...prev])
      toast.success('تم إضافة التقييم بنجاح')
      return newReview
    } catch (err) {
      console.error('Error adding review:', err)
      toast.error(err?.message || 'فشل إضافة التقييم')
      throw err
    }
  }

  const updateReview = async (id, reviewData) => {
    try {
      const updated = await reviewsApi.update(id, reviewData)
      setReviews(prev => prev.map(r => r.id === id ? updated : r))
      toast.success('تم تحديث التقييم')
      return updated
    } catch (err) {
      console.error('Error updating review:', err)
      toast.error(err?.message || 'فشل تحديث التقييم')
      throw err
    }
  }

  const deleteReview = async (id) => {
    try {
      await reviewsApi.delete(id)
      setReviews(prev => prev.filter(r => r.id !== id))
      toast.success('تم حذف التقييم')
    } catch (err) {
      console.error('Error deleting review:', err)
      toast.error(err?.message || 'فشل حذف التقييم')
      throw err
    }
  }

  return { reviews, loading, error, addReview, updateReview, deleteReview, refetch: loadReviews }
}
