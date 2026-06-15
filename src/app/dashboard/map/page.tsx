
"use client";

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, GitFork, ListChecks, MapPin, AlertCircle, Loader2, Truck, Navigation, Clock, Ruler } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, useCollection } from '@/firebase';
import { collection, doc, updateDoc, increment } from 'firebase/firestore';

// Importación dinámica de Leaflet para evitar errores de SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

const CENTER_LAT = 5.0689;
const CENTER_LNG = -75.5174;

interface EvaluatedUnit {
  ambulance: any;
  duration: number;
  distance: number;
  hospital: any;
  points: [number, number][];
}

export default function DispatchMapPage() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [leafletIcons, setLeafletIcons] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [evaluatedUnits, setEvaluatedUnits] = useState<EvaluatedUnit[]>([]);
  const [bestUnit, setBestUnit] = useState<EvaluatedUnit | null>(null);

  // Estados para la simulación
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatingAmbulanceId, setSimulatingAmbulanceId] = useState<string | null>(null);
  const [simulatedCoords, setSimulatedCoords] = useState<[number, number] | null>(null);
  const [activeSimulationPoints, setActiveSimulationPoints] = useState<[number, number][]>([]);
  const [simulationPhase, setSimulationPhase] = useState<'to-incident' | 'to-hospital' | 'idle'>('idle');

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
        let color = "#22c55e"; // Disponible
        const s = status?.toUpperCase();
        if (s === 'EN_RUTA' || s === 'EN RUTA' || s === 'DESPACHADA') color = "#eab308"; // Amarillo
        if (s === 'OCUPADA') color = "#ef4444"; // Rojo
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

  const currentIncident = useMemo(() => {
    if (!incidentes || !selectedIncidentId) return null;
    return incidentes.find((i: any) => i.id === selectedIncidentId);
  }, [incidentes, selectedIncidentId]);

  useEffect(() => {
    if (!currentIncident || !ambulancias || !hospitales || isSimulating) {
      if (!isSimulating) {
        setEvaluatedUnits([]);
        setBestUnit(null);
      }
      return;
    }

    const findBestRouteByETA = async () => {
      setIsCalculating(true);
      const availableAmbs = ambulancias.filter((a: any) => 
        a.estado?.toUpperCase() === 'DISPONIBLE' && 
        typeof a.lat === 'number' && typeof a.lng === 'number'
      );

      if (availableAmbs.length === 0) {
        setEvaluatedUnits([]);
        setBestUnit(null);
        setIsCalculating(false);
        return;
      }

      try {
        const evaluationPromises = availableAmbs.map(async (amb: any) => {
          const url = `https://router.project-osrm.org/route/v1/driving/${amb.lng},${amb.lat};${currentIncident.lng},${currentIncident.lat}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.code === 'Ok' && data.routes.length > 0) {
            const route = data.routes[0];
            return {
              ambulance: amb,
              duration: route.duration / 60,
              distance: route.distance / 1000,
              points: route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]),
              hospital: hospitales.find((h: any) => h.id === amb.hospital_id)
            } as EvaluatedUnit;
          }
          return null;
        });

        const results = (await Promise.all(evaluationPromises)).filter((r): r is EvaluatedUnit => r !== null);
        const sorted = results.sort((a, b) => a.duration - b.duration);
        setEvaluatedUnits(sorted);
        setBestUnit(sorted.length > 0 ? sorted[0] : null);
      } catch (error) {
        console.error("Error calculando ETAs:", error);
      } finally {
        setIsCalculating(false);
      }
    };

    findBestRouteByETA();
  }, [currentIncident, ambulancias, hospitales, isSimulating]);

  const handleConfirmDispatch = async () => {
    if (!bestUnit || !selectedIncidentId || isSimulating || !currentIncident) return;

    const incidentId = selectedIncidentId;
    const ambulanceId = bestUnit.ambulance.id;
    const initialRoute = [...bestUnit.points];
    const incidentCoords = [currentIncident.lat, currentIncident.lng];

    console.log(`[SIM] Iniciando despacho para incidente ${incidentId} con unidad ${bestUnit.ambulance.placa}`);
    setIsSimulating(true);
    setSimulatingAmbulanceId(ambulanceId);
    setSimulatedCoords(initialRoute[0]);
    setActiveSimulationPoints(initialRoute);
    setSimulationPhase('to-incident');
    
    try {
      const ambRef = doc(db, 'ambulancias', ambulanceId);
      const incRef = doc(db, 'incidentes', incidentId);

      // FASE 1: ACTUALIZACIÓN INICIAL - Ambulancia e Incidente "EN_RUTA"
      // Se registran ID y Placa de la ambulancia en el incidente
      console.log(`[SIM] Fase 1: Actualizando estados a EN_RUTA y asignando ambulancia`);
      await updateDoc(ambRef, { estado: 'EN_RUTA' });
      await updateDoc(incRef, { 
        estado: 'EN_RUTA',
        ambulancia_id: ambulanceId,
        ambulancia_placa: bestUnit.ambulance.placa
      });

      // Animación al incidente
      await runAnimation(initialRoute, 50);

      // FASE 2: LLEGADA AL INCIDENTE - Incidente "EN_PROCESO", Ambulancia "OCUPADA"
      console.log(`[SIM] Fase 2: Llegada al incidente. Incidente EN_PROCESO.`);
      setSimulationPhase('to-hospital');
      await updateDoc(incRef, { estado: 'EN_PROCESO' });
      await updateDoc(ambRef, { 
        estado: 'OCUPADA',
        lat: incidentCoords[0],
        lng: incidentCoords[1]
      });

      const nearestHospital = findNearestHospital(incidentCoords);
      if (nearestHospital) {
        console.log(`[SIM] Hospital más cercano: ${nearestHospital.nombre}. Iniciando traslado.`);
        const url = `https://router.project-osrm.org/route/v1/driving/${incidentCoords[1]},${incidentCoords[0]};${nearestHospital.lng},${nearestHospital.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const hospitalRouteData = await response.json();

        if (hospitalRouteData.code === 'Ok' && hospitalRouteData.routes.length > 0) {
          const hospitalRoute = hospitalRouteData.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          setActiveSimulationPoints(hospitalRoute);
          
          // Animar hacia el hospital
          await runAnimation(hospitalRoute, 50);

          // FASE 3: LLEGADA AL HOSPITAL - Incidente "COMPLETADO", Ambulancia "DISPONIBLE"
          console.log(`[SIM] Fase 3: Llegada al hospital. Incidente COMPLETADO.`);
          const hospitalRef = doc(db, 'hospitales', nearestHospital.id);
          
          await updateDoc(incRef, { 
            estado: 'COMPLETADO',
            hospital_id: nearestHospital.id,
            finalizado_at: new Date().toISOString()
          });

          await updateDoc(hospitalRef, {
            capacidad_disponible: increment(-1)
          });
          
          await updateDoc(ambRef, {
            estado: 'DISPONIBLE',
            lat: nearestHospital.lat,
            lng: nearestHospital.lng,
            hospital_id: nearestHospital.id
          });
        }
      }

      // Finalizar simulación
      setTimeout(() => {
        setIsSimulating(false);
        setSimulatingAmbulanceId(null);
        setSimulatedCoords(null);
        setActiveSimulationPoints([]);
        setSimulationPhase('idle');
        setSelectedIncidentId(null);
        setBestUnit(null);
        setEvaluatedUnits([]);
        console.log(`[SIM] Ciclo completo finalizado.`);
      }, 1500);

    } catch (error) {
      console.error("[SIM] Error crítico durante el flujo:", error);
      setIsSimulating(false);
    }
  };

  const runAnimation = (points: [number, number][], speed: number): Promise<void> => {
    return new Promise((resolve) => {
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < points.length) {
          setSimulatedCoords(points[currentStep]);
          currentStep++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  };

  const findNearestHospital = (origin: any) => {
    if (!hospitales) return null;
    const availableHospitals = hospitales.filter((h: any) => h.capacidad_disponible > 0);
    
    if (availableHospitals.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    availableHospitals.forEach((h: any) => {
      const dist = Math.sqrt(Math.pow(h.lat - origin[0], 2) + Math.pow(h.lng - origin[1], 2));
      if (dist < minDistance) {
        minDistance = dist;
        nearest = h;
      }
    });

    return nearest;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] animate-in fade-in duration-700">
      <div className="flex-1 relative bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-inner shadow-slate-300 z-10">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        
        <MapContainer center={[CENTER_LAT, CENTER_LNG]} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {(hospitalesLoading || ambulanciasLoading || incidentesLoading || isCalculating) && !isSimulating && (
            <div className="absolute inset-0 z-[2000] bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-slate-800">
                  {isCalculating ? "Calculando rutas óptimas..." : "Sincronizando..."}
                </p>
              </div>
            </div>
          )}

          {leafletIcons && (
            <>
              {hospitales?.map((hospital: any) => {
                if (typeof hospital.lat !== 'number' || typeof hospital.lng !== 'number') return null;
                return (
                  <Marker key={hospital.id} position={[hospital.lat, hospital.lng]} icon={leafletIcons.hospital(hospital.nombre || hospital.name, hospital.capacidad_disponible > 0)}>
                    <Popup>
                      <div className="p-2 space-y-1">
                        <p className="font-bold text-slate-800">{hospital.nombre || hospital.name}</p>
                        <Badge variant={hospital.capacidad_disponible > 0 ? "secondary" : "destructive"} className="text-[10px] font-bold">
                          Capacidad: {hospital.capacidad_disponible}
                        </Badge>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {ambulancias?.map((ambulance: any) => {
                const isThisAmbulanceSimulating = isSimulating && simulatingAmbulanceId === ambulance.id;
                const pos: [number, number] = isThisAmbulanceSimulating && simulatedCoords 
                  ? simulatedCoords 
                  : [ambulance.lat, ambulance.lng];

                if (typeof pos[0] !== 'number' || typeof pos[1] !== 'number') return null;
                
                let displayStatus = ambulance.estado;
                if (isThisAmbulanceSimulating) {
                  displayStatus = simulationPhase === 'to-incident' ? 'EN_RUTA' : 'OCUPADA';
                }

                return (
                  <Marker key={ambulance.id} position={pos} icon={leafletIcons.ambulance(displayStatus)}>
                    <Popup>
                      <div className="p-2 space-y-1">
                        <p className="font-bold text-slate-800">Unidad: {ambulance.placa}</p>
                        <p className="text-xs">Estado: <span className="font-medium">{displayStatus}</span></p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {currentIncident && !isSimulating && (
                <Marker position={[currentIncident.lat, currentIncident.lng]} icon={leafletIcons.emergency} />
              )}

              {activeSimulationPoints.length > 0 && (
                <Polyline 
                  positions={activeSimulationPoints}
                  pathOptions={{ 
                    color: simulationPhase === 'to-hospital' ? '#ef4444' : '#eab308', 
                    weight: 6, 
                    opacity: 0.8, 
                    lineJoin: 'round'
                  }}
                />
              )}
            </>
          )}
        </MapContainer>

        <div className="absolute top-6 left-6 z-[1000] w-72 space-y-3">
          <Card className="shadow-2xl border-none rounded-2xl bg-white/95 backdrop-blur">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                <AlertCircle className="h-4 w-4 text-primary" /> Despacho de Incidentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Select onValueChange={setSelectedIncidentId} value={selectedIncidentId || undefined} disabled={isSimulating}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Seleccionar reporte" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {incidentes?.filter((inc: any) => inc.estado !== 'COMPLETADO')?.map((inc: any) => (
                    <SelectItem key={inc.id} value={inc.id}>
                      {inc.id} - {inc.tipo_emergencia || 'Emergencia'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-4">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden flex flex-col flex-1 bg-white">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
              <GitFork className="h-4 w-4 text-primary" /> Algoritmo de Respuesta
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1">
            <CardContent className="p-6 space-y-6">
              {!selectedIncidentId ? (
                <div className="text-center py-12 space-y-4">
                  <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                    <Navigation className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium px-4">Seleccione una emergencia para analizar las rutas óptimas.</p>
                </div>
              ) : isCalculating ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-4 rounded-2xl border transition-all duration-500 ${isSimulating ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-100' : 'bg-primary/5 border-primary/20'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-primary">
                      {isSimulating ? `SIMULANDO: ${simulationPhase === 'to-incident' ? 'AL INCIDENTE' : 'TRASLADO HOSPITAL'}` : 'UNIDAD RECOMENDADA'}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-slate-800 text-lg">
                          {isSimulating ? (ambulancias?.find(a => a.id === simulatingAmbulanceId)?.placa) : bestUnit?.ambulance.placa}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-none px-3 font-bold">
                        {isSimulating ? 'ACTIVA' : 'ÓPTIMA'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <Clock className="h-4 w-4 text-primary mb-1" />
                        <p className="text-lg font-bold text-slate-800">
                          {Math.round(bestUnit?.duration || 0) || '--'} min
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <Ruler className="h-4 w-4 text-primary mb-1" />
                        <p className="text-lg font-bold text-slate-800">
                          {bestUnit?.distance.toFixed(1) || '--'} km
                        </p>
                      </div>
                    </div>

                    {isSimulating && (
                      <div className="mt-4 pt-4 border-t border-amber-200">
                        <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                           <Activity className="h-3 w-3 animate-pulse" />
                           Estado: <span className="capitalize">{currentIncident?.estado || 'Procesando'}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {!isSimulating && evaluatedUnits.length > 1 && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Otras Unidades Disponibles</p>
                      {evaluatedUnits.slice(1).map((unit) => (
                        <div key={unit.ambulance.id} className="flex items-center justify-between p-3 rounded-xl border bg-slate-50">
                          <span className="text-xs font-bold text-slate-700">{unit.ambulance.placa}</span>
                          <span className="text-xs font-bold text-slate-800">{Math.round(unit.duration)} min</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t">
             <Button 
                disabled={(!bestUnit && !isSimulating) || isCalculating || isSimulating}
                onClick={handleConfirmDispatch}
                className="w-full rounded-full bg-primary py-6 font-bold flex items-center justify-center gap-2"
              >
              {isSimulating ? <><Loader2 className="h-5 w-5 animate-spin" /> En Curso...</> : <><CheckCircle2 className="h-5 w-5" /> Iniciar Despacho Completo</>}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Activity(props: any) {
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
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
