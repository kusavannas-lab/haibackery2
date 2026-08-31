"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Send, 
  Calendar, 
  Clock, 
  Cake, 
  CheckCircle2, 
  User, 
  Phone, 
  FileText, 
  ArrowLeft,
  Heart,
  Check,
  MessageCircle,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  Sliders,
  ChevronDown,
  PackageCheck,
  Mail
} from "lucide-react";
import confetti from "canvas-confetti";
import PhotoCakePreview from "@/components/photo-cake-preview";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { formatCurrency } from "@/lib/utils";
import { generatePhotoCakeWhatsAppUrl, ADMIN_PHONE, STORE_NAME } from "@/lib/whatsapp";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { PhotoCakeRequest } from "@/lib/types";

const FLAVORS = [
  { name: "Belgian Chocolate Truffle", pricePerKg: 750, color: "chocolate" },
  { name: "Classic Black Forest Cherry", pricePerKg: 650, color: "blackforest" },
  { name: "Red Velvet Cream Cheese", pricePerKg: 800, color: "redvelvet" },
  { name: "Butterscotch Caramel Crunch", pricePerKg: 680, color: "butterscotch" },
  { name: "Fresh Pineapple Delight", pricePerKg: 620, color: "vanilla" },
  { name: "Alphonso Mango Cream", pricePerKg: 700, color: "mango" },
];

const WEIGHTS = [
  { label: "1.0 kg (Standard)", value: "1.0 kg", multiplier: 1.0 },
  { label: "1.5 kg (Celebration)", value: "1.5 kg", multiplier: 1.5 },
  { label: "2.0 kg (Party Size)", value: "2.0 kg", multiplier: 2.0 },
  { label: "3.0 kg (Grand Event)", value: "3.0 kg", multiplier: 3.0 },
  { label: "0.5 kg (Mini Bento)", value: "0.5 kg", multiplier: 0.6 },
];

const TIME_SLOTS = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
  "08:00 PM - 10:00 PM",
];

const SAMPLE_PHOTOS = [
  {
    name: "Celebration",
    url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
    label: "🎂 Birthday",
  },
  {
    name: "Romance",
    url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
    label: "❤️ Romance",
  },
  {
    name: "Baby Party",
    url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    label: "👶 Kids",
  },
  {
    name: "Golden Jubilee",
    url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    label: "✨ Jubilee",
  },
];

export default function PhotoCakePage() {
  const { photoCakeConfig, submitPhotoCakeRequest, user } = useBakeryStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableFlavors = photoCakeConfig?.flavors?.filter((f) => f.is_available) || FLAVORS;
  const availableWeights = photoCakeConfig?.weights?.filter((w) => w.is_available !== false) || WEIGHTS;
  const availableShapes =
    photoCakeConfig?.shapes && photoCakeConfig.shapes.length > 0
      ? photoCakeConfig.shapes.filter((s) => s.is_available !== false)
      : [
          { id: "sh-1", name: "Round", label: "Classic Round ⭕", extraPrice: 0 },
          { id: "sh-2", name: "Square", label: "Modern Square ⏹️", extraPrice: 0 },
          { id: "sh-3", name: "Heart", label: "Romantic Heart ❤️", extraPrice: 50 },
        ];
  const [isPhotoCakeEnabled, setIsPhotoCakeEnabled] = useState(true);

  useEffect(() => {
    const syncEnabled = () => {
      if (typeof window === "undefined") return;
      const direct = localStorage.getItem("hb_photo_cake_enabled_v2");
      if (direct !== null) {
        setIsPhotoCakeEnabled(direct === "true");
        return;
      }
      const config = localStorage.getItem("hb_photo_cake_config_v2");
      if (config) {
        try {
          const parsed = JSON.parse(config);
          if (parsed.is_enabled !== undefined) {
            setIsPhotoCakeEnabled(parsed.is_enabled !== false);
            return;
          }
        } catch {}
      }
      setIsPhotoCakeEnabled(photoCakeConfig?.is_enabled !== false);
    };

    syncEnabled();
    window.addEventListener("hb_store_updated", syncEnabled);
    window.addEventListener("storage", syncEnabled);
    return () => {
      window.removeEventListener("hb_store_updated", syncEnabled);
      window.removeEventListener("storage", syncEnabled);
    };
  }, [photoCakeConfig]);

  const activeTimeSlots = photoCakeConfig?.timeSlots || TIME_SLOTS;
  const printCharge = photoCakeConfig?.printCharge ?? 150;

  // Form State
  const [selectedFlavor, setSelectedFlavor] = useState(() => availableFlavors[0]?.name || "Belgian Chocolate Truffle");
  const [selectedWeight, setSelectedWeight] = useState(() => availableWeights[0]?.value || "1.0 kg");
  const [selectedShape, setSelectedShape] = useState(() => availableShapes[0]?.name || "Round");
  const [isEggless, setIsEggless] = useState(true);
  const [cakeMessage, setCakeMessage] = useState("Happy Birthday!");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80");
  const [isUploading, setIsUploading] = useState(false);

  // Customer Contact State
  const [customerName, setCustomerName] = useState(user.isLoggedIn ? user.name : "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(user.isLoggedIn ? user.email : "");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [deliveryTime, setDeliveryTime] = useState(() => activeTimeSlots[3] || activeTimeSlots[0] || "04:00 PM - 06:00 PM");
  const [specialNotes, setSpecialNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<PhotoCakeRequest | null>(null);

  // Calculate Dynamic Price
  const currentFlavorObj = availableFlavors.find((f) => f.name === selectedFlavor) || availableFlavors[0] || { pricePerKg: 700 };
  const currentWeightObj = availableWeights.find((w) => w.value === selectedWeight) || availableWeights[0] || { multiplier: 1.0 };
  const currentShapeObj = availableShapes.find((s) => s.name === selectedShape) || availableShapes[0] || { extraPrice: 0 };
  const calculatedPrice = Math.round(
    currentFlavorObj.pricePerKg * currentWeightObj.multiplier + printCharge + (currentShapeObj.extraPrice || 0)
  );

  // Client-side image compression for fast mobile uploads
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle Image Upload (Supabase storage or Local data URL)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. Instantly compress and generate local preview
      const compressedDataUrl = await compressImage(file);
      setPhotoUrl(compressedDataUrl);

      // 2. If Supabase configured, upload in background
      if (isSupabaseConfigured() && supabase) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `cake-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("cake-photos")
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from("cake-photos").getPublicUrl(filePath);
          if (data?.publicUrl) {
            setPhotoUrl(data.publicUrl);
          }
        }
      }
    } catch (err) {
      console.error("Image upload fallback error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please provide your name and WhatsApp phone number.");
      return;
    }
    if (!deliveryDate) {
      alert("Please select a delivery date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestRecord = await submitPhotoCakeRequest({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim().toLowerCase(),
        cake_flavor: selectedFlavor,
        cake_weight: selectedWeight,
        cake_shape: selectedShape,
        eggless: isEggless,
        image_url: photoUrl,
        message: cakeMessage.trim(),
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        notes: (customerEmail.trim() ? `[Email: ${customerEmail.trim().toLowerCase()}] ` : "") + specialNotes.trim(),
        estimated_price: calculatedPrice,
        status: "Received",
      });

      // Fire Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      // Save customer email & order ID to localStorage for My Orders filter
      if (typeof window !== "undefined") {
        try {
          if (customerEmail.trim()) {
            localStorage.setItem("hb_customer_email", customerEmail.trim().toLowerCase());
          }
          localStorage.setItem("hb_customer_phone", customerPhone.trim());
          const myIds = JSON.parse(localStorage.getItem("hb_my_order_ids") || "[]");
          if (requestRecord?.id && !myIds.includes(requestRecord.id)) {
            myIds.push(requestRecord.id);
            localStorage.setItem("hb_my_order_ids", JSON.stringify(myIds));
          }
        } catch {}
      }

      setSubmittedRequest(requestRecord);

      // Automated WhatsApp Trigger to Admin
      const whatsappUrl = generatePhotoCakeWhatsAppUrl(requestRecord);
      window.open(whatsappUrl, "_blank");

    } catch (err) {
      console.error("Error submitting photo cake request:", err);
      alert("Failed to submit photo cake request. Please try again or WhatsApp us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tomorrowDateString = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  return (
    <div className="min-h-screen py-4 sm:py-10 px-2.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      
      {/* Top Breadcrumb & Responsive Header */}
      <div className="space-y-2 sm:space-y-3 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-bakery-700 hover:text-bakery-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront</span>
        </Link>

        {isPhotoCakeEnabled && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
            <div className="space-y-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-bakery-800 text-[10px] sm:text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-bakery-600" />
                <span>Hai Backery Custom Cake Studio</span>
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-serif font-extrabold text-chocolate-900 leading-tight">
                Personalized Photo Cake Designer 🎂
              </h1>
              <p className="text-[11px] sm:text-sm text-amber-900/75 max-w-2xl">
                High-definition edible sugar sheet photo printing on fresh bakery cakes in Barrage Center, Hiramandalam.
              </p>
            </div>

            {/* Estimated Price Badge */}
            <div className="bg-amber-50 border border-amber-200 p-2.5 sm:p-4 rounded-2xl flex items-center justify-between sm:justify-start gap-3 shrink-0 shadow-xs w-full sm:w-auto">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-bakery-700 shrink-0">
                  <Cake className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-xs text-amber-800 font-semibold uppercase tracking-wider">Estimated Price</p>
                  <p className="text-base sm:text-2xl font-extrabold text-chocolate-900">
                    {formatCurrency(calculatedPrice)}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-bakery-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold border border-amber-300 sm:hidden">
                Edible Print & Box
              </span>
            </div>
          </div>
        )}
      </div>

      {!isPhotoCakeEnabled ? (
        /* Only Show "Now it is not available" View When Disabled by Admin */
        <div className="bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-rose-500/15 border-2 border-rose-300 rounded-3xl p-6 sm:p-12 text-center space-y-4 shadow-md max-w-3xl mx-auto my-6 animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-950 text-xs font-black border border-rose-300">
            <span>🔴 Currently Unavailable Online</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-4xl text-chocolate-900">
            Photo Cake: Now it is not available online
          </h2>
          <p className="text-xs sm:text-sm text-chocolate-900 max-w-xl mx-auto leading-relaxed font-medium">
            Photo cake online ordering is currently disabled. Please contact Shekhar Rao directly on WhatsApp for offline inquiries and custom bookings!
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/919347166241?text=${encodeURIComponent("Hello Shekhar Rao, I see photo cakes are now not available online. I would like to inquire about custom photo cake availability.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition transform hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Shekhar Rao on WhatsApp (+91 9347166241)</span>
            </a>
          </div>
        </div>
      ) : submittedRequest ? (
        /* Order Success View */
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-amber-200 shadow-xl text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-chocolate-900">
              Photo Cake Request Received!
            </h2>
            <p className="text-xs sm:text-sm text-amber-800/80">
              Thank you, <strong className="text-chocolate-900">{submittedRequest.customer_name}</strong>! Your customized photo cake request has been submitted to Shekhar Rao at Hai Backery.
            </p>
          </div>

          <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border border-amber-200 text-left space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-amber-200 pb-2">
              <span className="font-semibold text-amber-900">Request ID:</span>
              <span className="font-bold text-bakery-700">{submittedRequest.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-amber-900">Flavor & Weight:</span>
              <span className="font-medium text-chocolate-900">{submittedRequest.cake_flavor} ({submittedRequest.cake_weight})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-amber-900">Delivery Slot:</span>
              <span className="font-medium text-chocolate-900">{submittedRequest.delivery_date} at {submittedRequest.delivery_time}</span>
            </div>
            {submittedRequest.message && (
              <div className="border-t border-amber-200 pt-2">
                <span className="font-semibold text-amber-900">Cake Text:</span>
                <p className="font-serif italic text-chocolate-900 mt-0.5">&quot;{submittedRequest.message}&quot;</p>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <a
              href={generatePhotoCakeWhatsAppUrl(submittedRequest)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform hover:scale-102"
            >
              <Send className="w-4 h-4" />
              <span>Send Details to WhatsApp (+91 9347166241)</span>
            </a>

            <Link
              href="/my-orders"
              className="w-full py-3 px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-chocolate-950 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-300 transition"
            >
              <PackageCheck className="w-4 h-4 text-bakery-700" />
              <span>📦 View in My Orders & Track Status</span>
            </Link>

            <Link
              href="/"
              className="inline-block text-xs text-amber-800 hover:text-chocolate-900 font-semibold"
            >
              ← Back to Hai Backery Storefront
            </Link>
          </div>
        </div>
      ) : (
        /* Designer Form & Live Preview Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* Left Column: Live Interactive Cake Canvas (Sticky on Laptop/Desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4" id="live-cake-canvas">
            <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-amber-200/90 shadow-lg text-center space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                <span className="text-xs font-bold text-chocolate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Live 3D Cake Canvas
                </span>
                <span className="text-[10px] bg-amber-100 text-bakery-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  Real-time Preview
                </span>
              </div>

              {/* Real-time Cake Preview Component */}
              <PhotoCakePreview
                flavor={selectedFlavor}
                weight={selectedWeight}
                shape={selectedShape}
                eggless={isEggless}
                imageUrl={photoUrl}
                message={cakeMessage}
              />

              {/* Specification Card */}
              <div className="bg-amber-50/90 rounded-2xl p-3 sm:p-3.5 border border-amber-200 text-left space-y-1">
                <div className="flex items-center justify-between text-xs font-black text-chocolate-900">
                  <span>📄 Print Size Spec:</span>
                  <span className="text-amber-900 font-bold text-[11px]">Max 8.27 × 11.69 in (A4)</span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed">
                  💡 Printed on 100% FDA-approved edible sugar sheet with food-grade inks. Scaled proportionally to fit your selected cake size ({selectedWeight}, {selectedShape} shape).
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls & Booking Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-8 border-2 border-amber-200/90 shadow-lg space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Upload Photo */}
              <div className="space-y-3 pb-6 border-b border-amber-100">
                <h2 className="font-serif font-bold text-sm sm:text-base text-chocolate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-sans font-bold shrink-0">
                    1
                  </span>
                  Upload Your Photo (Edible Sugar Sheet Print)
                </h2>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium">
                  <span className="font-bold">📐 Sugar Sheet Dimensions:</span>
                  <span>Max 8.27 × 11.69 inches (A4 size) or below (custom fitted to cake)</span>
                </div>

                {/* Inline Confirmation when photo is loaded */}
                {photoUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-100/70 border-2 border-amber-300">
                    <img src={photoUrl} alt="Loaded Photo" className="w-12 h-12 rounded-xl object-cover border border-amber-400 shrink-0 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-chocolate-900 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span>Photo Applied to Live Cake!</span>
                      </p>
                      <p className="text-[10px] text-amber-800 truncate">
                        Edible sugar sheet is previewed on your cake above.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("live-cake-canvas");
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0 flex items-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Cake</span>
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex-1 py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-bakery-900 border-2 border-dashed border-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
                    >
                      <Upload className="w-4 h-4 text-bakery-600 shrink-0" />
                      <span>{isUploading ? "Optimizing & Uploading..." : "Choose Photo from Phone / PC"}</span>
                    </button>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-3 rounded-2xl bg-white hover:bg-amber-50 text-chocolate-900 border border-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Change</span>
                      </button>
                    )}
                  </div>

                  {/* Sample Photo Templates for Instant 1-Click Preview */}
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1.5">
                      Or Try Sample Templates:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SAMPLE_PHOTOS.map((sample) => (
                        <button
                          key={sample.name}
                          type="button"
                          onClick={() => setPhotoUrl(sample.url)}
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-1 truncate ${
                            photoUrl === sample.url
                              ? "bg-amber-200 border-amber-600 text-chocolate-950 font-black shadow-xs"
                              : "bg-amber-50/60 border-amber-200 text-chocolate-800 hover:bg-amber-100"
                          }`}
                        >
                          <span>{sample.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Select Cake Flavor */}
              <div className="space-y-3 pb-6 border-b border-amber-100">
                <h2 className="font-serif font-bold text-sm sm:text-base text-chocolate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-sans font-bold shrink-0">
                    2
                  </span>
                  Choose Cake Flavor
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  {availableFlavors.map((f) => {
                    const isSelected = selectedFlavor === f.name;
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => setSelectedFlavor(f.name)}
                        className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition relative ${
                          isSelected
                            ? "bg-amber-100/80 border-bakery-600 ring-2 ring-bakery-500/20 shadow-sm"
                            : "bg-white border-amber-200 hover:bg-amber-50/60"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-bakery-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                        <p className="text-xs font-bold text-chocolate-900 leading-tight pr-4">
                          {f.name}
                        </p>
                        <p className="text-[10px] text-bakery-700 font-bold mt-1">
                          {formatCurrency(f.pricePerKg)}/kg
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Select Cake Shape (Square / Round / Heart) */}
              <div className="space-y-3 pb-6 border-b border-amber-100">
                <h2 className="font-serif font-bold text-sm sm:text-base text-chocolate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-sans font-bold shrink-0">
                    3
                  </span>
                  Choose Cake Shape
                </h2>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {availableShapes.map((s) => {
                    const isSelected = selectedShape === s.name;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setSelectedShape(s.name)}
                        className={`p-2.5 sm:p-3 rounded-2xl border-2 text-center transition ${
                          isSelected
                            ? "bg-amber-100/80 border-bakery-600 ring-2 ring-bakery-500/20 shadow-sm"
                            : "bg-white border-amber-200 hover:bg-amber-50/60"
                        }`}
                      >
                        <p className="text-xs font-bold text-chocolate-900 leading-tight truncate">
                          {s.label || s.name}
                        </p>
                        {s.extraPrice > 0 ? (
                          <p className="text-[10px] text-amber-800 font-bold mt-1">
                            +{formatCurrency(s.extraPrice)}
                          </p>
                        ) : (
                          <p className="text-[10px] text-emerald-700 font-bold mt-1">
                            Standard
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Select Weight & Dietary Preference */}
              <div className="space-y-3 pb-6 border-b border-amber-100">
                <h2 className="font-serif font-bold text-sm sm:text-base text-chocolate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-sans font-bold shrink-0">
                    4
                  </span>
                  Cake Weight & Eggless Option
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableWeights.map((w) => {
                    const isSelected = selectedWeight === w.value;
                    return (
                      <button
                        key={w.value}
                        type="button"
                        onClick={() => setSelectedWeight(w.value)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                          isSelected
                            ? "bg-chocolate-900 text-white border-chocolate-900 shadow-sm font-black"
                            : "bg-white text-chocolate-900 border-amber-200 hover:bg-amber-50"
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>

                {/* Eggless Toggle */}
                <div className="pt-2 flex items-center justify-between bg-amber-50/90 p-3 sm:p-3.5 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shrink-0"></span>
                    <div>
                      <span className="text-xs font-bold text-chocolate-900 block">
                        100% Pure Eggless Bakery Sponge
                      </span>
                      <span className="text-[10px] text-amber-800/80">Baked in clean pure vegetarian counter</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEggless(!isEggless)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${
                      isEggless ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isEggless ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Step 5: Message on Cake */}
              <div className="space-y-3 pb-6 border-b border-amber-100">
                <h2 className="font-serif font-bold text-sm sm:text-base text-chocolate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-sans font-bold shrink-0">
                    5
                  </span>
                  Message to be Written on Cake
                </h2>

                <input
                  type="text"
                  maxLength={45}
                  placeholder="e.g. Happy 1st Birthday Aarav! ❤️"
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 focus:border-bakery-500 font-bold text-chocolate-900 bg-white"
                />
                <div className="flex justify-between text-[10px] sm:text-[11px] text-amber-800/75">
                  <span>Renders live on the cake above in real-time</span>
                  <span>{cakeMessage.length}/45 chars</span>
                </div>
              </div>

              {/* Step 6: Schedule & Customer Contact */}
              <div className="space-y-4">
                <h2 className="font-serif font-bold text-sm sm:text-base text-chocolate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-sans font-bold shrink-0">
                    6
                  </span>
                  Store Pickup Schedule & Contact Information
                </h2>

                {/* Pickup Location Info */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <span className="font-bold">🏬 Pickup Location:</span>
                  <span>Hai Backery, Barrage Center • Pay at Counter on Pickup</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-bakery-600" />
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shekhar Rao / Sneha"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-medium text-chocolate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-bakery-600" />
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 93471 66241"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-medium text-chocolate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-bakery-600" />
                      Email Address (For Order Tracking) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-medium text-chocolate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-bakery-600" />
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={tomorrowDateString}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-medium text-chocolate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-bakery-600" />
                      Preferred Pickup Time Slot *
                    </label>
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 bg-white font-medium text-chocolate-900"
                    >
                      {activeTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-chocolate-900 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-bakery-600" />
                    Special Notes / Icing Color Preferences (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please add extra chocolate curls around the border, delivering to Barrage Center"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 resize-none font-medium text-chocolate-900 bg-white"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-amber-100 space-y-3">
                <div className="flex justify-between items-center bg-amber-50/90 p-3.5 sm:p-4 rounded-2xl border border-amber-200">
                  <div>
                    <span className="text-[10px] sm:text-xs text-amber-800 block uppercase font-semibold">Total Estimated Price</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-chocolate-900">
                      {formatCurrency(calculatedPrice)}
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-[11px] text-bakery-800 bg-amber-100 px-3 py-1 rounded-full font-bold border border-amber-300">
                    Includes Edible Print & Box
                  </span>
                </div>

                {isPhotoCakeEnabled ? (
                  <>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-bakery-600 to-amber-600 hover:from-amber-600 hover:to-bakery-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition transform hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? "Submitting Custom Cake..." : "Submit Photo Cake & Send to WhatsApp"}</span>
                    </button>

                    <p className="text-[10px] sm:text-[11px] text-center text-amber-800/80">
                      ⚡ Auto-saves record to database & opens WhatsApp to Shekhar Rao (+91 9347166241)
                    </p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled
                      className="w-full py-4 px-6 rounded-2xl bg-rose-50 text-rose-800 font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed border-2 border-rose-300 shadow-sm"
                    >
                      <span>🔒 Now it is not available</span>
                    </button>
                    <a
                      href={`https://wa.me/919347166241?text=${encodeURIComponent(`Hello Shekhar Rao, I want to inquire about custom photo cake availability (${selectedFlavor}, ${selectedWeight}, ${selectedShape} shape).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition transform hover:scale-102"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Inquire via WhatsApp for Custom Order (+91 9347166241)</span>
                    </a>
                  </div>
                )}
              </div>

            </form>
          </div>

        </div>
      )}

      {/* Floating Bottom Action for Mobile (Hidden on Desktop) */}
      {isPhotoCakeEnabled && !submittedRequest && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border-2 border-amber-300 shadow-2xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-amber-100 shrink-0 border border-amber-300">
              {photoUrl ? (
                <img src={photoUrl} alt="Cake Photo" className="w-full h-full object-cover" />
              ) : (
                <Cake className="w-full h-full p-1.5 text-amber-700" />
              )}
            </div>
            <div className="truncate">
              <p className="text-[10px] font-black text-chocolate-900 truncate">
                {selectedShape} • {selectedWeight}
              </p>
              <p className="text-xs font-black text-amber-600 leading-tight">
                {formatCurrency(calculatedPrice)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("live-cake-canvas");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="px-2.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-chocolate-950 font-bold text-[10px] border border-amber-300 flex items-center gap-1 shadow-xs"
            >
              <Eye className="w-3 h-3 text-bakery-700" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
              }}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-[10px] shadow-md flex items-center gap-1"
            >
              <span>Book</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
