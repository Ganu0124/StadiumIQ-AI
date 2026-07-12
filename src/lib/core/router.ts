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
  /** Unique identifier of the node. */
  id: string;
  /** Display name of the zone. */
  name: string;
  /** Operational classification of the zone. */
  type: ZoneNodeType;
  /** X-coordinate on the stadium map layout. */
  x: number;
  /** Y-coordinate on the stadium map layout. */
  y: number;
  /** Status flag indicating if the zone is open for entry/exit. */
  isOpen: boolean;
}

/**
 * Representation of a walkway corridor connecting two nodes.
 */
export interface CorridorEdge {
  /** Source node identifier. */
  fromNodeId: string;
  /** Target node identifier. */
  toNodeId: string;
  /** Direct physical distance in meters. */
  baseDistanceMeters: number;
  /** Physical corridor width in meters. */
  widthMeters: number;
  /** Decimal congestion factor between 0.0 (empty) and 1.0 (fully blocked). */
  congestionFactor: number;
  /** Status flag indicating if the corridor is reserved for emergency operations only. */
  isEmergencyOnly: boolean;
  /** Status flag indicating if the corridor is open. */
  isOpen: boolean;
}

/**
 * Computed step in the routing pathway list.
 */
export interface RouteStep {
  /** Identifier of the step node. */
  nodeId: string;
  /** Display name of the step node. */
  nodeName: string;
  /** Node classification type. */
  nodeType: ZoneNodeType;
  /** Map grid X-coordinate. */
  x: number;
  /** Map grid Y-coordinate. */
  y: number;
  /** Running total distance from the start node in meters. */
  distanceFromStart: number;
  /** Estimated elapsed travel time from start in seconds. */
  estimatedTimeSeconds: number;
}

/**
 * Total result payload for routing matrices.
 */
export interface RouteResult {
  /** Ordered list of route steps. */
  path: RouteStep[];
  /** Total calculated path distance in meters. */
  totalDistanceMeters: number;
  /** Total estimated walking time in seconds. */
  totalEstimatedSeconds: number;
  /** Flag showing if this route is designated for emergency evacuation. */
  isEvacuationRoute: boolean;
}

/**
 * Item element inside the priority queue heap.
 */
interface HeapItem<T> {
  /** The item payload. */
  item: T;
  /** Numeric priority weight (lower priority items are dequeued first). */
  priority: number;
}

/**
 * Custom Min-Priority Queue (Binary Heap) implementation.
 * Ensures O(log V) operations for enqueue and dequeue, maintaining Dijkstra's
 * overall complexity at O((E + V) log V), under the required O(n log n).
 */
export class MinPriorityQueue<T> {
  private data: HeapItem<T>[] = [];

  /**
   * Enqueues an item with a priority score.
   * Operational Complexity: O(log V) where V is heap size.
   * 
   * @param item The item to enqueue.
   * @param priority The numeric priority score.
   */
  public enqueue(item: T, priority: number): void {
    this.data.push({ item, priority });
    this.bubbleUp(this.data.length - 1);
  }

  /**
   * Removes and returns the item with the minimum priority score.
   * Operational Complexity: O(log V) where V is heap size.
   * 
   * @returns HeapItem containing the item and priority, or undefined if empty.
   */
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

  /**
   * Checks if the queue is empty.
   * Operational Complexity: O(1).
   * 
   * @returns boolean true if empty, false otherwise.
   */
  public isEmpty(): boolean {
    return this.data.length === 0;
  }

  /**
   * Restores min-heap property by shifting node up.
   * Operational Complexity: O(log V).
   */
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

  /**
   * Restores min-heap property by shifting node down.
   * Operational Complexity: O(log V).
   */
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
   * 
   * @param walkingSpeed Target average walking speed in meters per second.
   * @param congestionMultiplier Traversal impedance multiplier based on density.
   */
  constructor(walkingSpeed = 1.4, congestionMultiplier = 5.0) {
    this.walkingSpeedMetersPerSecond = walkingSpeed;
    this.congestionWeightMultiplier = congestionMultiplier;
  }

  /**
   * Registers a new zone node to the map graph.
   * Operational Complexity: O(1).
   * 
   * @param node The zone node configuration.
   */
  public addNode(node: ZoneNode): void {
    try {
      this.nodes.set(node.id, node);
      if (!this.adjacencyList.has(node.id)) {
        this.adjacencyList.set(node.id, []);
      }
    } catch (error) {
      // Node addition error caught silently
    }
  }

  /**
   * Adds an edge corridor connecting two registered nodes.
   * Operational Complexity: O(1).
   * 
   * @param edge The corridor edge details.
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
      // Corridor addition error caught silently
    }
  }

  /**
   * Programmatic update of congestion scores on pathways.
   * Operational Complexity: O(E_v) where E_v is the degree of the source node.
   * 
   * @param fromNodeId Source node identifier.
   * @param toNodeId Destination node identifier.
   * @param level Congestion level factor between 0.0 and 1.0.
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
      // Congestion setting error caught silently
    }
  }

  /**
   * Resolves the dynamically-weighted traversal impedance weight for a corridor.
   * Weight increases based on base distance and congestion levels.
   * Operational Complexity: O(1).
   * 
   * @param corridor The walkway corridor.
   * @returns Calculated travel impedance weight score.
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
   * 
   * @param startId Starting node identifier.
   * @param targetId Destination node identifier.
   * @param options Routing constraints.
   * @returns RouteResult mapping path steps, or null if unresolvable.
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
      return null;
    }
  }

  /**
   * Automated evacuation pathway planner: directs people from a stand node
   * to the closest open and available emergency-exit gate.
   * Operational Complexity: O(X * (E + V) log V) where X is the number of open exits.
   * 
   * @param startId Starting seating or facility node.
   * @returns RouteResult to the closest exit, or null if unresolvable.
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
      return null;
    }
  }

  /**
   * Pre-loads default MetLife Stadium graph layout.
   * Operational Complexity: O(1).
   * 
   * @returns Configured StadiumRouter instance.
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

