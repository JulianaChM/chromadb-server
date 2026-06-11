
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, SidebarInset, SidebarFooter } from "@/components/ui/sidebar";
import { Activity, LayoutDashboard, Truck, Building2, Map, MessageSquare, PieChart, Settings, LogOut, Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Emergencias", icon: Bell, href: "/dashboard/emergencies" },
  { title: "Ambulancias", icon: Truck, href: "/dashboard/ambulances" },
  { title: "Hospitales", icon: Building2, href: "/dashboard/hospitals" },
  { title: "Mapa en tiempo real", icon: Map, href: "/dashboard/map" },
  { title: "Asistente IA", icon: MessageSquare, href: "/dashboard/assistant" },
  { title: "Reportes", icon: PieChart, href: "/dashboard/reports" },
  { title: "Configuración", icon: Settings, href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <Sidebar className="border-r shadow-sm">
          <SidebarHeader className="p-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-headline font-bold text-xl tracking-tight text-primary">CodeBlueAI</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title} className="rounded-xl h-11 px-4">
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${pathname === item.href ? 'text-primary' : 'text-slate-500'}`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-200 shadow-sm">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src="https://picsum.photos/seed/doctor1/100/100" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">Dr. Ricardo Pérez</p>
                <p className="text-xs text-muted-foreground truncate">Jefe de Despacho</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl" asChild>
              <Link href="/login">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-6 w-px bg-slate-200"></div>
              <h2 className="text-lg font-headline font-bold text-slate-800">
                {navItems.find(n => n.href === pathname)?.title || 'Panel de Control'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-slate-100 border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full border-2 border-white"></span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
