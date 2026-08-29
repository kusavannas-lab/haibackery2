"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Package, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles,
  Layers,
  CheckCircle2
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import ImageUploadDropzone from "@/components/image-upload-dropzone";

export default function InventoryDashboard() {
  const {
    categories,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductVisibility,
    toggleProductStock,
  } = useBakeryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("cat-sweets");
  const [formPrice, setFormPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formUnit, setFormUnit] = useState("500g");
  const [formDescription, setFormDescription] = useState("");
  const [formInStock, setFormInStock] = useState(true);
  const [formIsVisible, setFormIsVisible] = useState(true);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormTitle("");
    setFormCategoryId(selectedCategoryTab !== "all" ? selectedCategoryTab : (categories[0]?.id || "cat-sweets"));
    setFormPrice("");
    setFormImageUrl("");
    setFormUnit("500g");
    setFormDescription("");
    setFormInStock(true);
    setFormIsVisible(true);
    setIsProductModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormCategoryId(prod.category_id || "cat-sweets");
    setFormPrice(prod.price.toString());
    setFormImageUrl(prod.image_url || "");
    setFormUnit(prod.unit || "500g");
    setFormDescription(prod.description || "");
    setFormInStock(prod.in_stock);
    setFormIsVisible(prod.is_visible);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrice) {
      alert("Please enter product title and selling price.");
      return;
    }

    const priceNum = parseFloat(formPrice);
    const matchedCategory = categories.find((c) => c.id === formCategoryId);
    const categoryName = matchedCategory ? matchedCategory.name : "Bakery Delights";

    const productPayload = {
      title: formTitle.trim(),
      category_id: formCategoryId,
      category_name: categoryName,
      price: priceNum,
      cost_price: 0,
      image_url: formImageUrl.trim() || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
      unit: formUnit.trim() || "500g",
      description: formDescription.trim(),
      in_stock: formInStock,
      is_visible: formIsVisible,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productPayload);
    } else {
      await addProduct(productPayload);
    }

    setIsProductModalOpen(false);
  };

  // Filter products by Category + Search + Stock
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategoryTab === "all" ||
      prod.category_id === selectedCategoryTab ||
      prod.category_name?.toLowerCase() === categories.find((c) => c.id === selectedCategoryTab)?.name.toLowerCase();

    const matchesSearch =
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in_stock" && prod.in_stock) ||
      (stockFilter === "out_of_stock" && !prod.in_stock);

    return matchesCategory && matchesSearch && matchesStock;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Product Catalog Control</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50">
            Product Catalog & <span className="text-amber-400">Inventory</span>
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl leading-relaxed">
            Manage your bakery products, update pricing, toggle stock availability, and control live storefront visibility.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition transform hover:scale-105 shrink-0 relative z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Category Tabs & Filter & Search Bar */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryTab("all")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategoryTab === "all"
                ? "bg-chocolate-900 text-amber-200 shadow-md"
                : "bg-white text-chocolate-900 border border-amber-200 hover:bg-amber-50"
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
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-chocolate-900 text-amber-200 shadow-md"
                    : "bg-white text-chocolate-900 border border-amber-200 hover:bg-amber-50"
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-amber-400 text-chocolate-950 font-black" : "bg-amber-100 text-amber-900"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Stock Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs text-chocolate-900 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-medium"
            />
            <Search className="w-4 h-4 text-amber-700 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStockFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                stockFilter === "all"
                  ? "bg-bakery-600 text-white"
                  : "bg-amber-50 text-chocolate-900 hover:bg-amber-100"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStockFilter("in_stock")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                stockFilter === "in_stock"
                  ? "bg-bakery-600 text-white"
                  : "bg-amber-50 text-chocolate-900 hover:bg-amber-100"
              }`}
            >
              ✓ In Stock
            </button>
            <button
              onClick={() => setStockFilter("out_of_stock")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                stockFilter === "out_of_stock"
                  ? "bg-bakery-600 text-white"
                  : "bg-amber-50 text-chocolate-900 hover:bg-amber-100"
              }`}
            >
              ✗ Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/80 border-b border-amber-200 text-[11px] font-bold text-chocolate-900 uppercase tracking-wider">
                <th className="py-3.5 px-4">Product & Category</th>
                <th className="py-3.5 px-4">Unit / Size</th>
                <th className="py-3.5 px-4">Price (₹)</th>
                <th className="py-3.5 px-4 text-center">Stock Status</th>
                <th className="py-3.5 px-4 text-center">Storefront Visibility</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-amber-100 text-xs">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => {
                  const categoryName = prod.category_name || categories.find((c) => c.id === prod.category_id)?.name || "Bakery Item";
                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-amber-50/40 transition ${
                        !prod.is_visible ? "opacity-60 bg-gray-50/50" : ""
                      }`}
                    >
                      {/* Product Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image_url || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100"}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-chocolate-900 text-sm">
                              {prod.title}
                            </p>
                            <span className="inline-block text-[10px] font-extrabold bg-amber-100 text-bakery-950 px-2 py-0.5 rounded-md border border-amber-300 mt-0.5">
                              {categoryName}
                            </span>
                            {prod.description && (
                              <p className="text-[11px] text-amber-800/70 line-clamp-1 mt-0.5">
                                {prod.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Unit / Size */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-chocolate-900 bg-amber-100/80 px-2.5 py-1 rounded-lg inline-block">
                          {prod.unit || "500g"}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-chocolate-900">
                          {formatCurrency(prod.price)}
                        </span>
                      </td>

                      {/* Stock Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleProductStock(prod.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                            prod.in_stock
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
                          }`}
                        >
                          {prod.in_stock ? "✓ In Stock" : "✗ Out of Stock"}
                        </button>
                      </td>

                      {/* Instant Visibility Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleProductVisibility(prod.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition flex items-center justify-center gap-1.5 mx-auto ${
                            prod.is_visible
                              ? "bg-amber-100 text-bakery-900 border-amber-400 hover:bg-amber-200"
                              : "bg-gray-200 text-gray-700 border-gray-400 hover:bg-gray-300"
                          }`}
                          title="Instant storefront visibility switch"
                        >
                          {prod.is_visible ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Live on Store</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-gray-500" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-2 rounded-xl text-amber-800 hover:bg-amber-100 transition"
                            title="Edit product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${prod.title}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-amber-800/70">
                    No products found matching your filter or search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-amber-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-chocolate-900 to-bakery-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base">
                  {editingProduct ? "Edit Bakery Product" : "Add New Bakery Product"}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belgian Truffle Cake or Special Kaju Katli"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-semibold text-chocolate-900"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Category *
                </label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-bold text-chocolate-900 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-chocolate-900 mb-1">
                    Unit / Size *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500g, 1 kg, Pack of 10"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-medium"
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
                    step="1"
                    placeholder="e.g. 480"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-bold"
                  />
                </div>
              </div>

              <ImageUploadDropzone
                value={formImageUrl}
                onChange={setFormImageUrl}
                label="Product Photo (Drag & Drop or Click to Upload)"
              />

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Freshly made with 100% pure desi ghee and roasted nuts"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-chocolate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formInStock}
                    onChange={(e) => setFormInStock(e.target.checked)}
                    className="rounded text-bakery-600 focus:ring-bakery-500 w-4 h-4"
                  />
                  <span>Mark as In Stock</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-chocolate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsVisible}
                    onChange={(e) => setFormIsVisible(e.target.checked)}
                    className="rounded text-bakery-600 focus:ring-bakery-500 w-4 h-4"
                  />
                  <span>Visible on Storefront</span>
                </label>
              </div>

              <div className="pt-4 border-t border-amber-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-bakery-600 hover:from-amber-600 hover:to-bakery-700 rounded-xl shadow transition"
                >
                  {editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
