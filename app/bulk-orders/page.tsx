"use client";

import React, { useState } from "react";
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
  ShieldCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_PHONE, ADMIN_NAME, STORE_ADDRESS, STORE_NAME } from "@/lib/whatsapp";

interface CustomSweetItem {
  id: string;
  sweetName: string;
  quantityKgs: number;
  fixedRatePerKg: number;
  productId?: string;
}

// Standard Sweet Price Catalog fixed by High Bakery Admin (Shekhar Rao)
const ADMIN_FIXED_SWEET_MENU = [
  { name: "Premium Pure Ghee Kaju Katli", ratePerKg: 900 },
  { name: "Pure Ghee Motichoor Laddu", ratePerKg: 480 },
  { name: "Royal Mysore Pak (Pure Ghee)", ratePerKg: 520 },
  { name: "Kaju Pista Roll", ratePerKg: 950 },
  { name: "Gulab Jamun (Pure Ghee)", ratePerKg: 420 },
  { name: "Special Badusha", ratePerKg: 400 },
  { name: "Ajmer Kalakand / Milk Cake", ratePerKg: 560 },
  { name: "Dry Fruit Halwa", ratePerKg: 650 },
  { name: "Famous Osmania Tea Biscuits", ratePerKg: 350 },
  { name: "Cashew & Butter Cookies", ratePerKg: 420 },
  { name: "Special Andhra Mixture / Murukku", ratePerKg: 320 },
  { name: "Multi-Tier Wedding Celebration Cake", ratePerKg: 700 },
  { name: "High Bakery Special Mixed Sweets Box", ratePerKg: 600 },
];

const INITIAL_ITEMS: CustomSweetItem[] = [
  { id: "item-1", sweetName: "Premium Pure Ghee Kaju Katli", quantityKgs: 5, fixedRatePerKg: 900 },
  { id: "item-2", sweetName: "Pure Ghee Motichoor Laddu", quantityKgs: 10, fixedRatePerKg: 480 },
  { id: "item-3", sweetName: "Special Andhra Mixture / Murukku", quantityKgs: 5, fixedRatePerKg: 320 },
];

export default function BulkOrdersPage() {
  const { bulkCatalog, visibleProducts, createOrder } = useBakeryStore();

  const [eventType, setEventType] = useState("Wedding / Reception");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("Morning (8:00 AM - 12:00 PM)");
  const [deliveryLocation, setDeliveryLocation] = useState("Bommika / Hiramandalam Delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customPackaging, setCustomPackaging] = useState("Standard Fresh Bakery Boxes");
  const [notes, setNotes] = useState("");

  const [sweetItems, setSweetItems] = useState<CustomSweetItem[]>(INITIAL_ITEMS);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Active sweets defined & fixed by Admin in Admin Console
  const allAvailableSweets = (bulkCatalog && bulkCatalog.length > 0)
    ? bulkCatalog.filter((it) => it.is_available).map((it) => ({
        name: it.name,
        ratePerKg: it.rate_per_kg,
        productId: it.id,
      }))
    : ADMIN_FIXED_SWEET_MENU.map((it) => ({
        name: it.name,
        ratePerKg: it.ratePerKg,
        productId: it.name,
      }));

  // Add new sweet row
  const handleAddSweetRow = () => {
    const defaultSweet = allAvailableSweets[0] || { name: "Special Pure Ghee Sweet", ratePerKg: 450, productId: "default" };
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

  // Submit Bulk Order
  const handleSubmitBulkOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = sweetItems.filter((it) => it.sweetName.trim() && it.quantityKgs > 0);
    if (validItems.length === 0) {
      alert("Please select at least one sweet item with kilograms.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !eventDate) {
      alert("Please enter your Name, WhatsApp Mobile Number, and Event Date.");
      return;
    }

    // Save into Orders Pipeline
    await createOrder({
      customer_name: `${customerName} [BULK: ${eventType}]`,
      customer_phone: customerPhone,
      delivery_address: `${deliveryLocation} - ${deliveryAddress || "Address provided via call"}`,
      status: "Pending",
      items: validItems.map((it) => ({
        product_id: it.productId || it.id,
        product_title: `${it.sweetName} (${it.quantityKgs} kg)`,
        quantity: it.quantityKgs,
        unit_price: it.fixedRatePerKg,
        unit_cost: Math.round(it.fixedRatePerKg * 0.65),
      })),
      total_amount: estimatedTotal,
      profit_amount: estimatedTotal - Math.round(subtotal * 0.65),
      notes: `Event: ${eventType} | Date: ${eventDate} (${eventTime}) | Total Kgs: ${totalKgs} kg | Packaging: ${customPackaging} | Notes: ${notes || "None"}`,
    });

    // Confetti celebration
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    setIsSubmitted(true);

    // Build WhatsApp Message
    const orderListText = validItems
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.sweetName}* — ${it.quantityKgs} kg (Fixed Rate: ₹${it.fixedRatePerKg}/kg) = ₹${it.quantityKgs * it.fixedRatePerKg}`
      )
      .join("\n");

    const message = `*HIGH BAKERY — BULK EVENT ORDER*
━━━━━━━━━━━━━━━━━━━━
👑 *Store:* ${STORE_NAME}
📍 *Address:* ${STORE_ADDRESS}
👨‍🍳 *Proprietor:* ${ADMIN_NAME} (${ADMIN_PHONE})
━━━━━━━━━━━━━━━━━━━━
🎉 *Event Type:* ${eventType}
👤 *Customer Name:* ${customerName}
📞 *WhatsApp Mobile:* ${customerPhone}
📅 *Event Date:* ${eventDate} (${eventTime})
📍 *Delivery Location:* ${deliveryLocation}
🏡 *Venue Address:* ${deliveryAddress || "Will share on call"}
🎁 *Packaging:* ${customPackaging}
${notes ? `📝 *Special Notes:* ${notes}\n` : ""}
━━━━━━━━━━━━━━━━━━━━
🛒 *SWEETS & QUANTITY (KGS) REQUESTED:*
${orderListText}
━━━━━━━━━━━━━━━━━━━━
⚖️ *Total Order Weight:* ${totalKgs} kg
📊 *Subtotal (Fixed Rates):* ${formatCurrency(subtotal)}
🎉 *Bulk Event Discount (${discountPercent}%):* -${formatCurrency(discountAmount)}
💰 *Total Payable:* ${formatCurrency(estimatedTotal)}
━━━━━━━━━━━━━━━━━━━━
_Namaste Shekhar Rao garu, please confirm availability and delivery slot for our event._`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919347166241?text=${encoded}`;

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 800);
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
              Select your favorite sweets and choose how many kilograms (kg) you need. All sweet rates are <strong>fixed and guaranteed by High Bakery Admin (Shekhar Rao)</strong> with automatic bulk event discounts up to <strong>20% OFF</strong>.
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
              href="https://wa.me/919347166241?text=Namaste%20Shekhar%20Rao%20garu,%20I%20want%20to%20inquire%20about%20a%20bulk%20event%20sweet%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Call Shekhar Rao on WhatsApp</span>
            </a>
          </div>

        </div>

        {/* 2. Bulk Ordering Form & Interactive Sweet/KG Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Sweet Selection & Customer Details */}
          <form onSubmit={handleSubmitBulkOrder} className="lg:col-span-2 space-y-8">
            
            {/* Step 1: Select Event Type */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-bakery-700 font-bold">
                  1
                </div>
                <h2 className="font-serif font-bold text-lg text-chocolate-900">
                  Select Event / Function Type
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  "Wedding / Reception",
                  "Birthday Party",
                  "Festival / Pooja",
                  "Corporate / School Event",
                  "Housewarming / Function",
                  "Custom Catering",
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={`p-3 rounded-2xl text-xs font-extrabold text-left border-2 transition ${
                      eventType === type
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-500 shadow-md scale-[1.02]"
                        : "bg-amber-50/40 text-chocolate-900 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: SWEET NAME SELECTION & KILOGRAMS (Rate Fixed By Admin) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
                    2
                  </div>
                  <div>
                    <h2 className="font-serif font-black text-lg text-chocolate-900">
                      Select Sweets & Kilograms (kg)
                    </h2>
                    <p className="text-xs text-amber-800/80">
                      Choose sweet name and specify kilograms. Rates are strictly fixed by Admin.
                    </p>
                  </div>
                </div>
                
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Total Order: <strong>{totalKgs} kg</strong></span>
                </span>
              </div>

              {/* Sweet Rows Container */}
              <div className="space-y-4">
                {sweetItems.map((item, index) => {
                  const itemTotal = (item.quantityKgs || 0) * (item.fixedRatePerKg || 0);

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-2 border-amber-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-lg">
                          Sweet Item #{index + 1}
                        </span>

                        {sweetItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSweetRow(item.id)}
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            title="Remove this sweet item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        {/* 1. Sweet Name Selector (Dropdown of Admin's Menu) */}
                        <div className="sm:col-span-6 space-y-1">
                          <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                            Sweet / Bakery Item Name *
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
                          Item Total: {formatCurrency(itemTotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Button: + Add Another Sweet / Item */}
              <button
                type="button"
                onClick={handleAddSweetRow}
                className="w-full py-3 px-4 rounded-2xl bg-amber-100/80 hover:bg-amber-200 text-chocolate-900 font-black text-xs border-2 border-dashed border-amber-400 flex items-center justify-center gap-2 transition transform hover:scale-[1.01]"
              >
                <Plus className="w-4 h-4 text-bakery-700" />
                <span>+ Add Another Sweet / Bakery Item</span>
              </button>
            </div>

            {/* Step 3: Event Timing & Delivery Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-bakery-700 font-bold">
                  3
                </div>
                <h2 className="font-serif font-bold text-lg text-chocolate-900">
                  Event Timing & Delivery Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Preferred Time Slot *
                  </label>
                  <select
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
                  >
                    <option value="Morning (7:00 AM - 11:00 AM)">Morning (7:00 AM - 11:00 AM)</option>
                    <option value="Afternoon (11:00 AM - 3:00 PM)">Afternoon (11:00 AM - 3:00 PM)</option>
                    <option value="Evening (3:00 PM - 7:00 PM)">Evening (3:00 PM - 7:00 PM)</option>
                    <option value="Night (7:00 PM - 10:00 PM)">Night (7:00 PM - 10:00 PM)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Delivery Location / Pick-up *
                  </label>
                  <select
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
                  >
                    <option value="Bommika Local Delivery">Bommika (Free Delivery)</option>
                    <option value="Hiramandalam Town Delivery">Hiramandalam Town</option>
                    <option value="Srikakulam District Delivery">Srikakulam District (Event Venue)</option>
                    <option value="Self Pickup at Barrage Center Store">Self Pickup at Barrage Center Shop</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Venue Address / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Ramalayam Temple, Bommika Main Road"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Special Packaging & Gift Boxes
                  </label>
                  <select
                    value={customPackaging}
                    onChange={(e) => setCustomPackaging(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
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
                  <span>High Bakery Price Guarantee:</span>
                </p>
                <p>• All rates are fixed & authorized by Shekhar Rao</p>
                <p>• 100% Pure Desi Ghee & Fresh Morning Baking</p>
                <p>• Direct WhatsApp confirmation with Shekhar Rao</p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
