"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  Percent, 
  Cake, 
  Award,
  BarChart3,
  Layers
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsDashboard() {
  const { products, orders, categories, calculateAnalytics } = useBakeryStore();
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");

  const analytics = calculateAnalytics(dateFilter);

  // Compute item-level sales and profit breakdown
  const itemAnalyticsMap: {
    [productId: string]: {
      title: string;
      category: string;
      unitPrice: number;
      unitCost: number;
      unitsSold: number;
      totalRevenue: number;
      totalProfit: number;
      marginPct: number;
    };
  } = {};

  // Initialize with all products
  products.forEach((p) => {
    const cost = p.cost_price ?? 0;
    const profitPerUnit = p.price - cost;
    const margin = p.price > 0 ? (profitPerUnit / p.price) * 100 : 0;
    itemAnalyticsMap[p.id] = {
      title: p.title,
      category: p.category_name || "Bakery",
      unitPrice: p.price,
      unitCost: cost,
      unitsSold: 0,
      totalRevenue: 0,
      totalProfit: 0,
      marginPct: Math.round(margin),
    };
  });

  // Tally from orders matching the date filter
  const now = new Date();
  const filteredOrders = orders.filter((order) => {
    if (order.status === "Cancelled") return false;
    const orderDate = new Date(order.created_at);
    if (dateFilter === "today") return orderDate.toDateString() === now.toDateString();
    if (dateFilter === "week") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= oneWeekAgo;
    }
    if (dateFilter === "month") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return orderDate >= oneMonthAgo;
    }
    return true;
  });

  filteredOrders.forEach((o) => {
    o.items?.forEach((it) => {
      const unitCost = it.unit_cost ?? 0;
      if (itemAnalyticsMap[it.product_id]) {
        itemAnalyticsMap[it.product_id].unitsSold += it.quantity;
        itemAnalyticsMap[it.product_id].totalRevenue += it.unit_price * it.quantity;
        itemAnalyticsMap[it.product_id].totalProfit += (it.unit_price - unitCost) * it.quantity;
      } else {
        // dynamic item
        const rev = it.unit_price * it.quantity;
        const prof = (it.unit_price - unitCost) * it.quantity;
        itemAnalyticsMap[it.product_id] = {
          title: it.product_title || "Custom Bakery Item",
          category: "Special",
          unitPrice: it.unit_price,
          unitCost: unitCost,
          unitsSold: it.quantity,
          totalRevenue: rev,
          totalProfit: prof,
          marginPct: it.unit_price > 0 ? Math.round(((it.unit_price - unitCost) / it.unit_price) * 100) : 0,
        };
      }
    });
  });

  const sortedItems = Object.values(itemAnalyticsMap).sort((a, b) => b.totalProfit - a.totalProfit);

  // Category breakdown calculation
  const categoryRevenueMap: { [cat: string]: number } = {};
  sortedItems.forEach((item) => {
    if (!categoryRevenueMap[item.category]) {
      categoryRevenueMap[item.category] = 0;
    }
    categoryRevenueMap[item.category] += item.totalRevenue;
  });

  const maxCatRev = Math.max(...Object.values(categoryRevenueMap), 1);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Financial Performance • High Bakery</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50">
            Sales, Revenue & <span className="text-amber-400">Profit Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl leading-relaxed">
            Financial breakdown of gross sales, product costs, net margins, and best-selling bakery items.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="bg-[#2c1207] p-1.5 rounded-2xl border border-amber-600/50 shadow-inner flex items-center gap-1 shrink-0 relative z-10">
          <Calendar className="w-4 h-4 text-amber-400 ml-2" />
          <button
            onClick={() => setDateFilter("today")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition ${
              dateFilter === "today"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                : "text-amber-200 hover:bg-[#3d1a0b] hover:text-white"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter("week")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition ${
              dateFilter === "week"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                : "text-amber-200 hover:bg-[#3d1a0b] hover:text-white"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateFilter("month")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition ${
              dateFilter === "month"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                : "text-amber-200 hover:bg-[#3d1a0b] hover:text-white"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter("all")}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition ${
              dateFilter === "all"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                : "text-amber-200 hover:bg-[#3d1a0b] hover:text-white"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-200/90 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-serif font-black text-chocolate-900">
              {formatCurrency(analytics.totalRevenue)}
            </p>
            <p className="text-[11px] text-amber-800 font-bold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gross customer billing</span>
            </p>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-200/90 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Total Cost of Goods
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-serif font-black text-chocolate-900">
              {formatCurrency(analytics.totalCost)}
            </p>
            <p className="text-[11px] text-amber-800 font-bold mt-1">
              Ingredients, baking & packaging
            </p>
          </div>
        </div>

        {/* Net Profit Gain */}
        <div className="bg-gradient-to-br from-[#220d05] to-[#3d1809] text-white p-6 rounded-3xl shadow-xl space-y-3 border-2 border-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              Net Profit Gain
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-serif font-black text-amber-300">
              +{formatCurrency(analytics.netProfit)}
            </p>
            <p className="text-[11px] text-amber-200 font-black mt-1">
              {analytics.profitMarginPercent.toFixed(1)}% Net Margin
            </p>
          </div>
        </div>

        {/* Total Items Sold */}
        <div className="bg-white p-6 rounded-3xl border-2 border-amber-200/90 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              Total Items Sold
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-serif font-black text-chocolate-900">
              {analytics.totalItemsSold}
            </p>
            <p className="text-[11px] text-amber-800 font-bold mt-1">
              Across {analytics.totalOrdersCount} orders placed
            </p>
          </div>
        </div>

      </div>

      {/* Category Performance & Revenue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Revenue Bars */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-bakery-600" />
            <h2 className="font-serif font-bold text-base text-chocolate-900">
              Revenue by Category
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(categoryRevenueMap).map(([categoryName, rev]) => {
              const pctOfMax = Math.round((rev / maxCatRev) * 100);
              return (
                <div key={categoryName} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-chocolate-900">
                    <span>{categoryName}</span>
                    <span className="text-bakery-700">{formatCurrency(rev)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-amber-100/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-bakery-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pctOfMax, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Best-Sellers Highlight */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h2 className="font-serif font-bold text-base text-chocolate-900">
                Top Performing Items by Net Profit Contribution
              </h2>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold">
              Ranked by Profit
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sortedItems.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 relative"
              >
                <span className="absolute top-3 right-3 text-xs font-black text-amber-400">
                  #{idx + 1}
                </span>
                <p className="font-bold text-xs text-chocolate-900 line-clamp-1 pr-6">
                  {item.title}
                </p>
                <div className="text-xs space-y-0.5">
                  <div className="flex justify-between text-amber-800">
                    <span>Units Sold:</span>
                    <span className="font-bold text-chocolate-900">{item.unitsSold}</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Profit:</span>
                    <span className="font-bold text-emerald-700">+{formatCurrency(item.totalProfit)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Item-Level Profit Breakdown Table */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-chocolate-900">
              Item-Level Margin & Profit Analysis
            </h2>
            <p className="text-xs text-amber-800/80">
              Individual selling price, cost price, unit margin, units sold, and aggregate net profit.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-amber-50/80 border-b border-amber-200 text-[11px] font-bold text-chocolate-900 uppercase tracking-wider">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Unit Margin (₹ & %)</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4">Total Revenue</th>
                <th className="py-3 px-4 text-right">Net Profit Contribution</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-amber-100 text-xs">
              {sortedItems.map((item, idx) => {
                const profitPerUnit = item.unitPrice - item.unitCost;
                return (
                  <tr key={idx} className="hover:bg-amber-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-chocolate-900">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 text-amber-800">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-chocolate-900">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-amber-800">
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700">
                        +{formatCurrency(profitPerUnit)}
                      </span>
                      <span className="text-[10px] text-emerald-600 block">
                        ({item.marginPct}% margin)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-chocolate-900">
                      {item.unitsSold}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-chocolate-900">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-extrabold text-sm text-emerald-700">
                        +{formatCurrency(item.totalProfit)}
                      </span>
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
