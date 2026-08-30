"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  PackagePlus,
  ShoppingBag, 
  TrendingUp, 
  Cake, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Menu, 
  X,
  LogOut,
  UserCheck,
  Lock,
  AlertTriangle,
  Layers,
  Store,
  Plus,
  FolderTree,
  Scale,
  Camera,
  Palette
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface SidebarSection {
  groupTitle: string;
  items: SidebarItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAdmin, orders, photoCakes, cakeSuggestions, products, categories, bulkCatalog, loginWithGoogle, logout } = useBakeryStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === "Pending" || o.status === "Baking").length;
  const newSuggestionsCount = cakeSuggestions.filter((s) => s.status === "New").length;

  const sidebarSections: SidebarSection[] = [
    {
      groupTitle: "PRODUCT & CATALOG CONTROL",
      items: [
        {
          name: "Manage Categories",
          href: "/admin/categories",
          icon: FolderTree,
          badge: `${categories.length}`,
          badgeColor: "bg-amber-100 text-chocolate-900 border border-amber-300 font-bold",
        },
        {
          name: "Executive Product Center",
          href: "/admin/executive",
          icon: Sparkles,
        },
        {
          name: "Product Catalog & Items",
          href: "/admin/inventory",
          icon: Layers,
        },
        {
          name: "Bulk Sweets & KG Rates",
          href: "/admin/bulk-items",
          icon: Scale,
        },
        {
          name: "Photo Cake Options & Pricing",
          href: "/admin/photo-cakes",
          icon: Camera,
        },
      ],
    },
    {
      groupTitle: "ORDERS & REQUESTS",
      items: [
        {
          name: "Orders Pipeline",
          href: "/admin/orders",
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Active` : undefined,
          badgeColor: "bg-rose-600 text-white animate-pulse font-black",
        },
        {
          name: "Cake Design Suggestions",
          href: "/admin/suggestions",
          icon: Palette,
          badge: newSuggestionsCount > 0 ? `${newSuggestionsCount} New` : (cakeSuggestions.length > 0 ? `${cakeSuggestions.length}` : undefined),
          badgeColor: newSuggestionsCount > 0 ? "bg-rose-600 text-white animate-pulse font-black" : "bg-amber-100 text-chocolate-900 font-bold",
        },
      ],
    },
    {
      groupTitle: "BRANDING & CUSTOMIZATION",
      items: [
        {
          name: "Login Page & Background",
          href: "/admin/login-theme",
          icon: Palette,
        },
      ],
    },
    {
      groupTitle: "FINANCIALS & REPORTS",
      items: [
        {
          name: "Revenue & Profit Analytics",
          href: "/admin/analytics",
          icon: TrendingUp,
        },
      ],
    },
  ];

  // STRICT ACCESS GUARD: Only verified haibackery@gmail.com can enter the admin portal
  if (!user.isLoggedIn || !isAdmin) {
    const handleLaunchGoogleOAuth = () => {
      const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const clientId = "487079166794-s5t2jetkpqt71rojslm15af96c54nmkd.apps.googleusercontent.com";
      const redirectUri = typeof window !== "undefined" ? window.location.origin + "/login" : "";

      const options = {
        redirect_uri: redirectUri,
        client_id: clientId,
        response_type: "token",
        prompt: "select_account",
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      };

      const qs = new URLSearchParams(options);
      window.location.assign(`${rootUrl}?${qs.toString()}`);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#220d05] via-[#3d1809] to-[#1a0903] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border-2 border-amber-400 shadow-2xl space-y-6 text-center animate-in zoom-in-95">
          
          {/* Logo & Name */}
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30">
              <Lock className="w-8 h-8 text-white" />
            </div>

            <h1 className="font-serif font-black text-2xl text-chocolate-900 tracking-tight">
              Admin Portal <span className="text-amber-600">Restricted</span>
            </h1>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              This area is strictly restricted to the Hai Backery proprietor (<strong>haibackery@gmail.com</strong>). Please authenticate with your official Google account.
            </p>
          </div>

          {/* Official Google OAuth Verification */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleLaunchGoogleOAuth}
              className="w-full py-4 px-6 bg-white border-2 border-amber-400 hover:border-amber-500 rounded-2xl text-sm font-black text-gray-800 hover:bg-amber-50/50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition transform hover:scale-[1.01] active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Verify with Google (haibackery@gmail.com)</span>
            </button>

            <Link
              href="/"
              className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-chocolate-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Store className="w-4 h-4 text-bakery-600" />
              <span>← Return to Customer Storefront</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcf4e8] via-[#fff7ed] to-[#fdebd0] flex relative">
      
      {/* Subtle Background Golden Glow Orbs */}
      <div className="fixed top-0 right-10 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-10 left-80 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* 1. DESKTOP FIXED SIDEBAR */}
      <aside className="hidden lg:flex w-72 bg-[#1c0c05] text-white border-r-2 border-amber-900/50 flex-col justify-between shrink-0 sticky top-0 h-screen shadow-2xl z-30 overflow-y-auto">
        
        {/* Sidebar Header & Brand */}
        <div className="p-6 space-y-6">
          <Link href="/admin/executive" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-105 transition">
              <Cake className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black text-xl text-white tracking-tight">
                  Hai <span className="text-amber-400">Backery</span>
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block mt-0.5">
                👑 ADMIN PORTAL
              </span>
            </div>
          </Link>

          {/* Admin Profile Badge */}
          <div className="p-3.5 rounded-2xl bg-[#2b140a] border border-amber-700/60 flex items-center gap-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-black text-xs shadow shrink-0">
              SR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-amber-100 truncate">Shekhar Rao</p>
              <p className="text-[10px] text-amber-400/90 font-medium truncate">haibackery@gmail.com</p>
            </div>
          </div>

          {/* Quick Add Product Button */}
          <Link
            href="/admin/executive"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition transform hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </Link>

          {/* Navigation Groups */}
          <nav className="space-y-6 pt-1">
            {sidebarSections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-400/70 px-3">
                  {section.groupTitle}
                </p>
                <div className="space-y-1.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || (item.href === "/admin/executive" && pathname === "/admin");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 scale-[1.02]"
                            : "text-amber-100/80 hover:bg-[#2c1409] hover:text-white hover:translate-x-1"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-amber-400"}`} />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-amber-900/60 bg-[#140702] space-y-2">

          <button
            onClick={() => logout()}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/40 flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>

      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />
          <aside className="relative w-72 max-w-[80vw] bg-[#1c0c05] text-white flex flex-col justify-between h-full p-6 shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left duration-200">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/admin/executive" onClick={() => setMobileSidebarOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-chocolate-950 font-black shadow">
                    <Cake className="w-6 h-6" />
                  </div>
                  <span className="font-serif font-black text-lg text-white">
                    Hai Backery
                  </span>
                </Link>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-amber-200 hover:bg-chocolate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#2b140a] text-xs">
                <p className="font-bold text-white">Shekhar Rao</p>
                <p className="text-[10px] text-amber-400">haibackery@gmail.com</p>
              </div>

              <Link
                href="/admin/executive"
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs shadow flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Product</span>
              </Link>

              <nav className="space-y-6">
                {sidebarSections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/70 px-2">
                      {section.groupTitle}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || (item.href === "/admin/executive" && pathname === "/admin");
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                              isActive
                                ? "bg-amber-500 text-chocolate-950 shadow"
                                : "text-amber-100 hover:bg-chocolate-900"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </div>
                            {item.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top Mobile Bar */}
        <header className="lg:hidden bg-[#1c0c05] text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl bg-chocolate-900 text-amber-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-serif font-bold text-sm text-white">
              Hai Backery Admin
            </span>
          </div>
        </header>

        {/* Dynamic Admin View */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
