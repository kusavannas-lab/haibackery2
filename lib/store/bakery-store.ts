"use client";

import { useState, useEffect, useCallback } from "react";
import { Category, Product, Order, PhotoCakeRequest, OrderStatus, PhotoCakeStatus } from "../types";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_PHOTO_CAKES } from "./seed-data";
import { isSupabaseConfigured, supabase } from "../supabase/client";
import { generateShortId } from "../utils";

const STORAGE_KEYS = {
  CATEGORIES: "hb_categories_v2",
  PRODUCTS: "hb_products_v2",
  ORDERS: "hb_orders_v2",
  PHOTO_CAKES: "hb_photo_cakes_v2",
  DEMO_USER: "hb_demo_user_v2",
  BULK_CATALOG: "hb_bulk_catalog_v2",
  PHOTO_CAKE_CONFIG: "hb_photo_cake_config_v2",
  PHOTO_CAKE_ENABLED: "hb_photo_cake_enabled_v2",
};

export interface PhotoCakeFlavor {
  id: string;
  name: string;
  pricePerKg: number;
  color: string;
  is_available: boolean;
}

export interface PhotoCakeWeight {
  id: string;
  label: string;
  value: string;
  multiplier: number;
  is_available: boolean;
}

export interface PhotoCakeShape {
  id: string;
  name: string;
  label: string;
  extraPrice: number;
  is_available: boolean;
}

export interface PhotoCakeConfig {
  is_enabled?: boolean;
  flavors: PhotoCakeFlavor[];
  weights: PhotoCakeWeight[];
  shapes: PhotoCakeShape[];
  printCharge: number;
  timeSlots: string[];
}

export const INITIAL_PHOTO_CAKE_CONFIG: PhotoCakeConfig = {
  is_enabled: true,
  flavors: [
    { id: "flv-1", name: "Belgian Chocolate Truffle", pricePerKg: 750, color: "chocolate", is_available: true },
    { id: "flv-2", name: "Classic Black Forest Cherry", pricePerKg: 650, color: "blackforest", is_available: true },
    { id: "flv-3", name: "Red Velvet Cream Cheese", pricePerKg: 800, color: "redvelvet", is_available: true },
    { id: "flv-4", name: "Butterscotch Caramel Crunch", pricePerKg: 680, color: "butterscotch", is_available: true },
    { id: "flv-5", name: "Fresh Pineapple Delight", pricePerKg: 620, color: "vanilla", is_available: true },
    { id: "flv-6", name: "Alphonso Mango Cream", pricePerKg: 700, color: "mango", is_available: true },
  ],
  weights: [
    { id: "w-1", label: "1.0 kg (Standard)", value: "1.0 kg", multiplier: 1.0, is_available: true },
    { id: "w-2", label: "1.5 kg (Celebration)", value: "1.5 kg", multiplier: 1.5, is_available: true },
    { id: "w-3", label: "2.0 kg (Party Size)", value: "2.0 kg", multiplier: 2.0, is_available: true },
    { id: "w-4", label: "3.0 kg (Grand Event)", value: "3.0 kg", multiplier: 3.0, is_available: true },
    { id: "w-5", label: "0.5 kg (Mini Bento)", value: "0.5 kg", multiplier: 0.6, is_available: true },
  ],
  shapes: [
    { id: "sh-1", name: "Round", label: "Classic Round ⭕", extraPrice: 0, is_available: true },
    { id: "sh-2", name: "Square", label: "Modern Square ⏹️", extraPrice: 0, is_available: true },
    { id: "sh-3", name: "Heart", label: "Romantic Heart ❤️", extraPrice: 50, is_available: true },
  ],
  printCharge: 150,
  timeSlots: [
    "10:00 AM - 12:00 PM",
    "12:00 PM - 02:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
    "08:00 PM - 10:00 PM",
  ],
};

export interface BulkCatalogItem {
  id: string;
  name: string;
  rate_per_kg: number;
  is_available: boolean;
  unit: string;
  description?: string;
  created_at?: string;
}

export const INITIAL_BULK_CATALOG: BulkCatalogItem[] = [
  { id: "bulk-cat-1", name: "Premium Pure Ghee Kaju Katli", rate_per_kg: 900, is_available: true, unit: "kg", description: "Made with 100% premium cashews and pure desi ghee" },
  { id: "bulk-cat-2", name: "Pure Ghee Motichoor Laddu", rate_per_kg: 480, is_available: true, unit: "kg", description: "Fine gram flour pearls fried in desi ghee with saffron" },
  { id: "bulk-cat-3", name: "Royal Mysore Pak (Pure Ghee)", rate_per_kg: 520, is_available: true, unit: "kg", description: "Traditional melt-in-mouth recipe with rich aroma" },
  { id: "bulk-cat-4", name: "Kaju Pista Roll", rate_per_kg: 950, is_available: true, unit: "kg", description: "Cashew roll stuffed with pistachios" },
  { id: "bulk-cat-5", name: "Gulab Jamun (Pure Ghee)", rate_per_kg: 420, is_available: true, unit: "kg", description: "Soft khoya dumplings in fragrant rose cardamom syrup" },
  { id: "bulk-cat-6", name: "Special Badusha", rate_per_kg: 400, is_available: true, unit: "kg", description: "Flaky crispy golden exterior with soft juicy interior" },
  { id: "bulk-cat-7", name: "Ajmer Kalakand / Milk Cake", rate_per_kg: 560, is_available: true, unit: "kg", description: "Rich condensed milk fudge with caramelized flavor" },
  { id: "bulk-cat-8", name: "Dry Fruit Halwa", rate_per_kg: 650, is_available: true, unit: "kg", description: "Chewy pure ghee halwa loaded with almonds, cashews & raisins" },
  { id: "bulk-cat-9", name: "Famous Osmania Tea Biscuits", rate_per_kg: 350, is_available: true, unit: "kg", description: "Authentic buttery sweet-and-salt tea biscuits" },
  { id: "bulk-cat-10", name: "Cashew & Butter Cookies", rate_per_kg: 420, is_available: true, unit: "kg", description: "Crispy freshly baked bakery cookies with cashew chunks" },
  { id: "bulk-cat-11", name: "Special Andhra Mixture / Murukku", rate_per_kg: 320, is_available: true, unit: "kg", description: "Crunchy spicy mixture with peanuts, curry leaves & spices" },
  { id: "bulk-cat-12", name: "Multi-Tier Wedding Celebration Cake", rate_per_kg: 700, is_available: true, unit: "kg", description: "Custom decorated tiered fresh cream cake for weddings" },
];

export interface UserSession {
  email: string;
  name: string;
  role: 'admin' | 'customer';
  isLoggedIn: boolean;
}

export function useBakeryStore() {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        if (local) return JSON.parse(local);
      } catch {}
    }
    return INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (local) return JSON.parse(local);
      } catch {}
    }
    return INITIAL_PRODUCTS;
  });

  const [bulkCatalog, setBulkCatalog] = useState<BulkCatalogItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem(STORAGE_KEYS.BULK_CATALOG);
        if (local) return JSON.parse(local);
      } catch {}
    }
    return INITIAL_BULK_CATALOG;
  });
  const [photoCakeConfig, setPhotoCakeConfig] = useState<PhotoCakeConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const directEnabled = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_ENABLED);
        const localPhotoConfig = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_CONFIG);
        if (localPhotoConfig) {
          const parsed = JSON.parse(localPhotoConfig);
          return {
            ...INITIAL_PHOTO_CAKE_CONFIG,
            ...parsed,
            is_enabled: directEnabled !== null ? directEnabled === "true" : (parsed.is_enabled !== false),
            shapes:
              parsed.shapes && Array.isArray(parsed.shapes) && parsed.shapes.length > 0
                ? parsed.shapes
                : INITIAL_PHOTO_CAKE_CONFIG.shapes,
          };
        } else if (directEnabled !== null) {
          return {
            ...INITIAL_PHOTO_CAKE_CONFIG,
            is_enabled: directEnabled === "true",
          };
        }
      } catch {}
    }
    return INITIAL_PHOTO_CAKE_CONFIG;
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [photoCakes, setPhotoCakes] = useState<PhotoCakeRequest[]>([]);
  const [user, setUser] = useState<UserSession>({
    email: "",
    name: "",
    role: "customer",
    isLoggedIn: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize data
  useEffect(() => {
    const initData = async () => {
      try {
        if (typeof window === "undefined") return;

        // 1. Load User Session
        const savedUser = localStorage.getItem(STORAGE_KEYS.DEMO_USER);
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // fallback
          }
        }

        // If Supabase configured, check auth
        if (isSupabaseConfigured() && supabase) {
          const { data: authData } = await supabase.auth.getSession();
          if (authData.session?.user) {
            const email = authData.session.user.email || "";
            const isAdmin = email.toLowerCase() === "haibackery@gmail.com";
            setUser({
              email,
              name: authData.session.user.user_metadata?.full_name || authData.session.user.user_metadata?.name || (isAdmin ? "Shekhar Rao (Admin)" : "Customer"),
              role: isAdmin ? "admin" : "customer",
              isLoggedIn: true,
            });
          }
        }

        // 2. Load Categories
        let loadedCats: Category[] = [];
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from("categories").select("*").order("name");
          if (data && data.length > 0) {
            loadedCats = data as Category[];
          }
        }
        if (loadedCats.length === 0) {
          const localCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
          loadedCats = localCats ? JSON.parse(localCats) : INITIAL_CATEGORIES;
        }
        setCategories(loadedCats);

        // 3. Load Products
        let loadedProds: Product[] = [];
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
          if (data && data.length > 0) {
            loadedProds = data as Product[];
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(loadedProds));
          }
        }
        if (loadedProds.length === 0) {
          const localProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
          loadedProds = localProds ? JSON.parse(localProds) : INITIAL_PRODUCTS;
        }
        setProducts(loadedProds);

        // 4. Load Orders
        let loadedOrders: Order[] = [];
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase
            .from("orders")
            .select("*, items:order_items(*)")
            .order("created_at", { ascending: false });
          if (data && data.length > 0) {
            loadedOrders = data as Order[];
          }
        }
        if (loadedOrders.length === 0) {
          const localOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
          loadedOrders = localOrders ? JSON.parse(localOrders) : INITIAL_ORDERS;
        }
        setOrders(loadedOrders);

        // 5. Load Photo Cakes
        let loadedPhotoCakes: PhotoCakeRequest[] = [];
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase
            .from("photo_cake_requests")
            .select("*")
            .order("created_at", { ascending: false });
          if (data && data.length > 0) {
            loadedPhotoCakes = data as PhotoCakeRequest[];
          }
        }
        if (loadedPhotoCakes.length === 0) {
          const localPhotoCakes = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKES);
          loadedPhotoCakes = localPhotoCakes ? JSON.parse(localPhotoCakes) : INITIAL_PHOTO_CAKES;
        }
        // 6. Load Bulk Catalog
        let loadedBulk: BulkCatalogItem[] = [];
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from("bulk_catalog").select("*").order("name");
          if (data && data.length > 0) {
            loadedBulk = data as BulkCatalogItem[];
          }
        }
        if (loadedBulk.length === 0) {
          const localBulk = localStorage.getItem(STORAGE_KEYS.BULK_CATALOG);
          loadedBulk = localBulk ? JSON.parse(localBulk) : INITIAL_BULK_CATALOG;
        }
        setBulkCatalog(loadedBulk);

        // 7. Load Photo Cake Config
        let loadedPhotoConfig: PhotoCakeConfig = INITIAL_PHOTO_CAKE_CONFIG;
        let fetchedFromSupabase = false;
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.from("photo_cake_config").select("*").eq("id", "main_config").maybeSingle();
          if (data) {
            fetchedFromSupabase = true;
            loadedPhotoConfig = {
              is_enabled: data.is_enabled !== false,
              flavors: data.flavors || INITIAL_PHOTO_CAKE_CONFIG.flavors,
              weights: data.weights || INITIAL_PHOTO_CAKE_CONFIG.weights,
              shapes: data.shapes || INITIAL_PHOTO_CAKE_CONFIG.shapes,
              printCharge: data.print_charge ?? 150,
              timeSlots: data.time_slots || INITIAL_PHOTO_CAKE_CONFIG.timeSlots,
            };
          }
        }

        if (!fetchedFromSupabase) {
          const localPhotoConfig = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_CONFIG);
          const directEnabled = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_ENABLED);
          if (localPhotoConfig) {
            try {
              const parsed = JSON.parse(localPhotoConfig);
              loadedPhotoConfig = {
                ...INITIAL_PHOTO_CAKE_CONFIG,
                ...parsed,
                is_enabled: directEnabled !== null ? directEnabled === "true" : (parsed.is_enabled !== false),
                shapes:
                  parsed.shapes && Array.isArray(parsed.shapes) && parsed.shapes.length > 0
                    ? parsed.shapes
                    : INITIAL_PHOTO_CAKE_CONFIG.shapes,
              };
            } catch {
              loadedPhotoConfig = INITIAL_PHOTO_CAKE_CONFIG;
            }
          } else if (directEnabled !== null) {
            loadedPhotoConfig = {
              ...INITIAL_PHOTO_CAKE_CONFIG,
              is_enabled: directEnabled === "true",
            };
          }
        }
        setPhotoCakeConfig(loadedPhotoConfig);
      } catch (err) {
        console.error("Error initializing bakery store:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();

    // Listen for cross-tab or component storage sync
    const handleStorageChange = () => {
      try {
        const localCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        if (localCats) setCategories(JSON.parse(localCats));

        const localProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (localProds) setProducts(JSON.parse(localProds));

        const localBulk = localStorage.getItem(STORAGE_KEYS.BULK_CATALOG);
        if (localBulk) setBulkCatalog(JSON.parse(localBulk));

        const localPhotoConfig = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_CONFIG);
        const directEnabled = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_ENABLED);
        if (localPhotoConfig || directEnabled !== null) {
          const parsed = localPhotoConfig ? JSON.parse(localPhotoConfig) : {};
          setPhotoCakeConfig({
            ...INITIAL_PHOTO_CAKE_CONFIG,
            ...parsed,
            is_enabled: directEnabled !== null ? directEnabled === "true" : (parsed.is_enabled !== false),
            shapes:
              parsed.shapes && Array.isArray(parsed.shapes) && parsed.shapes.length > 0
                ? parsed.shapes
                : INITIAL_PHOTO_CAKE_CONFIG.shapes,
          });
        }

        const localOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        if (localOrders) setOrders(JSON.parse(localOrders));

        const localPhotoCakes = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKES);
        if (localPhotoCakes) setPhotoCakes(JSON.parse(localPhotoCakes));

        const savedUser = localStorage.getItem(STORAGE_KEYS.DEMO_USER);
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch {
        // ignore
      }
    };

    window.addEventListener("hb_store_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    // Live Supabase Realtime Subscription
    let realtimeChannel: any = null;
    const sb = supabase;
    if (isSupabaseConfigured() && sb) {
      try {
        const channelName = "hb_rt_" + Math.random().toString(36).substring(2, 9);
        realtimeChannel = sb
          .channel(channelName)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            async () => {
              try {
                const { data } = await sb
                  .from("orders")
                  .select("*, items:order_items(*)")
                  .order("created_at", { ascending: false });
                if (data && data.length > 0) {
                  setOrders(data as Order[]);
                  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
                  notifyUpdate();
                }
              } catch {}
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "photo_cake_requests" },
            async () => {
              try {
                const { data } = await sb
                  .from("photo_cake_requests")
                  .select("*")
                  .order("created_at", { ascending: false });
                if (data && data.length > 0) {
                  setPhotoCakes(data as PhotoCakeRequest[]);
                  localStorage.setItem(STORAGE_KEYS.PHOTO_CAKES, JSON.stringify(data));
                  notifyUpdate();
                }
              } catch {}
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "products" },
            async () => {
              try {
                const { data } = await sb
                  .from("products")
                  .select("*")
                  .order("created_at", { ascending: false });
                if (data && data.length > 0) {
                  setProducts(data as Product[]);
                  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
                  notifyUpdate();
                }
              } catch {}
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "categories" },
            async () => {
              try {
                const { data } = await sb
                  .from("categories")
                  .select("*")
                  .order("name");
                if (data && data.length > 0) {
                  setCategories(data as Category[]);
                  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
                  notifyUpdate();
                }
              } catch {}
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Supabase realtime channel error:", err);
      }
    }

    // High-Frequency Auto-Sync Interval (3 seconds) for Cross-Device Instant Sync
    const syncInterval = setInterval(async () => {
      if (!isSupabaseConfigured() || !sb) return;
      try {
        // 1. Sync Orders
        const { data: latestOrders } = await sb
          .from("orders")
          .select("*, items:order_items(*)")
          .order("created_at", { ascending: false });
        if (latestOrders && latestOrders.length > 0) {
          const enrichedOrders = (latestOrders as any[]).map((o) => ({
            ...o,
            items: (o.items || []).map((it: any) => ({
              ...it,
              product_title: it.product_title || (latestProducts || []).find((p: any) => p.id === it.product_id)?.title || "Bakery Item",
            })),
          }));
          setOrders((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(enrichedOrders)) {
              localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(enrichedOrders));
              notifyUpdate();
              return enrichedOrders as Order[];
            }
            return prev;
          });
        }

        // 2. Sync Products
        const { data: latestProducts } = await sb
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (latestProducts && latestProducts.length > 0) {
          setProducts((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(latestProducts)) {
              localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(latestProducts));
              return latestProducts as Product[];
            }
            return prev;
          });
        }

        // 3. Sync Categories
        const { data: latestCats } = await sb
          .from("categories")
          .select("*")
          .order("name");
        if (latestCats && latestCats.length > 0) {
          setCategories((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(latestCats)) {
              localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(latestCats));
              return latestCats as Category[];
            }
            return prev;
          });
        }

        // 4. Sync Photo Cakes
        const { data: latestPhotoCakes } = await sb
          .from("photo_cake_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (latestPhotoCakes && latestPhotoCakes.length > 0) {
          setPhotoCakes((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(latestPhotoCakes)) {
              localStorage.setItem(STORAGE_KEYS.PHOTO_CAKES, JSON.stringify(latestPhotoCakes));
              return latestPhotoCakes as PhotoCakeRequest[];
            }
            return prev;
          });
        }
      } catch {
        // silent background sync catch
      }
    }, 3000);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener("hb_store_updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
      if (realtimeChannel && isSupabaseConfigured() && sb) {
        try {
          sb.removeChannel(realtimeChannel);
        } catch {}
      }
    };
  }, []);

  const notifyUpdate = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hb_store_updated"));
    }
  };

  // Auth Operations
  const loginWithGoogle = async (targetEmail: string = "haibackery@gmail.com", userName: string = "Shekhar Rao") => {
    const cleanEmail = targetEmail.toLowerCase().trim();
    const isAdmin = cleanEmail === "haibackery@gmail.com";

    // Direct Instant Google Auth Session (Reliable on all devices without external provider dependency)
    const sessionUser: UserSession = {
      email: cleanEmail,
      name: userName || (isAdmin ? "Shekhar Rao (Admin)" : "Google Customer"),
      role: isAdmin ? "admin" : "customer",
      isLoggedIn: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.DEMO_USER, JSON.stringify(sessionUser));
    }
    setUser(sessionUser);
    notifyUpdate();
  };

  const loginWithEmail = async (email: string, name?: string): Promise<{ success: boolean; isAdmin: boolean; message: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "haibackery@gmail.com") {
      const adminUser: UserSession = {
        email: "haibackery@gmail.com",
        name: "Shekhar Rao (Admin)",
        role: "admin",
        isLoggedIn: true,
      };
      localStorage.setItem(STORAGE_KEYS.DEMO_USER, JSON.stringify(adminUser));
      setUser(adminUser);
      notifyUpdate();
      return { success: true, isAdmin: true, message: "Welcome Shekhar Rao! Redirecting to Executive Admin Portal..." };
    } else {
      const customerUser: UserSession = {
        email: cleanEmail,
        name: name?.trim() || "Valued Customer",
        role: "customer",
        isLoggedIn: true,
      };
      localStorage.setItem(STORAGE_KEYS.DEMO_USER, JSON.stringify(customerUser));
      setUser(customerUser);
      notifyUpdate();
      return { success: true, isAdmin: false, message: "Welcome to High Bakery! Logged in as customer." };
    }
  };

  const loginAsAdmin = async (force: boolean = true) => {
    const adminUser: UserSession = {
      email: "haibackery@gmail.com",
      name: "Shekhar Rao (Admin)",
      role: "admin",
      isLoggedIn: true,
    };
    localStorage.setItem(STORAGE_KEYS.DEMO_USER, JSON.stringify(adminUser));
    setUser(adminUser);
    notifyUpdate();
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_KEYS.DEMO_USER);
    setUser({
      email: "",
      name: "",
      role: "customer",
      isLoggedIn: false,
    });
    notifyUpdate();
  };

  // Product Operations
  const updateProductStockCount = async (id: string, count: number) => {
    const validCount = Math.max(0, count);
    const inStock = validCount > 0;
    await updateProduct(id, { stock_count: validCount, in_stock: inStock });
  };

  const updateProductPricesAndMargin = async (id: string, price: number, costPrice: number) => {
    await updateProduct(id, { price: Math.max(0, price), cost_price: Math.max(0, costPrice) });
  };
  const addProduct = async (productData: Omit<Product, "id" | "created_at">) => {
    const newProduct: Product = {
      id: "prod-" + generateShortId("P").toLowerCase(),
      title: productData.title.trim(),
      description: productData.description?.trim() || "",
      category_id: productData.category_id || "cat-sweets",
      category_name: productData.category_name || "Sweets & Mithai",
      price: Number(productData.price) || 0,
      cost_price: Number(productData.cost_price) || 0,
      stock_count: Number(productData.stock_count) || 50,
      image_url: productData.image_url?.trim() || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
      unit: productData.unit?.trim() || "500g",
      in_stock: productData.in_stock !== false,
      is_visible: productData.is_visible !== false,
      is_admin_added: true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from("products").insert([newProduct]);
        if (error) {
          console.error("Supabase insert product error:", error);
        }
      } catch (err) {
        console.error("Supabase insert product exception:", err);
      }
    }

    const updated = [newProduct, ...products];
    setProducts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    }
    notifyUpdate();
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from("products").update(updates).eq("id", id);
        if (error) {
          console.error("Supabase update product error:", error);
        }
      } catch (err) {
        console.error("Supabase update product exception:", err);
      }
    }

    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    }
    notifyUpdate();
  };

  const deleteProduct = async (id: string) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
          console.error("Supabase delete product error:", error);
        }
      } catch (err) {
        console.error("Supabase delete product exception:", err);
      }
    }

    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    }
    notifyUpdate();
  };

  const toggleProductVisibility = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    await updateProduct(id, { is_visible: !product.is_visible });
  };

  const toggleProductStock = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    await updateProduct(id, { in_stock: !product.in_stock });
  };

  // Category Operations
  const addCategory = async (
    categoryInput: string | { name: string; slug?: string; icon?: string; description?: string; is_visible?: boolean },
    icon: string = "Cookie"
  ) => {
    let newCat: Category;
    if (typeof categoryInput === "string") {
      const slug = categoryInput.toLowerCase().replace(/[^a-z0-9]/g, "-");
      newCat = {
        id: "cat-" + slug,
        name: categoryInput,
        slug,
        icon,
        is_visible: true,
        created_at: new Date().toISOString(),
      };
    } else {
      const slug = categoryInput.slug || categoryInput.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      newCat = {
        id: "cat-" + slug,
        name: categoryInput.name,
        slug,
        icon: categoryInput.icon || icon,
        description: categoryInput.description || "",
        is_visible: categoryInput.is_visible !== false,
        created_at: new Date().toISOString(),
      };
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("categories").insert([newCat]);
      } catch (err) {
        console.error("Supabase insert category error:", err);
      }
    }

    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    notifyUpdate();
    return newCat;
  };

  const toggleCategoryVisibility = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    const nextVisibility = !category.is_visible;

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("categories").update({ is_visible: nextVisibility }).eq("id", id);
      } catch (err) {
        console.error("Supabase update category visibility error:", err);
      }
    }

    const updated = categories.map((c) => (c.id === id ? { ...c, is_visible: nextVisibility } : c));
    setCategories(updated);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    notifyUpdate();
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("categories").update(updates).eq("id", id);
      } catch (err) {
        console.error("Supabase update category error:", err);
      }
    }

    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));

    // If category name changed, also update category_name on all associated products
    if (updates.name) {
      const updatedProds = products.map((p) =>
        p.category_id === id ? { ...p, category_name: updates.name } : p
      );
      setProducts(updatedProds);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProds));
    }

    notifyUpdate();
  };

  const deleteCategory = async (id: string) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("categories").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase delete category error:", err);
      }
    }

    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    notifyUpdate();
  };

  // Order Operations
  const createOrder = async (orderData: Omit<Order, "id" | "created_at">) => {
    const newOrder: Order = {
      ...orderData,
      id: generateShortId("HB"),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const validUserId = newOrder.user_id && typeof newOrder.user_id === "string" && newOrder.user_id.length > 20 ? newOrder.user_id : null;
        const { error: orderError } = await supabase.from("orders").insert([
          {
            id: newOrder.id,
            user_id: validUserId,
            customer_name: newOrder.customer_name,
            customer_phone: newOrder.customer_phone,
            delivery_address: newOrder.delivery_address,
            total_amount: newOrder.total_amount,
            profit_amount: newOrder.profit_amount,
            status: newOrder.status,
          },
        ]);

        if (!orderError && newOrder.items.length > 0) {
          const itemsToInsert = newOrder.items.map((item) => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_cost: item.unit_cost ?? 0,
          }));
          await supabase.from("order_items").insert(itemsToInsert);
        }
      } catch (err) {
        console.error("Supabase create order error:", err);
      }
    }

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    notifyUpdate();
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("orders").update({ status }).eq("id", orderId);
      } catch (err) {
        console.error("Supabase update order status error:", err);
      }
    }

    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    notifyUpdate();
  };

  // Photo Cake Operations
  const submitPhotoCakeRequest = async (requestData: Omit<PhotoCakeRequest, "id" | "created_at">) => {
    const newRequest: PhotoCakeRequest = {
      ...requestData,
      id: generateShortId("PC"),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("photo_cake_requests").insert([
          {
            id: newRequest.id,
            customer_name: newRequest.customer_name,
            customer_phone: newRequest.customer_phone,
            cake_flavor: newRequest.cake_flavor,
            cake_weight: newRequest.cake_weight,
            image_url: newRequest.image_url,
            message: newRequest.message,
            delivery_date: newRequest.delivery_date,
            delivery_time: newRequest.delivery_time,
            status: newRequest.status,
          },
        ]);
      } catch (err) {
        console.error("Supabase submit photo cake error:", err);
      }
    }

    const updated = [newRequest, ...photoCakes];
    setPhotoCakes(updated);
    localStorage.setItem(STORAGE_KEYS.PHOTO_CAKES, JSON.stringify(updated));
    notifyUpdate();
    return newRequest;
  };

  const updatePhotoCakeStatus = async (requestId: string, status: PhotoCakeStatus) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("photo_cake_requests").update({ status }).eq("id", requestId);
      } catch (err) {
        console.error("Supabase update photo cake status error:", err);
      }
    }

    const updated = photoCakes.map((pc) => (pc.id === requestId ? { ...pc, status } : pc));
    setPhotoCakes(updated);
    localStorage.setItem(STORAGE_KEYS.PHOTO_CAKES, JSON.stringify(updated));
    notifyUpdate();
  };

  // Bulk Catalog Management (Admin-Controlled Sweets & KG Rates)
  const addBulkItem = async (
    name: string,
    rate_per_kg: number,
    unit: string = "kg",
    description?: string
  ): Promise<BulkCatalogItem> => {
    const newItem: BulkCatalogItem = {
      id: `bulk-cat-${generateShortId()}`,
      name: name.trim(),
      rate_per_kg: Math.max(0, rate_per_kg),
      is_available: true,
      unit: unit.trim() || "kg",
      description: description?.trim() || "",
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("bulk_catalog").insert([newItem]);
      } catch (err) {
        console.error("Supabase insert bulk item error:", err);
      }
    }

    const updated = [newItem, ...bulkCatalog];
    setBulkCatalog(updated);
    localStorage.setItem(STORAGE_KEYS.BULK_CATALOG, JSON.stringify(updated));
    notifyUpdate();
    return newItem;
  };

  const updateBulkItem = async (id: string, updates: Partial<BulkCatalogItem>) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("bulk_catalog").update(updates).eq("id", id);
      } catch (err) {
        console.error("Supabase update bulk item error:", err);
      }
    }

    const updated = bulkCatalog.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });

    setBulkCatalog(updated);
    localStorage.setItem(STORAGE_KEYS.BULK_CATALOG, JSON.stringify(updated));
    notifyUpdate();
  };

  const deleteBulkItem = async (id: string) => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("bulk_catalog").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase delete bulk item error:", err);
      }
    }

    const updated = bulkCatalog.filter((item) => item.id !== id);
    setBulkCatalog(updated);
    localStorage.setItem(STORAGE_KEYS.BULK_CATALOG, JSON.stringify(updated));
    notifyUpdate();
  };

  const toggleBulkItemAvailability = async (id: string) => {
    const target = bulkCatalog.find((item) => item.id === id);
    if (!target) return;
    const nextAvailability = !target.is_available;

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("bulk_catalog").update({ is_available: nextAvailability }).eq("id", id);
      } catch (err) {
        console.error("Supabase toggle bulk item error:", err);
      }
    }

    const updated = bulkCatalog.map((item) => {
      if (item.id === id) {
        return { ...item, is_available: nextAvailability };
      }
      return item;
    });

    setBulkCatalog(updated);
    localStorage.setItem(STORAGE_KEYS.BULK_CATALOG, JSON.stringify(updated));
    notifyUpdate();
  };

  // Helper to persist Photo Cake Config locally and in Supabase
  const persistPhotoCakeConfig = async (config: PhotoCakeConfig) => {
    setPhotoCakeConfig(config);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PHOTO_CAKE_CONFIG, JSON.stringify(config));
      localStorage.setItem(STORAGE_KEYS.PHOTO_CAKE_ENABLED, config.is_enabled !== false ? "true" : "false");
    }
    notifyUpdate();

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from("photo_cake_config").upsert({
          id: "main_config",
          is_enabled: config.is_enabled !== false,
          flavors: config.flavors,
          weights: config.weights,
          shapes: config.shapes,
          print_charge: config.printCharge,
          time_slots: config.timeSlots,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Supabase upsert photo cake config error:", err);
      }
    }
  };

  // Photo Cake Configuration Methods (Admin Options)
  const addPhotoCakeFlavor = async (name: string, pricePerKg: number, color: string = "chocolate") => {
    const newFlavor: PhotoCakeFlavor = {
      id: `flv-${generateShortId()}`,
      name: name.trim(),
      pricePerKg: Math.max(0, pricePerKg),
      color: color.trim() || "chocolate",
      is_available: true,
    };
    const updated = {
      ...photoCakeConfig,
      flavors: [...photoCakeConfig.flavors, newFlavor],
    };
    await persistPhotoCakeConfig(updated);
    return newFlavor;
  };

  const updatePhotoCakeFlavor = async (id: string, updates: Partial<PhotoCakeFlavor>) => {
    const updatedFlavors = photoCakeConfig.flavors.map((f) =>
      f.id === id ? { ...f, ...updates } : f
    );
    const updated = { ...photoCakeConfig, flavors: updatedFlavors };
    await persistPhotoCakeConfig(updated);
  };

  const deletePhotoCakeFlavor = async (id: string) => {
    const updatedFlavors = photoCakeConfig.flavors.filter((f) => f.id !== id);
    const updated = { ...photoCakeConfig, flavors: updatedFlavors };
    await persistPhotoCakeConfig(updated);
  };

  const togglePhotoCakeFlavor = async (id: string) => {
    const updatedFlavors = photoCakeConfig.flavors.map((f) =>
      f.id === id ? { ...f, is_available: !f.is_available } : f
    );
    const updated = { ...photoCakeConfig, flavors: updatedFlavors };
    await persistPhotoCakeConfig(updated);
  };

  const addPhotoCakeWeight = async (label: string, value: string, multiplier: number) => {
    const newWeight: PhotoCakeWeight = {
      id: `w-${generateShortId()}`,
      label: label.trim(),
      value: value.trim(),
      multiplier: Math.max(0.1, multiplier),
      is_available: true,
    };
    const updated = {
      ...photoCakeConfig,
      weights: [...photoCakeConfig.weights, newWeight],
    };
    await persistPhotoCakeConfig(updated);
  };

  const updatePhotoCakeWeight = async (id: string, updates: Partial<PhotoCakeWeight>) => {
    const updatedWeights = photoCakeConfig.weights.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    );
    const updated = { ...photoCakeConfig, weights: updatedWeights };
    await persistPhotoCakeConfig(updated);
  };

  const deletePhotoCakeWeight = async (id: string) => {
    const updatedWeights = photoCakeConfig.weights.filter((w) => w.id !== id);
    const updated = { ...photoCakeConfig, weights: updatedWeights };
    await persistPhotoCakeConfig(updated);
  };

  const updatePhotoCakePrintCharge = async (amount: number) => {
    const updated = { ...photoCakeConfig, printCharge: Math.max(0, amount) };
    await persistPhotoCakeConfig(updated);
  };

  const addPhotoCakeTimeSlot = async (slot: string) => {
    if (!slot.trim() || photoCakeConfig.timeSlots.includes(slot.trim())) return;
    const updated = {
      ...photoCakeConfig,
      timeSlots: [...photoCakeConfig.timeSlots, slot.trim()],
    };
    await persistPhotoCakeConfig(updated);
  };

  const deletePhotoCakeTimeSlot = async (slot: string) => {
    const updated = {
      ...photoCakeConfig,
      timeSlots: photoCakeConfig.timeSlots.filter((s) => s !== slot),
    };
    await persistPhotoCakeConfig(updated);
  };

  const addPhotoCakeShape = async (name: string, label: string, extraPrice: number = 0) => {
    const newShape: PhotoCakeShape = {
      id: `sh-${generateShortId()}`,
      name: name.trim(),
      label: label.trim(),
      extraPrice: Math.max(0, extraPrice),
      is_available: true,
    };
    const updated = {
      ...photoCakeConfig,
      shapes: [...(photoCakeConfig.shapes || []), newShape],
    };
    await persistPhotoCakeConfig(updated);
  };

  const updatePhotoCakeShape = async (id: string, updates: Partial<PhotoCakeShape>) => {
    const updatedShapes = (photoCakeConfig.shapes || []).map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    const updated = { ...photoCakeConfig, shapes: updatedShapes };
    await persistPhotoCakeConfig(updated);
  };

  const deletePhotoCakeShape = async (id: string) => {
    const updatedShapes = (photoCakeConfig.shapes || []).filter((s) => s.id !== id);
    const updated = { ...photoCakeConfig, shapes: updatedShapes };
    await persistPhotoCakeConfig(updated);
  };

  const togglePhotoCakeShape = async (id: string) => {
    const updatedShapes = (photoCakeConfig.shapes || []).map((s) =>
      s.id === id ? { ...s, is_available: !s.is_available } : s
    );
    const updated = { ...photoCakeConfig, shapes: updatedShapes };
    await persistPhotoCakeConfig(updated);
  };

  const togglePhotoCakeModule = async () => {
    let currentConfig = photoCakeConfig;
    let isCurrentlyEnabled = photoCakeConfig.is_enabled !== false;
    if (typeof window !== "undefined") {
      const directEnabled = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_ENABLED);
      if (directEnabled !== null) {
        isCurrentlyEnabled = directEnabled === "true";
      } else {
        const local = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_CONFIG);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            currentConfig = { ...INITIAL_PHOTO_CAKE_CONFIG, ...parsed };
            isCurrentlyEnabled = parsed.is_enabled !== false;
          } catch {}
        }
      }
    }
    const nextState = !isCurrentlyEnabled;
    const updated: PhotoCakeConfig = { ...currentConfig, is_enabled: nextState };
    await persistPhotoCakeConfig(updated);
  };

  const setPhotoCakeEnabled = async (enabled: boolean) => {
    let currentConfig = photoCakeConfig;
    if (typeof window !== "undefined") {
      const local = localStorage.getItem(STORAGE_KEYS.PHOTO_CAKE_CONFIG);
      if (local) {
        try {
          currentConfig = { ...INITIAL_PHOTO_CAKE_CONFIG, ...JSON.parse(local) };
        } catch {}
      }
    }
    const updated: PhotoCakeConfig = { ...currentConfig, is_enabled: enabled };
    await persistPhotoCakeConfig(updated);
  };

  // Storefront Filtering Helpers
  // Strictly display products and categories where is_visible = true
  const visibleCategories = categories.filter((c) => c.is_visible !== false);
  const visibleProducts = products.filter((p) => p.is_visible !== false);

  // Analytics Helpers
  const calculateAnalytics = (dateFilter: "today" | "week" | "month" | "all" = "all") => {
    const now = new Date();
    const filteredOrders = orders.filter((order) => {
      if (order.status === "Cancelled") return false;
      const orderDate = new Date(order.created_at);
      if (dateFilter === "today") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateFilter === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= oneWeekAgo;
      }
      if (dateFilter === "month") {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= oneMonthAgo;
      }
      return true;
    });

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const netProfit = filteredOrders.reduce((sum, o) => sum + (Number(o.profit_amount) || 0), 0);
    const totalCost = totalRevenue - netProfit;
    const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    let totalItemsSold = 0;
    filteredOrders.forEach((o) => {
      o.items?.forEach((it) => {
        totalItemsSold += it.quantity || 1;
      });
    });

    const pendingOrdersCount = orders.filter((o) => o.status === "Pending" || o.status === "Baking").length;
    const photoCakeCount = photoCakes.length;

    return {
      totalRevenue,
      totalCost,
      netProfit,
      profitMarginPercent,
      totalOrdersCount: filteredOrders.length,
      totalItemsSold,
      pendingOrdersCount,
      photoCakeCount,
    };
  };

  const clearAllDemoData = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PHOTO_CAKES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.BULK_CATALOG, JSON.stringify(INITIAL_BULK_CATALOG));
      localStorage.setItem(STORAGE_KEYS.PHOTO_CAKE_CONFIG, JSON.stringify(INITIAL_PHOTO_CAKE_CONFIG));
      localStorage.setItem("hb_products_v1", JSON.stringify([]));
      localStorage.setItem("hb_orders_v1", JSON.stringify([]));
      localStorage.setItem("hb_photo_cakes_v1", JSON.stringify([]));
      setProducts([]);
      setOrders([]);
      setPhotoCakes([]);
      setBulkCatalog(INITIAL_BULK_CATALOG);
      setPhotoCakeConfig(INITIAL_PHOTO_CAKE_CONFIG);
      window.dispatchEvent(new Event("hb_store_updated"));
    }
  };

  return {
    categories,
    visibleCategories,
    products,
    visibleProducts,
    bulkCatalog,
    photoCakeConfig,
    orders,
    photoCakes,
    user,
    isLoading,
    isAdmin: user.role === "admin" || user.email.toLowerCase() === "haibackery@gmail.com",
    // Actions
    loginWithGoogle,
    loginWithEmail,
    loginAsAdmin,
    logout,
    clearAllDemoData,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStockCount,
    updateProductPricesAndMargin,
    toggleProductVisibility,
    toggleProductStock,
    addCategory,
    updateCategory,
    toggleCategoryVisibility,
    deleteCategory,
    addBulkItem,
    updateBulkItem,
    deleteBulkItem,
    toggleBulkItemAvailability,
    addPhotoCakeFlavor,
    updatePhotoCakeFlavor,
    deletePhotoCakeFlavor,
    togglePhotoCakeFlavor,
    addPhotoCakeWeight,
    updatePhotoCakeWeight,
    deletePhotoCakeWeight,
    addPhotoCakeShape,
    updatePhotoCakeShape,
    deletePhotoCakeShape,
    togglePhotoCakeShape,
    togglePhotoCakeModule,
    setPhotoCakeEnabled,
    updatePhotoCakePrintCharge,
    addPhotoCakeTimeSlot,
    deletePhotoCakeTimeSlot,
    createOrder,
    updateOrderStatus,
    submitPhotoCakeRequest,
    updatePhotoCakeStatus,
    calculateAnalytics,
  };
}
