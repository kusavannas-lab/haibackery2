-- ==============================================================================
-- HIGH BAKERY - SEED DATA SCRIPT
-- ==============================================================================

-- 1. Insert Default Categories
INSERT INTO public.categories (id, name, slug, icon, is_visible) VALUES
('c1000000-0000-0000-0000-000000000001', 'Sweets & Mithai', 'sweets', 'Candy', TRUE),
('c1000000-0000-0000-0000-000000000002', 'Biscuits & Cookies', 'biscuits', 'Cookie', TRUE),
('c1000000-0000-0000-0000-000000000003', 'Celebration Cakes', 'cakes', 'Cake', TRUE),
('c1000000-0000-0000-0000-000000000004', 'Savories & Snacks', 'savories', 'UtensilsCrossed', TRUE),
('c1000000-0000-0000-0000-000000000005', 'Custom Photo Cakes', 'photo-cakes', 'Camera', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Products
INSERT INTO public.products (id, title, description, category_id, price, cost_price, image_url, unit, in_stock, is_visible) VALUES
-- Sweets
('p1000000-0000-0000-0000-000000000001', 'Premium Kaju Katli', 'Melt-in-mouth diamond cut cashew fudge made with 100% pure Goan cashews and edible silver leaf.', 'c1000000-0000-0000-0000-000000000001', 480.00, 320.00, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80', '500g', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000002', 'Desi Ghee Gulab Jamun (10 Pcs)', 'Soft golden dumplings soaked in fragrant cardamom & saffron sugar syrup made with pure desi ghee.', 'c1000000-0000-0000-0000-000000000001', 260.00, 160.00, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', 'Box', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000003', 'Motichoor Pure Ghee Laddu', 'Fine melt-in-mouth gram flour pearls cooked in desi ghee, infused with green cardamom & pistachio.', 'c1000000-0000-0000-0000-000000000001', 320.00, 210.00, 'https://images.unsplash.com/photo-1601050690113-172e2cf1758f?auto=format&fit=crop&w=800&q=80', '500g', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000004', 'Royal Ghee Mysore Pak', 'Traditional Andhra-style crumbly and melt-in-mouth sweet packed with rich aroma of clarified butter.', 'c1000000-0000-0000-0000-000000000001', 340.00, 220.00, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80', '500g', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000005', 'Bengali Sponge Rasgulla (10 Pcs)', 'Spongy, juicy cottage cheese balls delicately poached in light rose syrup.', 'c1000000-0000-0000-0000-000000000001', 240.00, 150.00, 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80', 'Box', TRUE, TRUE),

-- Biscuits & Cookies
('p1000000-0000-0000-0000-000000000006', 'High Bakery Osmania Chai Biscuits', 'Our signature buttery, slightly salty tea biscuits baked fresh every morning. Best enjoyed with Irani chai.', 'c1000000-0000-0000-0000-000000000002', 140.00, 80.00, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80', '400g Pack', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000007', 'Hyderabadi Tutti Frutti Biscuits', 'Crisp bakery biscuits studded with candied fruit bits and cashew nuts.', 'c1000000-0000-0000-0000-000000000002', 160.00, 95.00, 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80', '400g Pack', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000008', 'Roasted Cashew Salted Cookies', 'Crunchy artisan cookies loaded with hand-roasted cashew chunks and a touch of sea salt.', 'c1000000-0000-0000-0000-000000000002', 190.00, 110.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', '350g Pack', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000009', 'Desi Nankhatai Butter Cookies', 'Traditional Indian shortbread cookies baked with cardamom, saffron and pure butter.', 'c1000000-0000-0000-0000-000000000002', 150.00, 85.00, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', '400g Pack', TRUE, TRUE),

-- Cakes
('p1000000-0000-0000-0000-000000000010', 'Belgian Dutch Truffle Cake (1kg)', 'Rich dark chocolate ganache layered between moist chocolate sponge, finished with Belgian glaze.', 'c1000000-0000-0000-0000-000000000003', 650.00, 380.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', '1 kg', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000011', 'Classic Black Forest Cherry Cake (1kg)', 'Fluffy chocolate sponge, vanilla whipped cream, candied red cherries and chocolate shavings.', 'c1000000-0000-0000-0000-000000000003', 550.00, 320.00, 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80', '1 kg', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000012', 'Velvet Cream Cheese Cake (1kg)', 'Crimson cocoa sponge layered with silken cream cheese frosting and white chocolate curls.', 'c1000000-0000-0000-0000-000000000003', 700.00, 420.00, 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80', '1 kg', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000013', 'Butterscotch Caramel Crunch (1kg)', 'Vanilla sponge drenched in butterscotch nectar, topped with handmade crunchy butter praline.', 'c1000000-0000-0000-0000-000000000003', 580.00, 340.00, 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80', '1 kg', TRUE, TRUE),

-- Savories & Snacks
('p1000000-0000-0000-0000-000000000014', 'Special Andhra Bakery Mixture', 'Spicy crunchy mixture of sev, roasted peanuts, fried curry leaves, cashews and secret bakery spices.', 'c1000000-0000-0000-0000-000000000004', 130.00, 75.00, 'https://images.unsplash.com/photo-1613728913341-8f29e26e088d?auto=format&fit=crop&w=800&q=80', '350g Pack', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000015', 'Crispy Ribbon Murukku (Pakoda)', 'Traditional South Indian crunchy ribbon snack made with rice flour, gram flour, and sesame seeds.', 'c1000000-0000-0000-0000-000000000004', 120.00, 70.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', '300g Pack', TRUE, TRUE),
('p1000000-0000-0000-0000-000000000016', 'Spicy Garlic Kara Boondi', 'Crispy round chickpea pearls tossed with fried garlic, curry leaves, and roasted peanuts.', 'c1000000-0000-0000-0000-000000000004', 110.00, 60.00, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80', '300g Pack', TRUE, TRUE),

-- Photo Cake Feature
('p1000000-0000-0000-0000-000000000017', 'Personalized Photo Cake (Custom)', 'Edible high-resolution printed photo cake with custom message, choice of premium flavors & fresh cream.', 'c1000000-0000-0000-0000-000000000005', 850.00, 480.00, 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80', '1 kg+', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;
