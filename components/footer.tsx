"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Cake, 
  MessageCircle,
  ExternalLink
} from "lucide-react";
import { ADMIN_PHONE, ADMIN_NAME, STORE_ADDRESS, STORE_NAME, generateDirectInquiryWhatsAppUrl } from "@/lib/whatsapp";

export default function Footer() {
  const pathname = usePathname();

  // Do not render the customer storefront footer on admin dashboard pages
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-chocolate-900 text-amber-100/90 pt-16 pb-12 border-t-4 border-bakery-600 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-bakery-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-amber-800/40">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-bakery-600 flex items-center justify-center text-white shadow-lg">
                <Cake className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                Hai <span className="text-amber-400">Backery</span>
              </span>
            </div>
            
            <p className="text-sm text-amber-200/80 leading-relaxed">
              Serving handcrafted sweets, hot & crispy biscuits, artisan celebration cakes, and personalized edible photo cakes freshly made every day in Bommika, Hiramandalam.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-amber-300/90">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>100% Pure Ghee & Fresh Ingredients</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-serif font-bold text-base tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Popular Delights
            </h3>
            <ul className="space-y-2 text-sm text-amber-200/80">
              <li>
                <Link href="/custom-cake" className="hover:text-amber-400 transition flex items-center gap-1.5 text-amber-300 font-bold">
                  🎨 Custom Cake Design & Suggestion Studio
                </Link>
              </li>
              <li>
                <Link href="/photo-cake" className="hover:text-amber-400 transition flex items-center gap-1.5 text-amber-300 font-semibold">
                  📸 Personalized Photo Cakes
                </Link>
              </li>
              <li>
                <Link href="/#cat-sweets" className="hover:text-amber-400 transition">
                  🧈 Pure Desi Ghee Sweets & Kaju Katli
                </Link>
              </li>
              <li>
                <Link href="/#cat-biscuits" className="hover:text-amber-400 transition">
                  🍪 Fresh Osmania & Fruit Tea Biscuits
                </Link>
              </li>
              <li>
                <Link href="/#cat-cakes" className="hover:text-amber-400 transition">
                  🎂 Birthday & Anniversary Chocolate Cakes
                </Link>
              </li>
              <li>
                <Link href="/#cat-savories" className="hover:text-amber-400 transition">
                  🌶️ Andhra Mixture & Ribbon Murukku
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Store & Owner Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-serif font-bold text-base tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Store Address & Admin
            </h3>
            
            <div className="space-y-2.5 text-sm text-amber-200/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="leading-snug">
                  {STORE_ADDRESS}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Proprietor: <strong className="text-white">{ADMIN_NAME}</strong></span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:haibackery@gmail.com" className="hover:text-white transition">
                  haibackery@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Open: 7:00 AM – 10:00 PM (Daily)</span>
              </div>
            </div>
          </div>

          {/* Column 4: WhatsApp Direct Ordering */}
          <div className="space-y-4">
            <h3 className="text-white font-serif font-bold text-base tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Instant WhatsApp Orders
            </h3>

            <p className="text-xs text-amber-200/80 leading-relaxed">
              Order directly via WhatsApp or chat with Shekhar Rao for bulk event orders and custom cake designs.
            </p>

            <div className="space-y-2">
              <a
                href={`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent('Hello Shekhar Rao, I would like to place an order at Hai Backery Bommika.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Chat on WhatsApp (+91 9347166241)
              </a>

              <a
                href="tel:+919347166241"
                className="w-full py-2.5 px-4 rounded-xl bg-chocolate-800 hover:bg-chocolate-700 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 border border-amber-800/60 transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Call +91 9347166241
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-300/70">
          <p>© {new Date().getFullYear()} Hai Backery (Shekhar Rao). All rights reserved. Barrage Center, Bommika, Hiramandalam.</p>
          
          <div className="flex items-center gap-4">
            <Link href="/admin/inventory" className="hover:text-amber-200 transition font-medium">
              Admin Login
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">
              Freshly Baked with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> in Srikakulam
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
