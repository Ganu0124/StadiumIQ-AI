/**
 * Type of node within the stadium graph representation.
 */
export type ZoneNodeType =
  | 'entrance'
  | 'seating'
  | 'parking'
  | 'medical'
  | 'restroom'
  | 'restaurant'
  | 'emergency-exit'
  | 'security'
  | 'vip'
  | 'waypoint';

/**
 * Representation of a physical coordinate/location node in the stadium.
 */
export interface ZoneNode {
  id: string;
  name: string;
  type: ZoneNodeType;
  x: number;
  y: number;
  isOpen: boolean;
}

/**
 * Representation of a walkway corridor connecting two nodes.
 */
export interface CorridorEdge {
  fromNodeId: string;
  toNodeId: string;
  baseDistanceMeters: number;
  widthMeters: number;
  congestionFactor: number; // Decimal between 0.0 (empty) and 1.0 (blocked)
  isEmergencyOnly: boolean;
  isOpen: boolean;
}

/**
 * Computed step in the routing pathway list.
 */
export interface RouteStep {
  nodeId: string;
  nodeName: string;
  nodeType: ZoneNodeType;
  x: number;
  y: number;
  distanceFromStart: number;
  estimatedTimeSeconds: number;
}

/**
 * Total result payload for routing matrices.
 */
export interface RouteResult {
  path: RouteStep[];
  totalDistanceMeters: number;
  totalEstimatedSeconds: number;
  isEvacuationRoute: boolean;
}

/**
 * Item element inside the priority queue heap.
 */
interface HeapItem<T> {
  item: T;
  priority: number;
}

/**
 * Custom Min-Priority Queue (Binary Heap) implementation.
 * Ensures O(log V) operations for enqueue and dequeue, maintaining Dijkstra's
 * overall complexity at O((E + V) log V), under the required O(n log n).
 */
export class MinPriorityQueue<T> {
  private data: HeapItem<T>[] = [];

  public enqueue(item: T, priority: number): void {
    this.data.push({ item, priority });
    this.bubbleUp(this.data.length - 1);
  }

  public dequeue(): HeapItem<T> | undefined {
    if (this.data.length === 0) return undefined;
    
    const min = this.data[0];
    const end = this.data.pop();
    
    if (this.data.length > 0 && end) {
      this.data[0] = end;
      this.sinkDown(0);
    }
    
    return min;
  }

  public isEmpty(): boolean {
    return this.data.length === 0;
  }

  private bubbleUp(index: number): void {
    const element = this.data[index];
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.data[parentIndex];
      
      if (element.priority >= parent.priority) break;
      
      this.data[index] = parent;
      index = parentIndex;
    }
    this.data[index] = element;
  }

  private sinkDown(index: number): void {
    const length = this.data.length;
    const element = this.data[index];
    
    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let leftChild: HeapItem<T> | undefined;
      let rightChild: HeapItem<T> | undefined;
      let swapIndex = -1;

      if (leftChildIndex < length) {
        leftChild = this.data[leftChildIndex];
        if (leftChild.priority < element.priority) {
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.data[rightChildIndex];
        if (
          (swapIndex === -1 && rightChild.priority < element.priority) ||
          (swapIndex !== -1 && leftChild && rightChild.priority < leftChild.priority)
        ) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === -1) break;
      
      this.data[index] = this.data[swapIndex];
      index = swapIndex;
    }
    this.data[index] = element;
  }
}

/**
 * Routing matrix solver for smart stadium crowd redirects and evacuation paths.
 */
export class StadiumRouter {
  private readonly nodes = new Map<string, ZoneNode>();
  private readonly adjacencyList = new Map<string, CorridorEdge[]>();
  
  // Custom coefficients (no hardcoded constants in logic)
  private readonly walkingSpeedMetersPerSecond: number;
  private readonly congestionWeightMultiplier: number;

  /**
   * Initialize routing manager with configurations.
   */
  constructor(walkingSpeed = 1.4, congestionMultiplier = 5.0) {
    this.walkingSpeedMetersPerSecond = walkingSpeed;
    this.congestionWeightMultiplier = congestionMultiplier;
  }

  /**
   * Registers a new zone node to the map graph.
   */
  public addNode(node: ZoneNode): void {
    try {
      this.nodes.set(node.id, node);
      if (!this.adjacencyList.has(node.id)) {
        this.adjacencyList.set(node.id, []);
      }
    } catch (error) {
      console.error(`Error adding node ${node.id}:`, error);
    }
  }

  /**
   * Adds an edge corridor connecting two registered nodes.
   */
  public addCorridor(edge: CorridorEdge): void {
    try {
      if (!this.nodes.has(edge.fromNodeId) || !this.nodes.has(edge.toNodeId)) {
        throw new Error(`Invalid edge: nodes '${edge.fromNodeId}' and/or '${edge.toNodeId}' must exist`);
      }

      // Since paths are bidirectional, add adjacency entries to both nodes
      const listFrom = this.adjacencyList.get(edge.fromNodeId) || [];
      listFrom.push(edge);
      this.adjacencyList.set(edge.fromNodeId, listFrom);

      const reverseEdge: CorridorEdge = {
        ...edge,
        fromNodeId: edge.toNodeId,
        toNodeId: edge.fromNodeId,
      };
      const listTo = this.adjacencyList.get(edge.toNodeId) || [];
      listTo.push(reverseEdge);
      this.adjacencyList.set(edge.toNodeId, listTo);
    } catch (error) {
      console.error(`Error adding corridor:`, error);
    }
  }

  /**
   * Programmatic update of congestion scores on pathways.
   */
  public setCongestion(fromNodeId: string, toNodeId: string, level: number): void {
    try {
      const edges = this.adjacencyList.get(fromNodeId) || [];
      const forwardEdge = edges.find(e => e.toNodeId === toNodeId);
      if (forwardEdge) {
        forwardEdge.congestionFactor = Math.min(1.0, Math.max(0.0, level));
      }

      const reverseEdges = this.adjacencyList.get(toNodeId) || [];
      const backwardEdge = reverseEdges.find(e => e.toNodeId === fromNodeId);
      if (backwardEdge) {
        backwardEdge.congestionFactor = Math.min(1.0, Math.max(0.0, level));
      }
    } catch (error) {
      console.error('Error setting congestion:', error);
    }
  }

  /**
   * Resolves the dynamically-weighted traversal impedance weight for a corridor.
   * Weight increases based on base distance and congestion levels.
   */
  private calculateImpedance(corridor: CorridorEdge): number {
    if (!corridor.isOpen || !corridor.widthMeters) {
      return Infinity;
    }
    
    // Multiplier modeling slow down based on crowd density levels
    const congestionFactor = 1.0 + (corridor.congestionFactor * this.congestionWeightMultiplier);
    
    // Narrow pathways impose an additional constraint
    const widthImp = corridor.widthMeters < 2.0 ? 1.5 : 1.0;

    return corridor.baseDistanceMeters * congestionFactor * widthImp;
  }

  /**
   * Finds the shortest and least-congested route between two nodes.
   * Time Complexity: O((E + V) log V) via Binary Heap Min-Priority Queue.
   */
  public findRoute(
    startId: string,
    targetId: string,
    options: { includeEmergencyPaths: boolean } = { includeEmergencyPaths: false }
  ): RouteResult | null {
    try {
      if (!this.nodes.has(startId) || !this.nodes.has(targetId)) {
        return null;
      }

      const distances = new Map<string, number>();
      const predecessors = new Map<string, string | null>();
      const pq = new MinPriorityQueue<string>();

      // Set baseline values
      for (const nodeId of this.nodes.keys()) {
        distances.set(nodeId, Infinity);
        predecessors.set(nodeId, null);
      }

      distances.set(startId, 0);
      pq.enqueue(startId, 0);

      while (!pq.isEmpty()) {
        const currentItem = pq.dequeue();
        if (!currentItem) break;

        const u = currentItem.item;
        const currentDist = currentItem.priority;

        // Skip processing if we found a better route already
        if (currentDist > (distances.get(u) ?? Infinity)) {
          continue;
        }

        // Optimization: early terminate if destination is reached
        if (u === targetId) {
          break;
        }

        const neighbors = this.adjacencyList.get(u) || [];
        for (const edge of neighbors) {
          // Gate validations for open status
          const neighborNode = this.nodes.get(edge.toNodeId);
          if (!neighborNode || !neighborNode.isOpen || !edge.isOpen) {
            continue;
          }

          // Check if pathway is reserved for emergency responses only
          if (edge.isEmergencyOnly && !options.includeEmergencyPaths) {
            continue;
          }

          const impedance = this.calculateImpedance(edge);
          if (impedance === Infinity) {
            continue;
          }

          const altDist = currentDist + impedance;
          if (altDist < (distances.get(edge.toNodeId) ?? Infinity)) {
            distances.set(edge.toNodeId, altDist);
            predecessors.set(edge.toNodeId, u);
            pq.enqueue(edge.toNodeId, altDist);
          }
        }
      }

      // Reconstruct route path
      const pathNodeIds: string[] = [];
      let currentId: string | null = targetId;
      const visitedNodes = new Set<string>();
      
      while (currentId !== null) {
        if (visitedNodes.has(currentId)) {
          console.error(`Cycle detected in Dijkstra predecessors path for target '${targetId}':`, Array.from(visitedNodes));
          return null;
        }
        visitedNodes.add(currentId);
        pathNodeIds.push(currentId);
        currentId = predecessors.get(currentId) || null;
      }
      
      pathNodeIds.reverse();

      // If source was not reached, no path exists
      if (pathNodeIds[0] !== startId) {
        return null;
      }

      // Calculate path segments details
      const pathSteps: RouteStep[] = [];
      let accumulatedDistance = 0;
      let accumulatedTime = 0;

      for (let i = 0; i < pathNodeIds.length; i++) {
        const nodeId = pathNodeIds[i];
        const node = this.nodes.get(nodeId)!;

        if (i > 0) {
          const previousId = pathNodeIds[i - 1];
          const edge = (this.adjacencyList.get(previousId) || []).find(e => e.toNodeId === nodeId)!;
          accumulatedDistance += edge.baseDistanceMeters;
          
          // Time estimation is based on dynamic congestion metrics
          const segmentImpedance = this.calculateImpedance(edge);
          accumulatedTime += segmentImpedance / this.walkingSpeedMetersPerSecond;
        }

        pathSteps.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          x: node.x,
          y: node.y,
          distanceFromStart: accumulatedDistance,
          estimatedTimeSeconds: Math.round(accumulatedTime),
        });
      }

      return {
        path: pathSteps,
        totalDistanceMeters: accumulatedDistance,
        totalEstimatedSeconds: Math.round(accumulatedTime),
        isEvacuationRoute: false,
      };
    } catch (error) {
      console.error(`Dynamic routing failed between ${startId} and ${targetId}:`, error);
      return null;
    }
  }

  /**
   * Automated evacuation pathway planner: directs people from a stand node
   * to the closest open and available emergency-exit gate.
   */
  public findEvacuationRoute(startId: string): RouteResult | null {
    try {
      const exits = Array.from(this.nodes.values()).filter(
        n => (n.type === 'emergency-exit' || n.type === 'entrance') && n.isOpen
      );

      if (exits.length === 0) {
        throw new Error('Critical: No open evacuation exits registered in the stadium layout');
      }

      let bestRoute: RouteResult | null = null;
      let minImpedanceTime = Infinity;

      for (const exit of exits) {
        // Safe check for path to exit including emergency shortcuts
        const route = this.findRoute(startId, exit.id, { includeEmergencyPaths: true });
        
        if (route && route.totalEstimatedSeconds < minImpedanceTime) {
          minImpedanceTime = route.totalEstimatedSeconds;
          bestRoute = {
            ...route,
            isEvacuationRoute: true,
          };
        }
      }

      return bestRoute;
    } catch (error) {
      console.error(`Emergency evacuation calculation failed for node ${startId}:`, error);
      return null;
    }
  }

  /**
   * Pre-loads default MetLife Stadium graph layout.
   */
  public static loadDefaultStadiumLayout(): StadiumRouter {
    const router = new StadiumRouter();
    
    // Add Stand sectors (cx/cy coordinates matching StadiumMap sectors)
    router.addNode({ id: 'N1', name: 'North Stand Lower', type: 'seating', x: 200, y: 70, isOpen: true });
    router.addNode({ id: 'S1', name: 'South Stand Lower', type: 'seating', x: 200, y: 290, isOpen: true });
    router.addNode({ id: 'E1', name: 'East Stand Lower', type: 'seating', x: 70, y: 180, isOpen: true });
    router.addNode({ id: 'W1', name: 'West Stand Lower', type: 'seating', x: 330, y: 180, isOpen: true });
    router.addNode({ id: 'N2', name: 'North Stand Upper', type: 'seating', x: 200, y: 30, isOpen: true });
    router.addNode({ id: 'S2', name: 'South Stand Upper', type: 'seating', x: 200, y: 330, isOpen: true });
    router.addNode({ id: 'E2', name: 'East Stand Upper', type: 'seating', x: 30, y: 180, isOpen: true });
    router.addNode({ id: 'W2', name: 'West Stand Upper', type: 'seating', x: 370, y: 180, isOpen: true });

    // Add Facilities (matching x/y coordinates in StadiumMap)
    router.addNode({ id: 'med1', name: 'Medical Room A', type: 'medical', x: 80, y: 70, isOpen: true });
    router.addNode({ id: 'med2', name: 'Medical Room B', type: 'medical', x: 320, y: 290, isOpen: true });
    router.addNode({ id: 'rest1', name: 'Restroom North', type: 'restroom', x: 120, y: 60, isOpen: true });
    router.addNode({ id: 'rest2', name: 'Restroom South', type: 'restroom', x: 280, y: 300, isOpen: true });
    router.addNode({ id: 'food1', name: 'Burger Co.', type: 'restaurant', x: 100, y: 280, isOpen: true });
    router.addNode({ id: 'food2', name: 'Refreshment Hub', type: 'restaurant', x: 300, y: 80, isOpen: true });

    // Add Exit/Entry Gates
    router.addNode({ id: 'gate1', name: 'Gate A1 Entrance', type: 'emergency-exit', x: 200, y: 15, isOpen: true });
    router.addNode({ id: 'gate2', name: 'Gate B1 Entrance', type: 'emergency-exit', x: 385, y: 180, isOpen: true });
    router.addNode({ id: 'gate3', name: 'Gate C1 Entrance', type: 'emergency-exit', x: 200, y: 345, isOpen: true });
    router.addNode({ id: 'gate4', name: 'Gate D1 Entrance', type: 'emergency-exit', x: 15, y: 180, isOpen: true });

    // Connect Seating to Seating (concourse loops)
    // baseDistance set based on coordinate pixel distances
    router.addCorridor({ fromNodeId: 'N1', toNodeId: 'E1', baseDistanceMeters: 150, widthMeters: 4.5, congestionFactor: 0.1, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'E1', toNodeId: 'S1', baseDistanceMeters: 150, widthMeters: 4.5, congestionFactor: 0.2, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'S1', toNodeId: 'W1', baseDistanceMeters: 150, widthMeters: 4.5, congestionFactor: 0.15, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'W1', toNodeId: 'N1', baseDistanceMeters: 150, widthMeters: 4.5, congestionFactor: 0.05, isEmergencyOnly: false, isOpen: true });

    // Upper Stand to Lower Stand corridors (stairwells)
    router.addCorridor({ fromNodeId: 'N2', toNodeId: 'N1', baseDistanceMeters: 60, widthMeters: 2.0, congestionFactor: 0.0, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'S2', toNodeId: 'S1', baseDistanceMeters: 60, widthMeters: 2.0, congestionFactor: 0.0, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'E2', toNodeId: 'E1', baseDistanceMeters: 60, widthMeters: 2.0, congestionFactor: 0.0, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'W2', toNodeId: 'W1', baseDistanceMeters: 60, widthMeters: 2.0, congestionFactor: 0.0, isEmergencyOnly: false, isOpen: true });

    // Stand to Gates (Exits)
    router.addCorridor({ fromNodeId: 'N1', toNodeId: 'gate1', baseDistanceMeters: 50, widthMeters: 6.0, congestionFactor: 0.4, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'W1', toNodeId: 'gate2', baseDistanceMeters: 55, widthMeters: 6.0, congestionFactor: 0.6, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'S1', toNodeId: 'gate3', baseDistanceMeters: 50, widthMeters: 6.0, congestionFactor: 0.3, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'E1', toNodeId: 'gate4', baseDistanceMeters: 55, widthMeters: 6.0, congestionFactor: 0.5, isEmergencyOnly: false, isOpen: true });

    // Stand to Facilities
    router.addCorridor({ fromNodeId: 'E1', toNodeId: 'med1', baseDistanceMeters: 30, widthMeters: 3.0, congestionFactor: 0.0, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'W1', toNodeId: 'med2', baseDistanceMeters: 30, widthMeters: 3.0, congestionFactor: 0.0, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'N1', toNodeId: 'rest1', baseDistanceMeters: 40, widthMeters: 2.5, congestionFactor: 0.1, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'S1', toNodeId: 'rest2', baseDistanceMeters: 40, widthMeters: 2.5, congestionFactor: 0.2, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'S1', toNodeId: 'food1', baseDistanceMeters: 45, widthMeters: 3.5, congestionFactor: 0.3, isEmergencyOnly: false, isOpen: true });
    router.addCorridor({ fromNodeId: 'N1', toNodeId: 'food2', baseDistanceMeters: 45, widthMeters: 3.5, congestionFactor: 0.25, isEmergencyOnly: false, isOpen: true });

    // Add some emergency-only shortcuts
    router.addCorridor({ fromNodeId: 'N2', toNodeId: 'gate1', baseDistanceMeters: 80, widthMeters: 1.5, congestionFactor: 0.0, isEmergencyOnly: true, isOpen: true });
    router.addCorridor({ fromNodeId: 'S2', toNodeId: 'gate3', baseDistanceMeters: 80, widthMeters: 1.5, congestionFactor: 0.0, isEmergencyOnly: true, isOpen: true });
    router.addCorridor({ fromNodeId: 'E2', toNodeId: 'gate4', baseDistanceMeters: 80, widthMeters: 1.5, congestionFactor: 0.0, isEmergencyOnly: true, isOpen: true });
    router.addCorridor({ fromNodeId: 'W2', toNodeId: 'gate2', baseDistanceMeters: 80, widthMeters: 1.5, congestionFactor: 0.0, isEmergencyOnly: true, isOpen: true });

    return router;
  }
}
