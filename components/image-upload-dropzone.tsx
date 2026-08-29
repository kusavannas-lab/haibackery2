"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, AlertCircle } from "lucide-react";

interface ImageUploadDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploadDropzone({
  value,
  onChange,
  label = "Product Image",
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setErrorMessage("");
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-chocolate-900">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-amber-300 bg-amber-50/50 p-2 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-amber-100 shrink-0 border border-amber-200 shadow-sm relative">
            <img
              src={value}
              alt="Uploaded Product Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Image Uploaded Successfully</span>
            </div>
            <p className="text-[10px] text-amber-800/80 truncate mt-0.5">
              Ready for customer storefront display
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-bakery-700 hover:text-bakery-900 underline"
              >
                Replace Image
              </button>
              <span className="text-amber-300">•</span>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800"
              >
                Remove
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-orange-500 bg-orange-50/80 scale-[1.01] shadow-lg shadow-orange-500/15"
              : "border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/70"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
              isDragging ? "bg-orange-500 text-white" : "bg-amber-100 text-amber-700"
            }`}>
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <p className="text-xs font-bold text-chocolate-900">
                <span className="text-bakery-600 underline">Click to upload</span> or drag and drop image here
              </p>
              <p className="text-[10px] text-amber-800/70 mt-0.5">
                PNG, JPG, WEBP or GIF (Max up to 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {errorMessage}
        </p>
      )}

      {/* Direct URL input fallback */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px] font-bold text-amber-800/80 uppercase">Or Image URL:</span>
        <input
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}
