"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Save,
  X,
  ExternalLink,
  Eye,
  Calendar,
  Layers,
  Scale,
  DollarSign,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Check,
  RotateCcw,
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { CustomerCakeSuggestion, CakeSuggestionStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_PHONE } from "@/lib/whatsapp";

const STATUS_COLORS: Record<CakeSuggestionStatus, { bg: string; text: string; border: string }> = {
  New: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
  Reviewing: { bg: "bg-amber-100", text: "text-amber-900", border: "border-amber-300" },
  Quoted: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  Accepted: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" },
  Completed: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
  Declined: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const ALL_STATUSES: CakeSuggestionStatus[] = [
  "New",
  "Reviewing",
  "Quoted",
  "Accepted",
  "Completed",
  "Declined",
];

export default function AdminCakeSuggestionsPage() {
  const { cakeSuggestions, updateSuggestionStatus, deleteCakeSuggestion } = useBakeryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  // Inline editing state: { [id]: { price: string; notes: string } }
  const [editingValues, setEditingValues] = useState<{
    [id: string]: { price: string; notes: string };
  }>({});
  const [savedRowId, setSavedRowId] = useState<string | null>(null);

  const handlePriceChange = (id: string, val: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [id]: {
        price: val,
        notes: prev[id]?.notes !== undefined ? prev[id].notes : cakeSuggestions.find((s) => s.id === id)?.admin_notes || "",
      },
    }));
  };

  const handleNotesChange = (id: string, val: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [id]: {
        price: prev[id]?.price !== undefined ? prev[id].price : (cakeSuggestions.find((s) => s.id === id)?.quoted_price?.toString() || ""),
        notes: val,
      },
    }));
  };

  const handleSaveQuotation = async (sug: CustomerCakeSuggestion) => {
    const edit = editingValues[sug.id];
    const priceNum = edit?.price ? parseFloat(edit.price) : sug.quoted_price;
    const notesStr = edit?.notes !== undefined ? edit.notes : sug.admin_notes;

    const nextStatus: CakeSuggestionStatus = priceNum && priceNum > 0 && sug.status === "New" ? "Quoted" : sug.status;

    await updateSuggestionStatus(sug.id, nextStatus, priceNum, notesStr);
    setSavedRowId(sug.id);
    setTimeout(() => setSavedRowId(null), 1500);
  };

  const handleStatusSelect = async (id: string, status: CakeSuggestionStatus) => {
    const sug = cakeSuggestions.find((s) => s.id === id);
    await updateSuggestionStatus(id, status, sug?.quoted_price, sug?.admin_notes);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this custom cake request?")) {
      await deleteCakeSuggestion(id);
    }
  };

  // Direct WhatsApp Link to Customer
  const getCustomerWhatsAppLink = (sug: CustomerCakeSuggestion) => {
    const cleanPhone = sug.customer_phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91") && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;

    const quotedText = sug.quoted_price && sug.quoted_price > 0 ? `\n💰 *Estimated Quotation:* ₹${sug.quoted_price}` : "";
    const message = `Namaste ${sug.customer_name} garu! 🙏\n` +
      `This is Shekhar Rao from *Hai Backery (Bommika)*.\n` +
      `Regarding your Custom Cake Request (*ID: ${sug.id}*) for *${sug.occasion || "Celebration"}* on *${sug.needed_date}*:\n` +
      `🍰 *Flavor & Weight:* ${sug.preferred_flavor} (${sug.estimated_weight})\n` +
      quotedText +
      `\nWe have reviewed your design reference photo. Please let us know if you would like us to start baking!`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  // Metrics
  const totalCount = cakeSuggestions.length;
  const newCount = cakeSuggestions.filter((s) => s.status === "New").length;
  const quotedCount = cakeSuggestions.filter((s) => s.status === "Quoted").length;
  const acceptedCount = cakeSuggestions.filter((s) => s.status === "Accepted").length;
  const completedCount = cakeSuggestions.filter((s) => s.status === "Completed").length;

  // Filtered List
  const filteredSuggestions = cakeSuggestions.filter((sug) => {
    const matchesSearch =
      sug.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sug.customer_phone.includes(searchQuery) ||
      sug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sug.occasion && sug.occasion.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sug.preferred_flavor && sug.preferred_flavor.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === "all" || sug.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header & Quick Actions */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-bakery-900 text-xs font-bold">
              <Camera className="w-3.5 h-3.5 text-bakery-600" />
              Customer Custom Design Inquiries
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-chocolate-900 tracking-tight">
              Customer Cake Suggestions & Requests
            </h1>
            <p className="text-xs text-amber-800/80">
              Customers upload reference photos and describe custom cakes here. Quote prices and confirm baking on WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/custom-cake"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-chocolate-900 font-bold text-xs border border-amber-300 flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-bakery-600" />
              <span>Customer Design Page</span>
            </Link>
          </div>
        </div>

        {/* 2. Metrics KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Total Received</span>
            <p className="text-2xl font-black text-chocolate-900">{totalCount}</p>
          </div>

          <div className={`p-4 rounded-2xl border text-center space-y-1 ${newCount > 0 ? 'bg-rose-50 border-rose-300 shadow-sm' : 'bg-amber-50/60 border-amber-200'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${newCount > 0 ? 'text-rose-700' : 'text-amber-800'}`}>
              🔴 New / Unreviewed
            </span>
            <p className={`text-2xl font-black ${newCount > 0 ? 'text-rose-700' : 'text-chocolate-900'}`}>{newCount}</p>
          </div>

          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Price Quoted</span>
            <p className="text-2xl font-black text-blue-900">{quotedCount}</p>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Accepted / Baking</span>
            <p className="text-2xl font-black text-emerald-900">{acceptedCount}</p>
          </div>

          <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Completed</span>
            <p className="text-2xl font-black text-gray-800">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-amber-800/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone, flavor, theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-medium text-chocolate-900"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedStatus === "all"
                  ? "bg-chocolate-900 text-white shadow-sm"
                  : "bg-amber-50 text-chocolate-900 hover:bg-amber-100"
              }`}
            >
              All ({cakeSuggestions.length})
            </button>

            {ALL_STATUSES.map((st) => {
              const count = cakeSuggestions.filter((s) => s.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                    selectedStatus === st
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-amber-50 text-chocolate-900 hover:bg-amber-100"
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 4. Requests Feed & Cards */}
      {filteredSuggestions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-amber-300 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center text-amber-700 mx-auto shadow-inner">
            <Camera className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <p className="text-lg font-serif font-bold text-chocolate-900">
              No Cake Suggestions Found
            </p>
            <p className="text-xs text-amber-800/80 leading-relaxed">
              {searchQuery || selectedStatus !== "all"
                ? "No custom requests match your current filters."
                : "When customers upload cake design ideas on the Customer Studio, they will appear here in real time."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/custom-cake"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
            >
              <span>Test Customer Design Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSuggestions.map((sug) => {
            const currentEdit = editingValues[sug.id];
            const currentPrice = currentEdit?.price !== undefined ? currentEdit.price : (sug.quoted_price?.toString() || "");
            const currentNotes = currentEdit?.notes !== undefined ? currentEdit.notes : (sug.admin_notes || "");
            const isRowSaved = savedRowId === sug.id;

            return (
              <div
                key={sug.id}
                className="bg-white rounded-3xl border-2 border-amber-200 shadow-md p-6 space-y-5 hover:shadow-lg transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Top Bar: ID, Date, Status */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-100 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-bakery-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                        {sug.id}
                      </span>
                      <span className="text-[11px] text-amber-800/70 font-semibold">
                        {new Date(sug.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Selector */}
                      <select
                        value={sug.status}
                        onChange={(e) => handleStatusSelect(sug.id, e.target.value as CakeSuggestionStatus)}
                        className={`text-xs font-black px-3 py-1 rounded-xl border-2 cursor-pointer focus:outline-none ${
                          STATUS_COLORS[sug.status]?.bg || "bg-amber-50"
                        } ${STATUS_COLORS[sug.status]?.text || "text-chocolate-900"} ${
                          STATUS_COLORS[sug.status]?.border || "border-amber-300"
                        }`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDelete(sug.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete this request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customer Info & Occasion Badges */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif font-black text-lg text-chocolate-900">
                        {sug.customer_name}
                      </h3>
                      <div className="flex items-center gap-3 pt-0.5 text-xs text-amber-900">
                        <span className="font-bold flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-600" />
                          {sug.customer_phone}
                        </span>
                        {sug.occasion && (
                          <span className="text-[11px] font-bold bg-amber-100 text-bakery-900 px-2 py-0.5 rounded-md">
                            {sug.occasion}
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={getCustomerWhatsAppLink(sug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow transition shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Image & Description Split */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                    
                    {/* Reference Photo Thumbnail (Click to open full zoom) */}
                    <div className="sm:col-span-5 relative group cursor-pointer" onClick={() => setActiveModalImage(sug.image_url)}>
                      <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-amber-300 shadow-sm bg-amber-50 relative">
                        <img
                          src={sug.image_url}
                          alt="Customer Reference"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                          <Eye className="w-4 h-4" />
                          <span>View Full Photo</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-800 text-center block pt-1 font-bold">
                        🔍 Click to Zoom Photo
                      </span>
                    </div>

                    {/* Customer Design Description */}
                    <div className="sm:col-span-7 space-y-2.5">
                      <div className="space-y-1 bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                        <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                          Customer Design Description:
                        </span>
                        <p className="text-xs text-chocolate-900 font-medium italic leading-relaxed">
                          &quot;{sug.description}&quot;
                        </p>
                      </div>

                      {/* Cake Specs Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-amber-100">
                        <div>
                          <span className="text-[10px] text-amber-700 block font-bold">FLAVOR</span>
                          <span className="font-bold text-chocolate-900">{sug.preferred_flavor || "Chef Choice"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-700 block font-bold">WEIGHT</span>
                          <span className="font-bold text-chocolate-900">{sug.estimated_weight || "1 kg"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-700 block font-bold">DATE NEEDED</span>
                          <span className="font-bold text-chocolate-900">{sug.needed_date || "Not specified"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-700 block font-bold">EGGLESS?</span>
                          <span className={`font-bold ${sug.is_eggless ? 'text-emerald-700' : 'text-chocolate-900'}`}>
                            {sug.is_eggless ? "Yes (Eggless)" : "Regular"}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Bottom Quotation & Chef Notes Control */}
                <div className="pt-3 border-t border-amber-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    
                    {/* Price Quote Input */}
                    <div className="sm:col-span-4 space-y-1">
                      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-wider">
                        Quote Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1200"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(sug.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:outline-none bg-white font-black text-chocolate-900"
                      />
                    </div>

                    {/* Admin / Chef Notes */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="block text-[10px] font-black text-amber-900 uppercase tracking-wider">
                        Bakery / Chef Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Blue cream, fondant dino toppers"
                        value={currentNotes}
                        onChange={(e) => handleNotesChange(sug.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-medium"
                      />
                    </div>

                    {/* Save Quote Button */}
                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={() => handleSaveQuotation(sug)}
                        className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition ${
                          isRowSaved
                            ? "bg-emerald-600 text-white"
                            : "bg-chocolate-900 hover:bg-chocolate-800 text-white"
                        }`}
                      >
                        {isRowSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Quote</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. Full Image Modal Viewer */}
      {activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] shadow-2xl relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-chocolate-900 text-white flex items-center justify-between">
              <span className="font-serif font-bold text-sm">Customer Reference Cake Photo</span>
              <button
                type="button"
                onClick={() => setActiveModalImage(null)}
                className="p-1 rounded-lg text-amber-200 hover:bg-chocolate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-amber-50/50">
              <img
                src={activeModalImage}
                alt="Full Size Reference"
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg border-2 border-amber-200"
              />
            </div>

            <div className="p-4 bg-white border-t border-amber-100 flex items-center justify-between text-xs">
              <span className="text-amber-900 font-semibold">Inspect colors, theme toppers, and tier structure.</span>
              <button
                type="button"
                onClick={() => setActiveModalImage(null)}
                className="px-4 py-2 bg-amber-100 text-chocolate-900 font-bold rounded-xl hover:bg-amber-200 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
