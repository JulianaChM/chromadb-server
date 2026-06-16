'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function UploadDialog() {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (files: File[]) => {
    const supportedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const validFiles = files.filter(
      (file) =>
        supportedTypes.includes(file.type) ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md')
    );

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setProgress(0);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));

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
        description: `Se procesaron ${result.processed} segmentos de documentos`,
      });

      setProgress(100);
      setTimeout(() => {
        setSelectedFiles([]);
        setOpen(false);
        setProgress(0);
      }, 1000);
    } catch (error: any) {
      toast({
        title: '❌ Error en la carga',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Cargar Protocolos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cargar Protocolos de Hospitales</DialogTitle>
          <DialogDescription>
            Sube documentos PDF, TXT o MD para indexarlos en el asistente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all"
          >
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Selecciona archivos</p>
            <p className="text-xs text-slate-500">o arrastra aquí</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,.docx"
              onChange={(e) => handleFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''} seleccionado{selectedFiles.length > 1 ? 's' : ''}
              </p>
              <div className="max-h-[150px] overflow-y-auto space-y-1">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded text-xs">
                    <span className="truncate">{file.name}</span>
                    <Badge variant="secondary">
                      {(file.size / 1024).toFixed(0)} KB
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Procesando documentos...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setSelectedFiles([])}
              disabled={isLoading || selectedFiles.length === 0}
              size="sm"
            >
              Limpiar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isLoading || selectedFiles.length === 0}
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Cargar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}