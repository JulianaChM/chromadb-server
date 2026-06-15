import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { initializeVectorStore } from "@/lib/ai/bootstrap";

const inter = Inter({ subsets: ["latin"] });

// Ejecuta la inicialización de la base de datos de vectores al iniciar el servidor.
// No se usa await para no bloquear el arranque.
initializeVectorStore();

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
