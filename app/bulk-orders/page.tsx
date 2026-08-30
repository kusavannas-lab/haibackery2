"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Gift, 
  Cake, 
  Percent, 
  Clock, 
  Users, 
  Truck, 
  Heart,
  Plus,
  Minus,
  Trash2,
  Scale,
  Lock,
  ArrowRight,
  ShieldCheck,
  Download,
  Eye,
  X,
  Camera,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_PHONE, ADMIN_NAME, STORE_ADDRESS, STORE_NAME, buildWhatsAppLink } from "@/lib/whatsapp";
import ImageUploadDropzone from "@/components/image-upload-dropzone";

interface CustomSweetItem {
  id: string;
  sweetName: string;
  quantityKgs: number;
  fixedRatePerKg: number;
  productId?: string;
}

// Standard Sweet Price Catalog fixed by Hai Backery Admin (Shekhar Rao)
const ADMIN_FIXED_SWEET_MENU = [
  { name: "Premium Pure Ghee Kaju Katli", ratePerKg: 900, image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80", description: "Made with 100% premium cashews and pure desi ghee" },
  { name: "Pure Ghee Motichoor Laddu", ratePerKg: 480, image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80", description: "Fine gram flour pearls fried in desi ghee with saffron" },
  { name: "Royal Mysore Pak (Pure Ghee)", ratePerKg: 520, image_url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80", description: "Traditional melt-in-mouth recipe with rich aroma" },
  { name: "Kaju Pista Roll", ratePerKg: 950, image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80", description: "Cashew roll stuffed with pistachios" },
  { name: "Gulab Jamun (Pure Ghee)", ratePerKg: 420, image_url: "https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=600&auto=format&fit=crop&q=80", description: "Soft khoya dumplings in fragrant rose cardamom syrup" },
  { name: "Special Badusha", ratePerKg: 400, image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80", description: "Flaky crispy golden exterior with soft juicy interior" },
  { name: "Ajmer Kalakand / Milk Cake", ratePerKg: 560, image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80", description: "Rich condensed milk fudge with caramelized flavor" },
  { name: "Dry Fruit Halwa", ratePerKg: 650, image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80", description: "Chewy pure ghee halwa loaded with almonds, cashews & raisins" },
  { name: "Famous Osmania Tea Biscuits", ratePerKg: 350, image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80", description: "Authentic buttery sweet-and-salt tea biscuits" },
  { name: "Cashew & Butter Cookies", ratePerKg: 420, image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&auto=format&fit=crop&q=80", description: "Crispy freshly baked bakery cookies with cashew chunks" },
  { name: "Special Andhra Mixture / Murukku", ratePerKg: 320, image_url: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80", description: "Crunchy spicy mixture with peanuts, curry leaves & spices" },
  { name: "Multi-Tier Wedding Celebration Cake", ratePerKg: 700, image_url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80", description: "Custom decorated tiered fresh cream cake for weddings" },
];

const INITIAL_ITEMS: CustomSweetItem[] = [
  { id: "item-1", sweetName: "Premium Pure Ghee Kaju Katli", quantityKgs: 5, fixedRatePerKg: 900 },
  { id: "item-2", sweetName: "Pure Ghee Motichoor Laddu", quantityKgs: 10, fixedRatePerKg: 480 },
  { id: "item-3", sweetName: "Special Andhra Mixture / Murukku", quantityKgs: 5, fixedRatePerKg: 320 },
];

export default function BulkOrdersPage() {
  const { bulkCatalog, createOrder } = useBakeryStore();

  const [eventType, setEventType] = useState("Wedding / Reception");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("Morning (8:00 AM - 12:00 PM)");
  const [deliveryLocation, setDeliveryLocation] = useState("Bommika / Hiramandalam Delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customPackaging, setCustomPackaging] = useState("Standard Fresh Bakery Boxes");
  const [notes, setNotes] = useState("");
  const [referenceImageUrl, setReferenceImageUrl] = useState("");

  const [sweetItems, setSweetItems] = useState<CustomSweetItem[]>(INITIAL_ITEMS);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  // Active sweets defined & fixed by Admin in Admin Console
  const allAvailableSweets = (bulkCatalog && bulkCatalog.length > 0)
    ? bulkCatalog.filter((it) => it.is_available).map((it) => ({
        name: it.name,
        ratePerKg: it.rate_per_kg,
        productId: it.id,
        image_url: it.image_url || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
        description: it.description || "",
      }))
    : ADMIN_FIXED_SWEET_MENU.map((it) => ({
        name: it.name,
        ratePerKg: it.ratePerKg,
        productId: it.name,
        image_url: it.image_url,
        description: it.description,
      }));

  // Real-time synchronization: When Admin updates bulk catalog items or rates in Admin Console,
  // immediately update the customer sweet items with the latest rates and names
  useEffect(() => {
    if (allAvailableSweets.length > 0) {
      setSweetItems((prev) => {
        if (!prev || prev.length === 0) {
          return allAvailableSweets.slice(0, 3).map((s, idx) => ({
            id: `item-${idx + 1}`,
            sweetName: s.name,
            quantityKgs: idx === 0 ? 5 : idx === 1 ? 10 : 5,
            fixedRatePerKg: s.ratePerKg,
            productId: s.productId,
          }));
        }

        return prev.map((item) => {
          const matched = allAvailableSweets.find(
            (s) => s.name.toLowerCase().trim() === item.sweetName.toLowerCase().trim() || s.productId === item.productId
          );
          if (matched) {
            return {
              ...item,
              sweetName: matched.name,
              fixedRatePerKg: matched.ratePerKg,
              productId: matched.productId,
            };
          }
          const fallback = allAvailableSweets[0];
          return {
            ...item,
            sweetName: fallback.name,
            fixedRatePerKg: fallback.ratePerKg,
            productId: fallback.productId,
          };
        });
      });
    }
  }, [bulkCatalog]);

  const downloadImage = async (url?: string, filename = "bulk-order-reference.jpg") => {
    if (!url) return;
    try {
      if (url.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  // Add new sweet row
  const handleAddSweetRow = () => {
    const defaultSweet = allAvailableSweets[0] || { name: "Special Pure Ghee Sweet", ratePerKg: 450, productId: "default", image_url: "", description: "" };
    const newItem: CustomSweetItem = {
      id: `custom-item-${Date.now()}`,
      sweetName: defaultSweet.name,
      quantityKgs: 5,
      fixedRatePerKg: defaultSweet.ratePerKg,
      productId: defaultSweet.productId,
    };
    setSweetItems((prev) => [...prev, newItem]);
  };

  // Remove sweet row
  const handleRemoveSweetRow = (id: string) => {
    if (sweetItems.length === 1) {
      alert("At least one sweet item is required.");
      return;
    }
    setSweetItems((prev) => prev.filter((it) => it.id !== id));
  };

  // When customer changes sweet selection, rate is automatically fixed from Admin pricing
  const handleSelectSweet = (id: string, selectedSweetName: string) => {
    const matched = allAvailableSweets.find((s) => s.name === selectedSweetName);
    const rate = matched ? matched.ratePerKg : 450;

    setSweetItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return {
            ...it,
            sweetName: selectedSweetName,
            fixedRatePerKg: rate,
            productId: matched?.productId,
          };
        }
        return it;
      })
    );
  };

  // Customer edits Quantity (KGs) only
  const handleUpdateKgs = (id: string, kgs: number) => {
    const validKg = Math.max(1, kgs);
    setSweetItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantityKgs: validKg } : it))
    );
  };

  // Calculations
  const totalKgs = sweetItems.reduce((acc, it) => acc + (it.quantityKgs || 0), 0);
  const subtotal = sweetItems.reduce(
    (acc, it) => acc + (it.quantityKgs || 0) * (it.fixedRatePerKg || 0),
    0
  );

  // Automatic Bulk Discount Tiers
  let discountPercent = 0;
  if (totalKgs >= 25 || subtotal >= 10000) {
    discountPercent = 20;
  } else if (totalKgs >= 15 || subtotal >= 6000) {
    discountPercent = 15;
  } else if (totalKgs >= 5 || subtotal >= 2500) {
    discountPercent = 10;
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const estimatedTotal = subtotal - discountAmount;

  // Build WhatsApp Inquiry Link
  const buildWhatsAppOrderLink = (orderData: any) => {
    const orderListText = orderData.items
      .filter((it: any) => it.sweetName.trim() && it.quantityKgs > 0)
      .map((it: any, i: number) => `${i + 1}. *${it.sweetName}* — ${it.quantityKgs} kg @ ₹${it.fixedRatePerKg}/kg = ${formatCurrency(it.quantityKgs * it.fixedRatePerKg)}`)
      .join("\n");

    const isWebUrl = orderData.referenceImageUrl && (orderData.referenceImageUrl.startsWith("http://") || orderData.referenceImageUrl.startsWith("https://"));
    const photoLine = orderData.referenceImageUrl
      ? isWebUrl
        ? `\n🖼️ *REFERENCE PHOTO / PACKAGING LINK:*\n${orderData.referenceImageUrl}\n`
        : `\n🖼️ *REFERENCE PHOTO:*\n[Photo attached in order — I will share in WhatsApp chat]\n`
      : "";

    const message = `🎉🎂 *HAI BACKERY — BULK EVENT ORDER* 🎂🎉\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👑 *Store:* ${STORE_NAME}\n` +
      `👨‍🍳 *Proprietor:* ${ADMIN_NAME} (+91 9347166241)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎉 *Event Type:* ${orderData.eventType}\n` +
      `👤 *Customer Name:* ${orderData.customerName}\n` +
      `📞 *Customer Mobile:* ${orderData.customerPhone}\n` +
      `📅 *Event Date:* ${orderData.eventDate} (${orderData.eventTime})\n` +
      `📍 *Delivery Location:* ${orderData.deliveryLocation}\n` +
      `🏡 *Venue Address:* ${orderData.deliveryAddress || "Will share on call"}\n` +
      `🎁 *Packaging:* ${orderData.customPackaging}\n` +
      (orderData.notes ? `📝 *Special Notes:* ${orderData.notes}\n` : "") +
      photoLine +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛒 *SWEETS & QUANTITY (KGS) REQUESTED:*\n` +
      `${orderListText}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⚖️ *Total Order Weight:* ${orderData.totalKgs} kg\n` +
      `📊 *Subtotal:* ${formatCurrency(orderData.subtotal)}\n` +
      `🎉 *Bulk Event Discount (${orderData.discountPercent}%):* -${formatCurrency(orderData.discountAmount)}\n` +
      `💰 *Total Payable:* ${formatCurrency(orderData.estimatedTotal)}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Namaste Shekhar Rao garu, please confirm availability and delivery slot for our event._`;

    return buildWhatsAppLink(ADMIN_PHONE, message);
  };

  // Submit Bulk Order
  const handleSubmitBulkOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter Customer Name and WhatsApp Mobile Number.");
      return;
    }

    if (!eventDate) {
      alert("Please select your Event / Delivery Date.");
      return;
    }

    if (totalKgs <= 0) {
      alert("Please add at least 1 sweet item with quantity.");
      return;
    }

    const orderData = {
      orderId: `BLK-${Date.now().toString().slice(-6)}`,
      eventType,
      customerName,
      customerPhone,
      eventDate,
      eventTime,
      deliveryLocation,
      deliveryAddress,
      customPackaging,
      notes,
      referenceImageUrl,
      items: sweetItems,
      totalKgs,
      subtotal,
      discountPercent,
      discountAmount,
      estimatedTotal,
      createdAt: new Date().toISOString(),
    };

    // Save in store
    try {
      createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: `${deliveryLocation} - ${deliveryAddress || "Event Venue"}`,
        total_amount: estimatedTotal,
        profit_amount: Math.round(estimatedTotal * 0.25),
        status: "Pending",
        notes: `Bulk Event: ${eventType} | Delivery: ${eventDate} (${eventTime}) | Packaging: ${customPackaging}`,
        items: sweetItems.map((s) => ({
          product_id: s.productId || s.id,
          product_title: `${s.sweetName} (Bulk ${s.quantityKgs}kg)`,
          unit_price: s.fixedRatePerKg,
          quantity: s.quantityKgs,
        })),
      });
    } catch (err) {
      console.warn("Local order creation note:", err);
    }

    setSubmittedOrder(orderData);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf4e8] via-[#fff7ed] to-[#fdebd0] py-10">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 1. Hero Header */}
        <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden text-center sm:text-left flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          <div className="space-y-3 relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Customer Bulk Order & Kilograms Builder</span>
            </span>

            <h1 className="text-3xl sm:text-5xl font-serif font-black text-amber-50 leading-tight">
              Bulk Orders & <span className="text-amber-400">Kilograms Calculator</span>
            </h1>

            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              Select your favorite sweets and choose how many kilograms (kg) you need. All sweet rates are <strong>fixed and guaranteed by Hai Backery Admin (Shekhar Rao)</strong> with automatic bulk event discounts up to <strong>20% OFF</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Fixed Rates & Price Guarantee</span>
              </span>
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>On-Time Event Delivery in Bommika</span>
              </span>
            </div>
          </div>

          <div className="bg-[#2c1207] p-6 rounded-3xl border-2 border-amber-600/50 shadow-xl space-y-4 shrink-0 relative z-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mx-auto">
              <Percent className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-300 uppercase tracking-widest">Automatic Bulk Discounts</p>
              <p className="text-2xl font-black text-white mt-1">Up to 20% OFF</p>
              <p className="text-[11px] text-amber-200/70 mt-0.5">5 kg+ (10%) • 15 kg+ (15%) • 25 kg+ (20%)</p>
            </div>

            <a
              href={`https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent('Namaste Shekhar Rao garu, I want to inquire about a bulk event sweet order at Hai Backery.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire on WhatsApp (+91 9347166241)</span>
            </a>
          </div>

        </div>

        {/* 2. Order Submission Success Screen */}
        {submittedOrder ? (
          <div className="bg-white rounded-3xl border-2 border-emerald-500/40 shadow-2xl p-6 sm:p-10 text-center space-y-6 max-w-3xl mx-auto animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black border border-emerald-300">
                <span>ORDER ESTIMATE READY</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-chocolate-900">
                Bulk Order Summary Prepared!
              </h2>
              <p className="text-xs sm:text-sm text-amber-800/90 max-w-md mx-auto">
                Your bulk order specifications and discount calculations are ready for <strong>Shekhar Rao at Hai Backery</strong>.
              </p>
            </div>

            {/* Order Receipt */}
            <div className="bg-amber-50/80 p-6 rounded-2xl border-2 border-amber-200 text-left space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <span className="font-bold text-amber-900">Order ID:</span>
                <span className="font-black text-bakery-700 bg-amber-100 px-2.5 py-1 rounded-md">{submittedOrder.orderId}</span>
              </div>

              {/* Reference Image (If uploaded) */}
              {submittedOrder.referenceImageUrl && (
                <div className="space-y-2 border-b border-amber-200 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">Uploaded Event / Packaging Reference Photo:</span>
                    {submittedOrder.referenceImageUrl.startsWith("http") && (
                      <a
                        href={submittedOrder.referenceImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-bakery-700 font-bold underline"
                      >
                        Open Full Link 🔗
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md shrink-0">
                      <img
                        src={submittedOrder.referenceImageUrl}
                        alt="Bulk Order Reference"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => downloadImage(submittedOrder.referenceImageUrl, `bulk-order-${submittedOrder.orderId}.jpg`)}
                        className="px-3.5 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-chocolate-950 font-black text-xs flex items-center gap-1.5 shadow-sm border border-amber-300 transition"
                      >
                        <Download className="w-4 h-4 text-bakery-700" />
                        <span>Download Reference Photo 📥</span>
                      </button>
                      <p className="text-[10px] text-amber-800/80">
                        Save photo to your gallery to easily share in WhatsApp chat!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sweet Items List */}
              <div className="space-y-2 border-b border-amber-200 pb-3">
                <span className="font-bold text-amber-900 block">Sweets & Quantities (KGs):</span>
                {submittedOrder.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between items-center bg-white p-2 rounded-xl border border-amber-200">
                    <span className="font-bold text-chocolate-900">{it.sweetName} ({it.quantityKgs} kg)</span>
                    <span className="font-black text-amber-900">{formatCurrency(it.quantityKgs * it.fixedRatePerKg)}</span>
                  </div>
                ))}
              </div>

              {/* Event Specs */}
              <div className="grid grid-cols-2 gap-2 text-chocolate-900">
                <div>
                  <span className="text-[10px] text-amber-700 block font-bold">CUSTOMER</span>
                  <span className="font-bold">{submittedOrder.customerName} ({submittedOrder.customerPhone})</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block font-bold">EVENT TYPE</span>
                  <span className="font-bold">{submittedOrder.eventType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block font-bold">EVENT DATE</span>
                  <span className="font-bold">{submittedOrder.eventDate} ({submittedOrder.eventTime})</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block font-bold">TOTAL WEIGHT & PRICE</span>
                  <span className="font-black text-emerald-800">{submittedOrder.totalKgs} kg — {formatCurrency(submittedOrder.estimatedTotal)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={buildWhatsAppOrderLink(submittedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition transform hover:scale-[1.01]"
              >
                <Send className="w-5 h-5" />
                <span>Send to Shekhar Rao on WhatsApp (+91 9347166241)</span>
              </a>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedOrder(null);
                    setReferenceImageUrl("");
                  }}
                  className="text-xs text-amber-900 font-bold hover:underline"
                >
                  + Create Another Bulk Event Order
                </button>
                <span className="text-amber-300">•</span>
                <Link
                  href="/"
                  className="text-xs text-amber-900 font-bold hover:underline"
                >
                  Return to Storefront
                </Link>
              </div>
            </div>

          </div>
        ) : (

          /* 3. Bulk Ordering Form & Interactive Sweet/KG Builder */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Sweet Selection & Customer Details */}
            <form onSubmit={handleSubmitBulkOrder} className="lg:col-span-2 space-y-8">
              
              {/* Step 1: Select Event Type */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base text-chocolate-900">
                      Select Occasion / Event Type
                    </h3>
                    <p className="text-xs text-amber-800/80">
                      Helps us recommend packaging and batch scheduling
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    "Wedding / Reception",
                    "Housewarming / Griha Pravesh",
                    "Birthday / Anniversary",
                    "Temple / Festival / Pooja",
                    "Catering / Corporate",
                    "Baby Shower / Naming Ceremony",
                    "School / College Function",
                    "Family Gathering / Other",
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEventType(type)}
                      className={`p-3 rounded-2xl text-xs font-bold border-2 text-left transition-all ${
                        eventType === type
                          ? "bg-amber-100 border-amber-500 text-chocolate-950 shadow-md scale-[1.02]"
                          : "bg-amber-50/40 border-amber-200/80 text-chocolate-800 hover:bg-amber-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Interactive Sweet & Kilogram Builder */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                      2
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-base text-chocolate-900">
                        Choose Sweets & Kilograms (KG)
                      </h3>
                      <p className="text-xs text-amber-800/80">
                        Select sweets from Shekhar Rao&apos;s verified rate card
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSweetRow}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-black shadow-sm flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Sweet</span>
                  </button>
                </div>

                {/* Sweets Row List */}
                <div className="space-y-4">
                  {sweetItems.map((item, index) => {
                    const matchedSweet = allAvailableSweets.find(
                      (s) => s.name.toLowerCase().trim() === item.sweetName.toLowerCase().trim() || s.productId === item.productId
                    );

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-200/90 shadow-sm space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-md">
                            Sweet #{index + 1}
                          </span>

                          {sweetItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSweetRow(item.id)}
                              className="text-rose-600 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50 transition text-xs flex items-center gap-1 font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                          
                          {/* Photo Thumbnail */}
                          {matchedSweet?.image_url && (
                            <div 
                              className="sm:col-span-2 w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-300 shadow-xs bg-amber-100 shrink-0 cursor-pointer relative group/img hidden sm:block"
                              onClick={() => setActiveModalImage(matchedSweet.image_url)}
                            >
                              <img
                                src={matchedSweet.image_url}
                                alt={item.sweetName}
                                className="w-full h-full object-cover group-hover/img:scale-110 transition duration-300"
                              />
                            </div>
                          )}

                          {/* 1. Sweet Name Selector */}
                          <div className={matchedSweet?.image_url ? "sm:col-span-4 space-y-1" : "sm:col-span-6 space-y-1"}>
                            <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                              Sweet / Item Name *
                            </label>
                            <select
                              value={item.sweetName}
                              onChange={(e) => handleSelectSweet(item.id, e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                            >
                              {allAvailableSweets.map((s) => (
                                <option key={s.name} value={s.name}>
                                  {s.name} (₹{s.ratePerKg}/kg)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 2. Customer-Editable Quantity in KGs with Stepper */}
                          <div className="sm:col-span-3 space-y-1">
                            <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                              Quantity (KGs) *
                            </label>
                            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border-2 border-amber-300 shadow-inner">
                              <button
                                type="button"
                                onClick={() => handleUpdateKgs(item.id, (item.quantityKgs || 0) - 1)}
                                className="w-7 h-7 rounded-lg bg-amber-100 hover:bg-amber-200 text-chocolate-900 font-black text-xs flex items-center justify-center transition"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantityKgs}
                                onChange={(e) => handleUpdateKgs(item.id, parseInt(e.target.value) || 1)}
                                className="w-full text-center font-black text-xs bg-transparent focus:outline-none text-chocolate-900"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateKgs(item.id, (item.quantityKgs || 0) + 1)}
                                className="w-7 h-7 rounded-lg bg-amber-100 hover:bg-amber-200 text-chocolate-900 font-black text-xs flex items-center justify-center transition"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* 3. Rate Per KG: STRICTLY FIXED BY ADMIN (Read-Only) */}
                          <div className="sm:col-span-3 space-y-1">
                            <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider flex items-center justify-between">
                              <span>Rate / kg</span>
                              <span className="text-[9px] text-amber-800 font-black flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Fixed
                              </span>
                            </label>
                            <div className="flex items-center justify-between bg-amber-100/90 px-3 py-2.5 rounded-xl border-2 border-amber-300 font-black text-chocolate-900 text-xs shadow-inner">
                              <span>{formatCurrency(item.fixedRatePerKg)}</span>
                              <span className="text-[10px] text-amber-800 font-bold">/ kg</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Quantity Presets */}
                        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-amber-800">Quick Add Weight:</span>
                          {[5, 10, 15, 25, 50].map((kgVal) => (
                            <button
                              key={kgVal}
                              type="button"
                              onClick={() => handleUpdateKgs(item.id, kgVal)}
                              className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold transition ${
                                item.quantityKgs === kgVal
                                  ? "bg-chocolate-900 text-amber-200 border-chocolate-900 shadow-sm"
                                  : "bg-white hover:bg-amber-200 text-chocolate-900 border-amber-300"
                              }`}
                            >
                              {kgVal} kg
                            </button>
                          ))}
                        </div>

                        {/* Row Subtotal */}
                        <div className="flex justify-between items-center pt-2 border-t border-amber-200/60 text-xs">
                          <span className="text-amber-900 font-medium">
                            {item.quantityKgs} kg × ₹{item.fixedRatePerKg}/kg (Admin Fixed Rate)
                          </span>
                          <span className="font-black text-chocolate-900 text-sm">
                            = {formatCurrency((item.quantityKgs || 0) * (item.fixedRatePerKg || 0))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 bg-amber-100/60 rounded-2xl border border-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Scale className="w-4 h-4 text-amber-700" />
                    <span>Current Total Order Weight:</span>
                  </div>
                  <span className="font-black text-chocolate-900 text-sm">
                    {totalKgs} Kilograms (kg)
                  </span>
                </div>
              </div>

              {/* Step 3: Reference Image / Custom Box Packaging Upload (NEW FEATURE) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base text-chocolate-900">
                      Upload Packaging Design / Reference Photo (Optional)
                    </h3>
                    <p className="text-xs text-amber-800/80">
                      Have a wedding gift box branding, custom sweet tray design, or event photo? Upload it here!
                    </p>
                  </div>
                </div>

                <ImageUploadDropzone
                  value={referenceImageUrl}
                  onChange={setReferenceImageUrl}
                  label="Upload Event Photo / Packaging Reference"
                />
              </div>

              {/* Step 4: Customer Details & Event Schedule */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-base text-chocolate-900">
                      Customer Details & Delivery Location
                    </h3>
                    <p className="text-xs text-amber-800/80">
                      Shekhar Rao will coordinate direct delivery or store pickup
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Naidu"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                      Event / Required Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                      Preferred Delivery Time Slot *
                    </label>
                    <select
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                    >
                      <option value="Morning (7:00 AM - 10:00 AM)">Morning (7:00 AM - 10:00 AM)</option>
                      <option value="Mid-Day (11:00 AM - 2:00 PM)">Mid-Day (11:00 AM - 2:00 PM)</option>
                      <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                      <option value="Night (7:00 PM - 9:30 PM)">Night (7:00 PM - 9:30 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                      Delivery / Pickup Preference *
                    </label>
                    <select
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                    >
                      <option value="Bommika Local Delivery">Bommika Local Delivery</option>
                      <option value="Hiramandalam Town Delivery">Hiramandalam Town Delivery</option>
                      <option value="Self Pickup at Hai Backery Counter (Barrage Center)">Self Pickup at Hai Backery Counter (Barrage Center)</option>
                      <option value="Srikakulam District Outstation Delivery">Srikakulam District Outstation Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                      Custom Sweet Box Packaging
                    </label>
                    <select
                      value={customPackaging}
                      onChange={(e) => setCustomPackaging(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                    >
                      <option value="Standard Fresh Bakery Boxes">Standard Fresh Bakery Boxes</option>
                      <option value="Wedding Golden Gift Box Packing">Wedding Golden Gift Box Packing</option>
                      <option value="Individual 250g/500g Guest Packs">Individual 250g/500g Guest Gift Packs</option>
                      <option value="Pooja / Temple Prasadam Pouches">Pooja / Temple Prasadam Pouches</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                      Additional Notes / Flavor Customization
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Less sugar in Kaju Katli, extra cashew garnish, pure ghee verification, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Submit Bulk Order to Shekhar Rao (+91 9347166241) on WhatsApp</span>
              </button>
            </form>

            {/* Right 1 Col: Live Estimate Summary Card */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl space-y-6 sticky top-24">
                
                <div className="flex items-center justify-between pb-4 border-b border-amber-700/60">
                  <div>
                    <h3 className="font-serif font-black text-lg text-amber-50">Order Summary</h3>
                    <p className="text-[11px] text-amber-300/80">Live calculated estimate</p>
                  </div>
                  <span className="text-xs font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/40">
                    {eventType}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {sweetItems
                    .filter((it) => it.sweetName.trim() && it.quantityKgs > 0)
                    .map((it) => (
                      <div key={it.id} className="flex justify-between text-xs py-1.5 border-b border-amber-900/40">
                        <div>
                          <p className="font-bold text-amber-100">{it.sweetName}</p>
                          <p className="text-[10px] text-amber-400/80">
                            {it.quantityKgs} kg × ₹{it.fixedRatePerKg}/kg (Fixed)
                          </p>
                        </div>
                        <span className="font-black text-white">
                          {formatCurrency(it.quantityKgs * it.fixedRatePerKg)}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Pricing Totals */}
                <div className="space-y-2 pt-2 border-t border-amber-700/60 text-xs">
                  <div className="flex justify-between text-amber-200">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      Total Weight:
                    </span>
                    <span className="font-extrabold text-amber-300">{totalKgs} kg</span>
                  </div>

                  <div className="flex justify-between text-amber-200">
                    <span>Gross Subtotal:</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        Bulk Discount ({discountPercent}%):
                      </span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-amber-300 pt-2 border-t border-amber-800/60">
                    <span>Estimated Total:</span>
                    <span className="text-xl">{formatCurrency(estimatedTotal)}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#190903] rounded-2xl border border-amber-700/50 space-y-1.5 text-[11px] text-amber-200/80">
                  <p className="font-bold text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hai Backery Price Guarantee:</span>
                  </p>
                  <p>• All rates are fixed & authorized by Shekhar Rao</p>
                  <p>• 100% Pure Desi Ghee & Fresh Morning Baking</p>
                  <p>• Direct WhatsApp confirmation with Shekhar Rao</p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 4. Full Bulk Catalog Rate Card (Live from Bakery Counter) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-bakery-900 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-bakery-600" />
                Live Bakery Price Board
              </span>
              <h3 className="font-serif font-black text-xl text-chocolate-900">
                Official Bulk Sweet & KG Rate Card
              </h3>
              <p className="text-xs text-amber-800/80">
                Photos, prices, and availability managed by Shekhar Rao at Barrage Center, Bommika.
              </p>
            </div>
            <span className="text-xs font-black text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-300 w-fit">
              {allAvailableSweets.length} Items Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAvailableSweets.map((sweet) => (
              <div
                key={sweet.productId || sweet.name}
                className="rounded-3xl bg-amber-50/60 border-2 border-amber-200/90 overflow-hidden shadow-sm hover:shadow-md hover:bg-amber-100/60 transition group flex flex-col justify-between"
              >
                {/* Sweet Image Thumbnail */}
                <div 
                  className="w-full h-44 overflow-hidden bg-amber-100 relative cursor-pointer"
                  onClick={() => setActiveModalImage(sweet.image_url)}
                >
                  <img
                    src={sweet.image_url}
                    alt={sweet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-chocolate-950/80 backdrop-blur-xs text-amber-300 font-black text-xs">
                    {formatCurrency(sweet.ratePerKg)} / kg
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1">
                    <Eye className="w-4 h-4" />
                    <span>Zoom Photo</span>
                  </div>
                </div>

                {/* Sweet Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-black text-base text-chocolate-900">
                      {sweet.name}
                    </h4>
                    {sweet.description && (
                      <p className="text-xs text-amber-800/80 mt-1 line-clamp-2">
                        {sweet.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => downloadImage(sweet.image_url, `${sweet.name}.jpg`)}
                      className="text-[11px] font-bold text-bakery-700 hover:text-bakery-900 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 400, behavior: "smooth" });
                        handleAddSweetRow();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Order in KG</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Full Image Zoom Modal */}
      {activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-chocolate-900 text-white flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Bulk Sweet Item Photo</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadImage(activeModalImage, "bulk-sweet-photo.jpg")}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-chocolate-950 font-black text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalImage(null)}
                  className="p-1 rounded-lg text-amber-200 hover:bg-chocolate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 flex items-center justify-center bg-amber-50/50">
              <img
                src={activeModalImage}
                alt="Full Size Reference"
                className="max-h-[65vh] w-auto object-contain rounded-2xl shadow-md border border-amber-200"
              />
            </div>

            <div className="p-4 bg-white border-t border-amber-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveModalImage(null)}
                className="px-4 py-2 bg-amber-100 text-chocolate-900 font-bold rounded-xl hover:bg-amber-200 transition text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
