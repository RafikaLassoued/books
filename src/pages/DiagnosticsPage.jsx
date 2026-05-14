import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DiagnosticsPage() {
  const [status, setStatus] = useState({
    supabaseUrl: '🔄 جاري التحقق...',
    supabaseKey: '🔄 جاري التحقق...',
    booksTable: '🔄 جاري التحقق...',
    ordersTable: '🔄 جاري التحقق...',
    categoriesTable: '🔄 جاري التحقق...',
  })

  useEffect(() => {
    const checkAll = async () => {
      const newStatus = { ...status }

      // 1. Check URL
      const url = import.meta.env.VITE_SUPABASE_URL
      newStatus.supabaseUrl = url ? `✅ ${url.slice(0, 30)}...` : '❌ غير موجودة'

      // 2. Check Key
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      newStatus.supabaseKey = key ? `✅ ${key.slice(0, 20)}...` : '❌ غير موجودة'

      // 3. Check books table
      const { error: booksError } = await supabase
        .from('books')
        .select('count()', { count: 'exact' })
        .limit(1)
      newStatus.booksTable = booksError ? `❌ ${booksError.message}` : '✅ جاهزة'

      // 4. Check orders table
      const { error: ordersError } = await supabase
        .from('orders')
        .select('count()', { count: 'exact' })
        .limit(1)
      newStatus.ordersTable = ordersError ? `❌ ${ordersError.message}` : '✅ جاهزة'

      // 5. Check categories table
      const { error: categoriesError } = await supabase
        .from('categories')
        .select('count()', { count: 'exact' })
        .limit(1)
      newStatus.categoriesTable = categoriesError ? `❌ ${categoriesError.message}` : '✅ جاهزة'

      setStatus(newStatus)
    }

    checkAll()
  }, [])

  return (
    <div className="min-h-screen bg-white p-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 تشخيص النظام</h1>

        <div className="space-y-4">
          {Object.entries(status).map(([key, value]) => (
            <div key={key} className="p-4 bg-gray-100 rounded-lg font-mono text-sm">
              <div className="font-bold mb-1">{key}</div>
              <div className="text-gray-700">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-900">
            💡 إذا رأيت وسيماً ❌ بدل ✅ فهذا يعني أن جداول الـ Supabase لم تُنشأ بعد.
          </p>
          <p className="text-blue-900 mt-2">
            👉 اتبع التعليمات في ملف: <code>FIX_TABLES_ERROR.md</code>
          </p>
        </div>
      </div>
    </div>
  )
}
