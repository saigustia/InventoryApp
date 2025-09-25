-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('product-images', 'product-images', true),
('profile-images', 'profile-images', true),
('receipts', 'receipts', false);

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Managers and admins can update product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Managers and admins can delete product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Storage policies for profile images
CREATE POLICY "Profile images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload their own profile images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own profile images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'profile-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage policies for receipts
CREATE POLICY "Users can view their own receipts" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'receipts' AND
        (
            auth.uid()::text = (storage.foldername(name))[1] OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('admin', 'manager')
            )
        )
    );

CREATE POLICY "System can create receipts" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'receipts');

-- Function to generate unique file names
CREATE OR REPLACE FUNCTION generate_unique_filename(
    bucket_name TEXT,
    file_extension TEXT,
    prefix TEXT DEFAULT ''
)
RETURNS TEXT AS $$
DECLARE
    timestamp_str TEXT;
    random_str TEXT;
    filename TEXT;
BEGIN
    timestamp_str := TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
    random_str := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);
    
    IF prefix != '' THEN
        filename := prefix || '_' || timestamp_str || '_' || random_str || '.' || file_extension;
    ELSE
        filename := timestamp_str || '_' || random_str || '.' || file_extension;
    END IF;
    
    RETURN filename;
END;
$$ LANGUAGE plpgsql;

-- Function to get file URL
CREATE OR REPLACE FUNCTION get_file_url(
    bucket_name TEXT,
    file_path TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql;
