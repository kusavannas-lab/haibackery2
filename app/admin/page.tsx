"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/executive");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-bakery-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-amber-900 font-semibold">Loading High Bakery Admin Dashboard...</p>
      </div>
    </div>
  );
}
