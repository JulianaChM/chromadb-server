
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { initializeApp } from '@/lib/ai/initializer';

const inter = Inter({ subsets: ["latin"] });

// Iniciamos la aplicación de forma asíncrona sin bloquear el renderizado del layout
// Esto evita que el servidor se detenga si hay problemas de red o configuración inicial
initializeApp().catch(err => {
  console.error("Fallo crítico en la inicialización de la app:", err);
});

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
