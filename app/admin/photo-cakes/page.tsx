"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Cake, 
  Clock, 
  DollarSign, 
  Scale, 
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Calendar,
  Square
} from "lucide-react";
import { useBakeryStore, PhotoCakeFlavor, PhotoCakeWeight, PhotoCakeShape } from "@/lib/store/bakery-store";
import { formatCurrency } from "@/lib/utils";

export default function AdminPhotoCakesPage() {
  const {
    photoCakeConfig,
    photoCakes,
    addPhotoCakeFlavor,
    updatePhotoCakeFlavor,
    deletePhotoCakeFlavor,
    togglePhotoCakeFlavor,
    addPhotoCakeWeight,
    updatePhotoCakeWeight,
    deletePhotoCakeWeight,
    addPhotoCakeShape,
    updatePhotoCakeShape,
    deletePhotoCakeShape,
    togglePhotoCakeShape,
    togglePhotoCakeModule,
    updatePhotoCakePrintCharge,
    addPhotoCakeTimeSlot,
    deletePhotoCakeTimeSlot,
    updatePhotoCakeStatus,
  } = useBakeryStore();

  const isModuleEnabled = photoCakeConfig.is_enabled !== false;
  const [activeTab, setActiveTab] = useState<"flavors" | "shapes" | "weights" | "settings" | "requests">("flavors");

  // Flavor modal state
  const [isAddFlavorOpen, setIsAddFlavorOpen] = useState(false);
  const [newFlavorName, setNewFlavorName] = useState("");
  const [newFlavorPrice, setNewFlavorPrice] = useState("");
  const [newFlavorColor, setNewFlavorColor] = useState("chocolate");

  // Shape modal state
  const [isAddShapeOpen, setIsAddShapeOpen] = useState(false);
  const [newShapeName, setNewShapeName] = useState("");
  const [newShapeLabel, setNewShapeLabel] = useState("");
  const [newShapeExtraPrice, setNewShapeExtraPrice] = useState("0");

  // Weight modal state
  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false);
  const [newWeightLabel, setNewWeightLabel] = useState("");
  const [newWeightValue, setNewWeightValue] = useState("");
  const [newWeightMultiplier, setNewWeightMultiplier] = useState("1.0");

  // Print charge state
  const [printChargeInput, setPrintChargeInput] = useState(() => (photoCakeConfig?.printCharge ?? 150).toString());
  const [isChargeSaved, setIsChargeSaved] = useState(false);

  useEffect(() => {
    if (photoCakeConfig?.printCharge !== undefined) {
      setPrintChargeInput(photoCakeConfig.printCharge.toString());
    }
  }, [photoCakeConfig?.printCharge]);

  // Time slot input state
  const [newSlotInput, setNewSlotInput] = useState("");

  // Inline edited flavor row state: { [id]: { name: string; price: number; color: string } }
  const [editedFlavors, setEditedFlavors] = useState<{
    [id: string]: { name: string; price: number; color: string };
  }>({});
  const [savedFlavorId, setSavedFlavorId] = useState<string | null>(null);

  const currentFlavors = photoCakeConfig?.flavors || [];
  const currentWeights = photoCakeConfig?.weights || [];
  const currentShapes = photoCakeConfig?.shapes || [];
  const currentTimeSlots = photoCakeConfig?.timeSlots || [];

  const handleInlineFlavorChange = (
    id: string,
    field: "name" | "price" | "color",
    val: any
  ) => {
    const original = currentFlavors.find((f) => f.id === id);
    if (!original) return;

    setEditedFlavors((prev) => {
      const current = prev[id] || {
        name: original.name,
        price: original.pricePerKg,
        color: original.color,
      };
      return {
        ...prev,
        [id]: {
          ...current,
          [field]: field === "price" ? Math.max(0, parseFloat(val) || 0) : val,
        },
      };
    });
  };

  const handleSaveFlavorRow = async (id: string) => {
    const changes = editedFlavors[id];
    if (!changes) return;
    await updatePhotoCakeFlavor(id, {
      name: changes.name.trim(),
      pricePerKg: changes.price,
      color: changes.color,
    });
    setSavedFlavorId(id);
    setTimeout(() => setSavedFlavorId(null), 1500);
  };

  const handleCreateFlavorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlavorName.trim() || !newFlavorPrice) {
      alert("Please enter Flavor Name and Price per KG.");
      return;
    }
    await addPhotoCakeFlavor(newFlavorName.trim(), parseFloat(newFlavorPrice) || 600, newFlavorColor);
    setNewFlavorName("");
    setNewFlavorPrice("");
    setIsAddFlavorOpen(false);
  };

  const handleCreateWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeightLabel.trim() || !newWeightValue.trim()) {
      alert("Please enter Weight Label and Value.");
      return;
    }
    await addPhotoCakeWeight(
      newWeightLabel.trim(),
      newWeightValue.trim(),
      parseFloat(newWeightMultiplier) || 1.0
    );
    setNewWeightLabel("");
    setNewWeightValue("");
    setNewWeightMultiplier("1.0");
    setIsAddWeightOpen(false);
  };

  const handleCreateShapeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShapeName.trim()) {
      alert("Please enter Shape Name.");
      return;
    }
    await addPhotoCakeShape(
      newShapeName.trim(),
      newShapeLabel.trim() || `${newShapeName.trim()} Shape`,
      parseFloat(newShapeExtraPrice) || 0
    );
    setNewShapeName("");
    setNewShapeLabel("");
    setNewShapeExtraPrice("0");
    setIsAddShapeOpen(false);
  };

  const handleSavePrintCharge = async () => {
    const num = parseFloat(printChargeInput) || 0;
    await updatePhotoCakePrintCharge(num);
    setIsChargeSaved(true);
    setTimeout(() => setIsChargeSaved(false), 1500);
  };

  const handleAddTimeSlot = async () => {
    if (!newSlotInput.trim()) return;
    await addPhotoCakeTimeSlot(newSlotInput.trim());
    setNewSlotInput("");
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              <span>Photo Cake Customizer & Pricing</span>
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-chocolate-900">
              Photo Cake Options & Pricing Manager
            </h1>
            <p className="text-xs text-amber-800/80 max-w-2xl">
              Customize cake flavors, fixed prices per KG, shapes (Square, Round, Heart), weight tiers, edible sugar sheet printing charges, and available delivery time slots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/photo-cake"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-chocolate-900 text-xs font-black border border-amber-300 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Preview Customer Studio</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
            </a>
          </div>
        </div>

        {/* Master Service Enable / Disable Toggle Control */}
        <div className={`p-4 sm:p-5 rounded-2xl border-2 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isModuleEnabled
            ? "bg-emerald-50/90 border-emerald-300 shadow-sm"
            : "bg-rose-50/90 border-rose-300 shadow-sm"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
              isModuleEnabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-chocolate-900 uppercase tracking-wider">
                  Photo Cake Online Service:
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                  isModuleEnabled
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : "bg-rose-100 text-rose-900 border-rose-300"
                }`}>
                  {isModuleEnabled ? "🟢 ENABLED (Available)" : "🔴 DISABLED (Now it is not available)"}
                </span>
              </div>
              <p className="text-[11px] text-chocolate-800/80 mt-0.5">
                {isModuleEnabled
                  ? "Customers can design custom photo cakes on /photo-cake and submit bookings directly."
                  : "Online booking is paused on /photo-cake. A friendly notice with direct WhatsApp inquiry is shown."}
              </p>
            </div>
          </div>

          <button
            onClick={togglePhotoCakeModule}
            className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition flex items-center gap-2 shrink-0 ${
              isModuleEnabled
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce"
            }`}
          >
            {isModuleEnabled ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Click to Disable / Pause Photo Cakes</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Click to Enable Photo Cakes</span>
              </>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-amber-100 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("flavors")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "flavors"
                ? "bg-chocolate-900 text-amber-200 shadow-md"
                : "text-chocolate-900 hover:bg-amber-50"
            }`}
          >
            🎂 Flavors & Rates ({currentFlavors.length})
          </button>

          <button
            onClick={() => setActiveTab("shapes")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "shapes"
                ? "bg-chocolate-900 text-amber-200 shadow-md"
                : "text-chocolate-900 hover:bg-amber-50"
            }`}
          >
            ⏹️ Cake Shapes ({currentShapes.length})
          </button>

          <button
            onClick={() => setActiveTab("weights")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "weights"
                ? "bg-chocolate-900 text-amber-200 shadow-md"
                : "text-chocolate-900 hover:bg-amber-50"
            }`}
          >
            ⚖️ Weight Tiers ({currentWeights.length})
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "settings"
                ? "bg-chocolate-900 text-amber-200 shadow-md"
                : "text-chocolate-900 hover:bg-amber-50"
            }`}
          >
            ⚙️ Print Charge & Time Slots
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeTab === "requests"
                ? "bg-chocolate-900 text-amber-200 shadow-md"
                : "text-chocolate-900 hover:bg-amber-50"
            }`}
          >
            📸 Customer Photo Requests ({photoCakes.length})
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT: Flavors */}
      {activeTab === "flavors" && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 flex-wrap gap-2">
            <div>
              <h2 className="font-serif font-black text-lg text-chocolate-900">
                Cake Flavors & Rates per KG
              </h2>
              <p className="text-xs text-amber-800/80">
                Set base rates per KG for each flavor. These update the customer pricing instantly.
              </p>
            </div>

            <button
              onClick={() => setIsAddFlavorOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Flavor</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/90 border-b border-amber-200 text-[11px] font-black text-chocolate-900 uppercase tracking-wider">
                  <th className="py-3 px-4">Flavor Name</th>
                  <th className="py-3 px-4">Rate per KG (₹)</th>
                  <th className="py-3 px-4 text-center">Theme Color</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-amber-100 text-xs">
                {currentFlavors.map((flv) => {
                  const currentEdit = editedFlavors[flv.id];
                  const activeName = currentEdit !== undefined ? currentEdit.name : flv.name;
                  const activePrice = currentEdit !== undefined ? currentEdit.price : flv.pricePerKg;
                  const activeColor = currentEdit !== undefined ? currentEdit.color : flv.color;

                  const isModified =
                    currentEdit !== undefined &&
                    (currentEdit.name !== flv.name ||
                      currentEdit.price !== flv.pricePerKg ||
                      currentEdit.color !== flv.color);
                  const isJustSaved = savedFlavorId === flv.id;

                  return (
                    <tr key={flv.id} className="hover:bg-amber-50/40 transition">
                      {/* Editable Flavor Name */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <input
                          type="text"
                          value={activeName}
                          onChange={(e) => handleInlineFlavorChange(flv.id, "name", e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-chocolate-900 text-xs shadow-inner"
                        />
                      </td>

                      {/* Editable Rate per KG */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 w-32">
                          <span className="font-bold text-amber-800">₹</span>
                          <input
                            type="number"
                            min="100"
                            value={activePrice}
                            onChange={(e) => handleInlineFlavorChange(flv.id, "price", e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-black text-chocolate-900 text-xs text-right shadow-inner"
                          />
                          <span className="text-[10px] text-amber-700 font-bold">/kg</span>
                        </div>
                      </td>

                      {/* Editable Theme Color */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={activeColor}
                          onChange={(e) => handleInlineFlavorChange(flv.id, "color", e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold text-xs text-chocolate-900 shadow-inner capitalize"
                        >
                          <option value="chocolate">🍫 Chocolate</option>
                          <option value="redvelvet">❤️ Red Velvet</option>
                          <option value="blackforest">🍒 Black Forest</option>
                          <option value="vanilla">🍍 Vanilla / Pineapple</option>
                          <option value="butterscotch">🍯 Butterscotch</option>
                          <option value="mango">🥭 Mango</option>
                          <option value="berry">🍓 Strawberry / Berry</option>
                        </select>
                      </td>

                      {/* Customer Availability Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => togglePhotoCakeFlavor(flv.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black border transition ${
                            flv.is_available
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                        >
                          {flv.is_available ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3" />}
                          <span>{flv.is_available ? "Available" : "Hidden"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isModified ? (
                            <button
                              onClick={() => handleSaveFlavorRow(flv.id)}
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
                              if (confirm(`Remove flavor "${flv.name}"?`)) {
                                deletePhotoCakeFlavor(flv.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition"
                            title="Delete Flavor"
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
      )}

      {/* 2.5 TAB CONTENT: Shapes (Square, Round, Heart, etc.) */}
      {activeTab === "shapes" && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 flex-wrap gap-2">
            <div>
              <h2 className="font-serif font-black text-lg text-chocolate-900">
                Cake Shapes & Custom Geometry
              </h2>
              <p className="text-xs text-amber-800/80">
                Enable or configure cake shapes available for customer photo cakes (e.g. Modern Square, Classic Round, Heart).
              </p>
            </div>

            <button
              onClick={() => setIsAddShapeOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Cake Shape</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/90 border-b border-amber-200 text-[11px] font-black text-chocolate-900 uppercase tracking-wider">
                  <th className="py-3 px-4">Shape Name</th>
                  <th className="py-3 px-4">Display Label</th>
                  <th className="py-3 px-4">Extra Surcharge (₹)</th>
                  <th className="py-3 px-4 text-center">Customer Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-amber-100 text-xs">
                {currentShapes.map((shape) => (
                  <tr key={shape.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-chocolate-900 flex items-center gap-2">
                      <Square className="w-4 h-4 text-amber-700" />
                      <span>{shape.name}</span>
                    </td>

                    <td className="py-3.5 px-4 text-amber-900 font-semibold">
                      {shape.label}
                    </td>

                    <td className="py-3.5 px-4">
                      {shape.extraPrice > 0 ? (
                        <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-950 font-bold text-xs">
                          +₹{shape.extraPrice}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs">
                          Standard (₹0)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => togglePhotoCakeShape(shape.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black border transition ${
                          shape.is_available
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {shape.is_available ? <Eye className="w-3 h-3 text-emerald-700" /> : <EyeOff className="w-3 h-3" />}
                        <span>{shape.is_available ? "Available" : "Hidden"}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove shape "${shape.name}"?`)) {
                            deletePhotoCakeShape(shape.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition"
                        title="Delete Shape"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TAB CONTENT: Weight Tiers */}
      {activeTab === "weights" && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100 flex-wrap gap-2">
            <div>
              <h2 className="font-serif font-black text-lg text-chocolate-900">
                Cake Weight Tiers & Price Multipliers
              </h2>
              <p className="text-xs text-amber-800/80">
                Configure size options (e.g. 0.5kg, 1kg, 2kg) and their price scaling multiplier.
              </p>
            </div>

            <button
              onClick={() => setIsAddWeightOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs shadow flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Weight Option</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/90 border-b border-amber-200 text-[11px] font-black text-chocolate-900 uppercase tracking-wider">
                  <th className="py-3 px-4">Label (e.g. 1.5 kg (Celebration))</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4 text-center">Multiplier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-amber-100 text-xs">
                {currentWeights.map((w) => (
                  <tr key={w.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-chocolate-900">
                      {w.label}
                    </td>

                    <td className="py-3.5 px-4 text-amber-900 font-semibold">
                      {w.value}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-md bg-amber-100 text-chocolate-950 font-black text-xs">
                        {w.multiplier}x
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove weight tier "${w.label}"?`)) {
                            deletePhotoCakeWeight(w.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition"
                        title="Delete Weight"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT: Settings (Print Charge & Time Slots) */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Edible Sugar Sheet Printing Fee */}
          <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                📸
              </div>
              <div>
                <h3 className="font-serif font-black text-base text-chocolate-900">
                  Edible Sugar Sheet Printing Fee
                </h3>
                <p className="text-xs text-amber-800/80">Added automatically to photo cake base price</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider">
                Printing Charge (₹)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-xl border-2 border-amber-300">
                  <span className="font-black text-chocolate-900">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={printChargeInput}
                    onChange={(e) => setPrintChargeInput(e.target.value)}
                    className="w-28 font-black text-sm bg-transparent focus:outline-none text-chocolate-900"
                  />
                </div>

                <button
                  onClick={handleSavePrintCharge}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{isChargeSaved ? "Saved!" : "Save Fee"}</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-800">Currently active on customer store: <strong>₹{photoCakeConfig?.printCharge ?? 150}</strong></p>
            </div>

            {/* Sugar Sheet Format Specification */}
            <div className="pt-3 border-t border-amber-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-chocolate-900 uppercase tracking-wider">
                  📄 Print Sheet Size Standard
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-bold text-[10px]">
                  A4 Sheet
                </span>
              </div>
              <p className="text-xs text-chocolate-900 font-bold">
                Max Print Area: 8.27 × 11.69 inches (210 × 297 mm) or scaled below
              </p>
              <p className="text-[10px] text-amber-800/80 leading-tight">
                All photos are printed on standard A4 edible sugar sheets or trimmed/scaled to fit round, square, or heart cakes.
              </p>
            </div>
          </div>

          {/* Delivery & Pickup Time Slots */}
          <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-black text-base text-chocolate-900">
                  Delivery / Pickup Time Slots
                </h3>
                <p className="text-xs text-amber-800/80">Available slots for customer selection</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {currentTimeSlots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-chocolate-900 text-xs font-bold border border-amber-300"
                  >
                    <span>{slot}</span>
                    <button
                      onClick={() => deletePhotoCakeTimeSlot(slot)}
                      className="hover:text-rose-600 transition"
                      title="Remove Slot"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="e.g. 09:00 PM - 11:00 PM"
                  value={newSlotInput}
                  onChange={(e) => setNewSlotInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <button
                  onClick={handleAddTimeSlot}
                  className="px-4 py-2 rounded-xl bg-chocolate-900 hover:bg-black text-amber-200 font-bold text-xs transition"
                >
                  + Add Slot
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 5. TAB CONTENT: Customer Photo Cake Requests */}
      {activeTab === "requests" && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div>
              <h2 className="font-serif font-black text-lg text-chocolate-900">
                Customer Photo Cake Submissions
              </h2>
              <p className="text-xs text-amber-800/80">
                Live photo uploads, custom messages, and baking status from customers.
              </p>
            </div>
            <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
              {photoCakes.length} Total Requests
            </span>
          </div>

          {photoCakes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-amber-50/90 border-b border-amber-200 text-[11px] font-black text-chocolate-900 uppercase tracking-wider">
                    <th className="py-3 px-3">Photo Upload</th>
                    <th className="py-3 px-3">Customer & Contact</th>
                    <th className="py-3 px-3">Cake Specs</th>
                    <th className="py-3 px-3">Message on Cake</th>
                    <th className="py-3 px-3">Delivery Schedule</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-amber-100 text-xs">
                  {photoCakes.map((req) => (
                    <tr key={req.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-3">
                        <img
                          src={req.image_url || req.photo_url || "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80"}
                          alt="Cake Photo Preview"
                          className="w-14 h-14 rounded-xl object-cover border-2 border-amber-300 shadow-sm"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-chocolate-900">{req.customer_name}</p>
                        <a
                          href={`https://wa.me/91${req.customer_phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 hover:underline mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{req.customer_phone}</span>
                        </a>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-chocolate-900">{req.cake_flavor || req.flavor || "Photo Cake"}</p>
                        <p className="text-[11px] text-amber-800">{req.cake_weight || req.weight || "1.0 kg"} • {req.is_eggless || req.eggless ? "🌱 Eggless" : "🥚 With Egg"}</p>
                        <p className="text-[11px] font-black text-chocolate-900 mt-0.5">{formatCurrency(req.total_price || req.estimated_price || 0)}</p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-chocolate-900 font-semibold italic text-xs max-w-xs">
                          "{req.cake_message || req.message || "No Message"}"
                        </div>
                      </td>

                      <td className="py-3 px-3 text-amber-900">
                        <p className="font-bold">{req.delivery_date}</p>
                        <p className="text-[11px] text-amber-700">{req.delivery_time}</p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <select
                          value={req.status}
                          onChange={(e) => updatePhotoCakeStatus(req.id, e.target.value as any)}
                          className="text-xs px-2.5 py-1.5 rounded-xl border-2 border-amber-300 font-bold bg-white focus:outline-none"
                        >
                          <option value="Pending">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Printed & Baking">Printed & Baking</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Camera className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="font-bold text-chocolate-900">No customer photo cake requests yet.</p>
              <p className="text-xs text-amber-800">Submissions from `/photo-cake` will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Add Flavor */}
      {isAddFlavorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <h3 className="font-serif font-black text-lg text-chocolate-900">Add New Cake Flavor</h3>
              <button onClick={() => setIsAddFlavorOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFlavorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Flavor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Belgian Dark Chocolate Truffle"
                  value={newFlavorName}
                  onChange={(e) => setNewFlavorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Rate / KG (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 750"
                    value={newFlavorPrice}
                    onChange={(e) => setNewFlavorPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Theme Color
                  </label>
                  <select
                    value={newFlavorColor}
                    onChange={(e) => setNewFlavorColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold"
                  >
                    <option value="chocolate">Chocolate</option>
                    <option value="redvelvet">Red Velvet</option>
                    <option value="blackforest">Black Forest</option>
                    <option value="vanilla">Vanilla / Pineapple</option>
                    <option value="butterscotch">Butterscotch</option>
                    <option value="mango">Mango</option>
                    <option value="berry">Strawberry / Berry</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsAddFlavorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs shadow"
                >
                  Add Flavor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Weight */}
      {isAddWeightOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <h3 className="font-serif font-black text-lg text-chocolate-900">Add Weight Tier</h3>
              <button onClick={() => setIsAddWeightOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWeightSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2.5 kg (Grand Gala)"
                  value={newWeightLabel}
                  onChange={(e) => setNewWeightLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Value *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2.5 kg"
                    value={newWeightValue}
                    onChange={(e) => setNewWeightValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                    Price Multiplier *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="0.1"
                    placeholder="e.g. 2.5"
                    value={newWeightMultiplier}
                    onChange={(e) => setNewWeightMultiplier(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-black"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsAddWeightOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs shadow"
                >
                  Add Weight Option
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Shape */}
      {isAddShapeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <h3 className="font-serif font-black text-lg text-chocolate-900">Add New Cake Shape</h3>
              <button onClick={() => setIsAddShapeOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShapeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Shape Key / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hexagon or Rectangle"
                  value={newShapeName}
                  onChange={(e) => setNewShapeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Rectangle 🔲"
                  value={newShapeLabel}
                  onChange={(e) => setNewShapeLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-chocolate-900 uppercase tracking-wider mb-1">
                  Extra Surcharge / Premium Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 for standard price"
                  value={newShapeExtraPrice}
                  onChange={(e) => setNewShapeExtraPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white font-black"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsAddShapeOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs shadow"
                >
                  Add Shape
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
