
"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle2, RefreshCw, GitFork, ListChecks } from 'lucide-react';
import { findBestRoute, Point, RouteResult } from '@/lib/a-star';
import { ScrollArea } from "@/components/ui/scroll-area";

// Importación dinámica de Leaflet para evitar errores de SSR en Next.js
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Manizales, Colombia
const CENTER_LAT = 5.0689;
const CENTER_LNG = -75.5174;

// Función para mapear puntos de A* (0-100) a coordenadas reales alrededor de Manizales
const mapPointToLatLng = (p: Point): [number, number] => {
  const scale = 0.0005; // Escala para distribuir los puntos en el mapa
  return [CENTER_LAT + (p.y - 20) * scale, CENTER_LNG + (p.x - 20) * scale];
};

export default function DispatchMapPage() {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [leafletIcons, setLeafletIcons] = useState<any>(null);

  // Inicializar iconos de Leaflet (solo cliente)
  useEffect(() => {
    import('leaflet').then((L) => {
      const ambulanceIcon = L.divIcon({
        html: `<div style="background-color: #1565C0; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10 10 10M14 10 14 10M18 10 18 10M4 10 4 10M8 10 8 10M12 10 12 10M16 10 16 10M20 10 20 10M6 14 6 14M10 14 10 14M14 14 14 14M18 14 18 14M22 14 22 14M4 14 4 14M8 14 8 14M12 14 12 14M16 14 16 14M20 14 20 14M2 18 2 18M6 18 6 18M10 18 10 18M14 18 14 18M18 18 18 18M22 18 22 18M4 18 4 18M8 18 8 18M12 18 12 18M16 18 16 18M20 18 20 18"/><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
               </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const hospitalIcon = L.divIcon({
        html: `<div style="background-color: #D32F2F; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
               </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      setLeafletIcons({ ambulance: ambulanceIcon, hospital: hospitalIcon });
    });
  }, []);

  // Simulación de puntos para el algoritmo A*
  const ambulancePos: Point = { x: 10, y: 10 };
  const hospitalPos: Point = { x: 45, y: 32 };

  const calculateAStar = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = findBestRoute(ambulancePos, hospitalPos);
      setRoute(result);
      setIsCalculating(false);
    }, 800);
  };

  useEffect(() => {
    calculateAStar();
  }, []);

  const polylinePath = useMemo(() => {
    if (!route) return [];
    return route.path.map(p => mapPointToLatLng(p));
  }, [route]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-700">
      {/* Visualización del Mapa Interactivo */}
      <div className="flex-1 relative bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-inner shadow-slate-300 z-10">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        
        <MapContainer 
          center={[CENTER_LAT, CENTER_LNG]} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {leafletIcons && (
            <>
              {/* Marcador de la Ambulancia */}
              <Marker position={mapPointToLatLng(ambulancePos)} icon={leafletIcons.ambulance}>
                <Popup>Ambulancia UNIT-101</Popup>
              </Marker>

              {/* Marcador del Hospital */}
              <Marker position={mapPointToLatLng(hospitalPos)} icon={leafletIcons.hospital}>
                <Popup>Hospital de Destino</Popup>
              </Marker>
            </>
          )}

          {/* Dibujo de la Ruta A* */}
          {polylinePath.length > 0 && (
            <Polyline 
              positions={polylinePath} 
              pathOptions={{ color: '#1565C0', weight: 5, opacity: 0.7, dashArray: '10, 10' }} 
            />
          )}
        </MapContainer>

        {/* Leyenda en el mapa */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/50 z-[1000]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <GitFork className="h-3 w-3 text-primary" /> Ruta A* Optimizada
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
                      <p className="font-bold text-slate-800">Manizales Hub</p>
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
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nodos A*</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ListChecks className="h-3 w-3" /> Waypoints Geográficos
                  </p>
                  <div className="space-y-2">
                    {polylinePath.slice(0, 5).map((latlng, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-600">
                        <span className="font-bold">Punto {idx + 1}</span>
                        <span>{latlng[0].toFixed(5)}, {latlng[1].toFixed(5)}</span>
                      </div>
                    ))}
                    {polylinePath.length > 5 && (
                      <p className="text-[10px] text-center text-slate-400 font-medium">
                        + {polylinePath.length - 5} waypoints adicionales
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Utilizando OpenStreetMap para la cartografía base de Manizales. La ruta se dibuja dinámicamente según la lógica A*.
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
