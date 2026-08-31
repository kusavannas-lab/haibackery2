"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  X, 
  ShoppingBag, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  Sparkles, 
  Send, 
  Truck, 
  ShieldCheck,
  PackageCheck,
  Mail
} from "lucide-react";
import confetti from "canvas-confetti";
import { useCartStore } from "@/lib/store/cart-store";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { formatCurrency } from "@/lib/utils";
import { generateOrderWhatsAppUrl, STORE_NAME, ADMIN_PHONE } from "@/lib/whatsapp";
import { Order } from "@/lib/types";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, subtotal, totalProfit, clearCart } = useCartStore();
  const { createOrder, user } = useBakeryStore();

  const [customerName, setCustomerName] = useState(user.isLoggedIn ? user.name : "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(user.isLoggedIn ? user.email : "");
  const [pickupNotes, setPickupNotes] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please fill in your name and WhatsApp phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveEmail = user.isLoggedIn && user.email ? user.email.trim().toLowerCase() : customerEmail.trim().toLowerCase();

      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        product_title: item.product.title,
        quantity: item.quantity,
        unit_price: item.product.price,
        unit_cost: item.product.cost_price ?? 0,
      }));

      const newOrder = await createOrder({
        user_id: user.isLoggedIn ? user.email : null,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: effectiveEmail,
        delivery_address: "Store Pickup - Hai Backery, Barrage Center",
        notes: (effectiveEmail ? `[Email: ${effectiveEmail}] • ` : "") + (pickupNotes.trim() ? `${pickupNotes.trim()} • ` : "") + "[Store Pickup • Pay at Counter]",
        total_amount: subtotal,
        profit_amount: totalProfit,
        status: "Pending",
        items: orderItems,
      });

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore confetti errors
      }

      // Save customer email & order ID to localStorage for My Orders filter
      if (typeof window !== "undefined") {
        try {
          if (effectiveEmail) {
            localStorage.setItem("hb_customer_email", effectiveEmail);
          }
          localStorage.setItem("hb_customer_phone", customerPhone.trim());
          const myIds = JSON.parse(localStorage.getItem("hb_my_order_ids") || "[]");
          if (newOrder?.id && !myIds.includes(newOrder.id)) {
            myIds.push(newOrder.id);
            localStorage.setItem("hb_my_order_ids", JSON.stringify(myIds));
          }
        } catch {}
      }

      setOrderSuccess(newOrder);
      clearCart();

      // Trigger WhatsApp open
      const whatsappUrl = generateOrderWhatsAppUrl(newOrder);
      window.open(whatsappUrl, "_blank");

    } catch (err) {
      console.error("Order submission error:", err);
      alert("Something went wrong while placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOrderSuccess(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-100 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-chocolate-900 to-bakery-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-amber-100">
                {orderSuccess ? "Order Confirmed!" : "Store Pickup Booking"}
              </h2>
              <p className="text-[11px] text-amber-300/80">
                Hai Backery • Barrage Center
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {orderSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl text-chocolate-900">
                  Thank You, {orderSuccess.customer_name}!
                </h3>
                <p className="text-xs text-amber-800/80">
                  Your pickup order <strong className="text-bakery-700">#{orderSuccess.id}</strong> has been received by Hai Backery.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-left space-y-2 text-xs">
                <div className="flex justify-between font-medium text-chocolate-900 pb-2 border-b border-amber-200">
                  <span>Total Bill to Pay at Counter:</span>
                  <span className="font-bold text-sm text-bakery-600">
                    {formatCurrency(orderSuccess.total_amount)}
                  </span>
                </div>
                <div className="text-amber-800">
                  <p className="font-semibold">Pickup Location:</p>
                  <p className="text-amber-900/90 font-medium">Hai Backery, Barrage Center, Hiramandalam</p>
                </div>
                <div className="text-amber-800">
                  <p className="font-semibold">Payment:</p>
                  <p className="text-emerald-800 font-bold">Pay at Shop Counter (Cash / UPI on Pickup)</p>
                </div>
                <div className="text-amber-800">
                  <p className="font-semibold">Customer Phone:</p>
                  <p className="text-amber-900/90">{orderSuccess.customer_phone}</p>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <a
                  href={generateOrderWhatsAppUrl(orderSuccess)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:scale-102"
                >
                  <Send className="w-4 h-4" />
                  <span>Open WhatsApp Order Receipt</span>
                </a>

                <Link
                  href="/my-orders"
                  onClick={handleClose}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-chocolate-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-300 transition"
                >
                  <PackageCheck className="w-4 h-4 text-bakery-700" />
                  <span>📦 View in My Orders & Track Status</span>
                </Link>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 text-xs text-amber-800 hover:text-chocolate-900 font-semibold"
                >
                  Continue Browsing Bakery Items
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              
              {/* Items Summary preview */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-chocolate-900">
                  <span>Items to Pack ({items.length})</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="text-[11px] text-amber-700/80 max-h-24 overflow-y-auto space-y-1">
                  {items.map((it) => (
                    <div key={it.product.id} className="flex justify-between">
                      <span className="truncate pr-2">
                        {it.product.title} × {it.quantity}
                      </span>
                      <span className="font-medium shrink-0">
                        {formatCurrency(it.product.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Store Pickup Notice Banner */}
              <div className="p-3.5 bg-amber-100/70 rounded-2xl border border-amber-300/80 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-bakery-800 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-bold text-chocolate-900">Store Pickup at Hai Backery Counter</p>
                  <p className="text-[11px] text-amber-800">Barrage Center, Hiramandalam, Srikakulam</p>
                  <p className="text-[10px] text-amber-700/90 mt-0.5 italic">No door delivery • Order is freshly packed & kept ready for collection</p>
                </div>
              </div>

              {/* Input: Customer Name */}
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-bakery-600" />
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shekhar Rao / Kiran Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 focus:border-bakery-500"
                />
              </div>

              {/* Input: Phone */}
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-bakery-600" />
                  WhatsApp / Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 93471 66241"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 focus:border-bakery-500"
                />
              </div>

              {/* Input: Email (Fixed to Login Email) */}
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-bakery-600" />
                    Account Email (Fixed Login)
                  </span>
                  {user.isLoggedIn && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ Logged In Account
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  required
                  readOnly={user.isLoggedIn}
                  disabled={user.isLoggedIn}
                  placeholder="e.g. customer@gmail.com"
                  value={user.isLoggedIn ? user.email : customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    user.isLoggedIn
                      ? "border-emerald-300 bg-emerald-50/70 text-emerald-950 font-bold cursor-not-allowed"
                      : "border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 focus:border-bakery-500"
                  }`}
                />
              </div>

              {/* Input: Pickup Time / Notes */}
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-bakery-600" />
                  Preferred Pickup Time / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Will collect at 5:00 PM today, pack in celebration box"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 focus:border-bakery-500"
                />
              </div>

              {/* Payment Info Card */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs flex items-center gap-2.5 text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold">Payment Method: Pay at Shop Counter</p>
                  <p className="text-[11px] text-emerald-700">Pay with Cash, PhonePe, GPay, or UPI when you collect your items at the counter.</p>
                </div>
              </div>

              {/* Total & Submit Button */}
              <div className="pt-3 border-t border-amber-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-amber-800">Total Bill (Pay on Pickup):</span>
                  <span className="text-xl font-extrabold text-chocolate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-bakery-600 to-amber-600 hover:from-amber-600 hover:to-bakery-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition transform hover:scale-102 active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Booking Order..." : "Confirm & Send Pickup Order via WhatsApp"}</span>
                </button>

                <p className="text-[10px] text-center text-amber-700/80 mt-2">
                  Instant pickup confirmation with Shekhar Rao on WhatsApp
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
