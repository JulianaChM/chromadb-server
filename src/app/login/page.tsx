
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, Mail, Lock, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulación de autenticación con credenciales fijas
    setTimeout(() => {
      if (email === 'admin@codeblue.ai' && password === 'admin123') {
        toast({
          title: "Acceso concedido",
          description: "Bienvenido al centro de mando CodeBlueAI.",
        });
        router.push('/dashboard');
      } else {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "El correo o la contraseña son incorrectos. Intente con admin@codeblue.ai / admin123",
        });
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-3 rounded-2xl shadow-lg">
                <Activity className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold tracking-tight text-slate-900">CodeBlueAI</CardTitle>
            <CardDescription className="text-base text-slate-500">
              Planificación Inteligente de Emergencias Hospitalarias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="admin@codeblue.ai" 
                    className="pl-10 h-11 rounded-xl" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Button variant="link" className="px-0 font-normal text-xs text-primary h-auto" type="button">
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-11 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 py-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal leading-none cursor-pointer">
                  Recordarme en este equipo
                </Label>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                    Verificando...
                  </>
                ) : 'Iniciar sesión'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center">
            <p className="text-xs text-slate-400">
              Acceso restringido a personal médico y operadores de despacho autorizados.
            </p>
          </CardFooter>
        </Card>
      </div>
      <div className="hidden lg:block relative medical-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/medlogin/1200/1200')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        <div className="relative h-full flex flex-col items-center justify-center text-white p-12 text-center">
          <div className="max-w-md space-y-6">
            <h2 className="text-5xl font-headline font-bold leading-tight">La eficiencia salva vidas.</h2>
            <p className="text-xl font-light text-blue-50">
              Nuestra tecnología de despacho impulsada por IA garantiza que cada segundo cuente en situaciones críticas.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                <div className="text-3xl font-bold">12m</div>
                <div className="text-sm opacity-80">Tiempo medio de respuesta</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                <div className="text-3xl font-bold">99.8%</div>
                <div className="text-sm opacity-80">Precisión de ruta</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
