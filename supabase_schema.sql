-- =============================================
-- مخطط قاعدة البيانات - مكتبة الكتب الاحترافية
-- =============================================

-- تفعيل UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- جدول الكتب
-- =============================================
CREATE TABLE books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  isbn TEXT UNIQUE,
  publisher TEXT,
  publish_year INTEGER,
  pages INTEGER,
  language TEXT DEFAULT 'ar',
  is_featured BOOLEAN DEFAULT false,
  is_new_release BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- جدول الطلبات
-- =============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number SERIAL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_state TEXT,
  
  -- بيانات الدفع
  payment_method TEXT DEFAULT 'cash_on_delivery', -- cash_on_delivery, card, transfer
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
  
  -- بيانات التوصيل
  delivery_company TEXT, -- aramex, smsa, dhl, fedex, custom
  delivery_type TEXT DEFAULT 'standard', -- standard, express, same_day
  tracking_number TEXT,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  estimated_delivery DATE,
  
  -- حالة الطلب
  status TEXT DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, returned
  
  -- المبالغ
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- ملاحظات
  notes TEXT,
  admin_notes TEXT,
  
  -- مصدر الطلب
  source TEXT DEFAULT 'website', -- website, whatsapp, instagram, facebook, tiktok
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- جدول عناصر الطلب
-- =============================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10,2) NOT NULL
);

-- =============================================
-- جدول إعدادات المتجر
-- =============================================
CREATE TABLE store_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إدراج الإعدادات الافتراضية
INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'مكتبة الكتب'),
  ('store_phone', '966512345678'),
  ('store_email', 'info@bookstore.com'),
  ('store_address', 'الرياض، المملكة العربية السعودية'),
  ('whatsapp_number', '966512345678'),
  ('currency', 'SAR'),
  ('currency_symbol', 'دج'),
  ('facebook_pixel', ''),
  ('tiktok_pixel', ''),
  ('instagram_pixel', ''),
  ('google_analytics', ''),
  ('facebook_url', ''),
  ('instagram_url', ''),
  ('twitter_url', ''),
  ('tiktok_url', ''),
  ('snapchat_url', ''),
  ('youtube_url', ''),
  ('delivery_standard_fee', '25'),
  ('delivery_express_fee', '50'),
  ('delivery_same_day_fee', '75'),
  ('free_delivery_threshold', '200'),
  ('aramex_enabled', 'true'),
  ('smsa_enabled', 'true'),
  ('dhl_enabled', 'false'),
  ('hero_title', 'اكتشف أفضل الكتب التي تستحق القراءة'),
  ('hero_subtitle', 'مكتبة متكاملة من أحدث الكتب العربية والأجنبية'),
  ('hero_image', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200');

-- =============================================
-- جدول الفئات
-- =============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('روايات', 'novels', '📚', 1),
  ('تطوير ذات', 'self-development', '🌟', 2),
  ('إدارة وأعمال', 'business', '💼', 3),
  ('خيال علمي', 'sci-fi', '🚀', 4),
  ('كتب أطفال', 'children', '🧸', 5),
  ('كتب تعليمية', 'educational', '🎓', 6),
  ('تاريخ', 'history', '🏛️', 7),
  ('فلسفة', 'philosophy', '🤔', 8);

-- =============================================
-- جدول سجل الأحداث (للطلبات)
-- =============================================
CREATE TABLE order_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- السماح لجميع العمليات العامة على جداول المتجر
CREATE POLICY "books_public_select" ON books FOR SELECT USING (true);
CREATE POLICY "books_public_insert" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "books_public_update" ON books FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "books_public_delete" ON books FOR DELETE USING (true);

CREATE POLICY "categories_public_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_public_insert" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "categories_public_update" ON categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "categories_public_delete" ON categories FOR DELETE USING (true);

CREATE POLICY "settings_public_select" ON store_settings FOR SELECT USING (true);
CREATE POLICY "settings_public_insert" ON store_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_public_update" ON store_settings FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "orders_public_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_public_update" ON orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "orders_public_delete" ON orders FOR DELETE USING (true);

CREATE POLICY "order_items_public_select" ON order_items FOR SELECT USING (true);
CREATE POLICY "order_items_public_insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_public_update" ON order_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "order_items_public_delete" ON order_items FOR DELETE USING (true);

CREATE POLICY "order_history_public_select" ON order_history FOR SELECT USING (true);
CREATE POLICY "order_history_public_insert" ON order_history FOR INSERT WITH CHECK (true);
CREATE POLICY "order_history_public_update" ON order_history FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "order_history_public_delete" ON order_history FOR DELETE USING (true);

-- =============================================
-- Trigger لتحديث updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- تحديث جدول الطلبات لدعم ي + بريدي موب
-- =============================================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_state TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- تحديث payment_method: أضف 'baridimob'
-- تحديث delivery_company: القيمة الافتراضية 'yalidine'
-- تحديث delivery_type: القيم home | office

-- تحديث الإعدادات الافتراضية ليالتيدن
INSERT INTO store_settings (key, value) VALUES
  ('yalidine_token', ''),
  ('yalidine_refresh_token', ''),
  ('yalidine_custom_prices', '{}'),
  ('delivery_home_enabled', 'true'),
  ('delivery_office_enabled', 'true'),
  ('payment_cod_enabled', 'true'),
  ('payment_baridimob_enabled', 'true'),
  ('baridimob_ccp', ''),
  ('baridimob_key', ''),
  ('baridimob_name', ''),
  ('baridimob_rip', ''),
  ('baridimob_instructions', ''),
  ('free_delivery_threshold', '0'),
  ('currency', 'DZD'),
  ('currency_symbol', 'دج')
ON CONFLICT (key) DO NOTHING;
