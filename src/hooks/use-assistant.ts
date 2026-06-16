'use client';

import { useState } from "react";
import { SearchFilters } from "@/lib/ai/vector-store";

export interface SourceDocument {
  id: string;
  tipo: string;
  gravedad: string;
  estado: string;
  nombre_paciente: string;
  edad_aproximada: number;
  descripcion: string;
  direccion: string;
  createdAt: string;
  relevanceScore: string;
}

export interface AssistantResponse {
  success: boolean;
  output: string;
  sourceDocuments: SourceDocument[];
  documentsCount: number;
}

export function useAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = async (
    question: string,
    filters?: SearchFilters,
    similarityThreshold?: number
  ): Promise<AssistantResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, filters, similarityThreshold }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMsg);
      console.error("Error en useAssistant:", errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { query, loading, error };
}