-- ==================== Reviews Table Migration ====================
-- Run this SQL in Supabase SQL Editor to create the reviews table

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('facebook', 'instagram', 'whatsapp', 'google', 'manual')),
  avatar TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_is_published ON reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source);

-- Sample data (optional, delete if not needed)
INSERT INTO reviews (name, rating, comment, source, is_published) VALUES
  ('أحمد - الجزائر العاصمة', 5, 'توصيل ياليدين سريع جداً، استلمت كتبي في 24 ساعة فقط. خدمة ممتازة!', 'manual', true),
  ('سارة - وهران', 5, 'دفعت ببريدي موب وكان سهلاً جداً. الكتب وصلت بحالة مثالية. أنصح بهذا المتجر.', 'manual', true),
  ('كريم - قسنطينة', 5, 'اخترت الاستلام من مكتب ياليدين وكان الأسرع. سعر التوصيل مناسب جداً.', 'manual', true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read of published reviews only
CREATE POLICY "allow_public_read_published_reviews" ON reviews
  FOR SELECT
  USING (is_published = true);

-- Create policy to allow admin operations
CREATE POLICY "allow_admin_all_operations" ON reviews
  FOR ALL
  USING (true);  -- Replace with proper auth check in production

-- ==================== Notes ====================
-- 1. إذا كنت تستخدم Supabase Auth مع claims مخصصة، قم بتحديث الـ policy:
--    USING (auth.jwt() ->> 'role' = 'admin')
-- 2. Source values: 'facebook', 'instagram', 'whatsapp', 'google', 'manual'
-- 3. الحد الأقصى للتقييم: 5 نجوم، الحد الأدنى: 1
-- 4. is_published: يحدد ما إذا كان التقييم مرئياً على الموقع الرئيسي
