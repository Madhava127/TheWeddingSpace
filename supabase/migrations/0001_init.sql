-- 0001_init.sql

-- Enable pgcrypto for UUIDs if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for creating profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. halls
CREATE TABLE halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    capacity_min INT,
    capacity_max INT,
    base_price NUMERIC(12,2),
    price_per_plate_veg NUMERIC(10,2),
    price_per_plate_nonveg NUMERIC(10,2),
    advance_percent NUMERIC(5,2) DEFAULT 20,
    amenities TEXT[],
    images TEXT[],
    cover_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    rating NUMERIC(2,1) DEFAULT 4.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_halls_is_active ON halls(is_active);

-- 3. hall_blocked_dates
CREATE TABLE hall_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id UUID REFERENCES halls(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hall_id, blocked_date)
);

-- 4. food_categories
CREATE TABLE food_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. food_items
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES food_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    price_per_plate NUMERIC(10,2),
    is_veg BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    cuisine TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_food_items_category_id ON food_items(category_id);

-- 6. decoration_packages
CREATE TABLE decoration_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2),
    images TEXT[],
    cover_image TEXT,
    includes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. photography_packages
CREATE TABLE photography_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12,2),
    duration_hours INT,
    features TEXT[],
    images TEXT[],
    cover_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    hall_id UUID REFERENCES halls(id),
    event_date DATE NOT NULL,
    event_type TEXT,
    guest_count INT,
    decoration_package_id UUID REFERENCES decoration_packages(id),
    photography_package_id UUID REFERENCES photography_packages(id),
    hall_amount NUMERIC(12,2),
    food_amount NUMERIC(12,2),
    decoration_amount NUMERIC(12,2),
    photography_amount NUMERIC(12,2),
    subtotal NUMERIC(12,2),
    gst_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2),
    advance_amount NUMERIC(12,2),
    balance_amount NUMERIC(12,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','advance_paid','paid','refunded')),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    special_requests TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);

-- 9. booking_food_items
CREATE TABLE booking_food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id),
    quantity INT,
    unit_price NUMERIC(10,2),
    line_total NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount NUMERIC(12,2),
    currency TEXT DEFAULT 'INR',
    status TEXT,
    method TEXT,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. contact_enquiries
CREATE TABLE contact_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. site_settings
CREATE TABLE site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    gst_percent NUMERIC(5,2) DEFAULT 18,
    default_advance_percent NUMERIC(5,2) DEFAULT 20,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    razorpay_key_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public) VALUES 
('hall-images', 'hall-images', true),
('food-images', 'food-images', true),
('decoration-images', 'decoration-images', true),
('photography-images', 'photography-images', true),
('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Configuration
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoration_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photography_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policies: public select
CREATE POLICY "Public select halls" ON halls FOR SELECT USING (is_active = true);
CREATE POLICY "Public select food_categories" ON food_categories FOR SELECT USING (true);
CREATE POLICY "Public select food_items" ON food_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public select decoration" ON decoration_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Public select photography" ON photography_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Public select site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public select hall_blocked_dates" ON hall_blocked_dates FOR SELECT USING (true);

-- Authenticated Users Policies
CREATE POLICY "Users can insert bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select own bookings" ON bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert booking_food_items" ON booking_food_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "Users can select own booking_food_items" ON booking_food_items FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "Users can insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "Users can select own payments" ON payments FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "Anyone can insert contact" ON contact_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin Policies
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access halls" ON halls FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access hall_blocked_dates" ON hall_blocked_dates FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access food_categories" ON food_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access food_items" ON food_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access decoration" ON decoration_packages FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access photography" ON photography_packages FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access booking_food_items" ON booking_food_items FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access payments" ON payments FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access contact" ON contact_enquiries FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (public.is_admin());

-- Storage Policies
CREATE POLICY "Public read hall-images" ON storage.objects FOR SELECT USING (bucket_id = 'hall-images');
CREATE POLICY "Admin all hall-images" ON storage.objects FOR ALL USING (bucket_id = 'hall-images' AND public.is_admin());

CREATE POLICY "Public read food-images" ON storage.objects FOR SELECT USING (bucket_id = 'food-images');
CREATE POLICY "Admin all food-images" ON storage.objects FOR ALL USING (bucket_id = 'food-images' AND public.is_admin());

CREATE POLICY "Public read decoration-images" ON storage.objects FOR SELECT USING (bucket_id = 'decoration-images');
CREATE POLICY "Admin all decoration-images" ON storage.objects FOR ALL USING (bucket_id = 'decoration-images' AND public.is_admin());

CREATE POLICY "Public read photography-images" ON storage.objects FOR SELECT USING (bucket_id = 'photography-images');
CREATE POLICY "Admin all photography-images" ON storage.objects FOR ALL USING (bucket_id = 'photography-images' AND public.is_admin());

CREATE POLICY "Public read site-assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Admin all site-assets" ON storage.objects FOR ALL USING (bucket_id = 'site-assets' AND public.is_admin());
