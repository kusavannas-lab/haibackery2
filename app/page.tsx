"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ShoppingBag, 
  Cake, 
  Cookie, 
  Candy, 
  UtensilsCrossed, 
  Camera, 
  Star, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Phone, 
  CheckCircle2,
  Heart,
  Gift
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import ProductCard from "@/components/product-card";
import { ADMIN_PHONE, STORE_ADDRESS } from "@/lib/whatsapp";

export default function HomePage() {
  const { visibleCategories, visibleProducts, isLoading } = useBakeryStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // Filter products by selected category
  const filteredProducts = visibleProducts.filter((product) => {
    if (selectedCategory === "all") return true;
    const cat = visibleCategories.find((c) => c.id === selectedCategory);
    return product.category_id === selectedCategory || (cat && product.category_name === cat.name);
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  const getCategoryIcon = (slug?: string) => {
    switch (slug) {
      case "sweets":
        return <Candy className="w-4 h-4" />;
      case "biscuits":
        return <Cookie className="w-4 h-4" />;
      case "cakes":
        return <Cake className="w-4 h-4" />;
      case "savories":
        return <UtensilsCrossed className="w-4 h-4" />;
      case "photo-cakes":
        return <Camera className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-100/30 to-transparent pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Soft Background Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-amber-300/20 via-bakery-400/20 to-amber-200/20 blur-3xl -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/70 text-bakery-900 text-xs font-bold shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Barrage Center, Bommika • Freshly Baked Every Day</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-chocolate-900 leading-[1.15] tracking-tight">
                Authentic Mithai, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-bakery-600 via-amber-600 to-bakery-700">
                  Crispy Biscuits & Cakes
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-amber-950/80 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Welcome to <strong>High Bakery</strong> by Shekhar Rao. Enjoy rich pure ghee sweets, melt-in-mouth Osmania biscuits, celebration cakes, and custom photo cakes freshly baked at Barrage Center, Bommika. Order online and pickup at counter!
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#catalog-section"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-bakery-600 to-amber-600 hover:from-amber-600 hover:to-bakery-700 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition transform hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Bakery Menu</span>
                </a>

                <Link
                  href="/photo-cake"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-amber-50/80 text-chocolate-900 font-extrabold text-sm flex items-center justify-center gap-2.5 border-2 border-amber-300 shadow-md transition transform hover:-translate-y-0.5"
                >
                  <Camera className="w-4 h-4 text-bakery-600" />
                  <span>Design Photo Cake 📸</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-amber-200/60 max-w-md mx-auto lg:mx-0 text-center">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-lg text-chocolate-900 font-serif">100%</p>
                  <p className="text-[11px] text-amber-800 font-medium">Pure Desi Ghee</p>
                </div>
                <div className="space-y-0.5 border-x border-amber-200/60">
                  <p className="font-extrabold text-lg text-chocolate-900 font-serif">Daily</p>
                  <p className="text-[11px] text-amber-800 font-medium">Fresh Morning Batch</p>
                </div>
                <div className="space-y-0.5">
                  <p className="font-extrabold text-lg text-chocolate-900 font-serif">Instant</p>
                  <p className="text-[11px] text-amber-800 font-medium">WhatsApp Orders</p>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                
                {/* Main Hero Card */}
                <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-amber-50 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
                    alt="High Bakery Celebration Cake"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-[11px] font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full w-fit mb-2">
                      ⭐ Chef Special
                    </span>
                    <h3 className="font-serif font-bold text-xl">Belgian Truffle & Custom Photo Cakes</h3>
                    <p className="text-xs text-amber-200/90 mt-1">Baked fresh with premium ingredients & Belgian cocoa</p>
                  </div>
                </div>

                {/* Floating Sweet Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-amber-100 flex items-center gap-3 animate-bounce-subtle">
                  <img
                    src="https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=120&q=80"
                    alt="Kaju Katli"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-xs font-extrabold text-chocolate-900">Kaju Katli Diamond</p>
                    <p className="text-[10px] text-amber-700">Pure Cashews & Silver Vark</p>
                  </div>
                </div>

                {/* Floating Rating Pill */}
                <div className="absolute -top-4 -right-4 bg-chocolate-900 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-amber-700/60">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <div className="text-xs">
                    <span className="font-extrabold">4.9/5</span>
                    <span className="text-amber-200/80 text-[10px] block">Local Favorite</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Product Catalog Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        
        {/* Section Heading & Category Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-amber-200/80">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-bakery-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Fresh From Our Ovens
            </span>
            <h2 className="text-3xl font-serif font-extrabold text-chocolate-900">
              Our Bakery & Sweet Catalog
            </h2>
            <p className="text-xs sm:text-sm text-amber-900/70">
              Handmade daily at Barrage Center, Bommika with pure ingredients.
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-800 font-semibold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white border border-amber-200 rounded-xl px-3 py-2 text-chocolate-900 font-medium focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-chocolate-900 text-amber-200 shadow-md"
                : "bg-white text-chocolate-900 border border-amber-200 hover:bg-amber-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Delights ({visibleProducts.length})</span>
          </button>

          {visibleCategories.map((cat) => {
            const count = visibleProducts.filter((p) => p.category_id === cat.id || p.category_name === cat.name).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-chocolate-900 text-amber-200 shadow-md"
                    : "bg-white text-chocolate-900 border border-amber-200 hover:bg-amber-50"
                }`}
              >
                {getCategoryIcon(cat.slug)}
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-400 text-chocolate-950 font-black' : 'bg-amber-100 text-amber-900'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Display (Divided by Separate Categories) */}
        {visibleProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-amber-300 p-8 space-y-4 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center text-amber-700 mx-auto shadow-inner">
              <Cake className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <p className="text-lg font-serif font-bold text-chocolate-900">
                Fresh Batches Are Baking!
              </p>
              <p className="text-xs text-amber-800/80 leading-relaxed">
                Our kitchen at Barrage Center, Bommika is preparing fresh batches. Items added by Shekhar Rao in the Admin Console will appear here in real time.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/photo-cake"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-orange-600 text-white font-bold text-xs shadow-md transition"
              >
                📸 Design Custom Photo Cake
              </Link>
              <a
                href={`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent('Hi Shekhar Rao, I want to inquire about High Bakery products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                WhatsApp Inquiry
              </a>
            </div>
          </div>
        ) : selectedCategory === "all" ? (
          <div className="space-y-14">
            {visibleCategories.map((cat) => {
              const catProducts = visibleProducts
                .filter((p) => p.category_id === cat.id || p.category_name === cat.name)
                .sort((a, b) => {
                  if (sortBy === "price-asc") return a.price - b.price;
                  if (sortBy === "price-desc") return b.price - a.price;
                  return 0;
                });

              if (catProducts.length === 0) return null;

              return (
                <div key={cat.id} id={`section-${cat.slug || cat.id}`} className="space-y-6 scroll-mt-28">
                  {/* Category Section Header */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-bakery-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                        {getCategoryIcon(cat.slug)}
                      </div>
                      <div>
                        <h3 className="font-serif font-black text-xl sm:text-2xl text-chocolate-900 flex items-center gap-2">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-amber-800/80">
                          Freshly prepared at High Bakery counter
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold bg-amber-100 text-chocolate-900 px-3 py-1 rounded-full border border-amber-300">
                      {catProducts.length} {catProducts.length === 1 ? "Item" : "Items"}
                    </span>
                  </div>

                  {/* Category Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {catProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Any unassigned / uncategorized products */}
            {(() => {
              const assignedCatIds = new Set(visibleCategories.map((c) => c.id));
              const assignedCatNames = new Set(visibleCategories.map((c) => c.name));
              const otherProducts = visibleProducts.filter(
                (p) => !assignedCatIds.has(p.category_id) && !assignedCatNames.has(p.category_name || "")
              );
              if (otherProducts.length === 0) return null;

              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-chocolate-900 flex items-center justify-center text-amber-300">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif font-black text-xl sm:text-2xl text-chocolate-900">
                          Bakery Specials & More
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-amber-100 text-chocolate-900 px-3 py-1 rounded-full border border-amber-300">
                      {otherProducts.length} Items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {otherProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-bakery-600 flex items-center justify-center text-white shadow-md">
                  {getCategoryIcon(visibleCategories.find((c) => c.id === selectedCategory)?.slug)}
                </div>
                <h3 className="font-serif font-black text-xl sm:text-2xl text-chocolate-900">
                  {visibleCategories.find((c) => c.id === selectedCategory)?.name || "Category Items"}
                </h3>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-chocolate-900 px-3 py-1 rounded-full border border-amber-300">
                {sortedProducts.length} {sortedProducts.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-amber-300 p-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center text-amber-700 mx-auto shadow-inner">
              <Cake className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <p className="text-lg font-serif font-bold text-chocolate-900">
                Fresh Batches Are Baking!
              </p>
              <p className="text-xs text-amber-800/80 leading-relaxed">
                Products in this category will appear once added by Shekhar Rao.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/photo-cake"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md transition"
              >
                📸 Design Custom Photo Cake
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 3.5 Bulk & Event Orders Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Weddings • Festivals • Functions • Parties</span>
            </span>

            <h2 className="text-2xl sm:text-4xl font-serif font-black text-amber-50 leading-tight">
              Planning a Wedding or Special Event? <span className="text-amber-400">Order in Bulk!</span>
            </h2>

            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              Get authentic pure ghee sweets, snack gift boxes, celebration cakes, and crispy savories in large quantities with <strong>up to 20% bulk discounts</strong>. Delivered directly to your event venue across Bommika & Hiramandalam.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/bulk-orders"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/30 transition transform hover:scale-105"
              >
                <span>Calculate & Order Bulk Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/919347166241?text=Namaste%20Shekhar%20Rao%20garu,%20I%20want%20to%20inquire%20about%20a%20bulk%20event%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-[#361507] hover:bg-[#481c09] text-amber-200 font-bold text-xs flex items-center gap-2 border border-amber-600/50 shadow transition"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Shekhar Rao (+91 9347166241)</span>
              </a>
            </div>
          </div>

          <div className="bg-[#2c1207] p-6 rounded-3xl border-2 border-amber-600/50 shadow-xl space-y-2 shrink-0 text-center relative z-10">
            <p className="text-xs font-black text-amber-400 uppercase tracking-widest">Grand Event Discount</p>
            <p className="text-3xl font-black text-white">Up to 20% OFF</p>
            <p className="text-[11px] text-amber-200/70">Custom Gift Box Packaging Available</p>
          </div>
        </div>
      </section>

      {/* 4. Why Choose High Bakery */}
      <section className="bg-amber-100/50 py-16 border-y border-amber-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-bakery-600">
              Our Quality Promise
            </span>
            <h2 className="text-3xl font-serif font-extrabold text-chocolate-900">
              Why Bommika & Hiramandalam Loves Us
            </h2>
            <p className="text-xs sm:text-sm text-amber-900/75">
              High standards of taste, hygiene, and authentic flavors since day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-bakery-600">
                <Candy className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-chocolate-900">100% Pure Desi Ghee</h3>
              <p className="text-xs text-amber-900/70 leading-relaxed">
                We use pure clarified cow ghee for all traditional sweets, laddoos, and Mysore Pak for authentic aroma.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-bakery-600">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-chocolate-900">Fresh Morning Baking</h3>
              <p className="text-xs text-amber-900/70 leading-relaxed">
                Crispy Osmania tea biscuits, fruit cookies, and cake sponges are baked fresh every morning from 7:00 AM.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-bakery-600">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-chocolate-900">Custom Photo Cakes</h3>
              <p className="text-xs text-amber-900/70 leading-relaxed">
                Edible photo printing with customized greetings for birthdays, anniversaries, and family celebrations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-bakery-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-chocolate-900">Instant WhatsApp Orders</h3>
              <p className="text-xs text-amber-900/70 leading-relaxed">
                Direct communication with Shekhar Rao for prompt order confirmation, customization, and local delivery.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Store Address & Visit Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-bakery-700 bg-amber-100 px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5" />
              <span>Visit Our Bakery in Person</span>
            </div>
            <h3 className="font-serif font-bold text-2xl text-chocolate-900">
              High Bakery - Barrage Center, Bommika
            </h3>
            <p className="text-xs sm:text-sm text-amber-900/80 max-w-xl">
              {STORE_ADDRESS}
            </p>
            <p className="text-xs text-amber-800 font-semibold">
              ⏰ Open 7:00 AM to 10:00 PM (Monday – Sunday)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${ADMIN_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition"
            >
              <Phone className="w-4 h-4 fill-white" />
              <span>Chat +91 9347166241</span>
            </a>

            <a
              href={`tel:+919347166241`}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-100 text-chocolate-900 font-bold text-xs flex items-center justify-center gap-2 border border-amber-300 transition"
            >
              <Phone className="w-4 h-4 text-bakery-600" />
              <span>Call Shekhar Rao</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
