import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import "./globals.css"
import AuthProvider from "@/components/providers/AuthProvider"
import { CartProvider } from "@/contexts/CartContext"
import Navbar from "@/components/Navbar"
import { Footer } from "@/components/sections"
import { Toaster } from "sonner"
import WhatsAppFloat from "@/components/WhatsAppFloat"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "ByBlue Shop - Tecnología Premium",
  description: "La tecnología que define el futuro, hoy. iPhone, laptops y accesorios de última generación.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${workSans.variable} ${openSans.variable} dark`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <WhatsAppFloat />
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'bg-background border-border text-foreground',
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
