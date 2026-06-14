
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Activity, ShieldCheck, MapPin, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="bg-primary p-1.5 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">CodeBlueAI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link href="/registro-incidente">
            <Button variant="outline" className="rounded-full px-6 border-primary text-primary hover:bg-primary/5">
              Registrar Emergencia
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="default" className="rounded-full px-6">Login</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 medical-gradient text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Intelligent Emergency Response Coordination
                  </h1>
                  <p className="max-w-[600px] text-blue-50/90 md:text-xl font-light">
                    Optimizing critical healthcare logistics with Generative AI. Assign ambulances and hospitals with clinical precision.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/registro-incidente">
                    <Button size="lg" className="bg-white text-primary hover:bg-blue-50 border-none rounded-full px-8 py-6 text-lg font-semibold">
                      Registrar una Emergencia
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="relative w-full aspect-square max-w-[500px] rounded-3xl overflow-hidden shadow-2xl border-8 border-white/10">
                  <img
                    alt="Clinical Dashboard"
                    className="object-cover"
                    src="https://picsum.photos/seed/codeblue/800/800"
                    data-ai-hint="medical dashboard"
                  />
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-20 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl text-foreground">Next-Gen Dispatch Features</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Powered by advanced algorithms and AI to save more lives through efficiency.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-md transition-all">
                <div className="p-4 bg-primary/10 rounded-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Zap className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">AI Routing</h3>
                <p className="text-muted-foreground text-sm">Real-time path optimization based on live traffic and facility occupancy.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-md transition-all">
                <div className="p-4 bg-primary/10 rounded-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <ShieldCheck className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">Clinical Match</h3>
                <p className="text-muted-foreground text-sm">Matching patients with the nearest hospital specialized in their specific condition.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-md transition-all">
                <div className="p-4 bg-primary/10 rounded-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Activity className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">Fleet Tracking</h3>
                <p className="text-muted-foreground text-sm">Comprehensive real-time monitoring of all active ambulance units.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:shadow-md transition-all">
                <div className="p-4 bg-primary/10 rounded-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MapPin className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-headline font-bold mb-3">Smart Dispatch</h3>
                <p className="text-muted-foreground text-sm">One-click assignments based on proximity and unit readiness.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 px-4 md:px-6 border-t bg-white">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 CodeBlueAI. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">Terms of Service</Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
