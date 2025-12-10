import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_Thai } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
})

export const metadata: Metadata = {
  title: "Campus Event & Photo Finder",
  description: "Find your photos from campus events using AI face search",
  generator: "v0.app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Photo Finder",
  },
  formatDetection: {
    telephone: false,
  },
}

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#82181a" />
      </head>
      <body className={`${_notoSansThai.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
