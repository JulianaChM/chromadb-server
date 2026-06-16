/**
 * @fileOverview Implementación del algoritmo BFS (Breadth-First Search) para despacho.
 * Búsqueda no informada.
 */

import { SearchNode } from './a-star';

function getEuclideanDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
}

export function findBestDispatchBFS(ambulancias: any[], incidente: any, hospitales: any[]) {
  const startTime = performance.now();
  let nodosExplorados = 0;

  if (!incidente || ambulancias.length === 0 || hospitales.length === 0) {
    return null;
  }

  const validHospitals = hospitales.filter(h => h.capacidad_disponible > 0);
  if (validHospitals.length === 0) return null;

  // Frontera (Queue FIFO)
  let queue: SearchNode[] = [];

  // Nivel 1: Ambulancias
  ambulancias.forEach(amb => {
    queue.push({
      id: amb.id,
      type: 'ambulance',
      lat: amb.lat,
      lng: amb.lng,
      g: 0,
      h: 0,
      f: 0,
      parent: null,
      ref: amb
    });
  });

  let solutions: SearchNode[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    nodosExplorados++;

    if (current.type === 'ambulance') {
      const distToInc = getEuclideanDistance(current.lat, current.lng, incidente.lat, incidente.lng);
      queue.push({
        id: 'incident-node',
        type: 'incident',
        lat: incidente.lat,
        lng: incidente.lng,
        g: current.g + distToInc,
        h: 0,
        f: 0,
        parent: current,
        ref: incidente
      });
    } 
    else if (current.type === 'incident') {
      validHospitals.forEach(hosp => {
        const distToHosp = getEuclideanDistance(current.lat, current.lng, hosp.lat, hosp.lng);
        queue.push({
          id: hosp.id,
          type: 'hospital',
          lat: hosp.lat,
          lng: hosp.lng,
          g: current.g + distToHosp,
          h: 0,
          f: 0,
          parent: current,
          ref: hosp
        });
      });
    }
    else if (current.type === 'hospital') {
      solutions.push(current);
    }
  }

  // En BFS no informada, exploramos todo el árbol para encontrar la mejor solución
  // (ya que BFS solo garantiza el camino más corto en número de pasos, no en costo acumulado G)
  const bestSolution = solutions.sort((a, b) => a.g - b.g)[0];

  const endTime = performance.now();

  if (bestSolution) {
    return {
      ambulanciaElegida: bestSolution.parent?.parent?.ref,
      hospitalElegido: bestSolution.ref,
      costoTotal: bestSolution.g,
      nodosExplorados,
      tiempoEjecucion: endTime - startTime
    };
  }

  return null;
}
