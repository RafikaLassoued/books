import { supabase } from './supabase.js'

/**
 * اختبر الاتصال بـ Supabase والتحقق من وجود الجداول
 */
export async function testSupabaseConnection() {
  try {
    console.log('🔍 جاري اختبار الاتصال بـ Supabase...')
    if (!supabase) {
      console.error('❌ Supabase client not configured')
      return { success: false, error: 'Supabase client not configured' }
    }

    // 1. اختبر الاتصال الأساسي
    const { data: testData, error: testError } = await supabase
      .from('books')
      .select('count()', { count: 'exact' })
      .limit(1)
    
    if (testError) {
      console.error('❌ خطأ في الجدول:', testError.message)
      return {
        success: false,
        error: testError.message,
        tables: {
          books: false,
        },
      }
    }
    
    console.log('✅ جدول books موجود')
    
    // 2. تحقق من الجداول الأخرى
    const tables = ['books', 'orders', 'categories', 'store_settings', 'order_items', 'order_history']
    const tableStatus = {}
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count()', { count: 'exact' })
        .limit(1)
      
      tableStatus[table] = !error
      const status = !error ? '✅' : '❌'
      console.log(`${status} جدول ${table}`)
    }
    
    return {
      success: true,
      message: '✅ الاتصال ناجح - جميع الجداول موجودة',
      tables: tableStatus,
    }
  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// اختبر عند تحميل الملف (في التطوير فقط)
if (import.meta.env.DEV) {
  testSupabaseConnection().then(result => {
    console.table(result)
  })
}
