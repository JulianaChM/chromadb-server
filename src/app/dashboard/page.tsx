
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Truck, Building2, Clock, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart } from "recharts";
import { Badge } from "@/components/ui/badge";

const stats = [
  { title: "Emergencias Activas", value: "24", icon: Activity, change: "+12%", trend: "up", color: "text-destructive" },
  { title: "Ambulancias Libres", value: "18", icon: Truck, change: "-4%", trend: "down", color: "text-blue-600" },
  { title: "Hospitales Conectados", value: "12", icon: Building2, change: "0%", trend: "neutral", color: "text-green-600" },
  { title: "Tiempo de Respuesta", value: "9.5 min", icon: Clock, change: "-1.2m", trend: "up", color: "text-amber-500" },
];

const areaData = [
  { name: "00:00", total: 12 },
  { name: "04:00", total: 8 },
  { name: "08:00", total: 32 },
  { name: "12:00", total: 45 },
  { name: "16:00", total: 38 },
  { name: "20:00", total: 54 },
  { name: "23:59", total: 22 },
];

const pieData = [
  { name: "Disponibles", value: 18, color: "hsl(var(--primary))" },
  { name: "En Ruta", value: 12, color: "hsl(var(--accent))" },
  { name: "Ocupadas", value: 6, color: "hsl(var(--destructive))" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs mt-1">
                {stat.trend === 'up' ? (
                  <span className="text-destructive flex items-center font-bold">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> {stat.change}
                  </span>
                ) : stat.trend === 'down' ? (
                  <span className="text-green-600 flex items-center font-bold">
                    <ArrowDownRight className="h-3 w-3 mr-1" /> {stat.change}
                  </span>
                ) : (
                  <span className="text-slate-500 font-bold">{stat.change}</span>
                )}
                <span className="ml-1 text-slate-400">vs ayer</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Emergencias por Hora</CardTitle>
            <CardDescription>Volumen de reportes recibidos en las últimas 24 horas.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Estado de la Flota</CardTitle>
            <CardDescription>Distribución actual de las unidades de ambulancia.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-medium text-slate-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Emergencias Críticas Recientes</CardTitle>
              <CardDescription>Atención inmediata requerida para estos casos.</CardDescription>
            </div>
            <Badge variant="destructive" className="animate-pulse">Prioridad Crítica</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">E-2024-00{i}</p>
                      <p className="text-sm text-muted-foreground">Infarto de miocardio - Av. Siempre Viva 123</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-destructive">CRÍTICO</p>
                      <p className="text-xs text-muted-foreground">Hace 4 mins</p>
                    </div>
                    <Badge variant="outline" className="group-hover:bg-primary group-hover:text-white transition-colors">Ver Detalle</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Personal de Turno</CardTitle>
            <CardDescription>Operadores activos en el centro de mando.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/nurse${i}/50/50`} />
                    <AvatarFallback>NS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Operador 00{i}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-muted-foreground">Online</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Turno Mañana</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
