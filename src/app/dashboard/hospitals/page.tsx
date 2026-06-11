
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Building2, MapPin, Users, HeartPulse, MoreVertical } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { mockHospitals } from "@/app/lib/mock-data";

export default function HospitalsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-headline font-bold text-slate-900">Red de Hospitales</h1>
          <p className="text-slate-500">Capacidad y disponibilidad de centros de salud conectados.</p>
        </div>
        <Button className="rounded-full px-6 shadow-md border-none bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Agregar Centro
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockHospitals.map((hospital) => {
          const occupancyPercent = (hospital.occupancyCurrent / hospital.capacity) * 100;
          const statusColor = occupancyPercent > 90 ? "text-destructive" : occupancyPercent > 70 ? "text-amber-500" : "text-green-600";
          
          return (
            <Card key={hospital.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <CardHeader className="relative pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Building2 className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-xl font-headline font-bold text-slate-800">{hospital.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {hospital.address}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500 font-medium">Ocupación Actual</span>
                    <span className={`font-bold ${statusColor}`}>{Math.round(occupancyPercent)}%</span>
                  </div>
                  <Progress value={occupancyPercent} className="h-2" />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{hospital.occupancyCurrent} pacientes</span>
                    <span>{hospital.capacity} camas totales</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Especialidades</span>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((spec) => (
                      <Badge key={spec} variant="secondary" className="rounded-full text-[10px] bg-slate-100 font-medium border-none">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t flex justify-between gap-2">
                <Button variant="outline" size="sm" className="w-full rounded-full text-xs">Ver Detalle</Button>
                <Button variant="outline" size="sm" className="w-full rounded-full text-xs">Estadísticas</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
