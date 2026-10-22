import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { useEffect } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kassie's Recipes",
  description: "Recipies for Kassie Baking",
  icons: {icon: '/favicon.ico'}
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dark by default (homeauto style); light only if explicitly chosen */}
        <script dangerouslySetInnerHTML={{__html: `(function(){try{if(localStorage.getItem('theme')!=='light'){document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})();`}} />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
