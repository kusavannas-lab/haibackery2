# 🎂 Hai Backery - Modern E-Commerce Web Platform

A full-stack, responsive bakery web application for **Hai Backery**, located at **Barrage Center, Hiramandalam, Srikakulam – 532459, Andhra Pradesh, India**.

Proprietor & Admin: **Shekhar Rao** (`haibackery@gmail.com` | WhatsApp: `+919347166241`)

---

## 🌟 Key Features

### 1. Storefront & Catalog
- **Warm Bakery Aesthetic:** Tailored color palette (warm honey, rich chocolate, amber gold, and crisp vanilla).
- **Dynamic Category Navigation:** Sweets & Mithai, Biscuits & Cookies, Celebration Cakes, Savories & Snacks, and Custom Photo Cakes.
- **Strict Storefront Visibility:** Products and categories are strictly displayed according to the admin's visibility toggles (`is_visible = true`).
- **Real-Time Live Search:** Instant search with autocomplete suggestions and price previews.
- **Interactive Cart & Checkout:** Slide-out drawer with quantity modifiers and instant WhatsApp order generation.

### 2. Dedicated Custom Photo Cake Studio (`/photo-cake`)
- **Live Interactive Cake Canvas:** Renders a 3D-styled cake base matching the selected flavor (Chocolate Truffle, Red Velvet, Black Forest, Butterscotch, Pineapple, Mango).
- **High-Resolution Photo Upload:** Preview uploaded photos on the top of the cake with edible print framing.
- **Dynamic Written Text on Cake:** Real-time edible icing message rendering.
- **Custom Options:** Weight (0.5kg, 1kg, 1.5kg, 2kg, 3kg), 100% Eggless switch, Delivery Date & Time Slot picker.
- **Automated WhatsApp Alert:** Triggers a formatted message to `+919347166241` on submission with customer details, schedule, and photo URL.

### 3. Admin Panel (3 Dedicated Dashboards at `/admin`)
- **Dashboard 1: Inventory & Catalog Management (`/admin/inventory`)**
  - Add, edit, and delete products (Selling Price, Cost Price, Stock Status, Category, Image, Unit).
  - Instant storefront visibility switches to show/hide products or entire categories immediately.
- **Dashboard 2: Orders & Photo Cake Requests (`/admin/orders`)**
  - Real-time order pipeline (Pending $\rightarrow$ Baking $\rightarrow$ Dispatched $\rightarrow$ Delivered).
  - Photo Cake Inbox with downloadable high-resolution customer photos and direct WhatsApp customer reach-out.
- **Dashboard 3: Sales, Revenue & Profit Analytics (`/admin/analytics`)**
  - Key financial cards: Total Items Sold, Total Revenue (₹), Total Cost (₹), and Net Profit Gain (₹) with margin %.
  - Item-level profitability breakdown and category revenue distribution.
  - Date filtering (Today, This Week, This Month, All Time).

---

## 🚀 Getting Started

### 1. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build
```bash
npm run build
npm start
```

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and execute the complete schema in [`supabase/schema.sql`](supabase/schema.sql).
3. Optionally execute [`supabase/seed.sql`](supabase/seed.sql) to seed default bakery products.
4. Copy your **Project URL** and **Anon Public Key** from Supabase Settings $\rightarrow$ API and add them to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_EMAIL=haibackery@gmail.com
NEXT_PUBLIC_ADMIN_PHONE=919347166241
```

> **Note:** Even before adding Supabase credentials, the application operates with full client-side state and seed data with persistence.

---

## 📱 WhatsApp Integration

Orders and photo cake requests trigger WhatsApp Click-to-Chat URLs directed to:
`https://wa.me/919347166241?text=...`
