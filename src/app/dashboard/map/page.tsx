
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Navigation, Truck, Building2, MapPin, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function DispatchMapPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-700">
      {/* Simulation of a Map */}
      <div className="flex-1 relative bg-slate-200 rounded-3xl overflow-hidden border-4 border-white shadow-inner shadow-slate-300">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mapview/1200/1200')] bg-cover bg-center opacity-60"></div>
        
        {/* Map Markers Simulation */}
        <div className="absolute top-1/4 left-1/3">
          <div className="relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-primary/20 whitespace-nowrap z-10 flex items-center gap-2">
              <span className="text-xs font-bold">Incidente #E-001</span>
              <Badge variant="destructive" className="text-[8px] h-4">Crítico</Badge>
            </div>
            <div className="h-8 w-8 bg-destructive rounded-full border-4 border-white shadow-lg pulse-emergency flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/3 right-1/4">
          <div className="relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-primary/20 whitespace-nowrap z-10 flex items-center gap-2">
              <span className="text-xs font-bold">UNIT-101</span>
              <Badge variant="outline" className="text-[8px] h-4">Disponible</Badge>
            </div>
            <div className="h-8 w-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        <div className="absolute top-2/3 left-1/2">
          <div className="relative">
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-primary/20 whitespace-nowrap z-10">
              <span className="text-xs font-bold">Gral. Medical Center</span>
            </div>
            <div className="h-10 w-10 bg-green-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <div className="h-3 w-3 bg-destructive rounded-full pulse-emergency"></div> Incidente Crítico
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <div className="h-3 w-3 bg-primary rounded-full"></div> Ambulancia Disponible
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <div className="h-3 w-3 bg-green-600 rounded-full"></div> Hospital Activo
          </div>
        </div>

        {/* Floating Search in Map */}
        <div className="absolute top-6 left-6 right-6 lg:left-6 lg:right-auto lg:w-96 flex gap-2">
          <div className="flex-1 bg-white p-2 rounded-2xl shadow-xl border border-white/50 flex items-center gap-2 px-4">
            <MapPin className="h-5 w-5 text-primary" />
            <input placeholder="Buscar ubicación o unidad..." className="flex-1 border-none focus:ring-0 text-sm py-1 bg-transparent" />
          </div>
          <Button size="icon" className="h-11 w-11 rounded-2xl shadow-xl bg-white text-slate-600 hover:bg-slate-50 border-none">
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Side Dispatch Info */}
      <div className="w-full lg:w-96 space-y-4 flex flex-col">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden flex flex-col flex-1">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Detalles de Despacho IA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Ambulancia Sugerida</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-bold text-slate-800">UNIT-101</p>
                      <p className="text-xs text-slate-500">A 2.4 km del incidente</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-none">98% Match</Badge>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2">Hospital Recomendado</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-bold text-slate-800">Gral. Medical Center</p>
                      <p className="text-xs text-slate-500">Capacidad: 25% Libre</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Trauma Nivel 1</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Estimación de Ruta</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border text-center">
                    <p className="text-2xl font-bold text-primary">8.5</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Minutos</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border text-center">
                    <p className="text-2xl font-bold text-primary">4.2</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Kilómetros</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Razonamiento IA</p>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  "Se selecciona UNIT-101 por proximidad inmediata. General Medical Center es el destino óptimo dado que posee disponibilidad en el área de Trauma, esencial para el cuadro reportado de traumatismo torácico."
                </p>
              </div>
            </div>
          </CardContent>
          <div className="p-4 bg-slate-50 border-t space-y-2">
             <Button className="w-full rounded-full bg-primary medical-gradient shadow-lg border-none py-6 font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Confirmar Asignación
            </Button>
            <Button variant="outline" className="w-full rounded-full border-slate-200 py-6 font-bold flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Recalcular Ruta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
