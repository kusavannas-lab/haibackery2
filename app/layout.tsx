import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cart-drawer";
import GlobalAuthGate from "@/components/global-auth-gate";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Hai Backery | Fresh Sweets, Cakes, Biscuits & Custom Photo Cakes",
  description: "Hai Backery at Barrage Center, Hiramandalam, Srikakulam. Order fresh desi ghee sweets, Osmania biscuits, birthday cakes & custom photo cakes online with instant WhatsApp delivery.",
  keywords: ["Hai Backery", "Hai Bakery", "Barrage Center Bakery", "Hiramandalam Cakes", "Srikakulam Sweets", "Custom Photo Cakes", "Shekhar Rao"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${outfit.variable} scroll-smooth w-full overflow-x-hidden`}>
      <body className="font-sans antialiased min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-[#fdfaf6] text-chocolate-900 selection:bg-amber-200 selection:text-chocolate-900">
        <GlobalAuthGate>
          <Navbar />
          <main className="flex-1 w-full max-w-full overflow-x-hidden">
            {children}
          </main>
          <CartDrawer />
          <Footer />
        </GlobalAuthGate>
      </body>
    </html>
  );
}
