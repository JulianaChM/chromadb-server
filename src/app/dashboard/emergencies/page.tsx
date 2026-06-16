
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, MoreHorizontal, FileText, MapPin, Eye, XCircle, Activity, GitFork, Database } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { mockEmergencies } from "@/app/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/hooks/use-toast';

export default function EmergenciesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessageToN8n = async (title: string, data: any) => {
      // Simulación de envío a webhook
      console.log(`[SIM] Enviando a n8n: ${title}`, data);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { ok: true };
  };

  const handleCreateEmergency = async () => {
    setIsProcessing(true);
    try {
      // Simulación: Enviamos la descripción a n8n para pre-procesamiento LangChain/RAG
      await sendMessageToN8n("Nueva emergencia registrada", { type: 'registration' });
      toast({
        title: "Emergencia Registrada",
        description: "n8n ha procesado el incidente y el algoritmo A* está calculando la ruta.",
      });
    } catch (error) {
        console.error("Error al crear emergencia:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-amber-100 text-amber-700",
    critical: "bg-destructive/10 text-destructive animate-pulse",
  };

  const statusMap = {
    pending: { label: "Pendiente", variant: "secondary" as const },
    dispatched: { label: "Despachado", variant: "default" as const },
    en_route: { label: "En Camino", variant: "default" as const },
    arrived: { label: "En Sitio", variant: "outline" as const },
    completed: { label: "Completado", variant: "outline" as const },
    cancelled: { label: "Cancelado", variant: "destructive" as const },
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-slate-900">Gestión de Emergencias</h1>
          <p className="text-slate-500">Supervisión vía n8n + Algoritmo A*.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full px-6 bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Nueva Emergencia
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                Registro con n8n & A*
              </DialogTitle>
              <DialogDescription>
                Se enviará la descripción a LangChain para triaje y se calculará la ruta con A*.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 border-b pb-2">Información del Paciente</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" placeholder="Juan Pérez" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Edad</Label>
                    <Input id="age" type="number" placeholder="45" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Descripción (Procesada por LangChain)</Label>
                  <Textarea id="condition" placeholder="Describe el incidente para que n8n identifique protocolos previos..." className="min-h-[100px]" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <GitFork className="h-4 w-4" /> Triaje y Destino (A*)
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="priority">Nivel de Prioridad</Label>
                  <Select>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Seleccione prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" className="rounded-full">Cancelar</Button>
              <Button 
                className="rounded-full bg-primary border-none shadow-lg flex items-center gap-2"
                onClick={handleCreateEmergency}
                disabled={isProcessing}
              >
                <GitFork className="h-4 w-4" /> {isProcessing ? 'Procesando en n8n...' : 'Activar n8n & A*'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar incidentes históricos (RAG)..."
                className="pl-10 border-slate-200 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full">
                <Database className="mr-2 h-4 w-4" /> RAG History
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">ID</TableHead>
                  <TableHead className="font-bold">Prioridad</TableHead>
                  <TableHead className="font-bold">Paciente / Condición</TableHead>
                  <TableHead className="font-bold">Ubicación</TableHead>
                  <TableHead className="font-bold">Estado</TableHead>
                  <TableHead className="font-bold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEmergencies.map((emergency) => (
                  <TableRow key={emergency.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-primary">#{emergency.id}</TableCell>
                    <TableCell>
                      <Badge className={`capitalize border-none ${priorityColors[emergency.priority]}`}>
                        {emergency.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-slate-800">{emergency.patientName}</p>
                        <p className="text-xs text-muted-foreground">{emergency.patientCondition}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{emergency.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[emergency.status].variant}>
                        {statusMap[emergency.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> Ver en Mapa (A*)
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" /> Consultar RAG
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
