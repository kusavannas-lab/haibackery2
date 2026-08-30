"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Cake, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Lock,
  ArrowRight,
  User,
  ShoppingBag
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { GOOGLE_CLIENT_ID } from "@/lib/google-auth";

export default function GlobalAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, loginWithGoogle, loginTheme } = useBakeryStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle Google OAuth token in URL hash
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setIsSubmitting(true);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data && data.email) {
              const isAdminEmail = data.email.toLowerCase().trim() === "haibackery@gmail.com";
              loginWithGoogle(data.email, data.name || (isAdminEmail ? "Shekhar Rao" : "Valued Customer"));
              setSuccessMsg(`Google Authentication Successful: ${data.email}`);
              window.history.replaceState(null, "", window.location.pathname);
              setTimeout(() => {
                if (isAdminEmail) {
                  router.push("/admin/executive");
                } else {
                  router.push("/");
                }
              }, 500);
            }
          })
          .catch((err) => {
            console.error("Google userinfo fetch error:", err);
            setErrorMsg("Could not verify Google account details. Please try again.");
          })
          .finally(() => setIsSubmitting(false));
      }
    }
  }, [router, loginWithGoogle]);

  // If user is already logged in as Admin and on root, send them to admin dashboard
  useEffect(() => {
    if (user.isLoggedIn && isAdmin && pathname === "/") {
      router.push("/admin/executive");
    }
  }, [user.isLoggedIn, isAdmin, pathname, router]);

  // Theme Overlay Color
  const getOverlayColor = () => {
    const opacity = (loginTheme.overlay_opacity ?? 45) / 100;
    switch (loginTheme.overlay_color) {
      case "black":
        return `rgba(0, 0, 0, ${opacity})`;
      case "amber":
        return `rgba(66, 32, 6, ${opacity})`;
      case "velvet":
        return `rgba(45, 10, 20, ${opacity})`;
      case "chocolate":
      default:
        return `rgba(34, 13, 5, ${opacity})`;
    }
  };

  // Card Class by theme
  const getCardClasses = () => {
    switch (loginTheme.card_style) {
      case "glass":
        return "bg-white/90 backdrop-blur-md border-2 border-white/60 text-chocolate-900 shadow-2xl";
      case "dark":
        return "bg-[#1f0c05]/95 backdrop-blur-md border-2 border-amber-500/50 text-amber-50 shadow-2xl";
      case "amber":
        return "bg-amber-50/95 border-2 border-amber-300 text-chocolate-900 shadow-2xl";
      case "white":
      default:
        return "bg-white border-2 border-amber-200/90 text-chocolate-900 shadow-2xl";
    }
  };

  // Blur Class
  const getBlurClass = () => {
    switch (loginTheme.background_blur) {
      case "sm": return "backdrop-blur-xs";
      case "md": return "backdrop-blur-sm";
      case "lg": return "backdrop-blur-md";
      case "none":
      default: return "";
    }
  };

  // If user is loading session from localStorage / supabase, show clean loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcf4e8] via-[#fff7ed] to-[#fdebd0] flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30 animate-pulse">
            <Cake className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="font-serif font-black text-xl text-chocolate-900">Hai Backery</h2>
            <p className="text-xs text-amber-800/80">Checking Authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔒 MANDATORY GLOBAL LOGIN GATE: If not logged in, show customizable login screen
  if (!user.isLoggedIn) {
    const handleLaunchGoogleOAuth = () => {
      setIsSubmitting(true);
      setErrorMsg("");
      const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
      const redirectUri = window.location.origin + "/login";

      const options = {
        redirect_uri: redirectUri,
        client_id: GOOGLE_CLIENT_ID,
        response_type: "token",
        prompt: "select_account",
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      };

      const qs = new URLSearchParams(options);
      window.location.assign(`${rootUrl}?${qs.toString()}`);
    };

    return (
      <div 
        className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{
          backgroundImage: loginTheme.background_image_url 
            ? `url('${loginTheme.background_image_url}')` 
            : "linear-gradient(to bottom right, #fcf4e8, #fdebd0, #f8d7da)",
        }}
      >
        {/* Background Dark Overlay */}
        <div 
          className={`absolute inset-0 transition-all duration-500 ${getBlurClass()}`}
          style={{ backgroundColor: getOverlayColor() }}
        />

        <div className={`w-full max-w-md rounded-3xl p-8 sm:p-10 relative z-10 space-y-6 text-center animate-in zoom-in-95 duration-200 ${getCardClasses()}`}>
          
          {/* Logo & Headline */}
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 via-bakery-600 to-amber-700 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/25">
              <Cake className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              {loginTheme.badge_text && (
                <span className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30">
                  {loginTheme.badge_text}
                </span>
              )}
              <h1 className="font-serif font-black text-3xl tracking-tight">
                {loginTheme.headline || "Hai Backery"}
              </h1>
              <p className="text-xs opacity-80 max-w-xs mx-auto leading-relaxed">
                {loginTheme.tagline || "Authentic Sweets & Custom Designer Cakes • Barrage Center"}
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 text-left animate-pulse">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Authentication Actions */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleLaunchGoogleOAuth}
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-white border-2 border-amber-400 hover:border-amber-500 rounded-2xl text-sm font-black text-gray-800 hover:bg-amber-50/50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
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
              <span>{isSubmitting ? "Connecting to Google..." : "Sign in with Google"}</span>
            </button>

            <p className="text-[11px] text-center opacity-70 font-medium pt-1">
              Store Admin: Sign in with <strong>haibackery@gmail.com</strong>
            </p>
          </div>

        </div>

      </div>
    );
  }

  // If user is authenticated, render the application normally
  return <>{children}</>;
}
