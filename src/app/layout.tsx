import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthGate from "./components/AuthGate";
import Providers from "./Providers";
import Navbar from "./components/NavBar";
import { ChatFab } from "./chat/ChatFab";
import { TypingProvider } from "@/context/TypingContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Piano",
  description: "Sintetizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <Providers>
          <TypingProvider>
            <Navbar />
            <AuthGate>{children}</AuthGate>
            <ChatFab />
          </TypingProvider>
        </Providers>
      </body>
    </html>
  );
}
