export interface Profile {
  id: string;
  name: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  icon: string | null;
}

export interface CustomizationGroup {
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: { name: string; price: number }[];
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  is_bestseller: boolean;
  is_available: boolean;
  sort_order: number;
  customizations: CustomizationGroup[];
  created_at: string;
  category?: Category;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  delivery_type: 'delivery' | 'pickup';
  address: string;
  address_details: string;
  notes: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
  customizations: CustomizationGroup[];
  item_total: number;
}

export interface RestaurantSettings {
  id: number;
  is_open: boolean;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
  delivery_charge: number;
  min_order_amount: number;
  opening_time: string;
  closing_time: string;
  phone: string;
  address: string;
  name: string;
  tagline: string;
}

export interface Notification {
  id: string;
  user_id: string;
  order_id: string | null;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  menu_item_id: string;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
  customizations: CustomizationGroup[];
  item_total: number;
}
