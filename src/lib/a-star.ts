/**
 * @fileOverview Implementación del algoritmo A* para encontrar la mejor ruta.
 * Utilizado para calcular el camino óptimo hacia el hospital.
 */

export interface Point {
  x: number;
  y: number;
}

export interface RouteResult {
  path: Point[];
  cost: number;
  estimatedTimeMinutes: number;
}

class Node {
  constructor(
    public x: number,
    public y: number,
    public g: number = 0,
    public h: number = 0,
    public parent: Node | null = null
  ) {}

  get f(): number {
    return this.g + this.h;
  }
}

/**
 * Calcula la distancia Manhattan como heurística.
 */
function heuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Algoritmo A* simplificado para una rejilla de navegación.
 * En una implementación real, esto usaría coordenadas geográficas y grafos de calles.
 */
export function findBestRoute(start: Point, end: Point): RouteResult {
  const openList: Node[] = [new Node(start.x, start.y, 0, heuristic(start, end))];
  const closedList: Node[] = [];

  while (openList.length > 0) {
    // Obtener nodo con menor F
    let currentIndex = 0;
    for (let i = 0; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    const currentNode = openList[currentIndex];

    // Si llegamos al final
    if (currentNode.x === end.x && currentNode.y === end.y) {
      const path: Point[] = [];
      let temp: Node | null = currentNode;
      while (temp !== null) {
        path.push({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return {
        path: path.reverse(),
        cost: currentNode.g,
        estimatedTimeMinutes: Math.round(currentNode.g * 1.5), // Mock factor
      };
    }

    // Mover de open a closed
    openList.splice(currentIndex, 1);
    closedList.push(currentNode);

    // Vecinos (4 direcciones)
    const neighbors = [
      { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }
    ];

    for (const move of neighbors) {
      const nx = currentNode.x + move.x;
      const ny = currentNode.y + move.y;

      if (closedList.find(n => n.x === nx && n.y === ny)) continue;

      const gScore = currentNode.g + 1;
      let neighborNode = openList.find(n => n.x === nx && n.y === ny);

      if (!neighborNode) {
        neighborNode = new Node(nx, ny, gScore, heuristic({ x: nx, y: ny }, end), currentNode);
        openList.push(neighborNode);
      } else if (gScore < neighborNode.g) {
        neighborNode.g = gScore;
        neighborNode.parent = currentNode;
      }
    }
  }

  return { path: [], cost: 0, estimatedTimeMinutes: 0 };
}
