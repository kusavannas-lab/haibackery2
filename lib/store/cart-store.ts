"use client";

import { useState, useEffect } from "react";
import { CartItem, Product } from "../types";

const CART_STORAGE_KEY = "hb_cart_items_v1";

let globalIsCartOpen = false;

export const openGlobalCart = () => {
  globalIsCartOpen = true;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hb_cart_drawer_toggle", { detail: true }));
  }
};

export const closeGlobalCart = () => {
  globalIsCartOpen = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hb_cart_drawer_toggle", { detail: false }));
  }
};

export const toggleGlobalCart = () => {
  if (globalIsCartOpen) closeGlobalCart();
  else openGlobalCart();
};

export function useCartStore() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(globalIsCartOpen);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // fallback
    } finally {
      setIsLoaded(true);
    }

    const handleCartSync = () => {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) setItems(JSON.parse(saved));
      } catch {
        // ignore
      }
    };

    const handleDrawerSync = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setIsOpen(customEvent.detail);
    };

    window.addEventListener("hb_cart_updated", handleCartSync);
    window.addEventListener("hb_cart_drawer_toggle", handleDrawerSync);
    return () => {
      window.removeEventListener("hb_cart_updated", handleCartSync);
      window.removeEventListener("hb_cart_drawer_toggle", handleDrawerSync);
    };
  }, []);

  const notifyCartChange = (newItems: CartItem[]) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hb_cart_updated"));
    }
  };

  const addItem = (product: Product, quantity: number = 1, selectedWeight?: string) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedWeight === selectedWeight
      );
      let updated: CartItem[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx].quantity += quantity;
      } else {
        updated = [...prev, { product, quantity, selectedWeight }];
      }
      notifyCartChange(updated);
      return updated;
    });
    openGlobalCart();
  };

  const removeItem = (productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      notifyCartChange(updated);
      return updated;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      notifyCartChange(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    notifyCartChange([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCost = items.reduce((sum, item) => sum + (item.product.cost_price ?? 0) * item.quantity, 0);
  const totalProfit = subtotal - totalCost;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    isLoaded,
    isOpen,
    openCart: openGlobalCart,
    closeCart: closeGlobalCart,
    toggleCart: toggleGlobalCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    totalProfit,
    itemCount,
  };
}
