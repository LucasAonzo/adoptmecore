import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // <-- Remove Inter
import { Manrope, Montserrat, Shantell_Sans } from 'next/font/google' // <-- Restore custom fonts
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

// Restore custom font configurations
const fontBody = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '700'],
})

const fontHeading = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['600', '700'],
})

const fontAccent = Shantell_Sans({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
  weight: ['700'], 
})

// Remove Inter instance
// const inter = Inter({ subsets: ["latin"] }); 

export const metadata: Metadata = {
  title: "AdoptMe Tucumán",
  description: "Encuentra tu compañero ideal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Restore custom font variables to html tag
    <html lang="es" className={`${fontBody.variable} ${fontHeading.variable} ${fontAccent.variable}`}>
      {/* Remove inter.className from body */}
      <body className={`flex flex-col h-screen bg-background`}> 
        <ReactQueryProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
