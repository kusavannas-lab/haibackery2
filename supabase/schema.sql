-- ==============================================================================
-- HIGH BAKERY - COMPLETE SUPABASE POSTGRESQL SCHEMA & MULTI-USER SYNC
-- Barrage Center, Bommika, Hiramandalam, Srikakulam – 532459, Andhra Pradesh
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  icon TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT,
  category_name TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  cost_price NUMERIC DEFAULT 0 CHECK (cost_price >= 0),
  stock_count INTEGER DEFAULT 50,
  image_url TEXT,
  unit TEXT DEFAULT 'pack',
  in_stock BOOLEAN DEFAULT TRUE,
  is_visible BOOLEAN DEFAULT TRUE,
  is_admin_added BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bulk Catalog Table (Sweets & Bakery KG Rates)
CREATE TABLE IF NOT EXISTS public.bulk_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rate_per_kg NUMERIC NOT NULL CHECK (rate_per_kg >= 0),
  is_available BOOLEAN DEFAULT TRUE,
  unit TEXT DEFAULT 'kg',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Photo Cake Global Config Table (Shapes, Flavors, Master Toggle)
CREATE TABLE IF NOT EXISTS public.photo_cake_config (
  id TEXT PRIMARY KEY DEFAULT 'main_config',
  is_enabled BOOLEAN DEFAULT TRUE,
  flavors JSONB NOT NULL DEFAULT '[]'::jsonb,
  weights JSONB NOT NULL DEFAULT '[]'::jsonb,
  shapes JSONB NOT NULL DEFAULT '[]'::jsonb,
  print_charge NUMERIC DEFAULT 150,
  time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  profit_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL,
  unit_cost NUMERIC DEFAULT 0
);

-- 8. Photo Cake Requests Table
CREATE TABLE IF NOT EXISTS public.photo_cake_requests (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  cake_flavor TEXT NOT NULL,
  cake_weight TEXT NOT NULL,
  cake_shape TEXT DEFAULT 'Round',
  image_url TEXT NOT NULL,
  message TEXT,
  special_notes TEXT,
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  status TEXT DEFAULT 'Received',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_cake_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_cake_requests ENABLE ROW LEVEL SECURITY;

-- 1. Categories Policies
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories" ON public.categories FOR ALL USING (TRUE);

-- 2. Products Policies
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admin can manage products" ON public.products FOR ALL USING (TRUE);

-- 3. Bulk Catalog Policies
DROP POLICY IF EXISTS "Public can view bulk catalog" ON public.bulk_catalog;
CREATE POLICY "Public can view bulk catalog" ON public.bulk_catalog FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admin can manage bulk catalog" ON public.bulk_catalog;
CREATE POLICY "Admin can manage bulk catalog" ON public.bulk_catalog FOR ALL USING (TRUE);

-- 4. Photo Cake Config Policies
DROP POLICY IF EXISTS "Public can view photo cake config" ON public.photo_cake_config;
CREATE POLICY "Public can view photo cake config" ON public.photo_cake_config FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admin can manage photo cake config" ON public.photo_cake_config;
CREATE POLICY "Admin can manage photo cake config" ON public.photo_cake_config FOR ALL USING (TRUE);

-- 5. Orders Policies
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;
CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders" ON public.orders FOR UPDATE USING (TRUE);

-- 6. Order Items Policies
DROP POLICY IF EXISTS "Anyone can manage order items" ON public.order_items;
CREATE POLICY "Anyone can manage order items" ON public.order_items FOR ALL USING (TRUE);

-- 7. Photo Cake Requests Policies
DROP POLICY IF EXISTS "Anyone can submit photo cake requests" ON public.photo_cake_requests;
CREATE POLICY "Anyone can submit photo cake requests" ON public.photo_cake_requests FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Anyone can view photo cake requests" ON public.photo_cake_requests;
CREATE POLICY "Anyone can view photo cake requests" ON public.photo_cake_requests FOR ALL USING (TRUE);

-- ==============================================================================
-- STORAGE BUCKETS (FOR PHOTOS)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('cake-photos', 'cake-photos', TRUE),
  ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DROP POLICY IF EXISTS "Allow public uploads to cake-photos" ON storage.objects;
CREATE POLICY "Allow public uploads to cake-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cake-photos');

DROP POLICY IF EXISTS "Allow public read cake-photos" ON storage.objects;
CREATE POLICY "Allow public read cake-photos" ON storage.objects FOR SELECT USING (bucket_id = 'cake-photos');

DROP POLICY IF EXISTS "Allow public uploads to product-images" ON storage.objects;
CREATE POLICY "Allow public uploads to product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public read product-images" ON storage.objects;
CREATE POLICY "Allow public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- ==============================================================================
-- SEED INITIAL CATEGORIES & DEFAULT PRODUCTS
-- ==============================================================================

INSERT INTO public.categories (id, name, slug, icon, is_visible) VALUES
('cat-sweets', 'Sweets & Mithai', 'sweets', 'Candy', TRUE),
('cat-biscuits', 'Biscuits & Cookies', 'biscuits', 'Cookie', TRUE),
('cat-cakes', 'Celebration Cakes', 'cakes', 'Cake', TRUE),
('cat-savories', 'Savories & Snacks', 'savories', 'UtensilsCrossed', TRUE),
('cat-photo-cakes', 'Custom Photo Cakes', 'photo-cakes', 'Camera', TRUE)
ON CONFLICT (id) DO UPDATE SET is_visible = EXCLUDED.is_visible;

INSERT INTO public.products (id, title, description, category_id, category_name, price, cost_price, stock_count, image_url, unit, in_stock, is_visible) VALUES
('prod-kaju-katli', 'Premium Kaju Katli', 'Melt-in-mouth diamond cut cashew fudge made with 100% pure Goan cashews and edible silver leaf.', 'cat-sweets', 'Sweets & Mithai', 480.00, 320.00, 50, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80', '500g', TRUE, TRUE),
('prod-gulab-jamun', 'Desi Ghee Gulab Jamun (10 Pcs)', 'Soft golden dumplings soaked in fragrant cardamom & saffron sugar syrup made with pure desi ghee.', 'cat-sweets', 'Sweets & Mithai', 260.00, 160.00, 45, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', 'Box', TRUE, TRUE),
('prod-motichoor-laddu', 'Motichoor Pure Ghee Laddu', 'Fine melt-in-mouth gram flour pearls cooked in desi ghee, infused with green cardamom & pistachio.', 'cat-sweets', 'Sweets & Mithai', 320.00, 210.00, 40, 'https://images.unsplash.com/photo-1601050690113-172e2cf1758f?auto=format&fit=crop&w=800&q=80', '500g', TRUE, TRUE),
('prod-mysore-pak', 'Royal Ghee Mysore Pak', 'Traditional Andhra-style crumbly and melt-in-mouth sweet packed with rich aroma of clarified butter.', 'cat-sweets', 'Sweets & Mithai', 340.00, 220.00, 35, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80', '500g', TRUE, TRUE),
('prod-osmania-biscuits', 'High Bakery Osmania Chai Biscuits', 'Our signature buttery, slightly salty tea biscuits baked fresh every morning. Best enjoyed with Irani chai.', 'cat-biscuits', 'Biscuits & Cookies', 140.00, 80.00, 80, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80', '400g Pack', TRUE, TRUE),
('prod-tutti-frutti', 'Hyderabadi Tutti Frutti Biscuits', 'Crisp bakery biscuits studded with candied fruit bits and cashew nuts.', 'cat-biscuits', 'Biscuits & Cookies', 160.00, 95.00, 60, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80', '400g Pack', TRUE, TRUE),
('prod-truffle-cake', 'Belgian Dutch Truffle Cake (1kg)', 'Rich dark chocolate ganache layered between moist chocolate sponge, finished with Belgian glaze.', 'cat-cakes', 'Celebration Cakes', 650.00, 380.00, 15, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', '1 kg', TRUE, TRUE),
('prod-black-forest', 'Classic Black Forest Cherry Cake (1kg)', 'Fluffy chocolate sponge, vanilla whipped cream, candied red cherries and chocolate shavings.', 'cat-cakes', 'Celebration Cakes', 550.00, 320.00, 15, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80', '1 kg', TRUE, TRUE),
('prod-andhra-mixture', 'Special Andhra Bakery Mixture', 'Spicy crunchy mixture of sev, roasted peanuts, fried curry leaves, cashews and secret bakery spices.', 'cat-savories', 'Savories & Snacks', 130.00, 75.00, 75, 'https://images.unsplash.com/photo-1613728913341-8f29e26e088d?auto=format&fit=crop&w=800&q=80', '350g Pack', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Initial Photo Cake Config
INSERT INTO public.photo_cake_config (id, is_enabled, flavors, weights, shapes, print_charge, time_slots)
VALUES (
  'main_config',
  TRUE,
  '[
    {"id": "flv-1", "name": "Belgian Chocolate Truffle", "pricePerKg": 750, "color": "chocolate", "is_available": true},
    {"id": "flv-2", "name": "Classic Black Forest Cherry", "pricePerKg": 650, "color": "blackforest", "is_available": true},
    {"id": "flv-3", "name": "Red Velvet Cream Cheese", "pricePerKg": 800, "color": "redvelvet", "is_available": true},
    {"id": "flv-4", "name": "Butterscotch Caramel Crunch", "pricePerKg": 680, "color": "butterscotch", "is_available": true},
    {"id": "flv-5", "name": "Fresh Pineapple Delight", "pricePerKg": 620, "color": "vanilla", "is_available": true},
    {"id": "flv-6", "name": "Alphonso Mango Cream", "pricePerKg": 700, "color": "mango", "is_available": true}
  ]'::jsonb,
  '[
    {"id": "w-1", "label": "1.0 kg (Standard)", "value": "1.0 kg", "multiplier": 1.0, "is_available": true},
    {"id": "w-2", "label": "1.5 kg (Celebration)", "value": "1.5 kg", "multiplier": 1.5, "is_available": true},
    {"id": "w-3", "label": "2.0 kg (Party Size)", "value": "2.0 kg", "multiplier": 2.0, "is_available": true},
    {"id": "w-4", "label": "3.0 kg (Grand Event)", "value": "3.0 kg", "multiplier": 3.0, "is_available": true},
    {"id": "w-5", "label": "0.5 kg (Mini Bento)", "value": "0.5 kg", "multiplier": 0.6, "is_available": true}
  ]'::jsonb,
  '[
    {"id": "sh-1", "name": "Round", "label": "Classic Round ⭕", "extraPrice": 0, "is_available": true},
    {"id": "sh-2", "name": "Square", "label": "Modern Square ⏹️", "extraPrice": 0, "is_available": true},
    {"id": "sh-3", "name": "Heart", "label": "Romantic Heart ❤️", "extraPrice": 50, "is_available": true}
  ]'::jsonb,
  150,
  '["10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM", "06:00 PM - 08:00 PM", "08:00 PM - 10:00 PM"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

