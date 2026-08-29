"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Scale, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Save, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useBakeryStore, BulkCatalogItem } from "@/lib/store/bakery-store";
import { formatCurrency } from "@/lib/utils";

export default function AdminBulkItemsPage() {
  const { 
    bulkCatalog, 
    addBulkItem, 
    updateBulkItem, 
    deleteBulkItem, 
    toggleBulkItemAvailability 
  } = useBakeryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BulkCatalogItem | null>(null);

  // New Sweet Form State
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newUnit, setNewUnit] = useState("kg");
  const [newDescription, setNewDescription] = useState("");

  // Inline edited values state: { [id]: { name: string; rate: number } }
  const [editedValues, setEditedValues] = useState<{
    [id: string]: { name: string; rate: number };
  }>({});
  const [savedRowId, setSavedRowId] = useState<string | null>(null);

  // Handle inline price & name change
  const handleInlineChange = (id: string, field: "name" | "rate", value: any) => {
    const original = bulkCatalog.find((item) => item.id === id);
    if (!original) return;

    setEditedValues((prev) => {
      const current = prev[id] || { name: original.name, rate: original.rate_per_kg };
      return {
        ...prev,
        [id]: {
          ...current,
          [field]: field === "rate" ? Math.max(0, parseFloat(value) || 0) : value,
        },
      };
    });
  };

  // Save inline row changes
  const handleSaveRow = async (id: string) => {
    const changes = editedValues[id];
    if (!changes) return;

    await updateBulkItem(id, {
      name: changes.name.trim(),
      rate_per_kg: changes.rate,
    });

    setSavedRowId(id);
    setTimeout(() => setSavedRowId(null), 1500);
  };

  // Create new sweet item
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRate) {
      alert("Please provide Sweet Name and Fixed Rate per KG.");
      return;
    }

    const rateNum = parseFloat(newRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      alert("Please enter a valid rate greater than 0.");
      return;
    }

    await addBulkItem(newName.trim(), rateNum, newUnit, newDescription.trim());

    setNewName("");
    setNewRate("");
    setNewDescription("");
    setIsAddModalOpen(false);
  };

  // Filtered bulk items
  const filteredItems = bulkCatalog.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = bulkCatalog.filter((it) => it.is_available).length;
  const avgRate = bulkCatalog.length > 0
    ? Math.round(bulkCatalog.reduce((sum, it) => sum + it.rate_per_kg, 0) / bulkCatalog.length)
    : 0;

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header & Summary Stats */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
              <Scale className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Bulk Orders Management</span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-chocolate-900">
              Bulk Sweets & KG Rates Manager
            </h1>
            <p className="text-xs text-amber-800/80 max-w-2xl">
              Control the sweet names, pricing per KG, and availability for customer event orders. All rates set here are strictly fixed and locked on the customer Bulk Order Calculator.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/bulk-orders"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-chocolate-900 text-xs font-black border border-amber-300 flex items-center gap-1.5 transition"
            >
              <span>Preview Customer Calculator</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
            </Link>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/25 flex items-center gap-2 transition transform hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Bulk Sweet</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-amber-100">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
            <p className="text-xs font-bold text-amber-800">Total Bulk Sweets</p>
            <p className="text-2xl font-black text-chocolate-900 font-serif">{bulkCatalog.length}</p>
            <p className="text-[10px] text-amber-700/80">Available in customer dropdown</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <p className="text-xs font-bold text-emerald-800">Active / In-Stock Sweets</p>
            <p className="text-2xl font-black text-emerald-900 font-serif">{activeCount}</p>
            <p className="text-[10px] text-emerald-700/80">Customers can order now</p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-1">
            <p className="text-xs font-bold text-orange-800">Average Rate / KG</p>
            <p className="text-2xl font-black text-chocolate-900 font-serif">₹{avgRate} / kg</p>
            <p className="text-[10px] text-orange-700/80">Across sweet menu catalog</p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Sweet Catalog Table */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 space-y-6">
        
        {/* Search & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-100">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search sweet name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-amber-50/40 font-medium text-chocolate-900"
            />
            <Search className="w-4 h-4 text-amber-700 absolute left-3 top-3" />
          </div>

          <p className="text-xs text-amber-800 font-semibold">
            Showing <strong>{filteredItems.length}</strong> of {bulkCatalog.length} bulk sweet items
          </p>
        </div>

        {/* Live Editable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/90 border-b border-amber-200 text-[11px] font-black text-chocolate-900 uppercase tracking-wider">
                <th className="py-3.5 px-4">Sweet / Bakery Item Name</th>
                <th className="py-3.5 px-4">Fixed Rate / KG (₹)</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                <th className="py-3.5 px-4 text-center">Customer Visibility</th>
                <th className="py-3.5 px-4">Description / Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-amber-100 text-xs">
              {filteredItems.map((item) => {
                const currentEdit = editedValues[item.id];
                const activeName = currentEdit !== undefined ? currentEdit.name : item.name;
                const activeRate = currentEdit !== undefined ? currentEdit.rate : item.rate_per_kg;

                const isModified =
                  currentEdit !== undefined &&
                  (currentEdit.name !== item.name || currentEdit.rate !== item.rate_per_kg);
                const isJustSaved = savedRowId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition">
                    
                    {/* Sweet Name Input */}
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={activeName}
                        onChange={(e) => handleInlineChange(item.id, "name", e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900 text-xs shadow-inner"
                      />
                    </td>

                    {/* Fixed Rate / KG Input */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 w-32">
                        <span className="font-bold text-amber-800 text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={activeRate}
                          onChange={(e) => handleInlineChange(item.id, "rate", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-black text-chocolate-900 text-xs text-right shadow-inner"
                        />
                        <span className="text-[10px] text-amber-700 font-bold">/kg</span>
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4 text-center font-bold text-chocolate-900">
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[11px]">
                        {item.unit}
                      </span>
                    </td>

                    {/* Customer Visibility Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleBulkItemAvailability(item.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black border transition ${
                          item.is_available
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {item.is_available ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-700" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-500" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-amber-900/80 max-w-xs truncate text-[11px]">
                      {item.description || "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isModified ? (
                          <button
                            onClick={() => handleSaveRow(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1 transition animate-pulse"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        ) : isJustSaved ? (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Saved</span>
                          </span>
                        ) : null}

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove "${item.name}" from the bulk sweet menu?`)) {
                              deleteBulkItem(item.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition"
                          title="Delete sweet from catalog"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* 3. Add Bulk Sweet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-2xl space-y-6 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-chocolate-900">
                    Add New Bulk Sweet Item
                  </h3>
                  <p className="text-xs text-amber-800/80">
                    Appears immediately on the customer Bulk Order Calculator
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:bg-amber-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Sweet / Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Ghee Dry Fruit Halwa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Fixed Rate / KG (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 520"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-black text-chocolate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Unit *
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="Box (50 pcs)">Box (50 pcs)</option>
                    <option value="Tray (100 pcs)">Tray (100 pcs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Description / Highlights (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Made with pure cow ghee, premium cashews & organic cardamom"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow-md transition"
                >
                  Add Sweet to Catalog
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
