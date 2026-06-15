
"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, GitFork, ListChecks, MapPin, AlertCircle, Loader2, Truck } from 'lucide-react';
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

// Función para mapear puntos de la rejilla A* a coordenadas geográficas (simulación)
const mapGridPointToLatLng = (p: Point): [number, number] => {
  const scale = 0.0005;
  return [CENTER_LAT + (p.y - 20) * scale, CENTER_LNG + (p.x - 20) * scale];
};

export default function DispatchMapPage() {
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [leafletIcons, setLeafletIcons] = useState<any>(null);

  // Consultas a Firestore en tiempo real
  const hospitalesRef = useMemo(() => collection(db, 'hospitales'), []);
  const { data: hospitales, loading: hospitalesLoading } = useCollection(hospitalesRef);

  const ambulanciasRef = useMemo(() => collection(db, 'ambulancias'), []);
  const { data: ambulancias, loading: ambulanciasLoading } = useCollection(ambulanciasRef);

  // Helper para obtener coordenadas de un documento de hospital
  const getHospitalCoords = (hospital: any): [number, number] | null => {
    const lat = hospital.coordinates?.latitude ?? hospital.latitude ?? hospital.lat;
    const lng = hospital.coordinates?.longitude ?? hospital.longitude ?? hospital.lng;
    
    if (typeof lat === 'number' && typeof lng === 'number') {
      return [lat, lng];
    }
    return null;
  };

  const getHospitalName = (hospital: any) => hospital.nombre ?? hospital.name ?? 'Hospital';

  useEffect(() => {
    import('leaflet').then((L) => {
      // Icono para la ubicación de la emergencia (Origen)
      const emergencyIcon = L.divIcon({
        html: `<div style="background-color: #1565C0; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 3a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Icono para hospitales (Pin Rojo con Nombre)
      const hospitalIcon = (name: string) => L.divIcon({
        html: `
          <div class="flex flex-col items-center">
            <span style="background: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid #D32F2F; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: #D32F2F;">
              ${name}
            </span>
            <div style="background-color: #D32F2F; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
          </div>`,
        className: '',
        iconSize: [120, 60],
        iconAnchor: [60, 50],
      });

      // Icono para ambulancias (Círculo con color de estado)
      const ambulanceIcon = (status: string) => {
        let color = "#22c55e"; // Disponible (Verde)
        if (status?.toUpperCase() === 'EN RUTA') color = "#eab308"; // En Ruta (Amarillo)
        if (status?.toUpperCase() === 'OCUPADA') color = "#ef4444"; // Ocupada (Rojo)

        return L.divIcon({
          html: `
            <div style="background-color: ${color}; padding: 6px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>
            </div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
      };

      setLeafletIcons({ emergency: emergencyIcon, hospital: hospitalIcon, ambulance: ambulanceIcon });
    });
  }, []);

  const startPos: Point = { x: 10, y: 10 };
  
  const getEndPos = (emergencyId: string | null): Point => {
    if (!emergencyId) return { x: 45, y: 32 };
    const seed = (emergencyId || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return { 
      x: 20 + (seed % 30), 
      y: 15 + (seed % 25) 
    };
  };

  const calculateAStar = () => {
    if (!selectedEmergencyId) return;
    setIsCalculating(true);
    const endPos = getEndPos(selectedEmergencyId);
    
    setTimeout(() => {
      const result = findBestRoute(startPos, endPos);
      setRoute(result);
      setIsCalculating(false);
    }, 600);
  };

  useEffect(() => {
    if (selectedEmergencyId) {
      calculateAStar();
    }
  }, [selectedEmergencyId]);

  const polylinePath = useMemo(() => {
    if (!route) return [];
    return route.path.map(p => mapGridPointToLatLng(p));
  }, [route]);

  // Determina el estado del badge de ambulancia
  const getAmbulanceStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DISPONIBLE': return "bg-green-100 text-green-700";
      case 'EN RUTA': return "bg-yellow-100 text-yellow-700";
      case 'OCUPADA': return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-700">
      <div className="flex-1 relative bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-inner shadow-slate-300 z-10">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        
        <MapContainer 
          center={[CENTER_LAT, CENTER_LNG]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {(hospitalesLoading || ambulanciasLoading) && (
            <div className="absolute inset-0 z-[2000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <span className="text-xs font-bold text-slate-600">Sincronizando con Firestore...</span>
              </div>
            </div>
          )}

          {leafletIcons && (
            <>
              {/* Marcador de Origen (Emergencia) */}
              <Marker position={mapGridPointToLatLng(startPos)} icon={leafletIcons.emergency}>
                <Popup>Ubicación del Incidente</Popup>
              </Marker>
              
              {/* Marcadores de Hospitales */}
              {hospitales?.map((hospital: any) => {
                const coords = getHospitalCoords(hospital);
                if (!coords) return null;

                const name = getHospitalName(hospital);
                const cap = hospital.capacidad ?? hospital.capacity ?? 0;
                const occ = hospital.ocupacion ?? hospital.occupancyCurrent ?? 0;
                const available = cap - occ;

                return (
                  <Marker 
                    key={hospital.id} 
                    position={coords} 
                    icon={leafletIcons.hospital(name)}
                  >
                    <Popup>
                      <div className="p-1 space-y-1 min-w-[150px]">
                        <p className="font-bold text-slate-900 leading-tight">{name}</p>
                        <p className="text-xs text-slate-500">{hospital.direccion ?? hospital.address ?? 'Sin dirección'}</p>
                        <div className="pt-2 border-t mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-primary uppercase">Camas Libres</span>
                            <Badge variant={available > 0 ? "secondary" : "destructive"} className="h-4 text-[9px] px-1">
                              {available}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Marcadores de Ambulancias */}
              {ambulancias?.map((ambulance: any) => {
                // Encontrar el hospital asociado para obtener las coordenadas
                const associatedHospital = hospitales?.find(h => 
                  h.id === ambulance.hospitalId || 
                  h.nombre === ambulance.hospitalAsociado ||
                  h.id === ambulance.idHospital
                );
                
                const coords = associatedHospital ? getHospitalCoords(associatedHospital) : null;
                if (!coords) return null;

                // Añadir un pequeño "offset" para que no se solape exactamente con el pin del hospital
                const offsetCoords: [number, number] = [coords[0] - 0.0002, coords[1] + 0.0002];

                return (
                  <Marker 
                    key={ambulance.id} 
                    position={offsetCoords} 
                    icon={leafletIcons.ambulance(ambulance.estado)}
                  >
                    <Popup>
                      <div className="p-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-100 p-1 rounded-md">
                            <Truck className="h-4 w-4 text-slate-700" />
                          </div>
                          <p className="font-bold text-slate-900">Placa: {ambulance.placa ?? 'S/P'}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-slate-500">Estado:</span>
                          <Badge className={`text-[9px] h-4 px-1 border-none ${getAmbulanceStatusColor(ambulance.estado)}`}>
                            {ambulance.estado?.toUpperCase() || 'DESCONOCIDO'}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-slate-400 border-t pt-1 mt-1">
                          Base: {getHospitalName(associatedHospital)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </>
          )}

          {polylinePath.length > 0 && (
            <Polyline 
              positions={polylinePath} 
              pathOptions={{ color: '#1565C0', weight: 6, opacity: 0.8, dashArray: '8, 12', lineCap: 'round' }} 
            />
          )}
        </MapContainer>

        <div className="absolute top-6 left-6 z-[1000] w-72 space-y-3">
          <Card className="shadow-2xl border-none rounded-2xl bg-white/95 backdrop-blur">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
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
                  <p className="text-sm text-slate-500 font-medium px-4">Seleccione una emergencia para calcular la trayectoria óptima.</p>
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
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 text-[10px] text-slate-600">
                        <span className="font-bold">Origen</span>
                        <span>GRID {startPos.x}, {startPos.y}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg border border-primary/20 text-[10px] text-primary">
                        <span className="font-bold">Destino</span>
                        <span>GRID {getEndPos(selectedEmergencyId).x}, {getEndPos(selectedEmergencyId).y}</span>
                      </div>
                      <p className="text-[10px] text-center text-slate-400 mt-2">
                        {polylinePath.length} nodos calculados dinámicamente.
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
              <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} /> Recalcular Trayectoria
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
