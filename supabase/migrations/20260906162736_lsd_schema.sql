/*
# LSD Restaurant — Database Schema

## Overview
Creates the complete database schema for the LSD (Like Something Dope) burger restaurant
ordering website. Includes customer accounts, menu management, ordering, order tracking,
notifications, and restaurant settings.

## New Tables

### profiles
- Extends Supabase auth.users with customer/admin info
- `id` (uuid, PK, FK to auth.users)
- `name` (text)
- `phone` (text)
- `is_admin` (boolean, default false)
- `created_at` (timestamptz)

### categories
- Menu categories (Burgers, Chicken, Wraps, etc.)
- `id` (uuid, PK)
- `name` (text)
- `slug` (text, unique)
- `sort_order` (int)
- `icon` (text, optional — lucide icon name)

### menu_items
- Individual menu items belonging to a category
- `id` (uuid, PK)
- `category_id` (uuid, FK to categories)
- `name` (text)
- `description` (text)
- `price` (numeric)
- `image_url` (text)
- `is_veg` (boolean)
- `is_bestseller` (boolean)
- `is_available` (boolean, default true)
- `sort_order` (int)
- `customizations` (jsonb — array of customization groups)

### orders
- Customer orders with delivery/pickup info and status tracking
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, DEFAULT auth.uid())
- `order_number` (text, unique)
- `status` (text — placed/confirmed/preparing/ready/out_for_delivery/delivered/cancelled)
- `subtotal`, `delivery_charge`, `discount`, `total` (numeric)
- `customer_name`, `customer_phone` (text)
- `delivery_type` (text — delivery/pickup)
- `address`, `address_details`, `notes` (text)
- `payment_method` (text)
- `created_at`, `updated_at` (timestamptz)

### order_items
- Individual items within an order
- `id` (uuid, PK)
- `order_id` (uuid, FK to orders)
- `menu_item_id` (uuid, FK to menu_items)
- `name`, `image_url` (text)
- `price`, `item_total` (numeric)
- `quantity` (int)
- `customizations` (jsonb)

### restaurant_settings
- Single-row table for restaurant configuration
- `is_open`, `delivery_enabled`, `pickup_enabled` (boolean)
- `delivery_charge`, `min_order_amount` (numeric)
- `opening_time`, `closing_time` (text)
- `phone`, `address`, `name`, `tagline` (text)

### notifications
- Order status notifications for customers
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `order_id` (uuid, FK to orders)
- `message`, `type` (text)
- `is_read` (boolean, default false)
- `created_at` (timestamptz)

## Security (RLS)
- profiles: users read/update own profile; admins read all
- categories & menu_items: public read; admin-only write
- orders: users read/insert own; admin read all + update status
- order_items: read through order ownership; admin read all
- restaurant_settings: public read; admin-only update
- notifications: users read own + mark read; admin insert

## Trigger
- Auto-creates a profile row when a new auth user signs up
*/

-- Enable pgcrypto for crypt() function (admin user creation)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  icon text
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============ MENU ITEMS ============
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  is_veg boolean NOT NULL DEFAULT false,
  is_bestseller boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  customizations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "menu_items_select_public" ON menu_items;
CREATE POLICY "menu_items_select_public" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "menu_items_insert_admin" ON menu_items;
CREATE POLICY "menu_items_insert_admin" ON menu_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "menu_items_update_admin" ON menu_items;
CREATE POLICY "menu_items_update_admin" ON menu_items FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

DROP POLICY IF EXISTS "menu_items_delete_admin" ON menu_items;
CREATE POLICY "menu_items_delete_admin" ON menu_items FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'placed',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  customer_name text NOT NULL DEFAULT '',
  customer_phone text NOT NULL DEFAULT '',
  delivery_type text NOT NULL DEFAULT 'delivery',
  address text NOT NULL DEFAULT '',
  address_details text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT 'cod',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  customizations jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_total numeric(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );

-- ============ RESTAURANT SETTINGS ============
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id int PRIMARY KEY DEFAULT 1,
  is_open boolean NOT NULL DEFAULT true,
  delivery_enabled boolean NOT NULL DEFAULT true,
  pickup_enabled boolean NOT NULL DEFAULT true,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 30,
  min_order_amount numeric(10,2) NOT NULL DEFAULT 99,
  opening_time text NOT NULL DEFAULT '11:00',
  closing_time text NOT NULL DEFAULT '23:59',
  phone text NOT NULL DEFAULT '+91 98765 43210',
  address text NOT NULL DEFAULT 'Okhla, Jamia Nagar, New Delhi',
  name text NOT NULL DEFAULT 'LSD',
  tagline text NOT NULL DEFAULT 'Like Something Dope'
);

ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_public" ON restaurant_settings;
CREATE POLICY "settings_select_public" ON restaurant_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_update_admin" ON restaurant_settings;
CREATE POLICY "settings_update_admin" ON restaurant_settings FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true));

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'order_update',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_admin" ON notifications;
CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ TRIGGER: Auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED: Restaurant Settings ============
INSERT INTO restaurant_settings (id, is_open, delivery_enabled, pickup_enabled, delivery_charge, min_order_amount, opening_time, closing_time, phone, address, name, tagline)
VALUES (1, true, true, true, 30, 99, '11:00', '23:59', '+91 98765 43210', 'Okhla, Jamia Nagar, New Delhi - 110025', 'LSD', 'Like Something Dope')
ON CONFLICT (id) DO NOTHING;

-- ============ SEED: Categories ============
INSERT INTO categories (name, slug, sort_order, icon) VALUES
('Burgers', 'burgers', 1, '🍔'),
('Fried Chicken', 'fried-chicken', 2, '🍗'),
('Wraps', 'wraps', 3, '🌯'),
('Fries & Sides', 'fries-sides', 4, '🍟'),
('Prawns', 'prawns', 5, '🦐'),
('Combos', 'combos', 6, '🪣'),
('Drinks', 'drinks', 7, '🥤'),
('Dips', 'dips', 8, '🫕')
ON CONFLICT (slug) DO NOTHING;
