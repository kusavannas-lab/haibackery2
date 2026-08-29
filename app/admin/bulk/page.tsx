"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  PackagePlus, 
  Layers, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Percent,
  Check,
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { formatCurrency } from "@/lib/utils";
import ImageUploadDropzone from "@/components/image-upload-dropzone";

interface BulkRow {
  title: string;
  category_id: string;
  price: string;
  cost_price: string;
  stock_count: string;
  unit: string;
}

export default function BulkProductsPage() {
  const { categories, products, addProduct, updateProductStockCount, updateProduct } = useBakeryStore();

  // 1. Single Fast Add State
  const [singleTitle, setSingleTitle] = useState("");
  const [singleCategory, setSingleCategory] = useState(categories[0]?.id || "cat-sweets");
  const [singlePrice, setSinglePrice] = useState("");
  const [singleCostPrice, setSingleCostPrice] = useState("");
  const [singleStock, setSingleStock] = useState("30");
  const [singleUnit, setSingleUnit] = useState("500g");
  const [singleImage, setSingleImage] = useState("");
  const [singleDesc, setSingleDesc] = useState("");
  const [singleVisible, setSingleVisible] = useState(true);
  const [singleSuccess, setSingleSuccess] = useState(false);

  // 2. Bulk Add Multiple Items State (Batch rows)
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    { title: "", category_id: categories[0]?.id || "cat-sweets", price: "", cost_price: "", stock_count: "25", unit: "500g" },
    { title: "", category_id: categories[1]?.id || "cat-biscuits", price: "", cost_price: "", stock_count: "25", unit: "Pack" },
    { title: "", category_id: categories[2]?.id || "cat-cakes", price: "", cost_price: "", stock_count: "10", unit: "1 kg" },
  ]);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");

  // 3. Bulk Quick Stock / Pricing Modifier
  const [stockAdjustment, setStockAdjustment] = useState<number>(10);
  const [targetCategory, setTargetCategory] = useState<string>("all");
  const [bulkStockMsg, setBulkStockMsg] = useState("");

  // Handle Single Add
  const handleSingleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTitle.trim() || !singlePrice || !singleCostPrice) {
      alert("Please enter title, selling price, and cost price.");
      return;
    }

    const catObj = categories.find((c) => c.id === singleCategory);
    const priceNum = parseFloat(singlePrice);
    const costNum = parseFloat(singleCostPrice);
    const stockNum = parseInt(singleStock) || 20;

    await addProduct({
      title: singleTitle.trim(),
      category_id: singleCategory,
      category_name: catObj?.name || "Bakery Product",
      price: priceNum,
      cost_price: costNum,
      stock_count: stockNum,
      unit: singleUnit.trim(),
      image_url: singleImage.trim() || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
      description: singleDesc.trim(),
      in_stock: stockNum > 0,
      is_visible: singleVisible,
      is_admin_added: true,
    });

    setSingleTitle("");
    setSinglePrice("");
    setSingleCostPrice("");
    setSingleDesc("");
    setSingleImage("");
    setSingleSuccess(true);
    setTimeout(() => setSingleSuccess(false), 2000);
  };

  // Add an empty bulk row
  const addBulkRow = () => {
    setBulkRows((prev) => [
      ...prev,
      { title: "", category_id: categories[0]?.id || "cat-sweets", price: "", cost_price: "", stock_count: "20", unit: "500g" },
    ]);
  };

  // Update a bulk row field
  const updateBulkRow = (index: number, field: keyof BulkRow, value: string) => {
    setBulkRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Remove a bulk row
  const removeBulkRow = (index: number) => {
    setBulkRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Save all non-empty bulk rows
  const handleSaveBulkRows = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = bulkRows.filter((r) => r.title.trim() && r.price && r.cost_price);

    if (validRows.length === 0) {
      alert("Please fill in at least one product with Title, Price, and Cost Price.");
      return;
    }

    for (const row of validRows) {
      const catObj = categories.find((c) => c.id === row.category_id);
      const priceNum = parseFloat(row.price) || 100;
      const costNum = parseFloat(row.cost_price) || 60;
      const stockNum = parseInt(row.stock_count) || 25;

      await addProduct({
        title: row.title.trim(),
        category_id: row.category_id,
        category_name: catObj?.name || "Bakery Special",
        price: priceNum,
        cost_price: costNum,
        stock_count: stockNum,
        unit: row.unit.trim() || "Pack",
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
        description: "Freshly prepared bakery product by Shekhar Rao.",
        in_stock: stockNum > 0,
        is_visible: true,
        is_admin_added: true,
      });
    }

    setBulkSuccessMsg(`Successfully added ${validRows.length} new products to catalog!`);
    setBulkRows([
      { title: "", category_id: categories[0]?.id || "cat-sweets", price: "", cost_price: "", stock_count: "25", unit: "500g" },
      { title: "", category_id: categories[1]?.id || "cat-biscuits", price: "", cost_price: "", stock_count: "25", unit: "Pack" },
    ]);
    setTimeout(() => setBulkSuccessMsg(""), 3000);
  };

  // Bulk Apply Stock Adjustments
  const handleApplyBulkStock = async () => {
    const targetProducts = products.filter((p) =>
      targetCategory === "all" ? true : p.category_id === targetCategory
    );

    for (const p of targetProducts) {
      const currentStock = p.stock_count ?? (p.in_stock ? 25 : 0);
      const nextStock = Math.max(0, currentStock + stockAdjustment);
      await updateProductStockCount(p.id, nextStock);
    }

    setBulkStockMsg(`Updated stock for ${targetProducts.length} items (+${stockAdjustment} units each)!`);
    setTimeout(() => setBulkStockMsg(""), 3000);
  };

  const calculatedSingleMargin = (parseFloat(singlePrice) || 0) - (parseFloat(singleCostPrice) || 0);
  const calculatedSingleMarginPct = (parseFloat(singlePrice) || 0) > 0
    ? Math.round((calculatedSingleMargin / (parseFloat(singlePrice) || 1)) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Dedicated Product Manager • High Bakery</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50">
            Add Products & <span className="text-amber-400">Bulk Inventory</span>
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl leading-relaxed">
            Quickly add individual items or batch import multiple products with instant margin & stock calculations.
          </p>
        </div>

        <Link
          href="/admin/executive"
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/30 transition transform hover:scale-105 shrink-0"
        >
          <span>View Margins & Revenue Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* SECTION 1: Single Product Creator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-bakery-700 font-bold">
              1
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-chocolate-900">
                Add Single Product to Storefront
              </h2>
              <p className="text-[11px] text-amber-800/80">Full details with custom image and instant visibility control</p>
            </div>
          </div>

          {singleSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-xl flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Product Added Successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleSingleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-chocolate-900 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pure Ghee Cashew Halwa"
                value={singleTitle}
                onChange={(e) => setSingleTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-900 mb-1">
                Category *
              </label>
              <select
                value={singleCategory}
                onChange={(e) => setSingleCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-900 mb-1">
                Unit / Size *
              </label>
              <input
                type="text"
                placeholder="e.g. 500g, 1 kg, Box of 10"
                value={singleUnit}
                onChange={(e) => setSingleUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-900 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 480"
                value={singlePrice}
                onChange={(e) => setSinglePrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-900 mb-1">
                Cost Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 300"
                value={singleCostPrice}
                onChange={(e) => setSingleCostPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-chocolate-900 mb-1">
                Available Stock Units *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 30"
                value={singleStock}
                onChange={(e) => setSingleStock(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
              />
            </div>

            {/* Margin Preview */}
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex flex-col justify-center">
              <span className="text-[10px] text-amber-800 font-bold uppercase">Calculated Profit Margin</span>
              <span className="text-sm font-extrabold text-emerald-700">
                +{formatCurrency(calculatedSingleMargin)} ({calculatedSingleMarginPct}%)
              </span>
            </div>

          </div>

          <div className="space-y-4">
            <ImageUploadDropzone
              value={singleImage}
              onChange={setSingleImage}
              label="Product Photo (Drag & Drop or Click to Upload)"
            />

            <div>
              <label className="block text-xs font-bold text-chocolate-900 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Made fresh every morning with pure ghee"
                value={singleDesc}
                onChange={(e) => setSingleDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-chocolate-900 cursor-pointer">
              <input
                type="checkbox"
                checked={singleVisible}
                onChange={(e) => setSingleVisible(e.target.checked)}
                className="rounded text-bakery-600 focus:ring-bakery-500 w-4 h-4"
              />
              <span>Display on Live Customer Storefront</span>
            </label>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-bakery-600 to-amber-600 hover:from-amber-600 hover:to-bakery-700 text-white font-extrabold text-xs shadow-md transition"
            >
              + Add Product to Store
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Bulk Multi-Product Batch Importer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-bakery-700 font-bold">
              2
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-chocolate-900">
                Bulk Batch Product Importer
              </h2>
              <p className="text-[11px] text-amber-800/80">Add multiple bakery products at once in a single click</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addBulkRow}
              className="px-3.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-bakery-900 font-bold text-xs flex items-center gap-1 border border-amber-300 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Row</span>
            </button>
          </div>
        </div>

        {bulkSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bulkSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveBulkRows} className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/80 border-b border-amber-200 text-[10px] font-extrabold text-chocolate-900 uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product Title *</th>
                  <th className="py-2.5 px-3">Category *</th>
                  <th className="py-2.5 px-3">Selling Price (₹) *</th>
                  <th className="py-2.5 px-3">Cost Price (₹) *</th>
                  <th className="py-2.5 px-3">Unit / Weight</th>
                  <th className="py-2.5 px-3">Stock Units</th>
                  <th className="py-2.5 px-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-xs">
                {bulkRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-3 font-bold text-amber-800">{idx + 1}</td>
                    
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="e.g. Karachi Biscuits"
                        value={row.title}
                        onChange={(e) => updateBulkRow(idx, "title", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <select
                        value={row.category_id}
                        onChange={(e) => updateBulkRow(idx, "category_id", e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-200 text-xs bg-white focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={row.price}
                        onChange={(e) => updateBulkRow(idx, "price", e.target.value)}
                        className="w-20 px-2 py-1.5 rounded-lg border border-amber-200 text-xs font-bold text-chocolate-900"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Cost"
                        value={row.cost_price}
                        onChange={(e) => updateBulkRow(idx, "cost_price", e.target.value)}
                        className="w-20 px-2 py-1.5 rounded-lg border border-amber-200 text-xs font-bold text-amber-800"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        placeholder="500g / 1kg"
                        value={row.unit}
                        onChange={(e) => updateBulkRow(idx, "unit", e.target.value)}
                        className="w-20 px-2 py-1.5 rounded-lg border border-amber-200 text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="25"
                        value={row.stock_count}
                        onChange={(e) => updateBulkRow(idx, "stock_count", e.target.value)}
                        className="w-16 px-2 py-1.5 rounded-lg border border-amber-200 text-xs font-bold text-center"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {bulkRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBulkRow(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish All Bulk Rows</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: Bulk Stock Adjuster */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-amber-100">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-bakery-700 font-bold">
            3
          </div>
          <div>
            <h2 className="font-serif font-bold text-base text-chocolate-900">
              Bulk Stock Replenishment Modifier
            </h2>
            <p className="text-[11px] text-amber-800/80">Instantly add stock units to all items in a category or the entire store</p>
          </div>
        </div>

        {bulkStockMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{bulkStockMsg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-chocolate-900">Target Category:</span>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white font-semibold"
            >
              <option value="all">All Products ({products.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-chocolate-900">Add Stock:</span>
            <div className="flex items-center gap-1">
              {[5, 10, 20, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setStockAdjustment(num)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    stockAdjustment === num
                      ? "bg-chocolate-900 text-white border-chocolate-900"
                      : "bg-white text-chocolate-900 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  +{num} units
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyBulkStock}
            className="px-5 py-2.5 rounded-xl bg-bakery-600 hover:bg-bakery-700 text-white font-bold text-xs shadow transition ml-auto"
          >
            Apply Bulk Stock Adjustment
          </button>
        </div>
      </div>

    </div>
  );
}
