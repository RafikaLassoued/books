# 📚 نظام التقييمات (Reviews System) - دليل متكامل

## 📋 نظرة عامة

تم تطوير نظام تقييمات متكامل يشمل:
- ✅ عرض التقييمات في الصفحة الرئيسية بـ Swiper Carousel
- ✅ لوحة إدارة كاملة للتقييمات
- ✅ إضافة تقييمات جديدة يدويًا
- ✅ نشر/إخفاء التقييمات
- ✅ حذف التقييمات
- ✅ دعم عدة مصادر (فيسبوك، إنستاجرام، واتساب، جوجل، يدوي)
- ✅ بيانات تخزن في Supabase
- ✅ عرض ديناميكي بدون تغيير التصميم الحالي

---

## 📁 البنية الجديدة للمشروع

```
src/
├── components/
│   ├── ReviewCard.jsx           # مكون بطاقة التقييم
│   └── ReviewsCarousel.jsx      # Swiper Carousel للتقييمات
├── hooks/
│   └── useReviews.js            # Hook للتعامل مع Reviews API
├── pages/
│   ├── admin/
│   │   └── AdminReviews.jsx     # صفحة إدارة التقييمات
│   └── store/
│       └── StorePage.jsx         # (محدثة) مع Carousel
└── lib/
    └── supabase.js              # (محدثة) مع reviewsApi
```

---

## 🔧 خطوات التثبيت والتشغيل

### 1️⃣ إنشاء جدول Reviews في Supabase

انسخ وشغّل SQL من ملف `REVIEWS_MIGRATION.sql`:

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  avatar TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2️⃣ التثبيت تم بالفعل ✅

```bash
npm install swiper
```

### 3️⃣ الاستخدام

#### في الصفحة الرئيسية (StorePage):
```jsx
import { ReviewsCarousel } from '../../components/ReviewsCarousel'
import { useReviews } from '../../hooks/useReviews'

function StorePage() {
  const { reviews, loading, error } = useReviews(true) // true = published only
  
  return (
    <ReviewsCarousel 
      reviews={reviews} 
      loading={loading} 
      error={error} 
    />
  )
}
```

#### في لوحة التحكم الإدمن:
اذهب إلى: **http://localhost:5173/admin/reviews**

---

## 🎯 المميزات التفصيلية

### 1. ReviewsCarousel (Swiper)

**المواصفات:**
- 📱 Responsive: 1 slide على mobile، 2 على tablet، 3 على desktop
- ⏱️ Auto play: كل 4 ثواني
- ◀️ Navigation arrows (السابق/التالي)
- 🔘 Pagination dots
- ♾️ Infinite loop (إلا إذا كانت أقل من 4 تقييمات)
- ⌨️ Keyboard support

**الملفات:**
- `src/components/ReviewsCarousel.jsx`

**الاستخدام:**
```jsx
<ReviewsCarousel 
  reviews={reviews} 
  loading={loading} 
  error={error} 
/>
```

---

### 2. ReviewCard Component

**المواصفات:**
- عرض اسم العميل
- ⭐ التقييم (1-5 نجوم)
- 📝 التعليق
- 🏷️ شارة المصدر (آيقونة + نص)
- 📸 صورة العميل (اختياري)

**الملفات:**
- `src/components/ReviewCard.jsx`

**الاستخدام:**
```jsx
<ReviewCard 
  name="أحمد"
  rating={5}
  comment="تقييمي الرائع"
  source="facebook"
  avatar="https://..."
/>
```

---

### 3. Admin Reviews Page

**المواصفات:**
- 📊 عرض إحصائيات: إجمالي، منشور، مخفي، متوسط التقييم
- 🔍 بحث حسب الاسم أو التعليق
- ➕ إضافة تقييم جديد
- 👁️ نشر/إخفاء التقييم
- 🗑️ حذف التقييم
- 📅 عرض تاريخ الإنشاء

**الملفات:**
- `src/pages/admin/AdminReviews.jsx`

**الوصول:**
- `http://localhost:5173/admin/reviews`

---

### 4. useReviews Hook

**المواصفات:**
- `getPublished()`: جلب التقييمات المنشورة فقط
- `getAll()`: جلب جميع التقييمات (للإدارة)
- `create()`: إضافة تقييم جديد
- `update()`: تحديثتقييم
- `delete()`: حذف تقييم

**الملفات:**
- `src/hooks/useReviews.js`

**الاستخدام:**
```jsx
const { reviews, loading, addReview, updateReview, deleteReview } = useReviews(true)

// إضافة تقييم
await addReview({ name: 'أحمد', rating: 5, comment: 'رائع!', source: 'facebook', is_published: true })

// تحديث
await updateReview(id, { is_published: false })

// حذف
await deleteReview(id)
```

---

## 📊 جدول Database

```
reviews
├── id (UUID) 🔑 - معرف فريد
├── name (TEXT) - اسم العميل
├── rating (INTEGER) - من 1 إلى 5
├── comment (TEXT) - نص التقييم
├── source (TEXT) - المصدر (facebook, instagram, whatsapp, google, manual)
├── avatar (TEXT) - رابط صورة (اختياري)
├── is_published (BOOLEAN) - منشور أم لا
├── created_at (TIMESTAMP) - تاريخ الإنشاء
└── updated_at (TIMESTAMP) - تاريخ آخر تحديث
```

---

## 🎨 تصميم غير متأثر

- ✅ **لم يتم تغيير أي CSS**
- ✅ **نفس الأيقونات والألوان (Gold, Ink, الخ)**
- ✅ **نفس الـ Tailwind classes**
- ✅ **بطاقات التقييم نفس التصميم الأصلي**
- ✅ **فقط تبديل البيانات من static إلى dynamic**

---

## 🚀 الخطوات التالية (إجراءات يدوية)

### 1. إنشاء الجدول

اذهب إلى Supabase SQL Editor وشغّل:
```sql
-- انسخ محتوى REVIEWS_MIGRATION.sql
```

### 2. اختبار النظام

```bash
npm run dev
```

ثم:
- اذهب إلى المصدر: `http://localhost:5173/#testimonials`
- يجب أن تظهر البيانات الثابتة إذا لم تكن هناك بيانات في DB
- بمجرد إضافة تقييمات عبر الإدمن، ستظهر في Carousel

### 3. إضافة تقييمات

- اذهب إلى: `http://admin/login?secret=<your_secret_key>`
- ثم: `/admin/reviews`
- اضغط "تقييم جديد" وأضف البيانات

---

## ⚙ الإعدادات المتقدمة

### تغيير وقت الـ Autoplay

في `src/components/ReviewsCarousel.jsx`:
```jsx
autoplay={{ 
  delay: 4000,      // بالملي ثانية (الحالي: 4 ثواني)
  disableOnInteraction: false,
  pauseOnMouseEnter: true 
}}
```

### تغيير عدد البطاقات حسب الشاشة

في `src/components/ReviewsCarousel.jsx`:
```jsx
breakpoints={{
  640: { slidesPerView: 1 },    // mobile
  768: { slidesPerView: 2 },    // tablet
  1024: { slidesPerView: 3 },   // desktop
}}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تظهر التقييمات
**الحل:**
1. تأكد من إنشاء جدول `reviews` في Supabase
2. أضف بعض البيانات (أو استخدم البيانات الثابتة fallback)
3. تحقق من Network tab في DevTools

### المشكلة: الـ Carousel لا يتحرك
**الحل:**
1. تأكد من تثبيت `swiper`: `npm install swiper`
2. أعد تشغيل `npm run dev`

### المشكلة: خطأ في الإضافة من الإدمن
**الحل:**
1. تأكد من تسجيل دخولك بشكل صحيح
2. تحقق من أن الجدول موجود في Supabase
3. تحقق من الإذن (RLS policies)

---

## 📝 Notes

- البيانات الثابتة موجودة كـ fallback عندما لا توجد بيانات في Supabase
- التقييمات المخفية (unpublished) لا تظهر في الصفحة الرئيسية
- التقييمات المخفية تظهر فقط في لوحة الإدمن
- الـ Carousel يدعم keyboard navigation (Arrow keys)

---

## 🎓 نصائح الأداء

1. **استخدم مصدر واحد**: لا تخلط بين Supabase وبيانات ثابتة
2. **قلل عدد التقييمات المعروضة**: حدد top 10 أو top 20 فقط
3. **استخدم pagination في Admin**: عند وجود مئات التقييمات

---

## 📞 الدعم

للمزيد من المعلومات:
- Swiper.js Docs: https://swiperjs.com/react
- Supabase Docs: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com

---

**تاريخ الإنشاء:** May 13, 2026  
**الإصدار:** 1.0.0  
**حالة النظام:** ✅ جاهز للإنتاج
