
"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { runEvaluation, calculateAverages, printEvaluationResults } from "../../../lib/evaluation";
import { mockAmbulances, mockHospitals } from "../../lib/mock-data";
import { mockIncidents } from "../../../lib/mock-incidents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
    name: string;
    BFS: number;
    AStar: number;
}

interface EvaluationData {
    averages: any;
    chartData: ChartData[];
    totalScenarios: number;
    improvement: number;
}

export default function EvaluationPage() {
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);

  useEffect(() => {
    const incidents = mockIncidents;
    const ambulances = mockAmbulances.filter(a => a.status === 'available').map(a => ({ ...a, lat: a.coordinates.latitude, lng: a.coordinates.longitude }));
    const hospitals = mockHospitals.filter(h => h.occupancyCurrent < h.capacity).map(h => ({ ...h, lat: h.coordinates.latitude, lng: h.coordinates.longitude, capacidad_disponible: h.capacity - h.occupancyCurrent }));

    const results = runEvaluation(incidents, ambulances, hospitals);
    const averages = calculateAverages(results);

    printEvaluationResults(results.length, averages.averageNodes, averages.averageTime, averages.averageCost);

    const chartData: ChartData[] = [
      {
        name: 'Nodos Explorados',
        BFS: averages.averageNodes.bfs,
        AStar: averages.averageNodes.aStar,
      },
      {
        name: 'Tiempo de Ejecución (ms)',
        BFS: averages.averageTime.bfs,
        AStar: averages.averageTime.aStar,
      },
      {
        name: 'Costo de Ruta',
        BFS: averages.averageCost.bfs,
        AStar: averages.averageCost.aStar,
      },
    ];

    setEvaluationData({
      averages,
      chartData,
      totalScenarios: results.length,
      improvement: averages.averageNodes.bfs > 0 ? ((averages.averageNodes.bfs - averages.averageNodes.aStar) / averages.averageNodes.bfs) * 100 : 0,
    });
  }, []);

  if (!evaluationData) {
    return <div className="flex items-center justify-center h-full">Calculando métricas de evaluación...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Resultados de la Evaluación de Algoritmos</CardTitle>
          <p className="text-muted-foreground text-sm">Comparativa de rendimiento entre BFS y A* para {evaluationData.totalScenarios} escenarios de prueba.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-center">Comparativa Gráfica</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={evaluationData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Bar dataKey="BFS" fill="#3b82f6" name="BFS" />
                  <Bar dataKey="AStar" fill="#16a34a" name="A*" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-4">Métricas Promedio</h3>
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-700">BFS</h4>
                  <p className="text-sm text-slate-600">Nodos explorados: <span className="font-semibold">{evaluationData.averages.averageNodes.bfs.toFixed(2)}</span></p>
                  <p className="text-sm text-slate-600">Tiempo de ejecución: <span className="font-semibold">{evaluationData.averages.averageTime.bfs.toFixed(2)} ms</span></p>
                  <p className="text-sm text-slate-600">Costo de ruta: <span className="font-semibold">{evaluationData.averages.averageCost.bfs.toFixed(2)}</span></p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-700">A*</h4>
                  <p className="text-sm text-slate-600">Nodos explorados: <span className="font-semibold">{evaluationData.averages.averageNodes.aStar.toFixed(2)}</span></p>
                  <p className="text-sm text-slate-600">Tiempo de ejecución: <span className="font-semibold">{evaluationData.averages.averageTime.aStar.toFixed(2)} ms</span></p>
                  <p className="text-sm text-slate-600">Costo de ruta: <span className="font-semibold">{evaluationData.averages.averageCost.aStar.toFixed(2)}</span></p>
                </div>
              </div>
              <div className="mt-6 text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Mejora en Exploración con A*</h4>
                <p className="text-3xl font-bold text-green-600">{evaluationData.improvement.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
