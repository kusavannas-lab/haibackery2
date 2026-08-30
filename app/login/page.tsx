"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Cake, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Store
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { ADMIN_PHONE } from "@/lib/whatsapp";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAdmin, loginWithEmail, loginWithGoogle } = useBakeryStore();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // If already admin, redirect to executive management
  useEffect(() => {
    if (user.isLoggedIn && isAdmin) {
      router.push("/admin/executive");
    }
  }, [user, isAdmin, router]);

  // Handle Google OAuth token return in URL hash (#access_token=...)
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
              const isAdminEmail = data.email.toLowerCase() === "haibackery@gmail.com";
              loginWithGoogle(data.email, data.name || (isAdminEmail ? "Shekhar Rao" : "Customer"));
              setSuccessMsg(`Authenticated via Google: ${data.email}`);
              setTimeout(() => {
                if (isAdminEmail) {
                  router.push("/admin/executive");
                } else {
                  router.push("/");
                }
              }, 600);
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

  const handleLaunchGoogleOAuth = () => {
    setIsSubmitting(true);
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const clientId = "487079166794-s5t2jetkpqt71rojslm15af96c54nmkd.apps.googleusercontent.com";
    const redirectUri = window.location.origin + "/login";

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await loginWithEmail(email.trim(), name.trim());
      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          if (result.isAdmin) {
            router.push("/admin/executive");
          } else {
            router.push("/");
          }
        }, 800);
      }
    } catch (err) {
      setErrorMsg("Failed to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-amber-100/40 via-white to-amber-50">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-amber-200/80 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-500 via-bakery-600 to-amber-700 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/25">
            <Cake className="w-9 h-9" />
          </div>

          <h1 className="font-serif font-black text-3xl text-chocolate-900 tracking-tight">
            Hai <span className="text-amber-600">Backery</span>
          </h1>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Single Official Google Authentication */}
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
        </div>

      </div>
    </div>
  );
}
