"use client";

import React, { useState } from "react";
import { 
  ShoppingBag, 
  Camera, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Sparkles, 
  User, 
  ExternalLink,
  ChevronRight,
  Printer
} from "lucide-react";
import { useBakeryStore } from "@/lib/store/bakery-store";
import { Order, PhotoCakeRequest, OrderStatus, PhotoCakeStatus } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { generateAdminToCustomerWhatsAppUrl, STORE_NAME } from "@/lib/whatsapp";

const ORDER_STATUSES: OrderStatus[] = ["Pending", "Baking", "Dispatched", "Delivered", "Cancelled"];
const PHOTO_CAKE_STATUSES: PhotoCakeStatus[] = ["Received", "Designing", "Baking", "Ready", "Delivered", "Cancelled"];

export default function OrdersDashboard() {
  const { orders, photoCakes, updateOrderStatus, updatePhotoCakeStatus } = useBakeryStore();
  const [activeTab, setActiveTab] = useState<"orders" | "photo-cakes">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPhotoCake, setSelectedPhotoCake] = useState<PhotoCakeRequest | null>(null);

  // Filter regular orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  // Filter photo cakes
  const filteredPhotoCakes = photoCakes.filter((pc) => {
    if (statusFilter === "all") return true;
    return pc.status === statusFilter;
  });

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "Baking":
        return "bg-orange-100 text-orange-900 border-orange-300 animate-pulse";
      case "Dispatched":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "Delivered":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-900 border-rose-300";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  const getPhotoCakeStatusBadge = (status: PhotoCakeStatus) => {
    switch (status) {
      case "Received":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "Designing":
        return "bg-amber-100 text-amber-900 border-amber-300 animate-pulse";
      case "Baking":
        return "bg-orange-100 text-orange-900 border-orange-300";
      case "Ready":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "Delivered":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-900 border-rose-300";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "photo-cake-print.jpg";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Dashboard 2 Header Banner */}
      <div className="bg-gradient-to-r from-[#220d05] via-[#3d1809] to-[#220d05] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Orders & Custom Cake Pipeline</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-amber-50">
            Orders & <span className="text-amber-400">Photo Cake Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 max-w-2xl leading-relaxed">
            Real-time pipeline of bakery deliveries and high-res custom photo cake print requests.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#2c1207] p-1.5 rounded-2xl flex items-center gap-1.5 border border-amber-600/50 shadow-inner shrink-0 relative z-10">
          <button
            onClick={() => {
              setActiveTab("orders");
              setStatusFilter("all");
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                : "text-amber-200 hover:bg-[#3d1a0b] hover:text-white"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Standard Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("photo-cakes");
              setStatusFilter("all");
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
              activeTab === "photo-cakes"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                : "text-amber-200 hover:bg-[#3d1a0b] hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Photo Cake Inbox ({photoCakes.length})</span>
          </button>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-amber-900 shrink-0">Filter Status:</span>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            statusFilter === "all"
              ? "bg-bakery-600 text-white"
              : "bg-white text-chocolate-900 border border-amber-200 hover:bg-amber-50"
          }`}
        >
          All ({activeTab === "orders" ? orders.length : photoCakes.length})
        </button>

        {(activeTab === "orders" ? ORDER_STATUSES : PHOTO_CAKE_STATUSES).map((status) => {
          const count = activeTab === "orders"
            ? orders.filter((o) => o.status === status).length
            : photoCakes.filter((pc) => pc.status === status).length;

          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === status
                  ? "bg-bakery-600 text-white"
                  : "bg-white text-chocolate-900 border border-amber-200 hover:bg-amber-50"
              }`}
            >
              <span>{status}</span>
              <span className="text-[10px] opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STANDARD ORDERS */}
      {activeTab === "orders" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const whatsappChatUrl = generateAdminToCustomerWhatsAppUrl(
                order.customer_phone,
                `Hello ${order.customer_name}, this is Shekhar Rao from High Bakery regarding your order #${order.id}.`
              );

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-amber-200/80 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-chocolate-900">
                          #{order.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getOrderStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800/80 mt-0.5">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-chocolate-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        Net Profit: +{formatCurrency(order.profit_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-chocolate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-bakery-600" />
                        {order.customer_name}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={whatsappChatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-emerald-300"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-chocolate-900 rounded-lg font-bold text-[11px] flex items-center gap-1 border border-amber-300"
                        >
                          <Phone className="w-3 h-3 text-bakery-600" />
                          <span>Call</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 text-amber-900/80 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <MapPin className="w-3.5 h-3.5 text-bakery-600 mt-0.5 shrink-0" />
                      <span className="leading-snug">{order.delivery_address}</span>
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-amber-800 italic bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                        📝 {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 space-y-1.5 text-xs">
                    <p className="font-bold text-[11px] text-chocolate-900 uppercase tracking-wider">
                      Ordered Items:
                    </p>
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-chocolate-900">
                        <span>{it.product_title || "Bakery Item"} × {it.quantity}</span>
                        <span className="font-semibold">{formatCurrency(it.unit_price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Switcher Footer */}
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-chocolate-900">Update Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs font-bold bg-amber-50 border border-amber-300 rounded-xl px-3 py-1.5 text-chocolate-900 focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-amber-200 space-y-2">
              <ShoppingBag className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="font-serif font-bold text-base text-chocolate-900">No orders in this status</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PHOTO CAKE INBOX */}
      {activeTab === "photo-cakes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotoCakes.length > 0 ? (
            filteredPhotoCakes.map((pc) => {
              const whatsappChatUrl = generateAdminToCustomerWhatsAppUrl(
                pc.customer_phone,
                `Hello ${pc.customer_name}, this is Shekhar Rao from High Bakery regarding your Photo Cake Request #${pc.id}.`
              );

              return (
                <div
                  key={pc.id}
                  className="bg-white rounded-3xl overflow-hidden border border-amber-200/80 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                >
                  {/* Photo Cake Image Header */}
                  <div className="relative aspect-video w-full bg-black/5 overflow-hidden group">
                    <img
                      src={pc.image_url}
                      alt="Customer Cake Print"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${getPhotoCakeStatusBadge(pc.status)}`}>
                        {pc.status}
                      </span>
                    </div>

                    {/* Download High Res Button */}
                    <button
                      onClick={() => downloadImage(pc.image_url, `cake-photo-${pc.id}.jpg`)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-md transition shadow"
                      title="Download High Resolution Photo"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[10px]">Download</span>
                    </button>

                    {/* Cake Text on top overlay */}
                    {pc.message && (
                      <div className="absolute bottom-2 inset-x-3 bg-black/75 backdrop-blur-md text-amber-100 p-2 rounded-xl text-center border border-white/20">
                        <span className="text-[10px] text-amber-300 font-bold block">Text on Cake:</span>
                        <p className="font-serif italic text-xs font-bold line-clamp-1">
                          &quot;{pc.message}&quot;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-chocolate-900">
                            {pc.cake_flavor}
                          </h3>
                          <span className="text-[11px] font-semibold text-bakery-700">
                            ⚖️ {pc.cake_weight} {pc.eggless ? "• 100% Eggless 🟢" : ""}
                          </span>
                        </div>
                        {pc.estimated_price && (
                          <span className="text-sm font-extrabold text-chocolate-900">
                            {formatCurrency(pc.estimated_price)}
                          </span>
                        )}
                      </div>

                      {/* Customer Contact */}
                      <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-chocolate-900 flex items-center gap-1">
                            <User className="w-3 h-3 text-bakery-600" />
                            {pc.customer_name}
                          </span>
                          <a
                            href={whatsappChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 font-bold text-[10px] hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </a>
                        </div>
                        <p className="text-[11px] text-amber-800 font-medium">
                          📞 {pc.customer_phone}
                        </p>
                      </div>

                      {/* Delivery Date & Time Slot */}
                      <div className="flex items-center justify-between text-[11px] text-amber-900/90 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-bakery-600" />
                          {pc.delivery_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-bakery-600" />
                          {pc.delivery_time}
                        </span>
                      </div>

                      {pc.notes && (
                        <p className="text-[10px] text-amber-800 italic bg-yellow-50 p-2 rounded-lg border border-yellow-200">
                          📝 {pc.notes}
                        </p>
                      )}
                    </div>

                    {/* Status Changer Footer */}
                    <div className="pt-3 border-t border-amber-100 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-chocolate-900">Status:</span>
                      <select
                        value={pc.status}
                        onChange={(e) => updatePhotoCakeStatus(pc.id, e.target.value as PhotoCakeStatus)}
                        className="text-xs font-bold bg-amber-50 border border-amber-300 rounded-xl px-2.5 py-1.5 text-chocolate-900 focus:outline-none focus:ring-2 focus:ring-bakery-500/30"
                      >
                        {PHOTO_CAKE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-16 bg-white rounded-3xl border border-amber-200 space-y-2">
              <Camera className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="font-serif font-bold text-base text-chocolate-900">
                No photo cake requests in this status
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
