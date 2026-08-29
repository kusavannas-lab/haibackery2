"use client";

import React from "react";
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
  icingColor = "#ffffff",
  shape = "Round",
}: PhotoCakePreviewProps) {
  const isSquare = shape?.toLowerCase().includes("square");
  const isHeart = shape?.toLowerCase().includes("heart");

  // Theme styling based on selected flavor
  const getFlavorStyles = () => {
    const f = flavor.toLowerCase();
    if (f.includes("truffle") || f.includes("chocolate")) {
      return {
        cakeBg: "from-amber-950 via-[#2A140E] to-[#1F0E0A]",
        borderRing: "border-amber-900/60",
        creamBeads: "bg-amber-100",
        ribbonBg: "bg-amber-900/80 text-amber-200",
        defaultMsgColor: "#FFE8D6",
      };
    }
    if (f.includes("red velvet")) {
      return {
        cakeBg: "from-rose-900 via-rose-950 to-red-950",
        borderRing: "border-rose-900/60",
        creamBeads: "bg-white",
        ribbonBg: "bg-rose-900/80 text-rose-100",
        defaultMsgColor: "#FFFFFF",
      };
    }
    if (f.includes("black forest")) {
      return {
        cakeBg: "from-zinc-900 via-stone-950 to-neutral-900",
        borderRing: "border-rose-900/40",
        creamBeads: "bg-white",
        ribbonBg: "bg-zinc-800 text-white",
        defaultMsgColor: "#FFFFFF",
      };
    }
    if (f.includes("butterscotch") || f.includes("mango") || f.includes("pineapple")) {
      return {
        cakeBg: "from-amber-400 via-amber-500 to-yellow-600",
        borderRing: "border-amber-400/80",
        creamBeads: "bg-white",
        ribbonBg: "bg-amber-800 text-amber-100",
        defaultMsgColor: "#3B1E08",
        gradStart: "#F59E0B",
        gradMid: "#D97706",
        gradEnd: "#B45309",
        svgBorder: "#FDE68A",
      };
    }
    // Default vanilla / strawberry / fresh fruit
    return {
      cakeBg: "from-amber-100 via-amber-200 to-orange-100",
      borderRing: "border-amber-300",
      creamBeads: "bg-rose-400",
      ribbonBg: "bg-chocolate-900 text-white",
      defaultMsgColor: "#3C1A10",
      gradStart: "#FEF3C7",
      gradMid: "#FDE68A",
      gradEnd: "#FCD34D",
      svgBorder: "#F59E0B",
    };
  };

  const style = getFlavorStyles();

  // SPECIAL RENDER: Dedicated Realistic Heart Cake Canvas
  if (isHeart) {
    return (
      <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center p-4">
        {/* Decorative Cake Stand */}
        <div className="absolute inset-x-6 bottom-2 h-10 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 rounded-full shadow-2xl border-4 border-amber-300/60 -z-10" />

        {/* Top Badges */}
        <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-20 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="bg-white/90 backdrop-blur-md text-chocolate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow border border-amber-100">
              ⚖️ {weight}
            </span>
            <span className="bg-rose-100 text-rose-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow border border-rose-300">
              ❤️ Heart
            </span>
          </div>

          {eggless && (
            <span className="bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> 100% Eggless
            </span>
          )}
        </div>

        {/* Main Heart Cake SVG Canvas */}
        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl overflow-visible">
          <defs>
            {/* Flavor specific cake gradient */}
            <linearGradient id="heartCakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={style.gradStart} />
              <stop offset="50%" stopColor={style.gradMid} />
              <stop offset="100%" stopColor={style.gradEnd} />
            </linearGradient>

            {/* Inner Photo Clip */}
            <clipPath id="heartPhotoClip">
              <path d="M 200,290 C 120,210 60,150 60,95 C 60,50 95,25 145,25 C 172,25 192,40 200,60 C 208,40 228,25 255,25 C 305,25 340,50 340,95 C 340,150 280,210 200,290 Z" />
            </clipPath>
          </defs>

          {/* 3D Heart Cake Base Shadow */}
          <path
            d="M 200,380 C 70,270 10,185 10,105 C 10,40 60,10 130,10 C 170,10 192,30 200,55 C 208,30 230,10 270,10 C 340,10 390,40 390,105 C 390,185 330,270 200,380 Z"
            fill="rgba(0,0,0,0.35)"
            transform="translate(0, 8)"
          />

          {/* 3D Heart Cake Base Outer Crust */}
          <path
            d="M 200,370 C 75,265 15,180 15,105 C 15,42 63,12 130,12 C 168,12 190,32 200,56 C 210,32 232,12 270,12 C 337,12 385,42 385,105 C 385,180 325,265 200,370 Z"
            fill="url(#heartCakeGrad)"
            stroke={style.svgBorder}
            strokeWidth="6"
          />

          {/* Whipped Cream Pearl Piping Border */}
          <path
            d="M 200,352 C 85,252 28,172 28,102 C 28,48 72,22 132,22 C 166,22 188,38 200,60 C 212,38 234,22 268,22 C 328,22 372,48 372,102 C 372,172 315,252 200,352 Z"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeDasharray="6 6"
            opacity="0.9"
          />

          {/* Inner Photo Sugar Sheet */}
          <g transform="translate(0, 15)">
            {imageUrl ? (
              <image
                href={imageUrl}
                x="40"
                y="10"
                width="320"
                height="300"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#heartPhotoClip)"
              />
            ) : (
              <path
                d="M 200,290 C 120,210 60,150 60,95 C 60,50 95,25 145,25 C 172,25 192,40 200,60 C 208,40 228,25 255,25 C 305,25 340,50 340,95 C 340,150 280,210 200,290 Z"
                fill="rgba(255,255,255,0.2)"
              />
            )}

            {/* Photo Frame Border */}
            <path
              d="M 200,290 C 120,210 60,150 60,95 C 60,50 95,25 145,25 C 172,25 192,40 200,60 C 208,40 228,25 255,25 C 305,25 340,50 340,95 C 340,150 280,210 200,290 Z"
              fill="none"
              stroke="#FEF3C7"
              strokeWidth="4"
              opacity="0.95"
            />
          </g>
        </svg>

        {/* Written Message */}
        <div className="absolute bottom-6 inset-x-8 text-center z-20">
          <div className="px-3 py-1 rounded-full backdrop-blur-md bg-black/40 border border-white/20 shadow-md inline-block max-w-full">
            <p
              className="font-serif italic font-bold text-xs sm:text-sm tracking-wide truncate"
              style={{ color: style.defaultMsgColor }}
            >
              {message ? `"${message}"` : "✍️ Your Custom Cake Message Here"}
            </p>
          </div>
        </div>

        {/* Flavor Badge */}
        <div className="absolute bottom-1 bg-white/95 text-chocolate-900 text-[10px] font-bold px-3 py-0.5 rounded-full shadow border border-amber-100 z-30">
          🍰 {flavor}
        </div>
      </div>
    );
  }

  // STANDARD RENDER: Round and Square Cakes
  const shapeRounded = isSquare ? "rounded-3xl" : "rounded-full";
  const innerPhotoRounded = isSquare ? "rounded-2xl" : "rounded-full";

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center p-4">
      {/* Decorative Cake Stand */}
      <div
        className={`absolute inset-x-6 bottom-2 h-10 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 ${isSquare ? "rounded-2xl" : "rounded-full"} shadow-2xl border-4 border-amber-300/60 -z-10`}
      />

      {/* Main Cake Base (Round or Square) */}
      <div
        className={`relative w-full h-full ${shapeRounded} bg-gradient-to-b ${style.cakeBg} shadow-2xl p-6 flex flex-col items-center justify-center border-8 ${style.borderRing} transition-all duration-500`}
      >
        {/* Whipped Cream Piping Border */}
        <div className={`absolute inset-2 ${shapeRounded} border-4 border-dashed border-white/60 pointer-events-none opacity-80`} />

        {/* Top Badges (Weight, Shape & Eggless) */}
        <div className="absolute top-4 left-6 right-6 flex justify-between items-center z-20 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="bg-white/90 backdrop-blur-md text-chocolate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow border border-amber-100">
              ⚖️ {weight}
            </span>
            <span className="bg-amber-100/90 backdrop-blur-md text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow border border-amber-300">
              {isSquare ? "⏹️ Square" : "⭕ Round"}
            </span>
          </div>

          {eggless && (
            <span className="bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span> 100% Eggless
            </span>
          )}
        </div>

        {/* Center Edible Photo Frame */}
        <div className={`relative w-3/5 h-3/5 ${innerPhotoRounded} overflow-hidden border-4 border-amber-100/90 shadow-inner bg-amber-50/20 flex items-center justify-center group transition-all duration-300`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Custom Cake Print"
              className={`w-full h-full object-cover ${innerPhotoRounded}`}
            />
          ) : (
            <div className="text-center p-4 flex flex-col items-center justify-center text-white/80 space-y-1">
              <Camera className="w-8 h-8 opacity-60 animate-pulse" />
              <p className="text-[11px] font-semibold">Your Photo Appears Here</p>
              <p className="text-[9px] opacity-75">Upload portrait / photo</p>
            </div>
          )}

          {/* Edible Sugar Sheet Gloss Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none ${innerPhotoRounded}`} />
        </div>

        {/* Edible Cake Written Message */}
        <div className="absolute bottom-6 inset-x-8 text-center z-20">
          <div
            className="px-3 py-1 rounded-full backdrop-blur-md bg-black/40 border border-white/20 shadow-md inline-block max-w-full"
          >
            <p
              className="font-serif italic font-bold text-xs sm:text-sm tracking-wide truncate"
              style={{ color: style.defaultMsgColor }}
            >
              {message ? `"${message}"` : "✍️ Your Custom Cake Message Here"}
            </p>
          </div>
        </div>

        {/* Flavor Badge */}
        <div className="absolute bottom-1 bg-white/95 text-chocolate-900 text-[10px] font-bold px-3 py-0.5 rounded-full shadow border border-amber-100">
          🍰 {flavor}
        </div>
      </div>
    </div>
  );
}
