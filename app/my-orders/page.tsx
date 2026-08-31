"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Cake, 
  Sparkles, 
  Camera, 
  Mail, 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle2, 
  Clock3, 
  AlertCircle, 
  MessageCircle, 
  ArrowRight, 
  RotateCcw, 
  ExternalLink,
  ChevronRight,
  PackageCheck,
  ChefHat,
  Filter,
  User,
  ShieldCheck,
  Eye,
  RefreshCw,
  LogOut,
  Lock,
  LogIn
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ADMIN_PHONE, STORE_NAME } from "@/lib/whatsapp";
import { Order, PhotoCakeRequest, CustomerCakeSuggestion } from "@/lib/types";

type OrderTab = "all" | "bakery" | "photo-cakes" | "custom-cakes";

export default function MyOrdersPage() {
  const { orders, photoCakes, cakeSuggestions, user, isAdmin, visibleProducts, logout } = useBakeryStore();
  const { addItem, openCart } = useCartStore();

  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [myOrderIds, setMyOrderIds] = useState<string[]>([]);
  const [viewAllAdminMode, setViewAllAdminMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // The customer email is STRICTLY FIXED to the logged-in user email
  const loginEmail = user.isLoggedIn && user.email ? user.email.trim().toLowerCase() : "";

  // Load device placed orders as backup
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedIds = JSON.parse(localStorage.getItem("hb_my_order_ids") || "[]");
        setMyOrderIds(savedIds);
      } catch {
        // ignore
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Strict Match: ONLY items belonging to this fixed login email or placed by this device session
  const isCustomerMatch = (itemEmail: string | undefined, itemNotes: string | undefined, orderId: string) => {
    if (isAdmin && viewAllAdminMode) return true;
    if (loginEmail) {
      if (itemEmail && itemEmail.trim().toLowerCase() === loginEmail) return true;
      if (itemNotes && itemNotes.toLowerCase().includes(loginEmail)) return true;
      if (myOrderIds.includes(orderId)) return true;
      return false;
    }
    // Guest fallback: only explicitly placed order IDs on this browser session
    if (myOrderIds.includes(orderId)) return true;
    return false;
  };

  // Filter Regular Store Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!isCustomerMatch(o.customer_email, o.notes, o.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = o.id.toLowerCase().includes(q);
        const nameMatch = o.customer_name.toLowerCase().includes(q);
        const itemMatch = o.items.some((i) => (i.product_title || "").toLowerCase().includes(q));
        return idMatch || nameMatch || itemMatch;
      }
      return true;
    });
  }, [orders, loginEmail, myOrderIds, viewAllAdminMode, isAdmin, searchQuery]);

  // Filter Photo Cakes
  const filteredPhotoCakes = useMemo(() => {
    return photoCakes.filter((p) => {
      if (p.id.startsWith("sug-")) return false;
      if (!isCustomerMatch(p.customer_email, p.notes || p.special_notes, p.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = p.id.toLowerCase().includes(q);
        const nameMatch = p.customer_name.toLowerCase().includes(q);
        const flavorMatch = (p.cake_flavor || p.flavor || "").toLowerCase().includes(q);
        const msgMatch = (p.cake_message || p.message || "").toLowerCase().includes(q);
        return idMatch || nameMatch || flavorMatch || msgMatch;
      }
      return true;
    });
  }, [photoCakes, loginEmail, myOrderIds, viewAllAdminMode, isAdmin, searchQuery]);

  // Filter Custom Suggestions
  const filteredSuggestions = useMemo(() => {
    return cakeSuggestions.filter((s) => {
      if (!isCustomerMatch(s.customer_email, s.admin_notes || s.description, s.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = s.id.toLowerCase().includes(q);
        const nameMatch = s.customer_name.toLowerCase().includes(q);
        const descMatch = (s.description || "").toLowerCase().includes(q);
        const occasionMatch = (s.occasion || "").toLowerCase().includes(q);
        return idMatch || nameMatch || descMatch || occasionMatch;
      }
      return true;
    });
  }, [cakeSuggestions, loginEmail, myOrderIds, viewAllAdminMode, isAdmin, searchQuery]);

  const totalCount = filteredOrders.length + filteredPhotoCakes.length + filteredSuggestions.length;

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const prod = visibleProducts.find((p) => p.id === item.product_id);
      if (prod) {
        addItem(prod, item.quantity);
      }
    });
    openCart();
  };

  const getOrderStatusBadge = (status: string) => {
    const s = (status || "Pending").toLowerCase();
    if (s.includes("delivered") || s.includes("completed") || s.includes("ready")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
    }
    if (s.includes("baking") || s.includes("oven") || s.includes("designing") || s.includes("quoted")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
          <ChefHat className="w-3.5 h-3.5 text-bakery-600" />
          <span>{status}</span>
        </span>
      );
    }
    if (s.includes("cancel") || s.includes("declined")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
        <Clock3 className="w-3.5 h-3.5" />
        <span>{status || "Received"}</span>
      </span>
    );
  };

  const getWhatsAppInquiryUrl = (type: "order" | "photo-cake" | "suggestion", id: string, amount?: number) => {
    let msg = `Namaste Shekhar Rao garu, I want to check the status of my `;
    if (type === "order") msg += `Bakery Order #${id}${amount ? ` (Amount: ₹${amount})` : ""}.`;
    else if (type === "photo-cake") msg += `Photo Cake Request #${id}.`;
    else msg += `Custom Cake Design Suggestion #${id}.`;
    return `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`;
  };

  if (!isLoaded) return null;

  // If user is not logged in and has no active orders
  const isNotLoggedIn = !user.isLoggedIn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf4e8] via-[#fff7ed] to-[#fdebd0] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* 1. Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
              <PackageCheck className="w-4 h-4 text-amber-400" />
              <span>Customer Orders & Live Tracking</span>
            </span>

            <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50 leading-tight">
              My Orders & <span className="text-amber-400">Order History</span> 📦
            </h1>

            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              Strictly secured and locked to your <strong>verified login account</strong>. View only your personal bakery orders and custom cakes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setViewAllAdminMode(!viewAllAdminMode)}
                className={`px-3.5 py-2.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 transition shadow-sm ${
                  viewAllAdminMode
                    ? "bg-amber-500 text-chocolate-950 border-amber-300"
                    : "bg-white/10 text-amber-200 border-white/20 hover:bg-white/20"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{viewAllAdminMode ? "Admin: Showing All Store Orders" : "Switch to View All Orders"}</span>
              </button>
            )}

            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs border border-amber-400/40 flex items-center gap-1.5 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Menu</span>
            </Link>
            <Link
              href="/photo-cake"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-chocolate-950 font-black text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo Cake 📸</span>
            </Link>
          </div>
        </div>

        {/* 2. Fixed Login Email Account Bar or Sign In Gate */}
        {isNotLoggedIn && myOrderIds.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-amber-300 shadow-xl max-w-xl mx-auto text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto text-bakery-700">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif font-black text-2xl text-chocolate-900">
                Please Sign In to View Your Orders
              </h2>
              <p className="text-xs sm:text-sm text-amber-800/80 max-w-md mx-auto leading-relaxed">
                To guarantee your privacy and ensure orders cannot be accessed by anyone else, your orders are strictly fixed to your login email account.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-bakery-600 to-amber-600 hover:from-amber-600 hover:to-bakery-700 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition transform hover:scale-[1.01]"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Access Your Orders</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Fixed Logged-In User Account Indicator (No manual editing permitted) */
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-bakery-700 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-700">
                    Logged In Account (Fixed):
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                    ✓ Verified Email
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-chocolate-900 text-sm sm:text-base">
                    {loginEmail ? `✉️ ${loginEmail}` : "📍 This Device's Active Orders"}
                  </span>
                  {user.name && (
                    <span className="text-xs text-amber-800 font-semibold hidden md:inline">
                      ({user.name})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {user.isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 transition"
                  title="Sign out of current account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Account</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-chocolate-950 font-black text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* 3. Search & Tabs Filter */}
        {(user.isLoggedIn || myOrderIds.length > 0) && (
          <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-amber-200 shadow-md space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search within your personal orders by Order ID, item name, flavor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-sm text-chocolate-900 placeholder:text-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-amber-700 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3 text-amber-600 hover:text-chocolate-900 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Tab Navigation Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-2xl font-bold text-xs transition shrink-0 flex items-center gap-1.5 ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-amber-500 to-bakery-600 text-white shadow-md shadow-amber-500/20"
                    : "bg-amber-50 hover:bg-amber-100 text-chocolate-900 border border-amber-200"
                }`}
              >
                <span>All My Orders</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "all" ? "bg-white/20 text-white" : "bg-amber-200 text-bakery-900"}`}>
                  {totalCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("bakery")}
                className={`px-4 py-2 rounded-2xl font-bold text-xs transition shrink-0 flex items-center gap-1.5 ${
                  activeTab === "bakery"
                    ? "bg-gradient-to-r from-amber-500 to-bakery-600 text-white shadow-md shadow-amber-500/20"
                    : "bg-amber-50 hover:bg-amber-100 text-chocolate-900 border border-amber-200"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Store Orders</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "bakery" ? "bg-white/20 text-white" : "bg-amber-200 text-bakery-900"}`}>
                  {filteredOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("photo-cakes")}
                className={`px-4 py-2 rounded-2xl font-bold text-xs transition shrink-0 flex items-center gap-1.5 ${
                  activeTab === "photo-cakes"
                    ? "bg-gradient-to-r from-amber-500 to-bakery-600 text-white shadow-md shadow-amber-500/20"
                    : "bg-amber-50 hover:bg-amber-100 text-chocolate-900 border border-amber-200"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo Cake Requests</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "photo-cakes" ? "bg-white/20 text-white" : "bg-amber-200 text-bakery-900"}`}>
                  {filteredPhotoCakes.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("custom-cakes")}
                className={`px-4 py-2 rounded-2xl font-bold text-xs transition shrink-0 flex items-center gap-1.5 ${
                  activeTab === "custom-cakes"
                    ? "bg-gradient-to-r from-amber-500 to-bakery-600 text-white shadow-md shadow-amber-500/20"
                    : "bg-amber-50 hover:bg-amber-100 text-chocolate-900 border border-amber-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Cake Inquiries</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "custom-cakes" ? "bg-white/20 text-white" : "bg-amber-200 text-bakery-900"}`}>
                  {filteredSuggestions.length}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Orders Content List */}
        {(user.isLoggedIn || myOrderIds.length > 0) && (
          <>
            {totalCount === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-amber-200 shadow-xl space-y-4 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-xl text-chocolate-900">
                    No Orders Placed Yet for This Account
                  </h3>
                  <p className="text-xs text-amber-800/80 max-w-md mx-auto">
                    {loginEmail
                      ? `No orders found under ${loginEmail}. Orders you place will immediately appear here for live tracking.`
                      : "You haven't placed any orders yet. Explore our delicious sweets, bakery items, or design a custom photo cake!"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    href="/#catalog-section"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-bakery-600 text-white font-black text-xs shadow-md"
                  >
                    Browse Menu & Order
                  </Link>
                  <Link
                    href="/photo-cake"
                    className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-chocolate-900 font-black text-xs border border-amber-300"
                  >
                    Design Photo Cake 📸
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Section A: Regular Bakery Orders */}
                {(activeTab === "all" || activeTab === "bakery") && filteredOrders.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-bakery-700" />
                      <h2 className="font-serif font-extrabold text-lg sm:text-xl text-chocolate-900">
                        Storefront & Cart Orders ({filteredOrders.length})
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-md hover:shadow-lg transition space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-3">
                              <div>
                                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                                  Order ID
                                </span>
                                <span className="font-mono font-black text-sm text-chocolate-950">
                                  #{order.id}
                                </span>
                                <span className="text-[10px] text-amber-800/70 block mt-0.5">
                                  {order.created_at ? formatDate(order.created_at) : "Recently Placed"}
                                </span>
                              </div>
                              {getOrderStatusBadge(order.status)}
                            </div>

                            {/* Items List */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                                Ordered Items:
                              </span>
                              <div className="space-y-1 bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
                                {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs text-chocolate-900">
                                <span className="font-semibold truncate max-w-[200px]">
                                  {it.product_title || "Bakery Item"} × {it.quantity}
                                </span>
                                <span className="font-bold text-bakery-700 shrink-0">
                                  {formatCurrency(it.unit_price * it.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer & Total Details */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="text-chocolate-900 font-medium">
                            <span>👤 {order.customer_name}</span>
                            {order.customer_email && (
                              <span className="text-[11px] text-amber-800 ml-1">({order.customer_email})</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-amber-700 block font-bold">Total Bill:</span>
                            <span className="font-black text-base text-bakery-700">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </div>
                        </div>

                        {order.notes && (
                          <p className="text-[11px] text-amber-800/80 bg-white p-2 rounded-xl border border-amber-100 italic">
                            &quot;{order.notes}&quot;
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
                        <a
                          href={getWhatsAppInquiryUrl("order", order.id, order.total_amount)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Status</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="py-2 px-3.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-chocolate-950 font-bold text-xs flex items-center justify-center gap-1 border border-amber-300 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-bakery-700" />
                          <span>Reorder</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section B: Photo Cake Orders */}
            {(activeTab === "all" || activeTab === "photo-cakes") && filteredPhotoCakes.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-bakery-700" />
                  <h2 className="font-serif font-extrabold text-lg sm:text-xl text-chocolate-900">
                    Custom Photo Cake Requests ({filteredPhotoCakes.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPhotoCakes.map((cake) => (
                    <div
                      key={cake.id}
                      className="bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-md hover:shadow-lg transition space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-3">
                          <div>
                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                              Photo Cake ID
                            </span>
                            <span className="font-mono font-black text-sm text-chocolate-950">
                              #{cake.id}
                            </span>
                            <span className="text-[10px] text-amber-800/70 block mt-0.5">
                              {cake.created_at ? formatDate(cake.created_at) : "Recent Request"}
                            </span>
                          </div>
                          {getOrderStatusBadge(cake.status)}
                        </div>

                        {/* Cake Photo Thumbnail & Specs */}
                        <div className="flex items-center gap-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm shrink-0 bg-amber-100">
                            {cake.image_url || cake.photo_url ? (
                              <img
                                src={cake.image_url || cake.photo_url}
                                alt="Cake Photo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-amber-700">
                                <Cake className="w-7 h-7" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-black text-chocolate-950 truncate">
                              {cake.cake_flavor || cake.flavor || "Custom Cake"}
                            </p>
                            <p className="text-[11px] text-amber-900 font-semibold">
                              {cake.cake_weight || cake.weight} • {cake.cake_shape || "Round"} Shape
                              {(cake.eggless || cake.is_eggless) && " • 100% Eggless 🌱"}
                            </p>
                            <p className="text-[10px] text-amber-800/80">
                              Delivery: {cake.delivery_date} ({cake.delivery_time})
                            </p>
                          </div>
                        </div>

                        {/* Written Cake Message */}
                        {(cake.cake_message || cake.message) && (
                          <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                            <span className="text-[9px] font-bold text-amber-700 uppercase block">Message on Cake:</span>
                            <p className="font-serif italic font-bold text-xs text-chocolate-900">
                              &quot;{cake.cake_message || cake.message}&quot;
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="text-chocolate-900 font-medium">
                            <span>👤 {cake.customer_name}</span>
                            {cake.customer_email && (
                              <span className="text-[11px] text-amber-800 ml-1">({cake.customer_email})</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-amber-700 block font-bold">Est. Price:</span>
                            <span className="font-black text-base text-bakery-700">
                              {formatCurrency(cake.estimated_price || cake.total_price || 750)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
                        <a
                          href={getWhatsAppInquiryUrl("photo-cake", cake.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Status Update</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section C: Custom Cake Suggestions & Inquiries */}
            {(activeTab === "all" || activeTab === "custom-cakes") && filteredSuggestions.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <h2 className="font-serif font-extrabold text-lg sm:text-xl text-chocolate-900">
                    Custom Cake Design Inquiries ({filteredSuggestions.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSuggestions.map((sug) => (
                    <div
                      key={sug.id}
                      className="bg-white rounded-3xl p-5 border-2 border-amber-200/90 shadow-md hover:shadow-lg transition space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-3">
                          <div>
                            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                              Inquiry ID
                            </span>
                            <span className="font-mono font-black text-sm text-chocolate-950">
                              #{sug.id}
                            </span>
                            <span className="text-[10px] text-amber-800/70 block mt-0.5">
                              {sug.created_at ? formatDate(sug.created_at) : "Recent Idea"}
                            </span>
                          </div>
                          {getOrderStatusBadge(sug.status)}
                        </div>

                        {/* Reference Image & Description */}
                        <div className="flex items-start gap-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
                          {sug.image_url && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm shrink-0 bg-amber-100">
                              <img
                                src={sug.image_url}
                                alt="Reference Design"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="space-y-1 min-w-0 flex-1">
                            <p className="text-xs font-bold text-chocolate-950">
                              Occasion: <span className="text-bakery-700">{sug.occasion || "Celebration"}</span>
                            </p>
                            <p className="text-[11px] text-amber-900/90 line-clamp-2 italic">
                              &quot;{sug.description}&quot;
                            </p>
                            <p className="text-[10px] text-amber-800/70">
                              Needed: {sug.needed_date} ({sug.needed_time})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="text-chocolate-900 font-medium">
                            <span>👤 {sug.customer_name}</span>
                            {sug.customer_email && (
                              <span className="text-[11px] text-amber-800 ml-1">({sug.customer_email})</span>
                            )}
                          </div>
                          {sug.quoted_price ? (
                            <div className="text-right">
                              <span className="text-[10px] text-emerald-700 block font-bold">Quoted Price:</span>
                              <span className="font-black text-base text-emerald-800">
                                {formatCurrency(sug.quoted_price)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                              Price Quote Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
                        <a
                          href={getWhatsAppInquiryUrl("suggestion", sug.id, sug.quoted_price)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Ask Shekhar Rao for Quote</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </>
    )}

      </div>
    </div>
  );
}
