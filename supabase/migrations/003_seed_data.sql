-- Insert default categories
INSERT INTO public.categories (name, description, color, icon, sort_order) VALUES
('Ice Cream', 'Various flavors of ice cream', '#FFB6C1', 'ice-cream', 1),
('Toppings', 'Sprinkles, syrups, and other toppings', '#FFD700', 'star', 2),
('Fruits', 'Fresh fruits and fruit toppings', '#98FB98', 'fruit', 3),
('Supplies', 'Cones, cups, spoons, and other supplies', '#DDA0DD', 'package-variant', 4);

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact_person, email, phone, address, city, state, zip_code) VALUES
('Sweet Dreams Dairy', 'John Smith', 'john@sweetdreams.com', '+1-555-0101', '123 Dairy Lane', 'Milk City', 'CA', '90210'),
('Premium Toppings Co', 'Sarah Johnson', 'sarah@premiumtoppings.com', '+1-555-0102', '456 Sprinkle Street', 'Topping Town', 'NY', '10001'),
('Fresh Fruit Supply', 'Mike Wilson', 'mike@freshfruit.com', '+1-555-0103', '789 Orchard Road', 'Fruit Valley', 'FL', '33101'),
('Supply Solutions Inc', 'Lisa Brown', 'lisa@supplysolutions.com', '+1-555-0104', '321 Warehouse Blvd', 'Supply City', 'TX', '75001');

-- Insert sample products
INSERT INTO public.products (name, description, category_id, supplier_id, sku, unit, cost_price, selling_price, min_stock_level, max_stock_level, reorder_point) VALUES
-- Ice Cream products
('Vanilla Ice Cream', 'Classic vanilla ice cream', 
 (SELECT id FROM public.categories WHERE name = 'Ice Cream'),
 (SELECT id FROM public.suppliers WHERE name = 'Sweet Dreams Dairy'),
 'IC-VAN-001', 'pint', 2.50, 3.50, 10, 50, 15),
 
('Chocolate Ice Cream', 'Rich chocolate ice cream',
 (SELECT id FROM public.categories WHERE name = 'Ice Cream'),
 (SELECT id FROM public.suppliers WHERE name = 'Sweet Dreams Dairy'),
 'IC-CHO-001', 'pint', 2.75, 3.75, 10, 50, 15),
 
('Strawberry Ice Cream', 'Fresh strawberry ice cream',
 (SELECT id FROM public.categories WHERE name = 'Ice Cream'),
 (SELECT id FROM public.suppliers WHERE name = 'Sweet Dreams Dairy'),
 'IC-STR-001', 'pint', 2.60, 3.60, 10, 50, 15),
 
('Mint Chocolate Chip', 'Mint ice cream with chocolate chips',
 (SELECT id FROM public.categories WHERE name = 'Ice Cream'),
 (SELECT id FROM public.suppliers WHERE name = 'Sweet Dreams Dairy'),
 'IC-MIN-001', 'pint', 2.85, 3.85, 10, 50, 15),

-- Toppings
('Chocolate Chips', 'Premium chocolate chips',
 (SELECT id FROM public.categories WHERE name = 'Toppings'),
 (SELECT id FROM public.suppliers WHERE name = 'Premium Toppings Co'),
 'TOP-CHO-001', 'bag', 1.50, 2.00, 5, 25, 8),
 
('Rainbow Sprinkles', 'Colorful rainbow sprinkles',
 (SELECT id FROM public.categories WHERE name = 'Toppings'),
 (SELECT id FROM public.suppliers WHERE name = 'Premium Toppings Co'),
 'TOP-SPR-001', 'bottle', 1.00, 1.50, 3, 20, 5),
 
('Whipped Cream', 'Fresh whipped cream',
 (SELECT id FROM public.categories WHERE name = 'Toppings'),
 (SELECT id FROM public.suppliers WHERE name = 'Premium Toppings Co'),
 'TOP-WHI-001', 'can', 1.75, 2.25, 8, 30, 12),

-- Fruits
('Fresh Strawberries', 'Fresh strawberries',
 (SELECT id FROM public.categories WHERE name = 'Fruits'),
 (SELECT id FROM public.suppliers WHERE name = 'Fresh Fruit Supply'),
 'FRU-STR-001', 'lb', 3.00, 4.00, 2, 10, 3),
 
('Bananas', 'Fresh bananas',
 (SELECT id FROM public.categories WHERE name = 'Fruits'),
 (SELECT id FROM public.suppliers WHERE name = 'Fresh Fruit Supply'),
 'FRU-BAN-001', 'lb', 0.75, 1.50, 3, 15, 5),

-- Supplies
('Waffle Cones', 'Premium waffle cones',
 (SELECT id FROM public.categories WHERE name = 'Supplies'),
 (SELECT id FROM public.suppliers WHERE name = 'Supply Solutions Inc'),
 'SUP-CON-001', 'piece', 0.30, 0.50, 20, 100, 30),
 
('Paper Cups', 'Disposable paper cups',
 (SELECT id FROM public.categories WHERE name = 'Supplies'),
 (SELECT id FROM public.suppliers WHERE name = 'Supply Solutions Inc'),
 'SUP-CUP-001', 'piece', 0.15, 0.25, 15, 75, 25),
 
('Plastic Spoons', 'Disposable plastic spoons',
 (SELECT id FROM public.categories WHERE name = 'Supplies'),
 (SELECT id FROM public.suppliers WHERE name = 'Supply Solutions Inc'),
 'SUP-SPO-001', 'piece', 0.05, 0.10, 10, 50, 20);

-- Initialize inventory levels with some stock
INSERT INTO public.inventory_levels (product_id, current_stock)
SELECT id, 
    CASE 
        WHEN name LIKE '%Vanilla%' THEN 25
        WHEN name LIKE '%Chocolate%' THEN 8
        WHEN name LIKE '%Strawberry%' THEN 15
        WHEN name LIKE '%Mint%' THEN 12
        WHEN name LIKE '%Chips%' THEN 5
        WHEN name LIKE '%Sprinkles%' THEN 3
        WHEN name LIKE '%Whipped%' THEN 18
        WHEN name LIKE '%Strawberries%' THEN 2
        WHEN name LIKE '%Bananas%' THEN 7
        WHEN name LIKE '%Cones%' THEN 45
        WHEN name LIKE '%Cups%' THEN 12
        WHEN name LIKE '%Spoons%' THEN 8
        ELSE 10
    END
FROM public.products;

-- Create some initial stock movements to establish history
INSERT INTO public.stock_movements (product_id, movement_type, quantity, reference_number, reference_type, notes)
SELECT 
    p.id,
    'in'::movement_type,
    il.current_stock,
    'INIT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER()::TEXT, 3, '0'),
    'initial_stock',
    'Initial stock setup'
FROM public.products p
JOIN public.inventory_levels il ON p.id = il.product_id
WHERE il.current_stock > 0;
