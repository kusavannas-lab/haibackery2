"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Plus, 
  DollarSign, 
  Package, 
  TrendingUp, 
  ShoppingBag, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  Trash2, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  ArrowUpRight, 
  AlertCircle, 
  Layers, 
  Cake,
  Edit3,
  X
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import ImageUploadDropzone from "@/components/image-upload-dropzone";

export default function ExecutiveAdminPage() {
  const {
    products,
    categories,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStockCount,
    updateProductPricesAndMargin,
    toggleProductVisibility,
    addCategory,
    updateCategory,
    calculateAnalytics,
    clearAllDemoData,
    isAdmin,
  } = useBakeryStore();

  const analytics = calculateAnalytics("all");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");

  // New Product Form State
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("cat-sweets");
  const [newPrice, setNewPrice] = useState("");
  const [newStockCount, setNewStockCount] = useState("30");
  const [newUnit, setNewUnit] = useState("500g");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsVisible, setNewIsVisible] = useState(true);

  // Inline Editable State for products: { [id]: { price, stockCount } }
  const [editedValues, setEditedValues] = useState<{
    [id: string]: { price: number; stockCount: number };
  }>({});
  const [savedRowId, setSavedRowId] = useState<string | null>(null);

  // Calculate item-level sales and revenue generated
  const itemRevenueMap: { [productId: string]: { unitsSold: number; revenue: number } } = {};
  orders.forEach((o) => {
    if (o.status === "Cancelled") return;
    o.items?.forEach((it) => {
      if (!itemRevenueMap[it.product_id]) {
        itemRevenueMap[it.product_id] = { unitsSold: 0, revenue: 0 };
      }
      itemRevenueMap[it.product_id].unitsSold += it.quantity;
      itemRevenueMap[it.product_id].revenue += it.unit_price * it.quantity;
    });
  });

  const handlePriceChange = (id: string, field: "price" | "stockCount", val: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    setEditedValues((prev) => {
      const current = prev[id] || {
        price: prod.price,
        stockCount: prod.stock_count ?? (prod.in_stock ? 25 : 0),
      };
      return {
        ...prev,
        [id]: {
          ...current,
          [field]: Math.max(0, val),
        },
      };
    });
  };

  const handleSaveRow = async (prod: Product) => {
    const changes = editedValues[prod.id];
    if (!changes) return;

    await updateProduct(prod.id, {
      price: changes.price,
      stock_count: changes.stockCount,
      in_stock: changes.stockCount > 0,
    });

    setSavedRowId(prod.id);
    setTimeout(() => setSavedRowId(null), 1500);
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) {
      alert("Please fill in product title and price.");
      return;
    }

    const priceNum = parseFloat(newPrice);
    const stockNum = parseInt(newStockCount) || 20;
    const matchedCategory = categories.find((c) => c.id === newCategoryId);
    const categoryName = matchedCategory ? matchedCategory.name : "Bakery Delights";

    await addProduct({
      title: newTitle.trim(),
      category_id: newCategoryId,
      category_name: categoryName,
      price: priceNum,
      cost_price: 0,
      stock_count: stockNum,
      unit: newUnit.trim() || "500g",
      image_url: newImageUrl.trim() || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
      description: newDescription.trim(),
      in_stock: stockNum > 0,
      is_visible: newIsVisible,
      is_admin_added: true,
    });

    // Reset Form
    setNewTitle("");
    setNewPrice("");
    setNewStockCount("30");
    setNewDescription("");
    setNewImageUrl("");
    setIsAddFormOpen(false);
  };

  // Filter products by Category + Search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryTab === "all" ||
      p.category_id === selectedCategoryTab ||
      p.category_name?.toLowerCase() === categories.find((c) => c.id === selectedCategoryTab)?.name.toLowerCase();

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Executive Portal Header */}
      <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Gold Accent Light */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50">
            Bakery Products & <span className="text-amber-400">Inventory Command</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/30 transition transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddFormOpen ? "Close Add Form" : "+ Add New Product"}</span>
          </button>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear all data? This will reset the catalog to empty so you can add your own fresh products.")) {
                clearAllDemoData();
              }
            }}
            className="px-3.5 py-3.5 rounded-2xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-800/60 transition"
            title="Clear all demo items"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3.5 rounded-2xl bg-[#361507] hover:bg-[#481c09] text-amber-200 font-bold text-xs flex items-center gap-2 border border-amber-600/50 shadow transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span>View Live Store</span>
          </a>
        </div>
      </div>

      {/* 2. Key Financial & Revenue Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Gross Revenue */}
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-200/90 shadow-md space-y-2 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Total Revenue Generated
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-chocolate-900">
            {formatCurrency(analytics.totalRevenue)}
          </p>
          <p className="text-[11px] text-amber-800 font-bold">
            Across {analytics.totalOrdersCount} orders placed
          </p>
        </div>

        {/* Total Cost of Goods */}
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-200/90 shadow-md space-y-2 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Total Product Cost
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-chocolate-900">
            {formatCurrency(analytics.totalCost)}
          </p>
          <p className="text-[11px] text-amber-800 font-bold">
            Baking ingredients & packaging
          </p>
        </div>

        {/* Net Profit Gain */}
        <div className="bg-gradient-to-br from-[#220d05] to-[#3d1809] text-white p-6 rounded-3xl shadow-xl space-y-2 border-2 border-amber-400 hover:shadow-2xl transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              Net Profit Gain
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-amber-300">
            +{formatCurrency(analytics.netProfit)}
          </p>
          <p className="text-[11px] text-amber-200 font-black">
            {analytics.profitMarginPercent.toFixed(1)}% Net Margin
          </p>
        </div>

        {/* Items Sold & Stock Health */}
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-200/90 shadow-md space-y-2 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Total Units Sold
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif font-black text-chocolate-900">
            {analytics.totalItemsSold} Items
          </p>
          <p className="text-[11px] text-emerald-700 font-black">
            {products.filter((p) => p.in_stock).length} / {products.length} Products In Stock
          </p>
        </div>

      </div>

      {/* 3. DEDICATED SLIDE-OVER RIGHT SIDEBAR DRAWER FOR ADDING PRODUCT */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsAddFormOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Slide-out Sidebar Panel */}
          <aside className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l-2 border-amber-300 flex flex-col justify-between z-50 overflow-hidden animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white border-b border-amber-700/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-black text-lg text-amber-50">
                    Add Bakery Product
                  </h2>
                  <p className="text-[11px] text-amber-300/80">
                    Fill in details, drag image, and publish directly to live store
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddFormOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form id="add-product-form" onSubmit={handleCreateProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* 1. Drag & Drop Image Upload */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                <ImageUploadDropzone
                  value={newImageUrl}
                  onChange={setNewImageUrl}
                  label="Product Photo (Drag & Drop or Click)"
                />
              </div>

              {/* 2. Title & Category */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure Ghee Mysore Pak (500g)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-3 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Select Category *
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full px-3.5 py-3 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Unit / Size *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500g, 1 kg, Box of 10"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-semibold"
                  />
                </div>
              </div>

              {/* 3. Pricing */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 rounded-2xl border-2 border-amber-300 space-y-2">
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                  Product Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 480"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:outline-none bg-white font-black text-chocolate-900"
                />
              </div>

              {/* 4. Available Stock Units Stepper */}
              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Available Stock Count *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStockCount(String(Math.max(0, (parseInt(newStockCount) || 0) - 5)))}
                    className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-chocolate-900 font-bold text-xs border border-amber-300"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStockCount(String(Math.max(0, (parseInt(newStockCount) || 0) - 1)))}
                    className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-chocolate-900 font-bold text-xs border border-amber-300"
                  >
                    -1
                  </button>

                  <input
                    type="number"
                    required
                    min="0"
                    value={newStockCount}
                    onChange={(e) => setNewStockCount(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-center text-sm font-black rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setNewStockCount(String((parseInt(newStockCount) || 0) + 1))}
                    className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-chocolate-900 font-bold text-xs border border-amber-300"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStockCount(String((parseInt(newStockCount) || 0) + 5))}
                    className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-chocolate-900 font-bold text-xs border border-amber-300"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* 5. Description */}
              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Product Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Made fresh every morning with pure ghee and premium dry fruits"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-medium"
                />
              </div>

              {/* 6. Visibility Switch */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-chocolate-900">Show on Live Storefront</p>
                  <p className="text-[10px] text-amber-800/80">Make immediately visible to customers</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsVisible}
                    onChange={(e) => setNewIsVisible(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

            </form>

            {/* Sticky Drawer Footer */}
            <div className="p-4 bg-amber-50/80 border-t-2 border-amber-200 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="w-1/3 py-3 rounded-2xl bg-white border border-amber-300 hover:bg-amber-100 text-chocolate-900 font-bold text-xs transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="add-product-form"
                className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-xl shadow-amber-500/30 transition transform hover:scale-102 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish & Add Product</span>
              </button>
            </div>

          </aside>
        </div>
      )}

      {/* 4. Interactive Product Margin, Editable Stock & Revenue Table */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 space-y-6">
        
        {/* Table Filters & Control Bar */}
        <div className="space-y-4 pb-4 border-b border-amber-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-chocolate-900">
                Interactive Product Margin & Available Stock Manager
              </h2>
              <p className="text-xs text-amber-800/80">
                Quick edit price, adjust stock units, and toggle visibility across all categories
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-medium bg-amber-50/40"
              />
              <Search className="w-3.5 h-3.5 text-amber-700 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryTab("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategoryTab === "all"
                  ? "bg-chocolate-900 text-amber-200 shadow-sm"
                  : "bg-amber-50 text-chocolate-900 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              All Categories ({products.length})
            </button>

            {categories.map((c) => {
              const count = products.filter((p) => p.category_id === c.id || p.category_name === c.name).length;
              const isSelected = selectedCategoryTab === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryTab(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-chocolate-900 text-amber-200 shadow-sm"
                      : "bg-amber-50 text-chocolate-900 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-amber-400 text-chocolate-950 font-black" : "bg-amber-200 text-amber-900"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/90 border-b border-amber-200 text-[11px] font-extrabold text-chocolate-900 uppercase tracking-wider">
                <th className="py-3.5 px-3">Product Details</th>
                <th className="py-3.5 px-3">Price (₹)</th>
                <th className="py-3.5 px-3 text-center">Available Stock Units</th>
                <th className="py-3.5 px-3 text-center">Storefront Visibility</th>
                <th className="py-3.5 px-3">Revenue Generated</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-amber-100 text-xs">
              {filteredProducts.map((prod) => {
                const currentEdit = editedValues[prod.id];
                const activePrice = currentEdit !== undefined ? currentEdit.price : prod.price;
                const activeStock = currentEdit !== undefined ? currentEdit.stockCount : (prod.stock_count ?? (prod.in_stock ? 25 : 0));

                const salesData = itemRevenueMap[prod.id] || { unitsSold: 0, revenue: 0 };
                const isModified = currentEdit !== undefined && (
                  currentEdit.price !== prod.price ||
                  currentEdit.stockCount !== (prod.stock_count ?? (prod.in_stock ? 25 : 0))
                );

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-amber-50/50 transition ${
                      !prod.is_visible ? "opacity-60 bg-gray-50/40" : ""
                    }`}
                  >
                    {/* Product Name & Category */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image_url || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100"}
                          alt={prod.title}
                          className="w-11 h-11 rounded-xl object-cover border border-amber-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-chocolate-900 text-xs sm:text-sm">
                            {prod.title}
                          </p>
                          <span className="text-[10px] text-amber-800/80 font-semibold">
                            {prod.category_name} • {prod.unit || "Pack"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Editable Price */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-amber-900">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={activePrice}
                          onChange={(e) => handlePriceChange(prod.id, "price", parseFloat(e.target.value) || 0)}
                          className="w-24 px-2.5 py-1.5 rounded-lg border border-amber-300 font-black text-xs text-chocolate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </td>

                    {/* Editable Available Stock Count */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200">
                        <button
                          type="button"
                          onClick={() => handlePriceChange(prod.id, "stockCount", activeStock - 1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-amber-100 font-black text-chocolate-900 text-xs shadow-sm flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={activeStock}
                          onChange={(e) => handlePriceChange(prod.id, "stockCount", parseInt(e.target.value) || 0)}
                          className="w-14 text-center px-1 py-0.5 rounded-md font-bold text-xs text-chocolate-900 bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handlePriceChange(prod.id, "stockCount", activeStock + 1)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-amber-100 font-black text-chocolate-900 text-xs shadow-sm flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <span className={`text-[10px] block mt-0.5 font-bold ${activeStock > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                        {activeStock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>

                    {/* Instant Storefront Visibility Toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleProductVisibility(prod.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition flex items-center justify-center gap-1.5 mx-auto ${
                          prod.is_visible
                            ? "bg-amber-100 text-bakery-900 border-amber-400 hover:bg-amber-200"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {prod.is_visible ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-bakery-800" />
                            <span>🟢 Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                            <span>⚪ Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Revenue Generated */}
                    <td className="py-3.5 px-3">
                      <div>
                        <span className="font-extrabold text-chocolate-900 text-xs block">
                          {formatCurrency(salesData.revenue)}
                        </span>
                        <span className="text-[10px] text-amber-800 font-medium">
                          {salesData.unitsSold} units sold
                        </span>
                      </div>
                    </td>

                    {/* Actions: Save / Delete */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isModified && (
                          <button
                            type="button"
                            onClick={() => handleSaveRow(prod)}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow transition animate-bounce"
                          >
                            Save
                          </button>
                        )}

                        {savedRowId === prod.id && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1 border border-emerald-300">
                            <Check className="w-3 h-3" /> Saved
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Delete "${prod.title}"?`)) {
                              await deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Product"
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

    </div>
  );
}
