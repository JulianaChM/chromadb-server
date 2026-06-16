
import { findBestDispatchBFS } from './bfs';
import { findBestDispatchAStar } from './a-star';

interface EvaluationResult {
  nodes: {
    bfs: number;
    aStar: number;
  };
  time: {
    bfs: number;
    aStar: number;
  };
  cost: {
    bfs: number;
    aStar: number;
  };
}

export function runEvaluation(incidents: any[], ambulances: any[], hospitals: any[]): EvaluationResult[] {
  const results: EvaluationResult[] = [];

  for (const incident of incidents) {
    const bfsResult = findBestDispatchBFS(ambulances, incident, hospitals);
    const aStarResult = findBestDispatchAStar(ambulances, incident, hospitals);

    if (bfsResult && aStarResult) {
      results.push({
        nodes: {
          bfs: bfsResult.nodosExplorados,
          aStar: aStarResult.nodosExplorados,
        },
        time: {
          bfs: bfsResult.tiempoEjecucion,
          aStar: aStarResult.tiempoEjecucion,
        },
        cost: {
          bfs: bfsResult.costoTotal,
          aStar: aStarResult.costoTotal,
        },
      });
    }
  }

  return results;
}

export function calculateAverages(results: EvaluationResult[]) {
  const totalResults = results.length;
  if (totalResults === 0) {
    return {
        averageNodes: { bfs: 0, aStar: 0 },
        averageTime: { bfs: 0, aStar: 0 },
        averageCost: { bfs: 0, aStar: 0 },
    };
  }

  const averageNodes = {
    bfs: results.reduce((acc, r) => acc + r.nodes.bfs, 0) / totalResults,
    aStar: results.reduce((acc, r) => acc + r.nodes.aStar, 0) / totalResults,
  };

  const averageTime = {
    bfs: results.reduce((acc, r) => acc + r.time.bfs, 0) / totalResults,
    aStar: results.reduce((acc, r) => acc + r.time.aStar, 0) / totalResults,
  };

  const averageCost = {
    bfs: results.reduce((acc, r) => acc + r.cost.bfs, 0) / totalResults,
    aStar: results.reduce((acc, r) => acc + r.cost.aStar, 0) / totalResults,
  };

  return {
    averageNodes,
    averageTime,
    averageCost,
  };
}

export function printEvaluationResults(
  totalScenarios: number,
  averageNodes: { bfs: number; aStar: number },
  averageTime: { bfs: number; aStar: number },
  averageCost: { bfs: number; aStar: number }
) {
  const improvement =
    averageNodes.bfs > 0 ? ((averageNodes.bfs - averageNodes.aStar) / averageNodes.bfs) * 100 : 0;

  console.log('[EVALUACION NIVEL 3]');
  console.log('');
  console.log(`Escenarios evaluados: ${totalScenarios}`);
  console.log('');
  console.log('BFS:');
  console.log(`- Promedio nodos: ${averageNodes.bfs.toFixed(2)}`);
  console.log(`- Promedio tiempo: ${averageTime.bfs.toFixed(2)} ms`);
  console.log(`- Promedio costo: ${averageCost.bfs.toFixed(2)}`);
  console.log('');
  console.log('A*:');
  console.log(`- Promedio nodos: ${averageNodes.aStar.toFixed(2)}`);
  console.log(`- Promedio tiempo: ${averageTime.aStar.toFixed(2)} ms`);
  console.log(`- Promedio costo: ${averageCost.aStar.toFixed(2)}`);
  console.log('');
  console.log(`Mejora exploración: ${improvement.toFixed(2)} %`);
}
