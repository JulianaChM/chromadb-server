
"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, CheckCircle2, RefreshCw, GitFork, ListChecks, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { findBestRoute, Point, RouteResult } from '@/lib/a-star';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockEmergencies } from "@/app/lib/mock-data";
import { db, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

// Importación dinámica de Leaflet para evitar errores de SSR
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

const CENTER_LAT = 5.0689;
const CENTER_LNG = -75.5174;

const mapPointToLatLng = (p: Point): [number, number] => {
  const scale = 0.0005;
  return [CENTER_LAT + (p.y - 20) * scale, CENTER_LNG + (p.x - 20) * scale];
};

export default function DispatchMapPage() {
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [leafletIcons, setLeafletIcons] = useState<any>(null);

  // Consulta real a Firestore para hospitales
  const hospitalsRef = useMemo(() => collection(db, 'hospitals'), []);
  const { data: hospitals, loading: hospitalsLoading } = useCollection(hospitalsRef);

  useEffect(() => {
    import('leaflet').then((L) => {
      const ambulanceIcon = L.divIcon({
        html: `<div style="background-color: #1565C0; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
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

  const startPos: Point = { x: 10, y: 10 };
  const endPos: Point = { x: 45, y: 32 };

  const calculateAStar = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = findBestRoute(startPos, endPos);
      setRoute(result);
      setIsCalculating(false);
    }, 800);
  };

  useEffect(() => {
    if (selectedEmergencyId) {
      calculateAStar();
    }
  }, [selectedEmergencyId]);

  const polylinePath = useMemo(() => {
    if (!route) return [];
    return route.path.map(p => mapPointToLatLng(p));
  }, [route]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-700">
      <div className="flex-1 relative bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-inner shadow-slate-300 z-10">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        
        <MapContainer 
          center={[CENTER_LAT, CENTER_LNG]} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {leafletIcons && (
            <>
              <Marker position={mapPointToLatLng(startPos)} icon={leafletIcons.ambulance}>
                <Popup>Origen (Ambulancia / Incidente)</Popup>
              </Marker>
              
              {/* Renderizado dinámico de hospitales desde Firestore */}
              {hospitals?.map((hospital: any) => (
                <Marker 
                  key={hospital.id} 
                  position={[hospital.coordinates?.latitude || CENTER_LAT, hospital.coordinates?.longitude || CENTER_LNG]} 
                  icon={leafletIcons.hospital}
                >
                  <Popup>
                    <div className="p-1 space-y-1">
                      <p className="font-bold text-slate-900">{hospital.name}</p>
                      <p className="text-xs text-slate-500">{hospital.address}</p>
                      <div className="pt-2 border-t mt-2">
                        <p className="text-[10px] font-bold text-primary uppercase">Capacidad Disponible</p>
                        <p className="text-sm font-bold">
                          {(hospital.capacity || 0) - (hospital.occupancyCurrent || 0)} camas
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </>
          )}

          {polylinePath.length > 0 && (
            <Polyline 
              positions={polylinePath} 
              pathOptions={{ color: '#1565C0', weight: 5, opacity: 0.7, dashArray: '10, 10' }} 
            />
          )}
        </MapContainer>

        <div className="absolute top-6 left-6 z-[1000] w-72">
          <Card className="shadow-2xl border-none rounded-2xl bg-white/95 backdrop-blur">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                {hospitalsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4 text-primary" />}
                Seleccionar Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Select onValueChange={setSelectedEmergencyId}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Emergencias Activas" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmergencies.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.id} - {e.patientCondition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-4">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden flex flex-col flex-1">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <GitFork className="h-4 w-4 text-primary" /> Inteligencia de Ruta (A*)
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1">
            <CardContent className="p-6 space-y-6">
              {!selectedEmergencyId ? (
                <div className="text-center py-12 space-y-4">
                  <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                    <MapPin className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Seleccione una emergencia para calcular la ruta óptima.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Análisis de Ruta</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Cálculo Optimizado</p>
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
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Coste A*</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ListChecks className="h-3 w-3" /> Puntos de Navegación
                    </p>
                    <div className="space-y-2">
                      {polylinePath.slice(0, 3).map((latlng, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-600">
                          <span className="font-bold">Nodo {idx + 1}</span>
                          <span>{latlng[0].toFixed(4)}, {latlng[1].toFixed(4)}</span>
                        </div>
                      ))}
                      <p className="text-[10px] text-center text-slate-400">
                        {polylinePath.length} waypoints calculados.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t space-y-2">
             <Button 
                disabled={!selectedEmergencyId}
                className="w-full rounded-full bg-primary shadow-lg border-none py-6 font-bold flex items-center justify-center gap-2"
              >
              <CheckCircle2 className="h-5 w-5" /> Confirmar Despacho
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-full border-slate-200 py-6 font-bold flex items-center justify-center gap-2"
              onClick={calculateAStar}
              disabled={isCalculating || !selectedEmergencyId}
            >
              <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} /> Recalcular
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
