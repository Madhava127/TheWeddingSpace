-- 0002_seed.sql

INSERT INTO halls (name, slug, description, address, city, state, pincode, capacity_min, capacity_max, base_price, price_per_plate_veg, price_per_plate_nonveg, advance_percent, amenities, images, cover_image, is_active, rating) VALUES
('Royal Palm Banquet', 'royal-palm-banquet', 'A luxurious hall perfect for grand Indian weddings with elegant interiors.', '123 Royal Avenue', 'Mumbai', 'Maharashtra', '400001', 200, 1000, 50000.00, 800.00, 1000.00, 20.00, ARRAY['AC', 'Parking', 'Bridal Room', 'DJ Setup'], ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80', true, 4.8),
('Sri Lakshmi Mahal', 'sri-lakshmi-mahal', 'Traditional yet modern hall suitable for authentic South Indian weddings.', '45 Temple Road', 'Chennai', 'Tamil Nadu', '600001', 100, 800, 30000.00, 600.00, 800.00, 20.00, ARRAY['AC', 'Generator Backup', 'Dining Hall', 'Valet Parking'], ARRAY['https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80', true, 4.5),
('The Grand Orchid', 'the-grand-orchid', 'Premium wedding venue offering world-class facilities and breathtaking decor.', '789 Grand Blvd', 'Delhi', 'Delhi', '110001', 500, 2000, 100000.00, 1200.00, 1500.00, 25.00, ARRAY['AC', 'Lawn Area', 'Swimming Pool', 'Catering'], ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80', true, 4.9);

WITH fc1 AS (INSERT INTO food_categories (name, description, sort_order) VALUES ('Starters', 'Delicious appetizers to start the feast', 1) RETURNING id),
fc2 AS (INSERT INTO food_categories (name, description, sort_order) VALUES ('Main Course', 'Hearty and fulfilling main dishes', 2) RETURNING id),
fc3 AS (INSERT INTO food_categories (name, description, sort_order) VALUES ('Biryani & Rice', 'Flavored rice varieties', 3) RETURNING id),
fc4 AS (INSERT INTO food_categories (name, description, sort_order) VALUES ('Desserts', 'Sweet endings', 4) RETURNING id)
INSERT INTO food_items (category_id, name, description, price_per_plate, is_veg, is_active, cuisine)
SELECT id, 'Paneer Tikka', 'Tandoori paneer skewers', 150.00, true, true, 'North Indian' FROM fc1 UNION ALL
SELECT id, 'Chicken 65', 'Spicy deep-fried chicken', 200.00, false, true, 'South Indian' FROM fc1 UNION ALL
SELECT id, 'Gobi Manchurian', 'Indo-Chinese cauliflower', 120.00, true, true, 'Indo-Chinese' FROM fc1 UNION ALL
SELECT id, 'Butter Chicken', 'Creamy tomato gravy', 300.00, false, true, 'North Indian' FROM fc2 UNION ALL
SELECT id, 'Dal Makhani', 'Slow-cooked black lentils', 180.00, true, true, 'North Indian' FROM fc2 UNION ALL
SELECT id, 'Hyderabadi Chicken Biryani', 'Authentic dum biryani', 250.00, false, true, 'Hyderabadi' FROM fc3 UNION ALL
SELECT id, 'Veg Pulao', 'Mixed vegetable rice', 150.00, true, true, 'North Indian' FROM fc3 UNION ALL
SELECT id, 'Gulab Jamun', 'Sweet milk solids in syrup', 80.00, true, true, 'Indian' FROM fc4 UNION ALL
SELECT id, 'Rasmalai', 'Soft paneer balls in sweetened milk', 100.00, true, true, 'Indian' FROM fc4;

INSERT INTO decoration_packages (name, description, price, images, cover_image, includes, is_active) VALUES
('Floral Elegance', 'Beautiful floral arrangements for a classic look.', 45000.00, ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80', ARRAY['Stage Backdrop', 'Entrance Arch', 'Table Centerpieces', 'Lighting'], true),
('Royal Gold', 'Opulent golden themed decor for a royal vibe.', 75000.00, ARRAY['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80', ARRAY['Golden Pillars', 'Crystal Chandeliers', 'Premium Sofa', 'LED Wall'], true),
('Minimal Pastel', 'Subtle pastel shades for a modern minimal wedding.', 35000.00, ARRAY['https://images.unsplash.com/photo-1522413452208-9969062f274a?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1522413452208-9969062f274a?auto=format&fit=crop&q=80', ARRAY['Drapery', 'Fairy Lights', 'Minimal Stage', 'Photo Booth'], true),
('Traditional South Indian', 'Authentic traditional decor with banana leaves and marigolds.', 40000.00, ARRAY['https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80', ARRAY['Banana Leaf Backdrop', 'Marigold Strings', 'Brass Lamps', 'Kolam'], true);

INSERT INTO photography_packages (name, description, price, duration_hours, features, images, cover_image, is_active) VALUES
('Basic', 'Essential coverage for your special day.', 25000.00, 6, ARRAY['1 Photographer', '1 Videographer', 'Edited Photos', 'Highlight Video'], ARRAY['https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80', true),
('Standard', 'Comprehensive coverage capturing all moments.', 45000.00, 10, ARRAY['2 Photographers', '2 Videographers', 'Drone Shoot', 'Cinematic Video', 'Album'], ARRAY['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80', true),
('Premium', 'The ultimate photography and cinematic experience.', 75000.00, 14, ARRAY['Candid Photographer', 'Traditional Photographer', 'Cinematographers', 'Pre-wedding Shoot', 'Premium Albums'], ARRAY['https://images.unsplash.com/photo-1606216794074-735e91ce2c92?auto=format&fit=crop&q=80'], 'https://images.unsplash.com/photo-1606216794074-735e91ce2c92?auto=format&fit=crop&q=80', true);

INSERT INTO site_settings (id, gst_percent, default_advance_percent, contact_email, contact_phone, address, instagram_url, facebook_url, razorpay_key_id) VALUES
(1, 18.00, 20.00, 'hello@theweddingspace.com', '+91-9876543210', '123 Wedding Space HQ, Mumbai', 'https://instagram.com', 'https://facebook.com', 'rzp_test_PLACEHOLDER_REPLACE_WITH_TEST_KEY')
ON CONFLICT (id) DO UPDATE SET contact_email = EXCLUDED.contact_email;
