"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  Truck,
  Cake
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import CheckoutModal from "./checkout-modal";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const handleOpenCheckout = () => {
    closeCart();
    setCheckoutOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
        {/* Backdrop */}
        <div 
          onClick={closeCart}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-amber-100 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-5 bg-gradient-to-r from-chocolate-900 via-bakery-950 to-chocolate-900 text-white flex items-center justify-between border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-white">Your Bakery Cart</h2>
                  <p className="text-xs text-amber-200/80">
                    {itemCount} {itemCount === 1 ? "item" : "items"} selected
                  </p>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Delivery Highlight Pill */}
            <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-100 flex items-center gap-2 text-xs text-chocolate-900">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Fresh local delivery in <strong>Barrage Center & Hiramandalam</strong>
              </span>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-amber-100">
              {items.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto text-amber-400">
                    <Cake className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-lg text-chocolate-900">
                      Your cart is empty
                    </h3>
                    <p className="text-xs text-amber-800/70 max-w-xs mx-auto">
                      Explore our freshly baked sweets, cookies, celebration cakes, and savory snacks.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition"
                  >
                    Start Shopping Delights
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="py-4 flex gap-3.5 group">
                    <img
                      src={item.product.image_url || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120"}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-amber-100 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-chocolate-900 line-clamp-1">
                            {item.product.title}
                          </h4>
                          <span className="text-[10px] text-amber-700 font-medium">
                            {item.selectedWeight || item.product.unit || "Pack"}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-amber-400 hover:text-rose-600 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="text-amber-800 hover:text-chocolate-900 transition p-0.5"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-chocolate-900 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="text-amber-800 hover:text-chocolate-900 transition p-0.5"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <span className="text-sm font-extrabold text-chocolate-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Custom Photo Cake Banner Link inside cart */}
            <div className="p-4 mx-5 mb-2 bg-gradient-to-r from-amber-500/10 to-bakery-600/10 rounded-2xl border border-amber-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-bakery-600" />
                <div className="text-xs">
                  <p className="font-bold text-chocolate-900">Need a Custom Photo Cake?</p>
                  <p className="text-[10px] text-amber-800">Add edible photos & custom names</p>
                </div>
              </div>
              <Link
                href="/photo-cake"
                onClick={closeCart}
                className="px-3 py-1.5 rounded-xl bg-bakery-600 hover:bg-bakery-700 text-white font-bold text-[11px] transition shrink-0"
              >
                Design Cake
              </Link>
            </div>

            {/* Cart Footer / Checkout Action */}
            {items.length > 0 && (
              <div className="p-5 bg-white border-t border-amber-100 space-y-3 shadow-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-amber-800 font-medium">Subtotal</span>
                  <span className="text-xl font-extrabold text-chocolate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-bakery-600 to-amber-600 hover:from-amber-600 hover:to-bakery-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition transform hover:scale-102 active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-amber-700/80">
                  Instant order confirmation with Shekhar Rao on WhatsApp
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
