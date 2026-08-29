import { Category, Product, Order, PhotoCakeRequest } from "../types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-sweets",
    name: "Sweets & Mithai",
    slug: "sweets",
    icon: "Candy",
    is_visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-biscuits",
    name: "Biscuits & Cookies",
    slug: "biscuits",
    icon: "Cookie",
    is_visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-cakes",
    name: "Celebration Cakes",
    slug: "cakes",
    icon: "Cake",
    is_visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-savories",
    name: "Savories & Snacks",
    slug: "savories",
    icon: "UtensilsCrossed",
    is_visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-photo-cakes",
    name: "Custom Photo Cakes",
    slug: "photo-cakes",
    icon: "Camera",
    is_visible: true,
    created_at: new Date().toISOString(),
  },
];

// Cleared: No demo products. Products will only be added by Admin (haibackery@gmail.com)
export const INITIAL_PRODUCTS: Product[] = [];

// Cleared: No demo orders. Live orders placed by customers will appear here
export const INITIAL_ORDERS: Order[] = [];

// Cleared: No demo photo cakes. Customer custom photo cake submissions will appear here
export const INITIAL_PHOTO_CAKES: PhotoCakeRequest[] = [];
