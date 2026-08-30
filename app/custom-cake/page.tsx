"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  Cake,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Send,
  Heart,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Upload,
  RefreshCw,
  Scale,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";
import ImageUploadDropzone from "@/components/image-upload-dropzone";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { ADMIN_PHONE, ADMIN_NAME, STORE_ADDRESS, STORE_NAME, buildWhatsAppLink } from "@/lib/whatsapp";
import { CustomerCakeSuggestion } from "@/lib/types";

const OCCASIONS = [
  "Birthday Celebration 🎂",
  "Wedding / Reception 💍",
  "Anniversary ❤️",
  "Baby Shower 👶",
  "Kids Theme Party 🦄",
  "Engagement / Ring Ceremony 💐",
  "Farewell / Corporate 🎉",
  "Custom Surprise 🎁",
];

const FLAVORS = [
  "Belgian Chocolate Truffle",
  "Classic Black Forest Cherry",
  "Butterscotch Caramel Crunch",
  "Red Velvet Cream Cheese",
  "Fresh Strawberry Vanilla",
  "Alphonso Mango Delight",
  "Rich Pineapple Cream",
  "Custom / Chef Choice",
];

const WEIGHT_OPTIONS = [
  "1.0 kg (6-8 Guests)",
  "1.5 kg (10-12 Guests)",
  "2.0 kg (15-18 Guests)",
  "3.0 kg (22-25 Guests)",
  "5.0 kg+ (Grand Event / Multi-Tier)",
  "Custom Size",
];

export default function CustomCakeSuggestionPage() {
  const { submitCakeSuggestion } = useBakeryStore();

  // Form State
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [flavor, setFlavor] = useState(FLAVORS[0]);
  const [weight, setWeight] = useState(WEIGHT_OPTIONS[0]);
  const [isEggless, setIsEggless] = useState(false);
  const [neededDate, setNeededDate] = useState("");
  const [neededTime, setNeededTime] = useState("Morning (9:00 AM - 12:00 PM)");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState("Store Pickup (Barrage Center)");
  const [specialNotes, setSpecialNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuggestion, setSubmittedSuggestion] = useState<CustomerCakeSuggestion | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl.trim()) {
      alert("Please upload a cake reference image or photo.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      alert("Please provide a short description of how you want your cake (colors, theme, text, etc.).");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !neededDate) {
      alert("Please fill in your Name, WhatsApp Mobile Number, and Required Date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newSug = await submitCakeSuggestion({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        description: description.trim(),
        image_url: imageUrl.trim(),
        occasion,
        preferred_flavor: flavor,
        estimated_weight: weight,
        is_eggless: isEggless,
        needed_date: neededDate,
        needed_time: neededTime,
        admin_notes: `Delivery/Pickup: ${deliveryPreference} | Notes: ${specialNotes || "None"}`,
      });

      setSubmittedSuggestion(newSug);

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error("Failed to submit custom cake suggestion:", err);
      alert("Something went wrong while submitting your request. Please try again or message us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Message Generator
  const generateWhatsAppInquiryUrl = (sug: CustomerCakeSuggestion) => {
    const isWebUrl = sug.image_url && (sug.image_url.startsWith("http://") || sug.image_url.startsWith("https://"));
    const photoLine = isWebUrl
      ? `🖼️ *REFERENCE PHOTO LINK:*\n${sug.image_url}\n`
      : `🖼️ *REFERENCE PHOTO:*\n[Photo Saved in Hai Backery System under Request ID: ${sug.id}]\n_(I am also sharing my photo here in this WhatsApp chat)_ 📸\n`;

    const message = `🎨🎂 *CUSTOM CAKE DESIGN SUGGESTION — ${STORE_NAME}* 🎂🎨\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Request ID:* ${sug.id}\n` +
      `👤 *Customer Name:* ${sug.customer_name}\n` +
      `📞 *Customer Mobile:* ${sug.customer_phone}\n` +
      `🎉 *Occasion:* ${sug.occasion}\n` +
      `🍰 *Preferred Flavor:* ${sug.preferred_flavor}\n` +
      `⚖️ *Estimated Weight:* ${sug.estimated_weight}\n` +
      `🌱 *Type:* ${sug.is_eggless ? "100% Eggless 🟢" : "Regular"}\n` +
      `📅 *Needed Date:* ${sug.needed_date} (${sug.needed_time})\n` +
      `📍 *Pickup / Delivery:* ${deliveryPreference}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📝 *HOW I WANT THE CAKE (DESIGN DETAILS):*\n"${sug.description}"\n` +
      (specialNotes ? `\n💡 *Extra Instructions:* ${specialNotes}\n` : "") +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      photoLine +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Namaste Shekhar Rao garu, I have shared my cake design idea. Please review and share the price quotation & baking confirmation!_`;

    return buildWhatsAppLink(ADMIN_PHONE, message);
  };

  const downloadImage = async (url: string, filename = "cake-design-reference.jpg") => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf4e8] via-[#fff7ed] to-[#fdebd0] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 1. Hero Header */}
        <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Custom Cake Studio & Idea Suggestion</span>
            </span>

            <h1 className="text-3xl sm:text-5xl font-serif font-black text-amber-50 leading-tight">
              Design Your <span className="text-amber-400">Dream Cake</span>
            </h1>

            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              Found a cake you love on <strong>Pinterest, Instagram, or a party photo</strong>? Upload the reference picture below and describe how you want it made. Our master bakers at <strong>Hai Backery</strong> will handcraft it for your special celebration!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>100% Fresh Morning Baking</span>
              </span>
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span>Direct WhatsApp Price Quote & Confirmation</span>
              </span>
            </div>
          </div>

          <div className="bg-[#2c1207] p-6 rounded-3xl border-2 border-amber-600/50 shadow-xl space-y-4 shrink-0 relative z-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mx-auto">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-300 uppercase tracking-widest">Instant Custom Inquiry</p>
              <p className="text-xl font-black text-white mt-1">Upload & Get Quoted</p>
              <p className="text-[11px] text-amber-200/70 mt-0.5">Quick response from Shekhar Rao</p>
            </div>

            <a
              href={`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent('Namaste Shekhar Rao garu, I want to inquire about a custom cake design idea.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask Shekhar Rao on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 2. Main Form or Submission Confirmation */}
        {submittedSuggestion ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-amber-300 shadow-2xl text-center max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
                🎉 Suggestion Received Successfully!
              </span>
              <h2 className="font-serif font-black text-3xl text-chocolate-900 pt-2">
                Thank you, {submittedSuggestion.customer_name}!
              </h2>
              <p className="text-xs sm:text-sm text-amber-800/90 max-w-md mx-auto leading-relaxed">
                Your custom cake reference image and design description have been submitted to <strong>Shekhar Rao at Hai Backery</strong>.
              </p>
            </div>

            {/* Request Summary Card */}
            <div className="bg-amber-50/90 p-6 rounded-2xl border-2 border-amber-200 text-left space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                <span className="font-bold text-amber-900">Request ID:</span>
                <span className="font-black text-bakery-700 bg-amber-100 px-2 py-0.5 rounded-md">{submittedSuggestion.id}</span>
              </div>

              {submittedSuggestion.image_url && (
                <div className="space-y-2 border-b border-amber-200 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">Uploaded Reference Image:</span>
                    {submittedSuggestion.image_url.startsWith("http") && (
                      <a
                        href={submittedSuggestion.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-bakery-700 font-bold underline flex items-center gap-1"
                      >
                        <span>Open Public Link 🔗</span>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-md shrink-0">
                      <img
                        src={submittedSuggestion.image_url}
                        alt="Uploaded Cake Reference"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => downloadImage(submittedSuggestion.image_url, `cake-design-${submittedSuggestion.id}.jpg`)}
                        className="px-3.5 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-chocolate-950 font-black text-xs flex items-center gap-1.5 shadow-sm border border-amber-300 transition"
                      >
                        <Download className="w-4 h-4 text-bakery-700" />
                        <span>Download Reference Photo 📥</span>
                      </button>
                      <p className="text-[10px] text-amber-800/80">
                        Save photo to your gallery to easily share or attach in WhatsApp chat!
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    ✅ Your reference photo is saved in the bakery system & linked to your WhatsApp message.
                  </p>
                </div>
              )}

              <div className="space-y-1 border-b border-amber-200 pb-2.5">
                <span className="font-bold text-amber-900">Your Design Description:</span>
                <p className="text-chocolate-900 font-medium bg-white p-3 rounded-xl border border-amber-200 italic leading-relaxed">
                  &quot;{submittedSuggestion.description}&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-chocolate-900">
                <div>
                  <span className="text-[10px] text-amber-700 block font-bold">OCCASION</span>
                  <span className="font-bold">{submittedSuggestion.occasion}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block font-bold">FLAVOR & WEIGHT</span>
                  <span className="font-bold">{submittedSuggestion.preferred_flavor} ({submittedSuggestion.estimated_weight})</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block font-bold">REQUIRED DATE</span>
                  <span className="font-bold">{submittedSuggestion.needed_date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block font-bold">TIME SLOT</span>
                  <span className="font-bold">{submittedSuggestion.needed_time}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={generateWhatsAppInquiryUrl(submittedSuggestion)}
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
                    setSubmittedSuggestion(null);
                    setImageUrl("");
                    setDescription("");
                  }}
                  className="text-xs text-amber-900 font-bold hover:underline"
                >
                  + Submit Another Custom Cake Idea
                </button>
                <span className="text-amber-300">•</span>
                <Link
                  href="/"
                  className="text-xs text-amber-900 font-bold hover:underline"
                >
                  ← Return to Storefront
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Main Creation Studio Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Cols: Image Upload & Form Inputs */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Upload Reference Image */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                    1
                  </div>
                  <div>
                    <h2 className="font-serif font-black text-lg text-chocolate-900">
                      Upload Your Reference Cake Photo *
                    </h2>
                    <p className="text-xs text-amber-800/80">
                      Upload a photo from your phone, Instagram, Pinterest, or past party.
                    </p>
                  </div>
                </div>

                <ImageUploadDropzone
                  label="Upload Cake Design Photo"
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                />
              </div>

              {/* Step 2: Describe the Cake Design */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-bakery-700 font-black">
                    2
                  </div>
                  <div>
                    <h2 className="font-serif font-black text-lg text-chocolate-900">
                      Describe How You Want the Cake *
                    </h2>
                    <p className="text-xs text-amber-800/80">
                      Specify colors, frosting type, custom text/name, theme toppers, or changes from the reference photo.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. 'I want a 2-tier chocolate truffle cake similar to the photo, but with pastel blue & golden frosting. Write Happy 5th Birthday Aarav on top, and add edible chocolate stars and dinosaur toppers.'"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-medium text-chocolate-900 leading-relaxed placeholder:text-amber-800/40"
                  />
                  <p className="text-[11px] text-amber-800/70 italic">
                    💡 Tip: Include the text to write on the cake, color preferences, and any specific topper requests.
                  </p>
                </div>
              </div>

              {/* Step 3: Flavor, Weight & Occasion */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-bakery-700 font-black">
                    3
                  </div>
                  <div>
                    <h2 className="font-serif font-black text-lg text-chocolate-900">
                      Cake Preferences & Event Occasion
                    </h2>
                    <p className="text-xs text-amber-800/80">
                      Select event details to help us quote the exact price.
                    </p>
                  </div>
                </div>

                {/* Occasion Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                    Select Occasion / Celebration *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => setOccasion(occ)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-center border-2 transition ${
                          occasion === occ
                            ? "bg-amber-500 text-white border-amber-500 shadow-md scale-[1.02]"
                            : "bg-amber-50/50 text-chocolate-900 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flavor & Weight Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                      Preferred Cake Flavor *
                    </label>
                    <select
                      value={flavor}
                      onChange={(e) => setFlavor(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                    >
                      {FLAVORS.map((flv) => (
                        <option key={flv} value={flv}>{flv}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                      Estimated Weight / Size *
                    </label>
                    <select
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                    >
                      {WEIGHT_OPTIONS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Eggless Checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none bg-amber-50/80 p-3 rounded-xl border border-amber-200 hover:bg-amber-100 transition">
                    <input
                      type="checkbox"
                      checked={isEggless}
                      onChange={(e) => setIsEggless(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-amber-300"
                    />
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                      <span>🌱 Make this 100% Eggless Pure Vegetarian</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 4: Contact & Timing Information */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-bakery-700 font-black">
                    4
                  </div>
                  <div>
                    <h2 className="font-serif font-black text-lg text-chocolate-900">
                      Your Details & Required Pickup Schedule
                    </h2>
                    <p className="text-xs text-amber-800/80">
                      Shekhar Rao will contact you on WhatsApp to confirm the price and baking slot.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar / Sneha"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
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

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                      Required Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={neededDate}
                      onChange={(e) => setNeededDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                      Preferred Time Slot *
                    </label>
                    <select
                      value={neededTime}
                      onChange={(e) => setNeededTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
                    >
                      <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12:00 PM - 03:00 PM)</option>
                      <option value="Evening (03:00 PM - 06:00 PM)">Evening (03:00 PM - 06:00 PM)</option>
                      <option value="Night (06:00 PM - 09:00 PM)">Night (06:00 PM - 09:00 PM)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                      Pickup / Delivery Preference
                    </label>
                    <select
                      value={deliveryPreference}
                      onChange={(e) => setDeliveryPreference(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold text-chocolate-900"
                    >
                      <option value="Store Pickup (Barrage Center)">Self Store Pickup (Barrage Center Counter)</option>
                      <option value="Local Barrage Center Delivery">Local Delivery in Barrage Center</option>
                      <option value="Hiramandalam Town Delivery">Hiramandalam Town Delivery</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                      Additional Notes / Custom Topper Requests (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Add 2 sparkler candles, less sugar, golden fondant crown, etc."
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-base shadow-xl shadow-amber-500/30 transition transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Submitting Custom Design...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Custom Cake Idea & Get Price Quote</span>
                  </>
                )}
              </button>
            </form>

            {/* Right 5 Cols: Live Interactive Preview Card */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="bg-gradient-to-br from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 border-2 border-amber-500/40 shadow-2xl space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-amber-700/60">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="font-serif font-black text-base text-amber-50">Live Design Preview</h3>
                  </div>
                  <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/40">
                    {occasion.split(" ")[0]}
                  </span>
                </div>

                {/* Photo Preview Box */}
                <div className="w-full aspect-video rounded-2xl bg-[#150702] border-2 border-dashed border-amber-500/50 overflow-hidden flex items-center justify-center relative group">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Cake Reference"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-center p-4 space-y-2 text-amber-200/60">
                      <ImageIcon className="w-10 h-10 mx-auto text-amber-400/50" />
                      <p className="text-xs font-bold text-amber-200">No reference image uploaded yet</p>
                      <p className="text-[10px] text-amber-400/60">Upload photo in Step 1 to preview here</p>
                    </div>
                  )}

                  {imageUrl && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-amber-300 font-bold border border-amber-500/30">
                      📸 Reference Photo
                    </div>
                  )}
                </div>

                {/* Specs List */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-900/40 text-amber-200">
                    <span>Occasion:</span>
                    <span className="font-bold text-white">{occasion}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-amber-900/40 text-amber-200">
                    <span>Flavor:</span>
                    <span className="font-bold text-amber-300">{flavor}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-amber-900/40 text-amber-200">
                    <span>Weight:</span>
                    <span className="font-bold text-white">{weight}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-amber-900/40 text-amber-200">
                    <span>Type:</span>
                    <span className={`font-bold ${isEggless ? 'text-emerald-400' : 'text-amber-200'}`}>
                      {isEggless ? "100% Eggless 🟢" : "Regular"}
                    </span>
                  </div>

                  {neededDate && (
                    <div className="flex justify-between py-1 border-b border-amber-900/40 text-amber-200">
                      <span>Target Date:</span>
                      <span className="font-bold text-white">{neededDate} ({neededTime.split(" ")[0]})</span>
                    </div>
                  )}

                  {description ? (
                    <div className="pt-2 space-y-1">
                      <span className="text-[11px] text-amber-300 font-bold block">Your Design Notes:</span>
                      <p className="text-[11px] text-amber-100 bg-[#160601] p-3 rounded-xl border border-amber-700/50 italic leading-relaxed line-clamp-4">
                        &quot;{description}&quot;
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Guarantee Banner */}
                <div className="p-3 bg-[#160601] rounded-2xl border border-amber-700/50 space-y-1 text-[11px] text-amber-200/80">
                  <p className="font-bold text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hai Backery Artisan Promise:</span>
                  </p>
                  <p>• Handcrafted with pure fresh ingredients & real cocoa</p>
                  <p>• Direct WhatsApp price quote from Shekhar Rao</p>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
