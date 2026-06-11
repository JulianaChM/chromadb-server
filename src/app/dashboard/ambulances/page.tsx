
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Truck, MapPin, User, Settings2, MoreHorizontal } from 'lucide-react';
import { mockAmbulances } from "@/app/lib/mock-data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AmbulancesPage() {
  const statusConfig = {
    available: { label: "Disponible", color: "bg-green-100 text-green-700" },
    "en route": { label: "En Ruta", color: "bg-blue-100 text-blue-700" },
    occupied: { label: "Ocupada", color: "bg-amber-100 text-amber-700" },
    "out of service": { label: "Fuera de Servicio", color: "bg-slate-100 text-slate-600" },
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-headline font-bold text-slate-900">Gestión de Flota</h1>
          <p className="text-slate-500">Monitoreo y administración de unidades de emergencia.</p>
        </div>
        <Button className="rounded-full px-6 shadow-md border-none bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Agregar Unidad
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Unidades", value: mockAmbulances.length, icon: Truck, color: "text-primary" },
          { label: "En Operación", value: mockAmbulances.filter(a => a.status !== 'out of service').length, icon: Activity, color: "text-green-600" },
          { label: "Fuera de Servicio", value: mockAmbulances.filter(a => a.status === 'out of service').length, icon: Settings2, color: "text-slate-500" },
          { label: "Tiempo Activo Promedio", value: "94%", icon: PieChart, color: "text-blue-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-slate-50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Código Unidad</TableHead>
                <TableHead className="font-bold">Estado</TableHead>
                <TableHead className="font-bold">Personal Asignado</TableHead>
                <TableHead className="font-bold">Ubicación Actual</TableHead>
                <TableHead className="font-bold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAmbulances.map((ambulance) => (
                <TableRow key={ambulance.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-bold text-slate-800">{ambulance.code}</TableCell>
                  <TableCell>
                    <Badge className={`border-none ${statusConfig[ambulance.status].color}`}>
                      {statusConfig[ambulance.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={`https://picsum.photos/seed/driver${ambulance.id}/50/50`} />
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{ambulance.driver}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="h-3 w-3" />
                      <span className="text-sm">{ambulance.currentLocation}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem className="cursor-pointer">Editar Unidad</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Bitácora de Mantenimiento</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive">Retirar de Servicio</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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

function PieChart(props: any) {
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
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

function Avatar({ children, className }: any) {
  return <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
}
function AvatarImage({ src }: any) {
  return <img className="aspect-square h-full w-full" src={src} alt="avatar" />
}
function AvatarFallback({ children }: any) {
  return <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">{children}</div>
}
