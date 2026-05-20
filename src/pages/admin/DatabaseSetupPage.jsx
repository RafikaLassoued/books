import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Copy } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function DatabaseSetupPage() {
  const [status, setStatus] = useState('checking')
  const [tables, setTables] = useState({})

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    const tableNames = ['books', 'orders', 'categories', 'store_settings', 'order_items', 'order_history']
    const results = {}

    if (!supabase) {
      for (const table of tableNames) results[table] = false
      setTables(results)
      setStatus('no_supabase')
      return
    }

    for (const table of tableNames) {
      const { error } = await supabase
        .from(table)
        .select('count()', { count: 'exact' })
        .limit(1)

      results[table] = !error
    }

    setTables(results)
    const allExist = Object.values(results).every(v => v)
    setStatus(allExist ? 'ready' : 'setup_needed')
  }

  const copyCode = (text) => {
    navigator.clipboard.writeText(text)
    alert('✅ تم النسخ!')
  }

  if (status === 'ready') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-900">✅ قاعدة البيانات جاهزة!</h1>
          <p className="text-green-700 mt-2">جميع الجداول موجودة وتعمل بشكل صحيح</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
          >
            عودة إلى التطبيق
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl font-bold text-ink">⚠️ قاعدة البيانات غير مهيأة</h1>
              <p className="text-gray-600 mt-1">جداول Supabase لم تُنشأ بعد</p>
            </div>
          </div>
        </div>

        {/* Table Status */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-ink mb-4">حالة الجداول:</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(tables).map(([name, exists]) => (
              <div key={name} className={`p-3 rounded-xl text-sm font-semibold ${exists ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {exists ? '✅' : '❌'} {name}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-ink mb-4">✅ الحل (1 دقيقة فقط):</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
              <p className="font-bold text-blue-900 mb-2">1️⃣ اذهب إلى Supabase Dashboard</p>
              <a href="https://app.supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                https://app.supabase.com
              </a>
            </div>

            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
              <p className="font-bold text-blue-900 mb-2">2️⃣ اختر المشروع: xltbmmkmnvotkwbucywv</p>
              <p className="text-sm text-blue-800">من قائمة المشاريع على اليسار</p>
            </div>

            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
              <p className="font-bold text-blue-900 mb-2">3️⃣ افتح SQL Editor</p>
              <p className="text-sm text-blue-800">من القائمة اليسرية → SQL Editor</p>
            </div>

            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
              <p className="font-bold text-blue-900 mb-2">4️⃣ اضغط "+ New Query"</p>
              <p className="text-sm text-blue-800">ثم انسخ الكود أدناه</p>
            </div>

            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded">
              <p className="font-bold text-blue-900 mb-2">5️⃣ انسخ وشغّل SQL</p>
              <p className="text-sm text-blue-800 mb-2">اضغط الأزرار أدناه:</p>
              <button
                onClick={() => copyCode('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE TABLE IF NOT EXISTS books (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, original_price DECIMAL(10,2), category TEXT NOT NULL, image_url TEXT, stock INTEGER DEFAULT 0, isbn TEXT UNIQUE, publisher TEXT, publish_year INTEGER, pages INTEGER, language TEXT DEFAULT \'ar\', is_featured BOOLEAN DEFAULT false, is_new_release BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, rating DECIMAL(3,2) DEFAULT 0, reviews_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()); CREATE TABLE IF NOT EXISTS categories (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, icon TEXT, is_active BOOLEAN DEFAULT true, sort_order INTEGER DEFAULT 0); INSERT INTO categories (name, slug, icon, sort_order) VALUES (\'روايات\', \'novels\', \'📚\', 1), (\'تطوير ذات\', \'self-development\', \'🌟\', 2), (\'إدارة وأعمال\', \'business\', \'💼\', 3), (\'خيال علمي\', \'sci-fi\', \'🚀\', 4), (\'كتب أطفال\', \'children\', \'🧸\', 5), (\'كتب تعليمية\', \'educational\', \'🎓\', 6) ON CONFLICT DO NOTHING;')}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 flex items-center gap-2 justify-center"
              >
                <Copy className="w-4 h-4" /> انسخ SQL
              </button>
            </div>
          </div>
        </div>

        {/* Final Step */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-6">
          <p className="text-lg font-bold text-amber-900 mb-3">⏳ بعد تشغيل SQL:</p>
          <ol className="space-y-2 text-amber-900">
            <li>✅ انتظر 1-2 دقيقة</li>
            <li>✅ احدّث هذه الصفحة: <kbd className="bg-amber-200 px-2 py-1 rounded">F5</kbd></li>
            <li>✅ يجب أن ترى "✅ قاعدة البيانات جاهزة!"</li>
          </ol>
        </div>

        {/* Refresh Button */}
        <button
          onClick={checkDatabase}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
        >
          🔄 تحديث الحالة
        </button>
      </div>
    </div>
  )
}
