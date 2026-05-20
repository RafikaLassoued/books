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
export const supabaseConfigured = Boolean(supabase)
export const supabaseMissingVars = missingVars

const fallbackBooks = [
  {
    id: 1,
    title: 'موسم القراءة',
    author: 'صفاء المغربي',
    category: 'روايات',
    price: 1250,
    original_price: 1500,
    rating: 4.8,
    is_active: true,
    is_featured: true,
    is_new_release: false,
    image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800',
    description: 'رواية عربية تجمع بين الحنين والمغامرة والمشاعر الإنسانية العميقة.',
    pages: 320,
    publish_year: 2023,
    stock: 12,
  },
  {
    id: 2,
    title: 'رحلة إلى الصحراء',
    author: 'مصطفى البشير',
    category: 'سفر',
    price: 980,
    original_price: 1200,
    rating: 4.6,
    is_active: true,
    is_featured: true,
    is_new_release: false,
    image_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
    description: 'سرد شيق لرحلة مترفة عبر قلب الصحراء الجزائرية.',
    pages: 264,
    publish_year: 2022,
    stock: 18,
  },
  {
    id: 3,
    title: 'إدارة الوقت الذكي',
    author: 'ليلى حمدي',
    category: 'تنمية بشرية',
    price: 760,
    original_price: 0,
    rating: 4.4,
    is_active: true,
    is_featured: false,
    is_new_release: true,
    image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    description: 'دليل عملي لتحسين الإنتاجية وتنظيم الوقت في الحياة اليومية.',
    pages: 210,
    publish_year: 2024,
    stock: 25,
  },
  {
    id: 4,
    title: 'الذكاء الاصطناعي ببساطة',
    author: 'ياسين المرزوق',
    category: 'تكنولوجيا',
    price: 1420,
    original_price: 1700,
    rating: 4.9,
    is_active: true,
    is_featured: true,
    is_new_release: false,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    description: 'مقدمة عملية لأساسيات الذكاء الاصطناعي وتطبيقاته الحديثة.',
    pages: 376,
    publish_year: 2023,
    stock: 20,
  },
]

const fallbackCategories = [
  { id: 1, name: 'الكل', slug: 'all', icon: '📚' },
  { id: 2, name: 'روايات', slug: 'روايات', icon: '📖' },
  { id: 3, name: 'سفر', slug: 'سفر', icon: '✈️' },
  { id: 4, name: 'تنمية بشرية', slug: 'تنمية بشرية', icon: '🌱' },
  { id: 5, name: 'تكنولوجيا', slug: 'تكنولوجيا', icon: '💻' },
]

const fallbackReviews = [
  { id: 1, name: 'أحمد', rating: 5, comment: 'توصيل ياليدين سريع جداً، استلمت كتبي في 24 ساعة فقط. خدمة ممتازة!', source: 'الجزائر العاصمة', avatar: '' },
  { id: 2, name: 'سارة', rating: 5, comment: 'دفعت ببريدي موب وكان سهلاً جداً. الكتب وصلت بحالة مثالية. أنصح بهذا المتجر.', source: 'وهران', avatar: '' },
  { id: 3, name: 'كريم', rating: 5, comment: 'اخترت الاستلام من مكتب ياليدين وكان الأسرع. سعر التوصيل مناسب جداً.', source: 'قسنطينة', avatar: '' },
]

const fallbackSettings = {
  store_name: 'مكتبة الكتب',
  whatsapp_number: '213000000000',
  hero_title: 'اكتشف أفضل الكتب التي تستحق القراءة',
  hero_subtitle: 'توصيل ياليدين لجميع ولايات الجزائر الـ 58 | دفع عند الاستلام أو بريدي موب',
}

// ==================== كتب ====================

// Debug: show whether env vars were read and whether client was created
try {
  const urlHost = supabaseUrl ? (() => { try { return new URL(supabaseUrl).host } catch (e) { return supabaseUrl } })() : null
  // Do not print full anon key in logs; only indicate presence
  console.debug('Supabase:', { urlHost, hasAnonKey: !!supabaseAnonKey, clientCreated: !!supabase })
} catch (e) {
  // swallow
}

export const booksApi = {
  getAll: async (filters = {}) => {
    if (!supabase) {
      console.warn('booksApi.getAll: supabase not configured — returning fallback sample books')
      let data = fallbackBooks.filter(book => book.is_active)
      if (filters.category) data = data.filter(book => book.category === filters.category)
      if (filters.featured) data = data.filter(book => book.is_featured)
      if (filters.newRelease) data = data.filter(book => book.is_new_release)
      if (filters.sort === 'price_asc') data = data.sort((a, b) => a.price - b.price)
      else if (filters.sort === 'price_desc') data = data.sort((a, b) => b.price - a.price)
      return data
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
      console.warn('booksApi.getById: supabase not configured — returning fallback sample book')
      return fallbackBooks.find(book => book.id === id) || null
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
      console.warn('reviewsApi.getPublished: supabase not configured — returning fallback sample reviews')
      return fallbackReviews
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
      console.warn('reviewsApi.getAll: supabase not configured — returning fallback sample reviews')
      return fallbackReviews
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
      console.warn('settingsApi.getAll: supabase not configured — returning fallback settings')
      return fallbackSettings
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
      console.warn('categoriesApi.getAll: supabase not configured — returning fallback categories')
      return fallbackCategories
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
