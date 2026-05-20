خطوات إعداد متغيرات البيئة على Vercel (لـ Bookstore)

1) لمحة
- المشروع يحتاج المتغيرات التالية في Vercel لتعمل قواعد البيانات وصفحة الأدمن بشكل صحيح:
  - `VITE_SUPABASE_URL`  → عنوان مشروع Supabase (مثال: https://xxxxx.supabase.co)
  - `VITE_SUPABASE_ANON_KEY` → مفتاح Anon Public من Supabase
  - `VITE_ADMIN_SECRET` → سر الدخول إلى لوحة الأدمن (مثال: hgjdgjdglkjdklsdsk)

2) استخدام واجهة Vercel (الأسهل)
- اذهب إلى https://vercel.com → سجّل دخولك → اختر المشروع (books-chi-seven أو اسم مشروعك).
- Project Settings → Environment Variables → Add New
  - أدخل `Name` كـ `VITE_SUPABASE_URL`، `Value` انسخ Project URL من Supabase → Save
  - كرّر لإضافة `VITE_SUPABASE_ANON_KEY` (انسخ Anon Public Key من لوحة Supabase)
  - أضف `VITE_ADMIN_SECRET` بقيمة السر التي تستخدمها في رابط الدخول
- مهم: حدّد لكل متغيّر البيئات المناسبة (Production, Preview, Development) إن أردت.
- بعد الحفظ: اضغط على Deployments → إعادة نشر (Redeploy) أو اضغط زر Redeploy في أحدث نشر.

3) باستخدام Vercel CLI
- ثبت Vercel CLI (إن لم يكن مثبتاً):
```bash
npm i -g vercel
```
- سجل دخولك:
```bash
vercel login
```
- استعرض متغيرات البيئة الحالية:
```bash
vercel env ls
```
- أضف متغير للإنتاج (كرر لكل متغير):
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_ADMIN_SECRET production
```
- أعد النشر:
```bash
vercel --prod
```

4) التحقق بعد النشر
- افتح الرابط:
  - https://[your-vercel-project].vercel.app/admin/login?secret=[VITE_ADMIN_SECRET]
- افتح أدوات المطور (DevTools) → Console وابحث عن رسالة `Supabase:` التي أضفناها في السجل التشخيصي. يجب أن ترى:
  - `{ urlHost: 'x...supabase.co', hasAnonKey: true, clientCreated: true }`
- إن كان `hasAnonKey:false` أو `clientCreated:false` فالمتغيرات غير مضبوطة وقت البناء.

5) مشاكل شائعة وحلول
- "رابط الدخول السري غير مفعّل": يعني أن `VITE_ADMIN_SECRET` غير موجود في بيئة الإنتاج.
- تحذيرات Supabase أو ظهور بيانات فارغة: تحقق من `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` وقيم CORS في Supabase.
- CORS: في Supabase Dashboard → Settings → API → Allowed URLs أضف `https://[your-vercel-domain].vercel.app` و`http://localhost:5173`.
- Row Level Security (RLS): إن كان مفعلًا تأكّد من السياسات أو استخدم مفاتيح/وظائف آمنة في الخادم.

6) أريد أن أساعدك مباشرة
- أستطيع تنفيذ التعليمات CLI هنا إن أعطيتني صلاحية الوصول أو تُنفّذها وتشارك المخرجات.
- أستطيع تعديل السجل التشخيصي أو إضافة خطوات تحقق إضافية إذا رغبت.

انتهى.
