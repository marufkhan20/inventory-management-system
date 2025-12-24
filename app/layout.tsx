import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Barmind",
    default: "Barmind - Smart Bar Inventory Management",
  },
  description:
    "Barmind is a professional inventory management system designed for bars and restaurants to track stock, prices, and status in real-time.",
  keywords: [
    "Bar Inventory",
    "Stock Management",
    "Barmind",
    "Restaurant Tech",
    "Inventory Tracker",
  ],
  authors: [{ name: "Arseniy Denissov" }],
  // icons: {
  //   icon: "/favicon.ico", // Ensure you have a favicon in your public folder
  //   shortcut: "/logo.png",
  //   apple: "/apple-touch-icon.png",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
