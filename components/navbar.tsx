"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Phone, 
  MapPin, 
  Cake, 
  ChevronDown,
  User,
  Heart
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_PHONE } from "@/lib/whatsapp";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { visibleCategories, visibleProducts, photoCakeConfig, user, isAdmin, loginWithGoogle, logout } = useBakeryStore();
  const { itemCount, openCart } = useCartStore();

  const isPhotoCakeEnabled = photoCakeConfig?.is_enabled !== false;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search filter
  const searchResults = searchQuery.trim()
    ? visibleProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductSelect = (productId: string) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    setMobileMenuOpen(false);
    const element = document.getElementById(productId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-4", "ring-honey-500");
      setTimeout(() => element.classList.remove("ring-4", "ring-honey-500"), 2000);
    } else {
      router.push(`/#${productId}`);
    }
  };

  // Do not render customer navbar on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-chocolate-800 via-bakery-900 to-chocolate-800 text-amber-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" /> Fresh Daily
            </span>
            <span className="hidden sm:inline text-amber-200/90 font-medium">
              Authentic Sweets, Hot Bakery & Custom Photo Cakes
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={`https://wa.me/${ADMIN_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition font-medium"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Order on WhatsApp: +91 9347166241</span>
            </a>
            <span className="hidden md:flex items-center gap-1 text-amber-200/70">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Bommika, Hiramandalam</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-bakery-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                <Cake className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold tracking-tight text-chocolate-900 font-serif">
                    Hai <span className="text-bakery-600">Backery</span>
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-amber-800 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Barrage Center, Bommika
                </span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search Kaju Katli, Truffle Cake, Osmania Biscuits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-amber-50/60 border border-amber-200 rounded-full text-sm text-chocolate-900 placeholder:text-amber-800/50 focus:outline-none focus:ring-2 focus:ring-bakery-500/40 focus:border-bakery-500 transition shadow-inner"
                />
                <Search className="w-4 h-4 text-amber-700 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-3 text-amber-600 hover:text-chocolate-900 text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Autocomplete Search Dropdown */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-amber-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-amber-800/70 uppercase tracking-wider border-b border-amber-50">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => handleProductSelect(prod.id)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-amber-50/80 transition text-left"
                      >
                        <img
                          src={prod.image_url || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100"}
                          alt={prod.title}
                          className="w-10 h-10 rounded-lg object-cover border border-amber-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-chocolate-900 truncate">
                            {prod.title}
                          </p>
                          <p className="text-xs text-amber-700/80 truncate">
                            {prod.category_name} • {prod.unit}
                          </p>
                        </div>
                        <div className="text-sm font-bold text-bakery-600">
                          {formatCurrency(prod.price)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-sm text-amber-800/70">
                      No bakery items found matching &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation & Action Buttons */}
            <div className="flex items-center gap-3">
              
              {/* Custom Cake Idea Suggestion Link */}
              <Link
                href="/custom-cake"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-orange-100 hover:bg-orange-200 text-chocolate-950 text-xs font-black border border-orange-300 transition"
              >
                <span>🎨 Suggest Cake Idea</span>
              </Link>

              {/* Bulk & Event Orders Link */}
              <Link
                href="/bulk-orders"
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-chocolate-900 text-xs font-black border border-amber-300 transition"
              >
                <span>🎉 Bulk / Events</span>
              </Link>

              {/* Photo Cake CTA Link */}
              <Link
                href="/photo-cake"
                className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-md transition transform hover:-translate-y-0.5 ${
                  isPhotoCakeEnabled
                    ? "bg-gradient-to-r from-amber-500 to-bakery-600 text-white shadow-amber-500/20 hover:from-amber-600 hover:to-bakery-700"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin-slow" />
                <span>{isPhotoCakeEnabled ? "Custom Photo Cake 📸" : "Photo Cake (Not Available) 🔴"}</span>
              </Link>

              {/* Admin Portal Link */}
              {isAdmin && (
                <Link
                  href="/admin/executive"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200 text-bakery-950 hover:from-amber-200 hover:to-amber-300 transition text-xs font-bold border border-amber-300 shadow-sm"
                  title="Executive Admin Dashboard"
                >
                  <Sparkles className="w-4 h-4 text-bakery-700 animate-spin-slow" />
                  <span className="hidden sm:inline">⚡ Executive Control</span>
                </Link>
              )}

              {/* User / Login Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-chocolate-900 transition text-xs font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-bakery-800 font-bold text-xs">
                    {user.isLoggedIn ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="hidden xl:inline max-w-[100px] truncate">
                    {user.isLoggedIn ? user.name : "Sign In"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-amber-700" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-amber-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {user.isLoggedIn ? (
                      <div>
                        <div className="px-4 py-2 border-b border-amber-50">
                          <p className="text-xs text-amber-700 font-medium">Signed in as</p>
                          <p className="text-sm font-bold text-chocolate-900 truncate">{user.name}</p>
                          <p className="text-xs text-amber-600/80 truncate">{user.email}</p>
                          {isAdmin && (
                            <span className="mt-1 inline-block text-[10px] bg-amber-100 text-bakery-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                              👑 Store Owner / Admin
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <div className="py-1">
                            <Link
                              href="/admin/executive"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-4 py-2 text-xs font-bold text-bakery-900 bg-amber-50/80 hover:bg-amber-100 flex items-center gap-2"
                            >
                              <Sparkles className="w-4 h-4 text-bakery-600" />
                              ⚡ Executive Store Command
                            </Link>
                            <Link
                              href="/admin/inventory"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-4 py-2 text-xs font-semibold text-chocolate-900 hover:bg-amber-50 flex items-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4 text-bakery-600" />
                              Catalog & Visibility Toggles
                            </Link>
                            <Link
                              href="/admin/orders"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-4 py-2 text-xs font-semibold text-chocolate-900 hover:bg-amber-50 flex items-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4 text-bakery-600" />
                              Orders & Photo Cake Requests
                            </Link>
                            <Link
                              href="/admin/analytics"
                              onClick={() => setUserDropdownOpen(false)}
                              className="w-full px-4 py-2 text-xs font-semibold text-chocolate-900 hover:bg-amber-50 flex items-center gap-2"
                            >
                              <Sparkles className="w-4 h-4 text-bakery-600" />
                              Revenue & Profit Analytics
                            </Link>
                          </div>
                        )}

                        <div className="pt-2 border-t border-amber-50 px-2">
                          <button
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        <p className="text-xs font-semibold text-chocolate-900 px-1">
                          Welcome to Hai Backery!
                        </p>
                        <p className="text-[11px] text-amber-700/80 px-1 pb-1">
                          Sign in to save delivery addresses and track custom cake orders.
                        </p>

                        <Link
                          href="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-bakery-600 hover:from-amber-600 hover:to-bakery-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Open Sign In Page</span>
                        </Link>

                        <button
                          onClick={() => {
                            loginWithGoogle();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full py-2 px-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 shadow-sm transition"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          Continue with Google
                        </button>

                        <div className="pt-2 border-t border-amber-100">
                          <Link
                            href="/login"
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-bakery-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition border border-amber-300"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-bakery-700" />
                            Admin Sign In (haibackery@gmail.com)
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Drawer Trigger Button */}
              <button
                onClick={openCart}
                className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-bakery-600 text-white shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-bakery-700 transition transform hover:scale-105 active:scale-95"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl border border-amber-200 text-chocolate-900 hover:bg-amber-50 transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-amber-100 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-xl">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Sweets, Cakes, Biscuits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-sm text-chocolate-900"
              />
              <Search className="w-4 h-4 text-amber-700 absolute left-3.5 top-3" />
            </div>

            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/custom-cake"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-sm"
              >
                <span>🎨 Suggest / Upload Custom Cake Design</span>
              </Link>

              <Link
                href="/bulk-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 flex items-center justify-center gap-2 p-3 bg-amber-100 hover:bg-amber-200 text-chocolate-900 font-extrabold text-sm rounded-xl border border-amber-300 shadow-sm"
              >
                <span>🎉 Bulk & Event Orders (Up to 20% OFF)</span>
              </Link>

              <Link
                href="/photo-cake"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-amber-500 to-bakery-600 text-white font-bold text-sm rounded-xl shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-yellow-200" />
                Design Custom Photo Cake
              </Link>

              {visibleCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/#${cat.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 bg-amber-50/60 rounded-xl text-xs font-semibold text-chocolate-900 hover:bg-amber-100 transition"
                >
                  <span>🍰</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>

            {/* Admin Link for Mobile */}
            <div className="pt-2 border-t border-amber-100 flex gap-2">
              {isAdmin ? (
                <Link
                  href="/admin/executive"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 bg-amber-100 text-bakery-900 text-center font-bold text-xs rounded-xl border border-amber-300"
                >
                  👑 Open Admin Portal
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 bg-amber-50 text-chocolate-900 text-center font-bold text-xs rounded-xl border border-amber-200"
                >
                  Admin Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
