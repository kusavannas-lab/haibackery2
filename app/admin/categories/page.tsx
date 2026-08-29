"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Layers, 
  Sparkles, 
  Candy, 
  Cookie, 
  Cake, 
  UtensilsCrossed, 
  Camera, 
  Coffee,
  Heart,
  X,
  Package,
  ArrowRight
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { Category } from "@/lib/types";

const AVAILABLE_ICONS = [
  { label: "Sweets / Candy", value: "sweets", icon: Candy },
  { label: "Biscuits / Cookies", value: "biscuits", icon: Cookie },
  { label: "Cakes / Bakery", value: "cakes", icon: Cake },
  { label: "Savories / Snacks", value: "savories", icon: UtensilsCrossed },
  { label: "Photo Cakes / Studio", value: "photo-cakes", icon: Camera },
  { label: "Hot Beverages / Coffee", value: "coffee", icon: Coffee },
  { label: "Special Delights", value: "special", icon: Sparkles },
  { label: "Favorites / Gifts", value: "favorites", icon: Heart },
];

export default function AdminCategoriesPage() {
  const { 
    categories, 
    products, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    toggleCategoryVisibility 
  } = useBakeryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("sweets");
  const [formIsVisible, setFormIsVisible] = useState(true);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormIcon("sweets");
    setFormIsVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug || cat.id.replace("cat-", ""));
    setFormDescription(cat.description || "");
    setFormIcon(cat.slug || "sweets");
    setFormIsVisible(cat.is_visible ?? true);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      // Auto-generate slug
      const generated = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      setFormSlug(generated);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter a category name.");
      return;
    }

    const slug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: formName.trim(),
        slug: slug,
        description: formDescription.trim(),
        is_visible: formIsVisible,
      });
    } else {
      await addCategory({
        name: formName.trim(),
        slug: slug,
        description: formDescription.trim(),
        is_visible: formIsVisible,
      });
    }

    setIsModalOpen(false);
  };

  const getCategoryIconComponent = (slug?: string) => {
    switch (slug) {
      case "sweets":
        return <Candy className="w-5 h-5 text-amber-500" />;
      case "biscuits":
        return <Cookie className="w-5 h-5 text-amber-600" />;
      case "cakes":
        return <Cake className="w-5 h-5 text-bakery-600" />;
      case "savories":
        return <UtensilsCrossed className="w-5 h-5 text-orange-600" />;
      case "photo-cakes":
        return <Camera className="w-5 h-5 text-pink-500" />;
      case "coffee":
        return <Coffee className="w-5 h-5 text-amber-800" />;
      case "favorites":
        return <Heart className="w-5 h-5 text-rose-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Storefront Categories & Organization</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50">
            Bakery <span className="text-amber-400">Categories</span>
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl leading-relaxed">
            Create, edit, and organize product categories. Control which categories appear on the customer storefront and manage assigned items.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition transform hover:scale-105 shrink-0 relative z-10"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-chocolate-900 font-black">
            <FolderTree className="w-6 h-6 text-bakery-600" />
          </div>
          <div>
            <p className="text-2xl font-serif font-black text-chocolate-900">{categories.length}</p>
            <p className="text-xs text-amber-800 font-semibold">Total Categories</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-serif font-black text-emerald-800">
              {categories.filter((c) => c.is_visible !== false).length}
            </p>
            <p className="text-xs text-amber-800 font-semibold">Live on Storefront</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-700">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-serif font-black text-chocolate-900">{products.length}</p>
            <p className="text-xs text-amber-800 font-semibold">Total Products Categorized</p>
          </div>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs text-chocolate-900 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-medium"
          />
          <Search className="w-4 h-4 text-amber-700 absolute left-3 top-3" />
        </div>

        <p className="text-xs text-amber-800 font-medium">
          Showing {filteredCategories.length} of {categories.length} categories
        </p>
      </div>

      {/* 4. Categories Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const catProducts = products.filter(
            (p) => p.category_id === cat.id || p.category_name === cat.name
          );
          const isLive = cat.is_visible !== false;

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-3xl border-2 p-6 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                isLive ? "border-amber-200" : "border-gray-200 opacity-70 bg-gray-50/50"
              }`}
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner">
                      {getCategoryIconComponent(cat.slug)}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-chocolate-900">
                        {cat.name}
                      </h3>
                      <span className="text-[11px] font-mono text-amber-800/80 bg-amber-100/60 px-2 py-0.5 rounded-md">
                        slug: {cat.slug || cat.id}
                      </span>
                    </div>
                  </div>

                  {/* Visibility Switch */}
                  <button
                    onClick={() => toggleCategoryVisibility(cat.id)}
                    className={`p-1.5 rounded-xl border transition ${
                      isLive 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100" 
                        : "bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200"
                    }`}
                    title={isLive ? "Visible on Customer Storefront" : "Hidden from Customer Storefront"}
                  >
                    {isLive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-amber-900/80 line-clamp-2 min-h-[32px]">
                  {cat.description || "Fresh bakery category for High Bakery customers."}
                </p>

                {/* Product Count Pill */}
                <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-xs">
                  <span className="text-amber-800 font-medium">Assigned Products:</span>
                  <span className="font-extrabold text-chocolate-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {catProducts.length} Items
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-amber-100 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/inventory`}
                  className="text-xs font-bold text-bakery-700 hover:text-bakery-900 flex items-center gap-1 transition"
                >
                  <span>Manage Items</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-xl text-amber-800 hover:bg-amber-100 transition"
                    title="Edit category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col animate-in zoom-in-95">
            
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-chocolate-900 to-bakery-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sweets & Mithai or Hot Savories"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-semibold text-chocolate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Slug / URL Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sweets, biscuits, cakes"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 font-mono text-chocolate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Category Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map((ic) => {
                    const IconComp = ic.icon;
                    const isSelected = formSlug === ic.value || formIcon === ic.value;
                    return (
                      <button
                        key={ic.value}
                        type="button"
                        onClick={() => {
                          setFormIcon(ic.value);
                          if (!editingCategory) setFormSlug(ic.value);
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-[10px] font-bold transition ${
                          isSelected
                            ? "bg-amber-100 border-bakery-600 text-bakery-950 shadow-sm"
                            : "bg-white border-amber-200 text-amber-800 hover:bg-amber-50"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="truncate w-full text-center">{ic.label.split("/")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-chocolate-900 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pure cow ghee handcrafted traditional sweets"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-bakery-500/30 resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-chocolate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsVisible}
                    onChange={(e) => setFormIsVisible(e.target.checked)}
                    className="rounded text-bakery-600 focus:ring-bakery-500 w-4 h-4"
                  />
                  <span>Show Category on Customer Storefront</span>
                </label>
              </div>

              <div className="pt-4 border-t border-amber-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-bakery-600 hover:from-amber-600 hover:to-bakery-700 rounded-xl shadow transition"
                >
                  {editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
