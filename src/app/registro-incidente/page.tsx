
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, MapPin, Navigation, User, AlertTriangle, CheckCircle2, RefreshCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegistroIncidentePage() {
  const [formData, setFormData] = useState({
    descripcion: '',
    tipo_emergencia: '',
    prioridad: '',
    nombre_paciente: '',
    edad_aproximada: '',
    lat: null as number | null,
    lng: null as number | null,
  });

  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'no-ambulance' | 'error'>('idle');
  const [assignedAmbulance, setAssignedAmbulance] = useState('');

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocalización no soportada por su navegador.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }));
        setIsLocating(false);
      },
      (error) => {
        setLocationError('No se pudo obtener la ubicación. Active los permisos de ubicación.');
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    const body = {
      tipo: "emergencia",
      descripcion: formData.descripcion,
      tipo_emergencia: formData.tipo_emergencia,
      prioridad: formData.prioridad,
      nombre_paciente: formData.nombre_paciente,
      edad_aproximada: formData.edad_aproximada ? parseInt(formData.edad_aproximada) : null,
      ubicacion: {
        lat: formData.lat,
        lng: formData.lng
      }
    };

    try {
      const response = await fetch('https://linita22-3.app.n8n.cloud/webhook-test/emergencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.ok === true) {
        setAssignedAmbulance(data.ambulancia || '[Asignando...]');
        setStatus('success');
      } else if (data.ok === false) {
        setStatus('no-ambulance');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      tipo_emergencia: '',
      prioridad: '',
      nombre_paciente: '',
      edad_aproximada: '',
      lat: null,
      lng: null,
    });
    setStatus('idle');
    setAssignedAmbulance('');
  };

  const isFormValid = formData.descripcion && formData.tipo_emergencia && formData.prioridad && formData.lat && formData.lng;

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-200 bg-green-50 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-headline font-bold text-green-800">Emergencia registrada</h2>
            <p className="text-green-700">Ambulancia <span className="font-bold">{assignedAmbulance}</span> asignada.</p>
            <Button onClick={resetForm} className="w-full rounded-full bg-green-600 hover:bg-green-700">
              Registrar otra emergencia
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'no-ambulance') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-amber-200 bg-amber-50 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-amber-100 p-4 rounded-full">
                <AlertTriangle className="h-16 w-16 text-amber-600" />
              </div>
            </div>
            <h2 className="text-2xl font-headline font-bold text-amber-800">Aviso del Sistema</h2>
            <p className="text-amber-700">No hay ambulancias disponibles en este momento. Alerta enviada al equipo de emergencia central.</p>
            <Button onClick={() => setStatus('idle')} variant="outline" className="w-full rounded-full border-amber-300 text-amber-800 hover:bg-amber-100">
              Volver al formulario
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary p-1.5 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-primary">CodeBlueAI</span>
          </Link>
          <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Registro de Emergencia</h1>
          <p className="text-slate-500">Complete el formulario para registrar el incidente</p>
        </div>

        {status === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Error de conexión. Intente nuevamente.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" /> Datos del Incidente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Incidente *</Label>
                <Textarea 
                  id="descripcion" 
                  required
                  placeholder="Describa detalladamente la emergencia"
                  className="min-h-[120px] rounded-xl"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Emergencia *</Label>
                  <Select required onValueChange={(val) => setFormData({...formData, tipo_emergencia: val})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trauma">Trauma</SelectItem>
                      <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                      <SelectItem value="Respiratorio">Respiratorio</SelectItem>
                      <SelectItem value="Neurológico">Neurológico</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridad">Prioridad *</Label>
                  <Select required onValueChange={(val) => setFormData({...formData, prioridad: val})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccione prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL" className="text-green-600 font-bold">NORMAL</SelectItem>
                      <SelectItem value="MODERADO" className="text-yellow-600 font-bold">MODERADO</SelectItem>
                      <SelectItem value="ALTO" className="text-orange-600 font-bold">ALTO</SelectItem>
                      <SelectItem value="CRÍTICO" className="text-red-600 font-bold">CRÍTICO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Datos del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Paciente (Opcional)</Label>
                  <Input 
                    id="nombre"
                    placeholder="Nombre si se conoce"
                    className="rounded-xl"
                    value={formData.nombre_paciente}
                    onChange={(e) => setFormData({...formData, nombre_paciente: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edad">Edad Aproximada</Label>
                  <Input 
                    id="edad"
                    type="number"
                    placeholder="Edad aproximada"
                    className="rounded-xl"
                    value={formData.edad_aproximada}
                    onChange={(e) => setFormData({...formData, edad_aproximada: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Ubicación de la Emergencia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Button 
                type="button"
                variant="outline"
                onClick={handleGetLocation}
                className="w-full py-6 border-dashed border-2 rounded-2xl flex items-center gap-2 hover:bg-slate-50"
                disabled={isLocating}
              >
                {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
                {formData.lat ? 'Actualizar ubicación' : 'Obtener mi ubicación actual'}
              </Button>

              {formData.lat && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-2 text-blue-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-bold">Ubicación capturada: {formData.lat.toFixed(6)}, {formData.lng?.toFixed(6)}</p>
                </div>
              )}

              {locationError && (
                <p className="text-sm font-bold text-red-600 text-center">{locationError}</p>
              )}
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full py-8 text-lg font-bold rounded-2xl shadow-xl bg-red-600 hover:bg-red-700 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:bg-slate-300"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Registrando...
              </>
            ) : (
              'Registrar Emergencia'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
