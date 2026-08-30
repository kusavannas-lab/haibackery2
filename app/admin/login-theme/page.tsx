"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Palette, 
  Image as ImageIcon, 
  Sparkles, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Eye, 
  ExternalLink, 
  Layers, 
  Sliders, 
  Type, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Smartphone, 
  Monitor,
  Cake,
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { LoginThemeConfig } from "@/lib/types";
import ImageUploadDropzone from "@/components/image-upload-dropzone";

// Pre-made Luxury Themes
const PRESET_THEMES: {
  id: string;
  name: string;
  category: string;
  config: LoginThemeConfig;
  previewUrl: string;
}[] = [
  {
    id: "artisan-bakery",
    name: "Artisan Bakery Counter",
    category: "Bakery Classic",
    previewUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    config: {
      background_type: "image",
      background_image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&auto=format&fit=crop&q=80",
      background_blur: "none",
      overlay_opacity: 45,
      overlay_color: "chocolate",
      headline: "Welcome to Hai Backery",
      tagline: "Authentic Pure Ghee Sweets & Custom Designer Cakes • Barrage Center",
      badge_text: "FRESH BAKERY COUNTER & SWEET STUDIO",
      card_style: "white",
    },
  },
  {
    id: "royal-mithai",
    name: "Royal Sweets & Mithai",
    category: "Traditional Mithai",
    previewUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80",
    config: {
      background_type: "image",
      background_image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1600&auto=format&fit=crop&q=80",
      background_blur: "sm",
      overlay_opacity: 50,
      overlay_color: "amber",
      headline: "Hai Backery Sweets",
      tagline: "Handcrafted Pure Ghee Sweets, Kaju Katli & Laddus • Barrage Center",
      badge_text: "100% PURE DESI GHEE SWEETS",
      card_style: "glass",
    },
  },
  {
    id: "wedding-cake",
    name: "Celebration Cake Studio",
    category: "Custom Cakes",
    previewUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80",
    config: {
      background_type: "image",
      background_image_url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1600&auto=format&fit=crop&q=80",
      background_blur: "none",
      overlay_opacity: 40,
      overlay_color: "chocolate",
      headline: "Celebration Cake Studio",
      tagline: "Designer Photo Cakes & Multi-Tier Event Cakes by Shekhar Rao",
      badge_text: "CUSTOM CAKE SPECIALISTS",
      card_style: "glass",
    },
  },
  {
    id: "dark-velvet",
    name: "Dark Velvet & Gold",
    category: "Luxury Gourmet",
    previewUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    config: {
      background_type: "image",
      background_image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1600&auto=format&fit=crop&q=80",
      background_blur: "md",
      overlay_opacity: 65,
      overlay_color: "black",
      headline: "Hai Backery Gourmet",
      tagline: "Finest Truffles, Pastries, and Fresh Delicacies",
      badge_text: "GOURMET SELECTION",
      card_style: "dark",
    },
  },
  {
    id: "warm-amber",
    name: "Warm Golden Glow",
    category: "Minimalist Gradient",
    previewUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80",
    config: {
      background_type: "gradient",
      background_image_url: "",
      background_blur: "none",
      overlay_opacity: 0,
      overlay_color: "amber",
      headline: "Welcome to Hai Backery",
      tagline: "Barrage Center, Hiramandalam, Srikakulam – 532459",
      badge_text: "ESTABLISHED 2024 • BARRAGE CENTER",
      card_style: "amber",
    },
  },
];

export default function AdminLoginThemePage() {
  const { loginTheme, updateLoginTheme } = useBakeryStore();

  const [formTheme, setFormTheme] = useState<LoginThemeConfig>(loginTheme);
  const [isSaved, setIsSaved] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    if (loginTheme) {
      setFormTheme(loginTheme);
    }
  }, [loginTheme]);

  const handleApplyPreset = (preset: LoginThemeConfig) => {
    setFormTheme(preset);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateLoginTheme(formTheme);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Preview styling helpers
  const getOverlayColor = () => {
    const opacity = (formTheme.overlay_opacity ?? 45) / 100;
    switch (formTheme.overlay_color) {
      case "black": return `rgba(0, 0, 0, ${opacity})`;
      case "amber": return `rgba(66, 32, 6, ${opacity})`;
      case "velvet": return `rgba(45, 10, 20, ${opacity})`;
      case "chocolate":
      default: return `rgba(34, 13, 5, ${opacity})`;
    }
  };

  const getCardClasses = () => {
    switch (formTheme.card_style) {
      case "glass": return "bg-white/90 backdrop-blur-md border-2 border-white/60 text-chocolate-900 shadow-2xl";
      case "dark": return "bg-[#1f0c05]/95 backdrop-blur-md border-2 border-amber-500/50 text-amber-50 shadow-2xl";
      case "amber": return "bg-amber-50/95 border-2 border-amber-300 text-chocolate-900 shadow-2xl";
      case "white":
      default: return "bg-white border-2 border-amber-200/90 text-chocolate-900 shadow-2xl";
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              <span>Storefront Branding & Theme Studio</span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-chocolate-900">
              Customer Login Page & Background Customizer
            </h1>
            <p className="text-xs text-amber-800/80 max-w-2xl">
              Change the background image, darkness overlays, blur effects, card styling, and welcome text of the customer login screen in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-chocolate-900 text-xs font-black border border-amber-300 flex items-center gap-1.5 transition"
            >
              <span>Open Customer Login</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 transition transform hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? "Saved & Published!" : "Save & Publish Theme"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Studio Grid: Left Controls, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Theme Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step A: Presets Showcase */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="font-serif font-black text-sm text-chocolate-900">
                  Pre-Made Luxury Bakery Themes
                </h3>
              </div>
              <span className="text-[11px] text-amber-800 font-bold">1-Click Apply</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRESET_THEMES.map((preset) => {
                const isActive = formTheme.background_image_url === preset.config.background_image_url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.config)}
                    className={`rounded-2xl border-2 overflow-hidden text-left transition-all p-2 flex flex-col justify-between group ${
                      isActive 
                        ? "border-amber-500 bg-amber-100/60 shadow-md scale-[1.02]" 
                        : "border-amber-200/80 bg-amber-50/40 hover:bg-amber-50"
                    }`}
                  >
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-amber-100 mb-2 relative">
                      <img
                        src={preset.previewUrl}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center gap-1 shadow">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-chocolate-900 truncate">{preset.name}</p>
                      <p className="text-[10px] text-amber-800/80">{preset.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step B: Upload Custom Background Image */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-black text-sm text-chocolate-900">
                Upload Custom Store / Bakery Background Photo
              </h3>
            </div>

            <ImageUploadDropzone
              value={formTheme.background_image_url || ""}
              onChange={(url) => setFormTheme((prev) => ({ ...prev, background_image_url: url, background_type: "image" }))}
              label="Background Image (Upload local photo or paste web link)"
            />
          </div>

          {/* Step C: Dark Overlay & Blur Controls */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
              <Sliders className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-black text-sm text-chocolate-900">
                Overlay Darkness & Visual Filters
              </h3>
            </div>

            <div className="space-y-4">
              {/* Overlay Darkness Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-chocolate-900">
                  <span>Overlay Darkness:</span>
                  <span className="text-amber-800 font-black">{formTheme.overlay_opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={formTheme.overlay_opacity}
                  onChange={(e) => setFormTheme((prev) => ({ ...prev, overlay_opacity: parseInt(e.target.value) || 0 }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-amber-800/70 font-semibold">
                  <span>0% (Bright / Transparent)</span>
                  <span>45% (Recommended)</span>
                  <span>90% (Deep Dark)</span>
                </div>
              </div>

              {/* Overlay Tint Color */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {[
                  { id: "chocolate", label: "Chocolate Velvet" },
                  { id: "black", label: "Midnight Black" },
                  { id: "amber", label: "Golden Amber" },
                  { id: "velvet", label: "Ruby Velvet" },
                ].map((tint) => (
                  <button
                    key={tint.id}
                    type="button"
                    onClick={() => setFormTheme((prev) => ({ ...prev, overlay_color: tint.id }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition ${
                      formTheme.overlay_color === tint.id
                        ? "bg-amber-200/80 border-amber-600 text-chocolate-950 shadow-xs font-black"
                        : "bg-white border-amber-200 text-chocolate-800 hover:bg-amber-50"
                    }`}
                  >
                    {tint.label}
                  </button>
                ))}
              </div>

              {/* Blur Level */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-chocolate-900">
                  Background Blur Level:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "none", label: "Sharp (None)" },
                    { id: "sm", label: "Subtle (Low)" },
                    { id: "md", label: "Soft Frost" },
                    { id: "lg", label: "Deep Frost" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setFormTheme((prev) => ({ ...prev, background_blur: b.id as any }))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border-2 transition text-center ${
                        formTheme.background_blur === b.id
                          ? "bg-amber-200/80 border-amber-600 text-chocolate-950 shadow-xs font-black"
                          : "bg-white border-amber-200 text-chocolate-800 hover:bg-amber-50"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Style */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-chocolate-900">
                  Login Card Style:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "white", label: "Solid White" },
                    { id: "glass", label: "Frosted Glass" },
                    { id: "dark", label: "Dark Velvet" },
                    { id: "amber", label: "Golden Amber" },
                  ].map((cs) => (
                    <button
                      key={cs.id}
                      type="button"
                      onClick={() => setFormTheme((prev) => ({ ...prev, card_style: cs.id as any }))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border-2 transition text-center ${
                        formTheme.card_style === cs.id
                          ? "bg-amber-200/80 border-amber-600 text-chocolate-950 shadow-xs font-black"
                          : "bg-white border-amber-200 text-chocolate-800 hover:bg-amber-50"
                      }`}
                    >
                      {cs.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Step D: Welcome Headlines & Text */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
              <Type className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-black text-sm text-chocolate-900">
                Custom Welcome Headlines & Tagline
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Top Badge Label
                </label>
                <input
                  type="text"
                  value={formTheme.badge_text || ""}
                  onChange={(e) => setFormTheme((prev) => ({ ...prev, badge_text: e.target.value }))}
                  placeholder="e.g. FRESH BAKERY COUNTER & SWEET STUDIO"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Main Title / Store Name
                </label>
                <input
                  type="text"
                  value={formTheme.headline || ""}
                  onChange={(e) => setFormTheme((prev) => ({ ...prev, headline: e.target.value }))}
                  placeholder="e.g. Welcome to Hai Backery"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-black text-chocolate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Sub-Tagline Description
                </label>
                <input
                  type="text"
                  value={formTheme.tagline || ""}
                  onChange={(e) => setFormTheme((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Authentic Pure Ghee Sweets & Custom Designer Cakes • Barrage Center"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-medium text-chocolate-900"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition transform hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? "Theme Successfully Published!" : "Save & Publish Changes"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset(PRESET_THEMES[0].config)}
              className="py-3.5 px-4 rounded-2xl border-2 border-amber-300 bg-white hover:bg-amber-50 text-chocolate-900 font-bold text-xs flex items-center gap-1.5 transition"
              title="Reset to default theme"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>

        {/* Right Column: Interactive Live Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-chocolate-900">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Live Customer Login Preview</span>
            </div>

            <div className="flex items-center gap-1 bg-amber-100/80 p-1 rounded-xl border border-amber-300">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                  previewDevice === "desktop" ? "bg-white text-chocolate-950 shadow-xs" : "text-amber-900"
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                  previewDevice === "mobile" ? "bg-white text-chocolate-950 shadow-xs" : "text-amber-900"
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Frame */}
          <div 
            className={`rounded-3xl border-4 border-chocolate-950 overflow-hidden shadow-2xl transition-all duration-300 relative mx-auto ${
              previewDevice === "mobile" ? "max-w-xs aspect-[9/16]" : "w-full aspect-[4/3]"
            }`}
          >
            {/* Background & Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300 flex items-center justify-center p-4"
              style={{
                backgroundImage: formTheme.background_image_url 
                  ? `url('${formTheme.background_image_url}')` 
                  : "linear-gradient(to bottom right, #fcf4e8, #fdebd0, #f8d7da)",
              }}
            >
              <div 
                className="absolute inset-0 transition-all duration-300"
                style={{ backgroundColor: getOverlayColor() }}
              />

              {/* Login Mockup Card */}
              <div className={`w-full rounded-2xl p-5 relative z-10 space-y-3.5 text-center ${getCardClasses()}`}>
                
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white mx-auto shadow-md">
                  <Cake className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  {formTheme.badge_text && (
                    <span className="inline-block text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30">
                      {formTheme.badge_text}
                    </span>
                  )}
                  <h4 className="font-serif font-black text-base tracking-tight">
                    {formTheme.headline || "Hai Backery"}
                  </h4>
                  <p className="text-[10px] opacity-80 line-clamp-2 leading-relaxed">
                    {formTheme.tagline || "Authentic Sweets & Custom Designer Cakes • Barrage Center"}
                  </p>
                </div>

                <div className="py-2.5 px-3 bg-white border border-amber-300 rounded-xl text-xs font-black text-gray-800 flex items-center justify-center gap-2 shadow-xs">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="text-[11px]">Sign in with Google</span>
                </div>

                <p className="text-[9px] opacity-60">
                  Admin: haibackery@gmail.com
                </p>
              </div>

            </div>
          </div>

          <p className="text-[11px] text-center text-amber-800/80 font-medium">
            💡 Changes saved here apply immediately to all visiting customers at <strong>/login</strong>.
          </p>

        </div>

      </div>

    </div>
  );
}
