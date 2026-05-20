import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const missingVars = []
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')

if (missingVars.length > 0) {
  console.warn(
    `Supabase environment variables are missing: ${missingVars.join(', ')}. ` +
      'Add them to your .env file for local development and to Vercel environment variables for production.'
  )

  if (import.meta.env.PROD) {
    console.error(
      `Missing required Supabase env vars in production: ${missingVars.join(', ')}. ` +
        'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel project settings.'
    )
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null

// ==================== كتب ====================
export const booksApi = {
  getAll: async (filters = {}) => {
    if (!supabase) {
      console.warn('booksApi.getAll: supabase not configured — returning empty list')
      return []
    }
    let query = supabase.from('books').select('*').eq('is_active', true)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.featured) query = query.eq('is_featured', true)
    if (filters.newRelease) query = query.eq('is_new_release', true)
    if (filters.sort === 'price_asc') query = query.order('price', { ascending: true })
    else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false })
    else query = query.order('created_at', { ascending: false })
    const { data, error } = await query
    if (error) throw error
    return data
  },
  getById: async (id) => {
    if (!supabase) {
      console.warn('booksApi.getById: supabase not configured — returning null')
      return null
    }
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },
  create: async (data) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: book, error } = await supabase.from('books').insert(data).select().single()
    if (error) throw error
    return book
  },
  update: async (id, data) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: book, error } = await supabase.from('books').update(data).eq('id', id).select().single()
    if (error) throw error
    return book
  },
  delete: async (id) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.from('books').update({ is_active: false }).eq('id', id)
    if (error) throw error
    return data
  },
  adminGetAll: async () => {
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
}

// ==================== طلبات ====================
export const ordersApi = {
  create: async (orderData, items) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: order, error } = await supabase.from('orders').insert(orderData).select().single()
    if (error) throw error
    const orderItems = items.map(item => ({
      order_id: order.id,
      book_id: item.id,
      title: item.title,
      author: item.author,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))
    await supabase.from('order_items').insert(orderItems)
    await supabase.from('order_history').insert({ order_id: order.id, status: 'pending', note: 'تم استلام الطلب' })
    return order
  },
  getAll: async (filters = {}) => {
    if (!supabase) {
      console.warn('ordersApi.getAll: supabase not configured — returning empty list')
      return []
    }
    let query = supabase.from('orders').select(`*, order_items(*)`).order('created_at', { ascending: false })
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.search) query = query.or(`customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`)
    if (filters.userId) query = query.eq('user_id', filters.userId)
    const { data, error } = await query
    if (error) throw error
    return data
  },
  getByUser: (userId) => {
    if (!supabase) {
      console.warn('ordersApi.getByUser: supabase not configured — returning empty list')
      return { then: (cb) => cb([]) }
    }
    return supabase.from('orders').select(`*, order_items(*)`).eq('user_id', userId).order('created_at', { ascending: false })
  },
  getById: (id) => {
    if (!supabase) {
      console.warn('ordersApi.getById: supabase not configured — returning null')
      return { then: (cb) => cb(null) }
    }
    return supabase.from('orders').select(`*, order_items(*), order_history(*)`).eq('id', id).single()
  },
  updateStatus: async (id, status, note = '') => {
    if (!supabase) throw new Error('Supabase not configured')
    await supabase.from('orders').update({ status }).eq('id', id)
    await supabase.from('order_history').insert({ order_id: id, status, note })
  },
  update: (id, data) => {
    if (!supabase) throw new Error('Supabase not configured')
    return supabase.from('orders').update(data).eq('id', id).select().single()
  },
  getStats: async () => {
    if (!supabase) {
      console.warn('ordersApi.getStats: supabase not configured — returning empty list')
      return []
    }
    const { data } = await supabase.from('orders').select('status, total, created_at')
    return data
  },
}

// ==================== التقييمات ====================
export const reviewsApi = {
  getPublished: async () => {
    if (!supabase) {
      console.warn('reviewsApi.getPublished: supabase not configured — returning empty list')
      return []
    }
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  getAll: async () => {
    if (!supabase) {
      console.warn('reviewsApi.getAll: supabase not configured — returning empty list')
      return []
    }
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
  create: async (reviewData) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single()
    if (error) throw error
    return data
  },
  update: async (id, reviewData) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
  delete: async (id) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
    if (error) throw error
    return data
  },
}

// ==================== إعدادات ====================
export const settingsApi = {
  getAll: async () => {
    if (!supabase) {
      console.warn('settingsApi.getAll: supabase not configured — returning empty settings')
      return {}
    }
    const { data } = await supabase.from('store_settings').select('*')
    return data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}
  },
  update: async (updates) => {
    if (!supabase) throw new Error('Supabase not configured')
    for (const [key, value] of Object.entries(updates)) {
      await supabase.from('store_settings').upsert({ key, value }, { onConflict: 'key' })
    }
  },
}

// ==================== فئات ====================
export const categoriesApi = {
  getAll: async () => {
    if (!supabase) {
      console.warn('categoriesApi.getAll: supabase not configured — returning empty list')
      return []
    }
    const { data, error } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
    if (error) throw error
    return data
  },
  adminGetAll: async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.from('categories').select('*').order('sort_order')
    if (error) throw error
    return data
  },
  create: async (data) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: category, error } = await supabase.from('categories').insert(data).select().single()
    if (error) throw error
    return category
  },
  update: async (id, payload) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: category, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
    if (error) throw error
    return category
  },
  delete: async (id) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: category, error } = await supabase.from('categories').update({ is_active: false }).eq('id', id).select().single()
    if (error) throw error
    return category
  },
}
