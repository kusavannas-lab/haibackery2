"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Check, ShoppingBag, Sparkles, AlertCircle } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { useBakeryStore } from "@/lib/store/bakery-store";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isAdmin } = useBakeryStore();
  const [justAdded, setJustAdded] = useState(false);

  const isPhotoCake = product.category_id === "cat-photo-cakes" || product.title.toLowerCase().includes("photo cake");

  const handleAddToCart = () => {
    if (!product.in_stock) return;
    addItem(product, 1, product.unit);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const costPrice = product.cost_price ?? 0;
  const profitPerUnit = product.price - costPrice;
  const marginPercent = product.price > 0 ? Math.round((profitPerUnit / product.price) * 100) : 0;

  return (
    <div
      id={product.id}
      className="group relative bg-white rounded-3xl overflow-hidden border border-amber-100/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-amber-50">
        <img
          src={product.image_url || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600"}
          alt={product.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            !product.in_stock ? "grayscale opacity-60" : ""
          }`}
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.category_name && (
            <span className="bg-white/90 backdrop-blur-md text-chocolate-900 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-amber-100/60">
              {product.category_name}
            </span>
          )}

          {!product.in_stock && (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Out of Stock
            </span>
          )}
        </div>

        {/* Unit Badge */}
        {product.unit && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <span className="bg-chocolate-900/80 backdrop-blur-md text-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
              {product.unit}
            </span>
          </div>
        )}

        {/* Admin Profit Indicator */}
        {isAdmin && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <span className="bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
              Margin: {formatCurrency(profitPerUnit)} ({marginPercent}%)
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="font-serif font-bold text-chocolate-900 text-base sm:text-lg group-hover:text-bakery-600 transition line-clamp-1">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-xs text-amber-900/70 line-clamp-2 leading-relaxed font-sans">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-amber-50 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-amber-800/70 block uppercase font-medium">Price</span>
            <span className="text-xl font-extrabold text-chocolate-900">
              {formatCurrency(product.price)}
            </span>
          </div>

          {isPhotoCake ? (
            <Link
              href="/photo-cake"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-bakery-600 hover:from-amber-600 hover:to-bakery-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customize</span>
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition transform active:scale-95 shadow-sm ${
                !product.in_stock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : justAdded
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-honey-50 hover:bg-honey-100 text-bakery-800 border border-honey-300 hover:border-bakery-500"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-bakery-600" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
