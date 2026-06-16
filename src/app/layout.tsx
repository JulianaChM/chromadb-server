import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { initializeApp } from '@/lib/ai/initializer';

const inter = Inter({ subsets: ["latin"] });

// Ejecuta la inicialización de la app al iniciar el servidor.
// Esto asegura que el bootstrap de embeddings se ejecute una sola vez.
await initializeApp();

export const metadata: Metadata = {
  title: "Sistema de Gestión de Emergencias",
  description: "Plataforma para coordinar ambulancias, hospitales e incidentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
