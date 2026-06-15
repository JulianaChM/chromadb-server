'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SendHorizonal } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isRagResult?: boolean;
}

async function askAssistant(question: string) {
    const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falló la solicitud a la API del asistente');
    }

    return response.json();
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
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Hubo un problema al conectar con el asistente. Por favor, inténtalo de nuevo.',
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
          <CardTitle>Asistente de IA</CardTitle>
          <CardDescription>Consulta el historial de incidentes para obtener información relevante.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <Avatar>
                  <AvatarFallback>IA</AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg px-4 py-2 max-w-[70%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <time className="text-xs text-muted-foreground float-right mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </time>
                {msg.isRagResult && <span className="text-xs text-blue-500 block mt-1">✓ Obtenido del historial</span>}
              </div>
              {msg.role === 'user' && (
                <Avatar>
                  <AvatarFallback>TÚ</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-8">
              <p>Haz una pregunta para comenzar.</p>
              <p className="text-sm">Ej: "¿Hubo incidentes de tráfico cerca del hospital central el mes pasado?"</p>
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
