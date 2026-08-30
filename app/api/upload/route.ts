import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://puwjprtxpmxwasjxdmyc.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let fileBuffer: Buffer;
    let mimeType = "image/jpeg";
    let fileName = `cake-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }
      mimeType = file.type || "image/jpeg";
      const ext = file.name.split(".").pop() || "jpg";
      fileName = `cake-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const bytes = await file.arrayBuffer();
      fileBuffer = Buffer.from(bytes);
    } else {
      const body = await req.json();
      const { dataUrl, name } = body;
      if (!dataUrl) {
        return NextResponse.json({ success: false, error: "No dataUrl provided" }, { status: 400 });
      }
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        const ext = mimeType.split("/")[1] || "jpg";
        fileName = name || `cake-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        fileBuffer = Buffer.from(matches[2], "base64");
      } else {
        return NextResponse.json({ success: false, error: "Invalid dataUrl" }, { status: 400 });
      }
    }

    // Upload to Supabase cake-photos bucket
    const cleanUrl = SUPABASE_URL.replace(/^https?:\/\//, "");
    const uploadRes = await fetch(`https://${cleanUrl}/storage/v1/object/cake-photos/${fileName}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": mimeType,
        "x-upsert": "true",
      },
      body: new Uint8Array(fileBuffer),
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Supabase Storage Upload failed:", uploadRes.status, errText);
      return NextResponse.json({ success: false, error: "Storage upload failed" }, { status: 500 });
    }

    const publicUrl = `https://${cleanUrl}/storage/v1/object/public/cake-photos/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (err: any) {
    console.error("Upload API route error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
