import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import ErrorBoundary from "@/components/error-boundary";
import Script from "next/script";

const inter = Inter({
 variable: "--font-inter",
 subsets: ["latin"],
 weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
 title: "PulseDilli",
 description: "The real time pulse of Delhi",
 icons: {
 icon: "/pulsedilli_logo-removebg.png",
 apple: "/pulsedilli_logo-removebg.png",
 shortcut: "/pulsedilli_logo-removebg.png",
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
 className={`${inter.variable} h-full antialiased`}
 suppressHydrationWarning
 >
 <head>
 <link
 href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
 rel="stylesheet"
 />
 <Script src="https://cdn.jsdelivr.net/npm/apexcharts" strategy="beforeInteractive" />
 </head>
 <body className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] font-[family-name:var(--font-inter)]">
 <ErrorBoundary
 fallback={
 <div className="flex h-full items-center justify-center bg-[#F5F0E9]">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
 <p className="text-gray-600 mb-6">We're sorry, but something unexpected happened.</p>
 <a
 href="/"
 className="inline-block px-4 py-2 bg-blue-600 text-[var(--btn-primary-fg)] rounded hover:bg-blue-700"
 >
 Reload Page
 </a>
 </div>
 </div>
 }
 >
 <Sidebar />
 <main className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 relative bg-[#F8FAFC]">

 
 <div className="flex-1 overflow-hidden w-full">
 <ErrorBoundary
 fallback={
 <div className="flex h-full items-center justify-center">
 <div className="text-center">
 <h2 className="text-xl font-semibold text-red-600 mb-2">Content Error</h2>
 <p className="text-gray-600 mb-4">This section failed to load.</p>
 <a
 href="/"
 className="inline-block px-3 py-1 bg-blue-600 text-[var(--btn-primary-fg)] rounded text-sm hover:bg-blue-700"
 >
 Reload
 </a>
 </div>
 </div>
 }
 >
 {children}
 </ErrorBoundary>
 </div>
 </main>
 </ErrorBoundary>
 </body>
 </html>
 );
}
