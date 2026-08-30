"use client";

import React, { useState } from "react";
import { Sparkles, Cake, Heart, Camera } from "lucide-react";

interface PhotoCakePreviewProps {
  flavor: string;
  weight: string;
  eggless: boolean;
  imageUrl: string;
  message: string;
  icingColor?: string;
  shape?: string;
}

export default function PhotoCakePreview({
  flavor,
  weight,
  eggless,
  imageUrl,
  message,
  shape = "Round",
}: PhotoCakePreviewProps) {
  const isSquare = shape?.toLowerCase().includes("square");
  const isHeart = shape?.toLowerCase().includes("heart");
  const [imgError, setImgError] = useState(false);

  // Reset img error if url changes
  React.useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  // Flavor specific cake colors and borders
  const getFlavorStyles = () => {
    const f = flavor.toLowerCase();
    if (f.includes("truffle") || f.includes("chocolate")) {
      return {
        cakeBg: "from-[#2A1208] via-[#3E1C10] to-[#1F0A04]",
        borderRing: "border-[#522515]",
        creamBeads: "border-amber-100",
        defaultMsgColor: "#FFE8D6",
        badgeBg: "bg-[#2A1208] text-amber-200 border-[#522515]",
        standBg: "from-amber-200 via-amber-100 to-amber-300",
      };
    }
    if (f.includes("red velvet")) {
      return {
        cakeBg: "from-[#5E091C] via-[#850D28] to-[#3B0511]",
        borderRing: "border-[#A31636]",
        creamBeads: "border-white",
        defaultMsgColor: "#FFFFFF",
        badgeBg: "bg-[#5E091C] text-rose-100 border-[#A31636]",
        standBg: "from-rose-200 via-amber-100 to-rose-300",
      };
    }
    if (f.includes("black forest")) {
      return {
        cakeBg: "from-[#18181B] via-[#27272A] to-[#09090B]",
        borderRing: "border-[#3F3F46]",
        creamBeads: "border-white",
        defaultMsgColor: "#FFFFFF",
        badgeBg: "bg-[#18181B] text-zinc-100 border-[#3F3F46]",
        standBg: "from-zinc-200 via-stone-100 to-zinc-300",
      };
    }
    if (f.includes("butterscotch") || f.includes("mango") || f.includes("pineapple")) {
      return {
        cakeBg: "from-[#D97706] via-[#F59E0B] to-[#B45309]",
        borderRing: "border-[#FDE68A]",
        creamBeads: "border-white",
        defaultMsgColor: "#3B1E08",
        badgeBg: "bg-[#78350F] text-amber-100 border-[#F59E0B]",
        standBg: "from-amber-200 via-amber-100 to-amber-300",
      };
    }
    // Default Vanilla / Strawberry
    return {
      cakeBg: "from-[#FCD34D] via-[#FDE68A] to-[#F59E0B]",
      borderRing: "border-[#FDE68A]",
      creamBeads: "border-rose-300",
      defaultMsgColor: "#3C1A10",
      badgeBg: "bg-[#78350F] text-amber-100 border-[#FCD34D]",
      standBg: "from-amber-200 via-amber-100 to-amber-300",
    };
  };

  const style = getFlavorStyles();

  // Shape geometry
  const cakeShapeClass = isHeart
    ? "rounded-[3rem] sm:rounded-[3.5rem]"
    : isSquare
    ? "rounded-3xl sm:rounded-[2.5rem]"
    : "rounded-full";

  const photoShapeClass = isHeart
    ? "rounded-[2rem] sm:rounded-[2.5rem]"
    : isSquare
    ? "rounded-2xl sm:rounded-3xl"
    : "rounded-full";

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 3D Cake Display Canvas Container */}
      <div className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] md:max-w-[380px] aspect-square flex items-center justify-center p-2 sm:p-4">
        
        {/* Decorative Golden Cake Stand Pedestal */}
        <div
          className={`absolute inset-x-3 sm:inset-x-6 bottom-1 sm:bottom-2 h-7 sm:h-9 bg-gradient-to-r ${style.standBg} ${isSquare ? "rounded-2xl" : "rounded-full"} shadow-xl border-2 sm:border-4 border-amber-300/70 -z-10`}
        />

        {/* 3D Layered Cake Base */}
        <div
          className={`relative w-full h-full ${cakeShapeClass} bg-gradient-to-b ${style.cakeBg} shadow-2xl p-3 sm:p-5 flex flex-col items-center justify-center border-4 sm:border-[6px] ${style.borderRing} transition-all duration-300 overflow-hidden`}
        >
          {/* Whipped Cream Piping Border Ring */}
          <div
            className={`absolute inset-1.5 sm:inset-2.5 ${cakeShapeClass} border-2 sm:border-4 border-dashed border-white/60 pointer-events-none opacity-85`}
          />

          {/* Top Floating Info Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center z-20 pointer-events-none gap-1">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="bg-white/95 backdrop-blur-md text-chocolate-900 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-amber-200">
                ⚖️ {weight}
              </span>
              <span className="bg-amber-100/95 backdrop-blur-md text-amber-950 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow border border-amber-300">
                {isHeart ? "❤️ Heart" : isSquare ? "⏹️ Square" : "⭕ Round"}
              </span>
            </div>

            {eggless && (
              <span className="bg-white/95 backdrop-blur-md text-emerald-800 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> 100% Eggless
              </span>
            )}
          </div>

          {/* Center Edible Photo Sugar Sheet Print */}
          <div
            className={`relative w-[68%] h-[68%] ${photoShapeClass} overflow-hidden border-2 sm:border-4 border-amber-100/95 shadow-inner bg-amber-950/40 flex items-center justify-center group`}
          >
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt="Edible Sugar Sheet Photo"
                onError={() => setImgError(true)}
                className={`w-full h-full object-cover ${photoShapeClass} transition-transform duration-300 hover:scale-105`}
              />
            ) : (
              <div className="text-center p-2 sm:p-4 flex flex-col items-center justify-center text-white/90 space-y-1">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200 animate-pulse" />
                </div>
                <p className="text-[10px] sm:text-xs font-black text-amber-100 leading-tight">
                  Your Photo Appears Here
                </p>
                <p className="text-[8px] sm:text-[9px] text-amber-200/80">
                  Select sample or upload photo below
                </p>
              </div>
            )}

            {/* Edible Sugar Sheet Gloss Sheen Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none ${photoShapeClass}`}
            />
          </div>

          {/* Written Custom Cake Message Banner */}
          <div className="absolute bottom-3.5 sm:bottom-5 inset-x-3 sm:inset-x-6 text-center z-20 pointer-events-none">
            <div className="px-2.5 sm:px-3.5 py-1 rounded-full backdrop-blur-md bg-black/60 border border-white/25 shadow-lg inline-block max-w-full">
              <p
                className="font-serif italic font-extrabold text-[10px] sm:text-xs md:text-sm tracking-wide truncate text-white"
                style={{ color: style.defaultMsgColor }}
              >
                {message ? `"${message}"` : "✍️ Your Custom Cake Message Here"}
              </p>
            </div>
          </div>

          {/* Flavor Name Pill */}
          <div
            className={`absolute bottom-0.5 sm:bottom-1 ${style.badgeBg} text-[8px] sm:text-[10px] font-bold px-2.5 sm:px-3 py-0.5 rounded-full shadow border z-30`}
          >
            🍰 {flavor}
          </div>
        </div>
      </div>
    </div>
  );
}
