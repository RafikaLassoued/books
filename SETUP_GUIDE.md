# 🚀 دليل الإعداد الكامل

## الخطأ الحالي
```
Could not find the table 'public.books' in the schema cache
```

## الحل

### ✅ الخطوة 1: التحقق من الاتصال بـ Supabase

تأكد أن ملف `.env` يحتوي على البيانات الصحيحة:
```
VITE_SUPABASE_URL="https://xltbmmkmnvotkwbucywv.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdGJtbWttbnZvdGt3YnVjeXd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTEwNDksImV4cCI6MjA5MzY2NzA0OX0.Qei1LpkhBw5E8G5K70GVHMr7BV5Bwlh5_blGNyrpiU8"
```

### ✅ الخطوة 2: إنشاء جداول قاعدة البيانات

1. اذهب إلى https://app.supabase.com
2. اختر المشروع: `xltbmmkmnvotkwbucywv`
3. انقر على **SQL Editor** (من القائمة اليسرى)
4. انقر **New Query**
5. **انسخ كل محتوى ملف `supabase_schema.sql`** والصقه في محرر SQL
6. اضغط **Run**

**⏳ انتظر حتى اكتمال العملية (قد تستغرق دقائق)**

### ✅ الخطوة 3: تحميل البيانات التجريبية

بعد إنشاء الجداول:
1. انقر **New Query** (مرة أخرى)
2. **انسخ كل محتوى ملف `supabase_seed.sql`** والصقه
3. اضغط **Run**

### ✅ الخطوة 4: التحقق من النجاح

في Supabase Dashboard:
- انقر على **Table Editor**
- تأكد من وجود الجداول:
  - `books` ✓
  - `orders` ✓
  - `categories` ✓
  - `store_settings` ✓

### ✅ الخطوة 5: إعادة تحميل التطبيق

في نافذة المتصفح:
- **اضغط F5** أو **Ctrl+R** لتحديث الصفحة
- لو ظهرت رسائل خطأ جديدة بدل الخطأ السابق فهذا تقدم ✓

---

## 📞 إذا استمرت المشكلة

1. **تحقق من اسم المشروع:**
   - اذهب إلى Settings → General
   - تأكد من `Project ID` = `xltbmmkmnvotkwbucywv`

2. **فعّل RLS (Row Level Security):**
   - نفذ الأوامر من `supabase_schema.sql`
   - تأكد من سماح السياسات (Policies)

3. **أعد التشغيل من 0:**
   - احذف جميع الجداول اليدوية
   - أعد تشغيل `supabase_schema.sql` و `supabase_seed.sql`

---

**🎉 بعد إكمال هذه الخطوات، ستظهر الكتب في لوحة التحكم تلقائياً**
