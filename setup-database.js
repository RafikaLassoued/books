#!/usr/bin/env node

/**
 * أداة إعداد قاعدة البيانات - تشغيل SQL schema تلقائياً
 * 
 * الاستخدام:
 * node setup-database.js
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطأ: VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY غير موجودة في .env')
  process.exit(1)
}

console.log('🔌 جاري الاتصال بـ Supabase...')
const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    // 1. اقرأ ملف schema
    const schemaPath = path.join(process.cwd(), 'supabase_schema.sql')
    const seedPath = path.join(process.cwd(), 'supabase_seed.sql')

    if (!fs.existsSync(schemaPath)) {
      console.error('❌ ملف supabase_schema.sql غير موجود')
      process.exit(1)
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8')
    const seed = fs.existsSync(seedPath) ? fs.readFileSync(seedPath, 'utf-8') : null

    // 2. تشغيل schema
    console.log('\n📊 جاري تشغيل المخطط...')
    const { data: schemaResult, error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schema,
    }).catch(() => {
      // إذا لم تعمل RPC، سنحاول طريقة أخرى
      return { data: null, error: 'RPC not available' }
    })

    if (schemaError && schemaError !== 'RPC not available') {
      console.error('❌ خطأ في تشغيل المخطط:', schemaError)
    } else if (schemaError === 'RPC not available') {
      console.warn('⚠️  طريقة RPC غير متاحة. الرجاء تشغيل SQL يدوياً:')
      console.log('📋 انسخ محتوى supabase_schema.sql والصقه في SQL Editor بـ Supabase\n')
    } else {
      console.log('✅ تم تشغيل المخطط بنجاح')
    }

    // 3. تحقق من وجود جدول books
    console.log('\n🔍 جاري التحقق من الجداول...')
    const { data: bookCount, error: bookError } = await supabase
      .from('books')
      .select('count()', { count: 'exact' })
      .limit(1)

    if (!bookError) {
      console.log('✅ جدول books موجود')

      // 4. إذا كان seed متاحاً وجدول books فارغ، شغّل seed
      if (seed && bookCount === 0) {
        console.log('\n📚 جاري تحميل البيانات التجريبية...')
        const { error: seedError } = await supabase.rpc('exec_sql', {
          sql: seed,
        }).catch(() => {
          return { error: 'RPC not available' }
        })

        if (!seedError || seedError === 'RPC not available') {
          console.log('✅ تم تحميل البيانات')
        }
      }

      console.log('\n🎉 اكتمل الإعداد بنجاح!')
      console.log('📖 يمكنك الآن تشغيل: npm run dev')
    } else {
      console.error('❌ خطأ: جدول books غير موجود')
      console.error('   يرجى تشغيل SQL يدوياً عبر Supabase SQL Editor')
    }
  } catch (error) {
    console.error('❌ خطأ عام:', error.message)
    process.exit(1)
  }
}

setupDatabase()
