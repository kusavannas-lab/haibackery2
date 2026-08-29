import { NextResponse } from "next/server";
import { STORE_NAME, STORE_ADDRESS, ADMIN_NAME, ADMIN_PHONE } from "@/lib/whatsapp";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    store: STORE_NAME,
    address: STORE_ADDRESS,
    proprietor: ADMIN_NAME,
    phone: ADMIN_PHONE,
    timestamp: new Date().toISOString(),
  });
}
