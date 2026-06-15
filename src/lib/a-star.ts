/**
 * @fileOverview Implementación del algoritmo A* para el espacio de estados de despacho.
 * Estado: Ambulancia -> Incidente -> Hospital
 */

export interface SearchNode {
  id: string;
  type: 'ambulance' | 'incident' | 'hospital';
  lat: number;
  lng: number;
  g: number; // Costo acumulado
  h: number; // Heurística
  f: number; // g + h
  parent: SearchNode | null;
  ref: any; // Referencia al objeto original (Ambulancia o Hospital)
}

function getEuclideanDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
}

export function findBestDispatchAStar(ambulancias: any[], incidente: any, hospitales: any[]) {
  const startTime = performance.now();
  let nodosExplorados = 0;

  if (!incidente || ambulancias.length === 0 || hospitales.length === 0) {
    return null;
  }

  // Hospitales con capacidad
  const validHospitals = hospitales.filter(h => h.capacidad_disponible > 0);
  if (validHospitals.length === 0) return null;

  // Heurística auxiliar: distancia del incidente al hospital más cercano
  const minIncidentToHosp = Math.min(
    ...validHospitals.map(h => getEuclideanDistance(incidente.lat, incidente.lng, h.lat, h.lng))
  );

  // Frontera (Priority Queue simplificada)
  let openSet: SearchNode[] = [];

  // Paso 1: Inicializar con ambulancias disponibles
  ambulancias.forEach(amb => {
    const distToInc = getEuclideanDistance(amb.lat, amb.lng, incidente.lat, incidente.lng);
    const h = distToInc + minIncidentToHosp;
    openSet.push({
      id: amb.id,
      type: 'ambulance',
      lat: amb.lat,
      lng: amb.lng,
      g: 0,
      h: h,
      f: h,
      parent: null,
      ref: amb
    });
  });

  let bestSolution: SearchNode | null = null;

  while (openSet.length > 0) {
    // Ordenar por F (menor a mayor)
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    nodosExplorados++;

    // Si estamos en una ambulancia, el siguiente paso es el incidente
    if (current.type === 'ambulance') {
      const distToInc = getEuclideanDistance(current.lat, current.lng, incidente.lat, incidente.lng);
      const incidentNode: SearchNode = {
        id: 'incident-node',
        type: 'incident',
        lat: incidente.lat,
        lng: incidente.lng,
        g: current.g + distToInc,
        h: minIncidentToHosp,
        f: (current.g + distToInc) + minIncidentToHosp,
        parent: current,
        ref: incidente
      };
      openSet.push(incidentNode);
    } 
    // Si estamos en el incidente, expandir a todos los hospitales válidos
    else if (current.type === 'incident') {
      validHospitals.forEach(hosp => {
        const distToHosp = getEuclideanDistance(current.lat, current.lng, hosp.lat, hosp.lng);
        const hospitalNode: SearchNode = {
          id: hosp.id,
          type: 'hospital',
          lat: hosp.lat,
          lng: hosp.lng,
          g: current.g + distToHosp,
          h: 0,
          f: current.g + distToHosp,
          parent: current,
          ref: hosp
        };
        openSet.push(hospitalNode);
      });
    }
    // Si llegamos a un hospital, hemos encontrado una meta
    else if (current.type === 'hospital') {
      if (!bestSolution || current.g < bestSolution.g) {
        bestSolution = current;
      }
      // Como es A* y los costos son positivos, la primera meta encontrada con el menor F es la óptima
      break; 
    }
  }

  const endTime = performance.now();

  if (bestSolution) {
    const hospitalElegido = bestSolution.ref;
    const ambulanciaElegida = bestSolution.parent?.parent?.ref;

    return {
      ambulanciaElegida,
      hospitalElegido,
      costoTotal: bestSolution.g,
      nodosExplorados,
      tiempoEjecucion: endTime - startTime
    };
  }

  return null;
}
