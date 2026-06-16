'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UploadProgress {
  total: number;
  processed: number;
  currentFile: string;
}

export function useDocumentUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();

  const uploadDocuments = async (files: File[]) => {
    setIsLoading(true);
    setProgress({ total: files.length, processed: 0, currentFile: '' });

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al cargar documentos');
      }

      const result = await response.json();

      toast({
        title: '✅ Carga completada',
        description: `Se procesaron ${result.processed} documentos correctamente`,
      });

      setProgress(null);
      return result;
    } catch (error: any) {
      toast({
        title: '❌ Error en la carga',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadDocuments, isLoading, progress };
}