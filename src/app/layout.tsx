import type { Metadata } from "next";
import "./globals.css";
import AuthGate from "./components/AuthGate";
import Providers from "./Providers";
import Navbar from "./components/NavBar";
import { ChatFab } from "./chat/ChatFab";
import { TypingProvider } from "@/context/TypingContext";

export const metadata: Metadata = {
  title: "MusicAula",
  description: "Aprende piano y teoría musical a tu ritmo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="es-MX">
      <body className="antialiased bg-background text-foreground">
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
