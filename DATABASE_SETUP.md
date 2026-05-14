# إعداد قاعدة البيانات والربط

هذا الملف يشرح كيفية ربط متجر الكتب بقاعدة البيانات Supabase وتحميل البيانات التجريبية.

## الخطوات:

### 1. إعداد قاعدة البيانات (Supabase Schema)
قم بتنفيذ الأوامر التالية في SQL Editor لـ Supabase:

**الخطوة الأولى**: نسخ محتوى ملف `supabase_schema.sql` والصقه في SQL Editor:
- اذهب إلى [Supabase Dashboard](https://app.supabase.com)
- اختر مشروعك
- انقر على "SQL Editor" من القائمة اليسرى
- انسخ محتوى `supabase_schema.sql` والصقه
- اضغط "Run"

**الخطوة الثانية**: تحميل البيانات التجريبية من `supabase_seed.sql`:
- انسخ محتوى `supabase_seed.sql` والصقه في SQL Editor
- اضغط "Run"

### 2. التحقق من متغيرات البيئة
تأكد من أن ملف `.env` يحتوي على:
```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_anon_key"
```

### 3. تشغيل التطبيق
```bash
npm install
npm run dev
```

ستجد قائمة بالكتب التجريبية على الصفحة الرئيسية.

## الربط بين الأجزاء المختلفة:

### 1. **صفحة المتجر (StorePage.jsx)**
- ✅ تحميل الكتب من قاعدة البيانات
- ✅ تحميل الفئات من قاعدة البيانات
- ✅ تحميل الإعدادات من قاعدة البيانات
- ✅ عرض الإعدادات (رقم واتساب، العنوان، الصورة الخلفية)

### 2. **نموذج إتمام الطلب**
- ✅ حفظ الطلبات في قاعدة البيانات
- ✅ حفظ عناصر الطلب (OrderItems)
- ✅ تسجيل سجل الطلب (OrderHistory)
- ✅ إرسال ملخص الطلب عبر واتساب

### 3. **لوحة التحكم (Admin)**
- ✅ عرض الطلبات من قاعدة البيانات
- ✅ تحديث حالة الطلبات
- ✅ إدارة الكتب (إضافة، تعديل، حذف)
- ✅ إدارة الإعدادات
- ✅ عرض إحصائيات المبيعات

## البيانات والجداول الرئيسية:

### جدول `books` (الكتب)
| الحقل | النوع | الملاحظات |
|------|------|---------|
| id | UUID | معرف فريد |
| title | TEXT | عنوان الكتاب |
| author | TEXT | المؤلف |
| price | DECIMAL | السعر بالدينار |
| category | TEXT | الفئة |
| is_featured | BOOLEAN | مميز؟ |
| is_new_release | BOOLEAN | جديد؟ |
| stock | INTEGER | المخزون |

### جدول `orders` (الطلبات)
| الحقل | النوع | الملاحظات |
|------|------|---------|
| order_number | SERIAL | رقم الطلب | 
| customer_name | TEXT | اسم العميل |
| customer_phone | TEXT | رقم الهاتف |
| total | DECIMAL | الإجمالي |
| status | TEXT | الحالة (pending, confirmed, etc) |
| payment_method | TEXT | طريقة الدفع |

### جدول `store_settings` (إعدادات المتجر)
| الحقل | القيمة |
|------|-------|
| store_name | اسم المتجر |
| whatsapp_number | رقم واتساب |
| hero_title | عنوان البطل |
| store_description | وصف المتجر |

## أمثلة العمليات:

### جلب الكتب:
```javascript
const { data: books } = await booksApi.getAll()
```

### إنشاء طلب جديد:
```javascript
const order = await ordersApi.create(orderData, cartItems)
```

### تحديث إعدادات المتجر:
```javascript
await settingsApi.update({ store_name: 'مكتبتي' })
```

## استكشاف الأخطاء:

### لا تظهر الكتب:
- تحقق من أن `supabase_seed.sql` تم تنفيذها بنجاح
- تأكد من أن رقم المشروع صحيح في `.env`
- افتح Supabase Dashboard وتحقق من جدول `books`

### الطلبات لا تحفظ:
- تأكد من أن الجداول موجودة: `orders`, `order_items`, `order_history`
- تحقق من RLS Policies في Supabase

### الإعدادات لا تظهر:
- تأكد من وجود بيانات في جدول `store_settings`
- تحقق من رسائل الخطأ في متصفح Console

## الخطوات التالية:

1. **إضافة المزيد من الكتب**: أضف كتب حقيقية إلى جدول `books`
2. **تخصيص الإعدادات**: عدّل بيانات `store_settings` حسب احتياجاتك
3. **تفعيل المدفوعات**: أضف بيانات بريدي موب والتوصيل الفعلي
4. **تتبع الطلبات**: ربط API ياليدين للتتبع التلقائي

---

**ملاحظة**: تأكد من نسخ `supabase_schema.sql` إلى القاعدة أولاً قبل `supabase_seed.sql`
