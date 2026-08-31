export type UserRole = 'admin' | 'customer';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  is_visible: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  category_name?: string;
  price: number;
  cost_price?: number;
  image_url?: string;
  unit?: string;
  stock_count?: number;
  in_stock: boolean;
  is_visible: boolean;
  is_admin_added?: boolean;
  created_at?: string;
}

export type OrderStatus = 'Pending' | 'Baking' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_title?: string;
  quantity: number;
  unit_price: number;
  unit_cost?: number;
}

export interface Order {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  total_amount: number;
  profit_amount: number;
  status: OrderStatus;
  notes?: string;
  items: OrderItem[];
  created_at: string;
}

export type PhotoCakeStatus = 'Received' | 'Designing' | 'Baking' | 'Ready' | 'Delivered' | 'Cancelled';

export interface PhotoCakeRequest {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  cake_flavor: string;
  cake_weight: string;
  cake_shape?: string;
  eggless?: boolean;
  is_eggless?: boolean;
  image_url: string;
  photo_url?: string;
  flavor?: string;
  weight?: string;
  total_price?: number;
  cake_message?: string;
  message?: string;
  delivery_date: string;
  delivery_time: string;
  notes?: string;
  special_notes?: string;
  estimated_price?: number;
  status: any;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMarginPercent: number;
  totalOrdersCount: number;
  totalItemsSold: number;
  pendingOrdersCount: number;
  photoCakeCount: number;
}

export type CakeSuggestionStatus = 'New' | 'Reviewing' | 'Quoted' | 'Accepted' | 'Completed' | 'Declined';

export interface CustomerCakeSuggestion {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  description: string;
  image_url: string;
  occasion?: string;
  preferred_flavor?: string;
  estimated_weight?: string;
  needed_date?: string;
  needed_time?: string;
  is_eggless?: boolean;
  quoted_price?: number;
  admin_notes?: string;
  status: CakeSuggestionStatus;
  created_at: string;
}

export interface LoginThemeConfig {
  background_type: 'image' | 'gradient' | 'color';
  background_image_url?: string;
  background_gradient?: string;
  background_blur?: 'none' | 'sm' | 'md' | 'lg';
  overlay_opacity: number; // 0 to 100
  overlay_color?: string; // 'black' | 'chocolate' | 'amber' | 'velvet'
  headline?: string;
  tagline?: string;
  badge_text?: string;
  card_style?: 'white' | 'glass' | 'dark' | 'amber';
  updated_at?: string;
}

