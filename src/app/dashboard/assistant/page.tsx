
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Send, Bot, User, Loader2, Sparkles, BookOpen, MapPin, History } from 'lucide-react';
import { aiProtocolAndInfoAssistant } from '@/ai/flows/ai-protocol-and-info-assistant';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hola, soy CodeBlueAI, tu asistente inteligente de despacho. ¿En qué puedo ayudarte hoy? Puedo explicarte protocolos médicos, detalles de rutas o disponibilidad hospitalaria.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
      const result = await aiProtocolAndInfoAssistant({ query: input });
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-700">
      <div className="hidden lg:flex flex-col gap-4">
        <Card className="border-none shadow-sm h-full rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Historial de Consultas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              "Protocolo RCP",
              "Disponibilidad UCI en Hospital General",
              "Explicación Ruta E-001",
              "Hospitales con Trauma"
            ].map((q, idx) => (
              <Button key={idx} variant="ghost" className="w-full justify-start text-xs rounded-xl h-auto py-3 px-3 hover:bg-slate-100 border border-transparent hover:border-slate-200">
                <MessageSquare className="h-3 w-3 mr-2 text-slate-400" />
                <span className="truncate">{q}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3 flex flex-col h-full gap-4">
        <Card className="flex-1 border-none shadow-sm flex flex-col rounded-3xl overflow-hidden">
          <CardHeader className="border-b bg-white flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-2xl">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Asistente de Protocolos</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">AI System Active</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                <BookOpen className="h-3 w-3 mr-1" /> Protocolos
              </Button>
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                <MapPin className="h-3 w-3 mr-1" /> Rutas
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="h-8 w-8 mt-1 shrink-0">
                        {msg.role === 'assistant' ? (
                          <div className="bg-primary h-full w-full flex items-center justify-center">
                            <Activity className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <>
                            <AvatarImage src="https://picsum.photos/seed/doctor1/50/50" />
                            <AvatarFallback>DR</AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={`space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-slate-400 px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs text-slate-500 font-medium italic">Analizando protocolos...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 bg-slate-50/50 border-t">
              <div className="relative">
                <Input
                  placeholder="Pregunta sobre protocolos o disponibilidad..."
                  className="pr-20 py-7 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 transition-transform active:scale-95"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                CodeBlueAI Assistant v2.0 • Provee asistencia consultiva, no reemplaza el criterio médico profesional.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
