-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'cashier', 'viewer');
CREATE TYPE movement_type AS ENUM ('in', 'out', 'adjustment', 'transfer');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'mobile', 'check');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 1. Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'cashier' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    profile_image_url TEXT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#1976D2',
    icon TEXT DEFAULT 'package-variant',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Suppliers table
CREATE TABLE public.suppliers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    payment_terms TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Products table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    unit TEXT NOT NULL DEFAULT 'piece',
    cost_price DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL,
    min_stock_level INTEGER DEFAULT 0 NOT NULL,
    max_stock_level INTEGER,
    reorder_point INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Inventory levels table (current stock)
CREATE TABLE public.inventory_levels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    current_stock INTEGER DEFAULT 0 NOT NULL,
    reserved_stock INTEGER DEFAULT 0 NOT NULL,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(product_id)
);

-- 6. Stock movements table (in/out transactions)
CREATE TABLE public.stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    movement_type movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    reference_number TEXT,
    reference_type TEXT, -- 'purchase', 'sale', 'adjustment', 'transfer'
    reference_id UUID,
    notes TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Sales table
CREATE TABLE public.sales (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'completed' NOT NULL,
    cashier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Sale items table
CREATE TABLE public.sale_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL, -- Denormalized for historical data
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_inventory_levels_product_id ON public.inventory_levels(product_id);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);
CREATE INDEX idx_sales_created_at ON public.sales(created_at);
CREATE INDEX idx_sales_cashier_id ON public.sales(cashier_id);
CREATE INDEX idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON public.sale_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_levels_updated_at BEFORE UPDATE ON public.inventory_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate sale numbers
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
    today DATE := CURRENT_DATE;
    sequence_num INTEGER;
    sale_number TEXT;
BEGIN
    -- Get the next sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.sales
    WHERE sale_number LIKE 'S' || TO_CHAR(today, 'YYYYMMDD') || '%';
    
    -- Format: S + YYYYMMDD + 4-digit sequence
    sale_number := 'S' || TO_CHAR(today, 'YYYYMMDD') || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN sale_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update inventory levels
CREATE OR REPLACE FUNCTION update_inventory_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Update inventory level based on stock movement
    IF NEW.movement_type = 'in' THEN
        UPDATE public.inventory_levels
        SET current_stock = current_stock + NEW.quantity,
            last_updated = NOW(),
            updated_at = NOW()
        WHERE product_id = NEW.product_id;
    ELSIF NEW.movement_type = 'out' THEN
        UPDATE public.inventory_levels
        SET current_stock = current_stock - NEW.quantity,
            last_updated = NOW(),
            updated_at = NOW()
        WHERE product_id = NEW.product_id;
    ELSIF NEW.movement_type = 'adjustment' THEN
        UPDATE public.inventory_levels
        SET current_stock = NEW.quantity,
            last_updated = NOW(),
            updated_at = NOW()
        WHERE product_id = NEW.product_id;
    END IF;
    
    -- Insert or update inventory level if it doesn't exist
    INSERT INTO public.inventory_levels (product_id, current_stock, last_updated)
    VALUES (NEW.product_id, 
            CASE 
                WHEN NEW.movement_type = 'in' THEN NEW.quantity
                WHEN NEW.movement_type = 'out' THEN -NEW.quantity
                ELSE NEW.quantity
            END,
            NOW())
    ON CONFLICT (product_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update inventory levels on stock movements
CREATE TRIGGER update_inventory_on_movement
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_level();
