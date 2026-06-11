"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Navigation, Truck, Building2, MapPin, Info, CheckCircle2, RefreshCw, GitFork } from 'lucide-react';
import { findBestRoute, Point, RouteResult } from '@/lib/a-star';

export default function DispatchMapPage() {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Simulación de puntos para el algoritmo A*
  const ambulancePos: Point = { x: 10, y: 10 };
  const hospitalPos: Point = { x: 45, y: 32 };

  const calculateAStar = () => {
    setIsCalculating(true);
    // Pequeño delay para simular proceso
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
      {/* Simulation of a Map */}
      <div className="flex-1 relative bg-slate-200 rounded-3xl overflow-hidden border-4 border-white shadow-inner shadow-slate-300">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mapview/1200/1200')] bg-cover bg-center opacity-60"></div>
        
        {/* Marcadores */}
        <div className="absolute top-1/4 left-1/3">
          <div className="h-8 w-8 bg-destructive rounded-full border-4 border-white shadow-lg pulse-emergency flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/4">
          <div className="h-8 w-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <Truck className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <GitFork className="h-3 w-3 text-primary" /> Ruta A* Calculada
          </div>
        </div>
      </div>

      {/* Side Dispatch Info */}
      <div className="w-full lg:w-96 space-y-4 flex flex-col">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden flex flex-col flex-1">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GitFork className="h-4 w-4 text-primary" /> Algoritmo A* Pathfinding
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Estado de la Ruta</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Camino Óptimo</p>
                    <p className="text-xs text-slate-500">Calculado mediante A*</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-none">Activo</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border text-center">
                  <p className="text-2xl font-bold text-primary">{route?.estimatedTimeMinutes || '--'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Minutos</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border text-center">
                  <p className="text-2xl font-bold text-primary">{route?.cost || '--'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nodos A*</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explicación del Algoritmo</p>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "El algoritmo A* ha determinado que la ruta más eficiente evita las zonas de congestión actuales basándose en la función de coste f(n) = g(n) + h(n), minimizando el tiempo de traslado al General Medical Center."
                </p>
              </div>
            </div>
          </CardContent>
          <div className="p-4 bg-slate-50 border-t space-y-2">
             <Button className="w-full rounded-full bg-primary shadow-lg border-none py-6 font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Confirmar Ruta A*
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-full border-slate-200 py-6 font-bold flex items-center gap-2"
              onClick={calculateAStar}
              disabled={isCalculating}
            >
              <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} /> Recalcular (A*)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
