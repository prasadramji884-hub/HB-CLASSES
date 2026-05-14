import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "react-hot-toast";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "HB CLASSES - Online English Coaching",
  description: "Premium online English coaching platform with live classes, recorded videos, and progress tracking.",
  keywords: ["english coaching", "online classes", "hb classes", "education"],
  authors: [{ name: "HB Classes" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#07091a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} font-dm antialiased`}>
        <ThemeProvider defaultTheme="dark" storageKey="hb-theme">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--surface)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}