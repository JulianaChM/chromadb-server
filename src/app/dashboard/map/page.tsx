"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, GitFork, ListChecks, MapPin, AlertCircle, Loader2, Truck, Building2, Navigation, Clock, Ruler } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

// Importación dinámica de Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const CENTER_LAT = 5.0689;
const CENTER_LNG = -75.5174;

// Función para calcular distancia Haversine (en km) para el filtrado inicial
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function DispatchMapPage() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [leafletIcons, setLeafletIcons] = useState<any>(null);
  const [routeData, setRouteData] = useState<{
    points: [number, number][],
    distanceKm: number,
    durationMin: number,
    loading: boolean
  } | null>(null);

  // Consultas a Firestore en tiempo real
  const hospitalesRef = useMemo(() => collection(db, 'hospitales'), []);
  const { data: hospitales, loading: hospitalesLoading } = useCollection(hospitalesRef);

  const ambulanciasRef = useMemo(() => collection(db, 'ambulancias'), []);
  const { data: ambulancias, loading: ambulanciasLoading } = useCollection(ambulanciasRef);

  const incidentesRef = useMemo(() => collection(db, 'incidentes'), []);
  const { data: incidentes, loading: incidentesLoading } = useCollection(incidentesRef);

  // Carga de iconos de Leaflet
  useEffect(() => {
    import('leaflet').then((L) => {
      const emergencyIcon = L.divIcon({
        html: `<div style="background-color: #1565C0; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 3a8 8 0 0 1 8 7.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20],
      });

      const hospitalIcon = (name: string, disponible: boolean) => L.divIcon({
        html: `<div class="flex flex-col items-center">
            <span style="background: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid ${disponible ? '#2e7d32' : '#D32F2F'}; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1); color: ${disponible ? '#2e7d32' : '#D32F2F'};">${name}</span>
            <div style="background-color: ${disponible ? '#2e7d32' : '#D32F2F'}; padding: 8px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
          </div>`,
        className: '', iconSize: [120, 60], iconAnchor: [60, 50],
      });

      const ambulanceIcon = (status: string) => {
        let color = "#22c55e"; 
        const s = status?.toUpperCase();
        if (s === 'EN RUTA' || s === 'DESPACHADA') color = "#eab308";
        if (s === 'OCUPADA') color = "#ef4444";
        return L.divIcon({
          html: `<div style="background-color: ${color}; padding: 6px; border-radius: 8px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h6a1 1 0 0 0 1-1V8.5L18.5 5H15"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
              </svg>
            </div>`,
          className: '', iconSize: [38, 38], iconAnchor: [19, 19],
        });
      };

      setLeafletIcons({ emergency: emergencyIcon, hospital: hospitalIcon, ambulance: ambulanceIcon });
    });
  }, []);

  // Lógica de Recomendación (Basada en Haversine para selección rápida)
  const currentIncident = useMemo(() => {
    if (!incidentes || !selectedIncidentId) return null;
    return incidentes.find((i: any) => i.id === selectedIncidentId);
  }, [incidentes, selectedIncidentId]);

  const dispatchRecommendation = useMemo(() => {
    if (!currentIncident || !ambulancias || !hospitales) return null;
    
    const availableAmbs = ambulancias.filter((a: any) => 
      a.estado?.toUpperCase() === 'DISPONIBLE' && 
      typeof a.lat === 'number' && typeof a.lng === 'number'
    );

    if (availableAmbs.length === 0) return null;

    let closest = availableAmbs[0];
    let minDistance = calculateDistance(
      currentIncident.lat, currentIncident.lng, 
      closest.lat, closest.lng
    );

    availableAmbs.forEach((amb: any) => {
      const dist = calculateDistance(currentIncident.lat, currentIncident.lng, amb.lat, amb.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = amb;
      }
    });

    const baseHospital = hospitales.find((h: any) => h.id === closest.hospital_id);

    return {
      ambulance: closest,
      haversineDistance: minDistance,
      hospital: baseHospital
    };
  }, [currentIncident, ambulancias, hospitales]);

  // Obtener ruta real por OSRM
  useEffect(() => {
    if (!dispatchRecommendation || !currentIncident) {
      setRouteData(null);
      return;
    }

    const getOSRMRoute = async () => {
      setRouteData(prev => ({ ...prev, points: [], distanceKm: 0, durationMin: 0, loading: true }));
      try {
        const amb = dispatchRecommendation.ambulance;
        const inc = currentIncident;
        // OSRM usa [lng, lat]
        const url = `https://router.project-osrm.org/route/v1/driving/${amb.lng},${amb.lat};${inc.lng},${inc.lat}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          // GeoJSON usa [lng, lat], Leaflet usa [lat, lng]
          const points = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
          
          setRouteData({
            points: points,
            distanceKm: route.distance / 1000,
            durationMin: route.duration / 60,
            loading: false
          });
        }
      } catch (error) {
        console.error("Error consultando OSRM:", error);
        setRouteData(null);
      }
    };

    getOSRMRoute();
  }, [dispatchRecommendation, currentIncident]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-700">
      <div className="flex-1 relative bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-inner shadow-slate-300 z-10">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        
        <MapContainer center={[CENTER_LAT, CENTER_LNG]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {(hospitalesLoading || ambulanciasLoading || incidentesLoading) && (
            <div className="absolute inset-0 z-[2000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          )}

          {leafletIcons && (
            <>
              {/* Marcadores de Hospitales */}
              {hospitales?.map((hospital: any) => {
                if (typeof hospital.lat !== 'number' || typeof hospital.lng !== 'number') return null;
                return (
                  <Marker key={hospital.id} position={[hospital.lat, hospital.lng]} icon={leafletIcons.hospital(hospital.nombre || hospital.name, hospital.capacidad_disponible)}>
                    <Popup>
                      <div className="p-2 space-y-1">
                        <p className="font-bold text-slate-800">{hospital.nombre || hospital.name}</p>
                        <p className="text-xs text-slate-600">{hospital.direccion}</p>
                        <div className="pt-1">
                          <Badge variant={hospital.capacidad_disponible ? "secondary" : "destructive"} className="text-[10px] font-bold">
                            Disponibilidad: {hospital.capacidad_disponible ? 'SÍ' : 'NO'}
                          </Badge>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Marcadores de Ambulancias */}
              {ambulancias?.map((ambulance: any) => {
                if (typeof ambulance.lat !== 'number' || typeof ambulance.lng !== 'number') return null;
                return (
                  <Marker key={ambulance.id} position={[ambulance.lat, ambulance.lng]} icon={leafletIcons.ambulance(ambulance.estado)}>
                    <Popup>
                      <div className="p-2 space-y-1">
                        <p className="font-bold text-slate-800">Unidad: {ambulance.placa}</p>
                        <p className="text-xs">Estado: <span className="font-medium">{ambulance.estado}</span></p>
                        {ambulance.hospital_id && (
                          <p className="text-[10px] text-slate-500 italic">Base: {hospitales?.find(h => h.id === ambulance.hospital_id)?.nombre || 'Cargando...'}</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Marcadores de Incidentes */}
              {incidentes?.map((inc: any) => {
                if (typeof inc.lat !== 'number' || typeof inc.lng !== 'number') return null;
                return (
                  <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={leafletIcons.emergency}>
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold text-primary">Emergencia: {inc.id}</p>
                        <p className="text-xs text-slate-600 mt-1">{inc.descripcion}</p>
                        <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400 mt-2">Ubicación</p>
                        <p className="text-xs">{inc.direccion || 'Sin dirección registrada'}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Ruta Real (OSRM) */}
              {routeData && routeData.points.length > 0 && (
                <Polyline 
                  positions={routeData.points}
                  pathOptions={{ color: '#1565C0', weight: 5, opacity: 0.8, lineJoin: 'round' }}
                />
              )}
            </>
          )}
        </MapContainer>

        <div className="absolute top-6 left-6 z-[1000] w-72 space-y-3">
          <Card className="shadow-2xl border-none rounded-2xl bg-white/95 backdrop-blur">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" /> Incidentes en Proceso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Select onValueChange={setSelectedIncidentId} value={selectedIncidentId || undefined}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Seleccionar reporte" />
                </SelectTrigger>
                <SelectContent>
                  {incidentes?.map((inc: any) => (
                    <SelectItem key={inc.id} value={inc.id}>
                      {inc.id} - {inc.tipo_emergencia || 'Incidente'}
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
              <GitFork className="h-4 w-4 text-primary" /> Logística de Despacho
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1">
            <CardContent className="p-6 space-y-6">
              {!selectedIncidentId ? (
                <div className="text-center py-12 space-y-4">
                  <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                    <Navigation className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium px-4">Seleccione una emergencia para trazar la ruta de la unidad más cercana.</p>
                </div>
              ) : !dispatchRecommendation ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                  <Truck className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-amber-800">Sin unidades disponibles</p>
                  <p className="text-xs text-amber-600">No hay ambulancias libres en el sistema para este incidente.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Unidad Recomendada</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Placa: {dispatchRecommendation.ambulance.placa}</p>
                        <p className="text-xs text-slate-500 italic">Estado: {dispatchRecommendation.ambulance.estado}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-none px-3">CERCANA</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border flex items-center gap-4 relative overflow-hidden">
                      {routeData?.loading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <Ruler className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800">
                          {routeData ? `${routeData.distanceKm.toFixed(1)} km` : `${dispatchRecommendation.haversineDistance.toFixed(2)} km*`}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          {routeData ? 'Distancia por calle' : '*Distancia lineal (estimando ruta...)'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border flex items-center gap-4 relative overflow-hidden">
                      {routeData?.loading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>}
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-slate-800">
                          {routeData ? `${Math.round(routeData.durationMin)} min` : '-- min'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Tiempo estimado (ETA)</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border flex items-center gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{dispatchRecommendation.hospital?.nombre || 'Base no registrada'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Hospital de Origen</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ListChecks className="h-3 w-3" /> Detalles de la Emergencia
                    </p>
                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-2">
                      <p className="font-bold text-slate-700">ID: {currentIncident.id}</p>
                      <p className="text-slate-600 line-clamp-2">{currentIncident.descripcion}</p>
                      <div className="flex items-center gap-1.5 text-primary font-medium mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{currentIncident.direccion || 'Ubicación GPS'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t space-y-2">
             <Button 
                disabled={!dispatchRecommendation || routeData?.loading}
                className="w-full rounded-full bg-primary shadow-lg border-none py-6 font-bold flex items-center justify-center gap-2"
              >
              <CheckCircle2 className="h-5 w-5" /> Confirmar Despacho
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-full border-slate-200 py-6 font-bold flex items-center justify-center gap-2 text-slate-600"
              onClick={() => {
                setSelectedIncidentId(null);
                setRouteData(null);
              }}
            >
              <RefreshCw className="h-4 w-4" /> Nueva Selección
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
