
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Navigation, Truck, Building2, MapPin, Info, CheckCircle2, RefreshCw, GitFork, ListChecks } from 'lucide-react';
import { findBestRoute, Point, RouteResult } from '@/lib/a-star';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DispatchMapPage() {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Simulación de puntos para el algoritmo A*
  const ambulancePos: Point = { x: 10, y: 10 };
  const hospitalPos: Point = { x: 45, y: 32 };

  const calculateAStar = () => {
    setIsCalculating(true);
    // Pequeño delay para simular proceso de cálculo
    setTimeout(() => {
      const result = findBestRoute(ambulancePos, hospitalPos);
      setRoute(result);
      setIsCalculating(false);
    }, 800);
  };

  useEffect(() => {
    calculateAStar();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-700">
      {/* Visualización del Mapa */}
      <div className="flex-1 relative bg-slate-200 rounded-3xl overflow-hidden border-4 border-white shadow-inner shadow-slate-300">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mapview/1200/1200')] bg-cover bg-center opacity-60"></div>
        
        {/* Marcadores de Emergencia y Ambulancia */}
        <div className="absolute top-1/4 left-1/3">
          <div className="h-10 w-10 bg-destructive rounded-full border-4 border-white shadow-lg pulse-emergency flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <Badge className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 text-destructive border-none shadow-sm font-bold text-[10px]">INCIDENTE</Badge>
        </div>

        <div className="absolute bottom-1/3 right-1/4">
          <div className="h-10 w-10 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <Badge className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 text-primary border-none shadow-sm font-bold text-[10px]">UNIT-101</Badge>
        </div>

        {/* Leyenda */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <GitFork className="h-3 w-3 text-primary" /> Ruta A* Calculada con Éxito
          </div>
        </div>
      </div>

      {/* Panel de Despacho y Algoritmo */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden flex flex-col flex-1">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GitFork className="h-4 w-4 text-primary" /> Inteligencia de Ruta (A*)
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Estado del Algoritmo</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Camino Optimizado</p>
                      <p className="text-xs text-slate-500 italic">f(n) = g(n) + h(n)</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-none px-3">ÓPTIMO</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border text-center">
                    <p className="text-2xl font-bold text-primary">{route?.estimatedTimeMinutes || '--'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Minutos</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border text-center">
                    <p className="text-2xl font-bold text-primary">{route?.cost || '--'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nodos</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ListChecks className="h-3 w-3" /> Puntos de Ruta (Waypoints)
                  </p>
                  <div className="space-y-2">
                    {route?.path.slice(0, 5).map((point, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-600">
                        <span className="font-bold">Nodo {idx + 1}</span>
                        <span>X: {point.x}, Y: {point.y}</span>
                      </div>
                    ))}
                    {route && route.path.length > 5 && (
                      <p className="text-[10px] text-center text-slate-400 font-medium">
                        + {route.path.length - 5} puntos calculados adicionales
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      La ruta evita zonas de tráfico denso basándose en la distancia Manhattan y el historial de n8n.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t space-y-2 mt-auto">
             <Button className="w-full rounded-full bg-primary shadow-lg border-none py-6 font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Confirmar Despacho
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-full border-slate-200 py-6 font-bold flex items-center justify-center gap-2"
              onClick={calculateAStar}
              disabled={isCalculating}
            >
              <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} /> {isCalculating ? 'Procesando...' : 'Recalcular Ruta'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
