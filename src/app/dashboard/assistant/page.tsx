'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SendHorizonal, AlertTriangle } from 'lucide-react';
import { UploadDialog } from '@/components/documents/upload-dialog';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  isRagResult?: boolean;
  details?: string;
  stack?: string;
}

async function askAssistant(question: string) {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  const responseData = await response.json();

  if (!response.ok) {
    // Si responseData está vacío, crea un objeto de error por defecto
    if (Object.keys(responseData).length === 0) {
      throw {
        error: 'Respuesta vacía del servidor',
        details: `El servidor respondió con un estado ${response.status} pero sin un cuerpo de error.`
      };
    }
    throw responseData;
  }

  return responseData;
}


export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAssistant(input);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.output,
        timestamp: new Date(),
        isRagResult: response.sourceDocuments && response.sourceDocuments.length > 0,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("Error capturado en el frontend:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'error',
        content: error.error || 'Hubo un problema al conectar con el asistente.',
        details: error.details || 'No hay detalles adicionales.',
        stack: error.stack,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle>CodeBlueAI - Asistente de Emergencias</CardTitle>
              <CardDescription>Consulta protocolos, analiza incidentes y obtén recomendaciones urgentes.</CardDescription>
            </div>
            <UploadDialog />
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role !== 'user' && (
                <Avatar>
                  <AvatarFallback>{msg.role === 'error' ? <AlertTriangle className="text-red-500" /> : '🔵'}</AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg px-4 py-2 max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : msg.role === 'error' ? 'bg-destructive/10' : 'bg-muted'}`}>
                {msg.role === 'assistant' || msg.role === 'error' ? (
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.details && (
                  <pre className="mt-2 p-2 bg-gray-700 text-white rounded-md text-xs overflow-x-auto whitespace-pre-wrap">
                    {msg.details}
                  </pre>
                )}
                <time className="text-xs text-muted-foreground float-right mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </time>
                {msg.isRagResult && <span className="text-xs text-blue-500 block mt-1">✓ Obtenido del historial</span>}
              </div>
              {msg.role === 'user' && (
                <Avatar>
                  <AvatarFallback>👤</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-8">
              <p>Bienvenido a CodeBlueAI</p>
              <p className="text-sm">Ej: "¿Cuál es el protocolo para una emergencia cardíaca?" o "¿Hay incidentes críticos activos?"</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Escribe tu pregunta aquí..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <SendHorizonal className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
