import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "TrustMovers — For One Stop Moving & Storage",
  description:
    "Book your move, track every step, and get peace of mind from start to finish. Clear status updates. Real-time crew info. No surprises.",
  openGraph: {
    title: "TrustMovers — For One Stop Moving & Storage",
    description:
      "Track your move in real time. Secure booking. Professional crew. Clear status every step of the way.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
