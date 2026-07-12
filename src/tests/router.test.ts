import { StadiumRouter, MinPriorityQueue } from '../lib/core/router';

describe('MinPriorityQueue (Binary Heap)', () => {
  it('should dequeue elements in priority order', () => {
    const pq = new MinPriorityQueue<string>();
    
    pq.enqueue('item-medium', 10);
    pq.enqueue('item-low', 20);
    pq.enqueue('item-high', 5);
    pq.enqueue('item-critical', 1);

    expect(pq.dequeue()?.item).toBe('item-critical');
    expect(pq.dequeue()?.item).toBe('item-high');
    expect(pq.dequeue()?.item).toBe('item-medium');
    expect(pq.dequeue()?.item).toBe('item-low');
    expect(pq.isEmpty()).toBe(true);
  });
});

describe('StadiumRouter (Dijkstra Pathfinding & Evacuation Solver)', () => {
  let router: StadiumRouter;

  beforeEach(() => {
    // Set up a simple 4-node grid for testing routing
    // Node layout:
    // Stand (A) --- (10m) --- Concourse (B) --- (10m) --- Exit Gate (C)
    // Stand (A) --------- (25m, wide corridor) --------- Exit Gate (C)
    router = new StadiumRouter(1.4, 5.0); // 1.4m/s, 5.0x congestion weight

    router.addNode({ id: 'A', name: 'Stand A', type: 'seating', x: 0, y: 0, isOpen: true });
    router.addNode({ id: 'B', name: 'Concourse B', type: 'waypoint', x: 10, y: 0, isOpen: true });
    router.addNode({ id: 'C', name: 'Exit C', type: 'emergency-exit', x: 20, y: 0, isOpen: true });
    
    // Add paths
    router.addCorridor({
      fromNodeId: 'A',
      toNodeId: 'B',
      baseDistanceMeters: 10,
      widthMeters: 3.0,
      congestionFactor: 0.0,
      isEmergencyOnly: false,
      isOpen: true
    });
    router.addCorridor({
      fromNodeId: 'B',
      toNodeId: 'C',
      baseDistanceMeters: 10,
      widthMeters: 3.0,
      congestionFactor: 0.0,
      isEmergencyOnly: false,
      isOpen: true
    });
    // Add longer direct backup path
    router.addCorridor({
      fromNodeId: 'A',
      toNodeId: 'C',
      baseDistanceMeters: 25,
      widthMeters: 4.0,
      congestionFactor: 0.0,
      isEmergencyOnly: false,
      isOpen: true
    });
  });

  it('should find the shortest path under normal conditions', () => {
    const route = router.findRoute('A', 'C');
    expect(route).not.toBeNull();
    // Shortest path should go via Concourse B (10m + 10m = 20m) rather than direct (25m)
    expect(route?.totalDistanceMeters).toBe(20);
    expect(route?.path.map(p => p.nodeId)).toEqual(['A', 'B', 'C']);
  });

  it('should bypass congested paths to find optimal crowd-flow alternatives', () => {
    // Set heavy congestion (0.8 = 80% crowded) on the corridor between A and B
    router.setCongestion('A', 'B', 0.8);

    const route = router.findRoute('A', 'C');
    expect(route).not.toBeNull();
    // Dijkstra should bypass A -> B due to dynamic weight impedance and select the direct path A -> C (25m)
    expect(route?.path.map(p => p.nodeId)).toEqual(['A', 'C']);
    expect(route?.totalDistanceMeters).toBe(25);
  });

  it('should find the nearest emergency exit evacuation route', () => {
    // Let's add another exit: D (Exit D) connected to B with 5m distance
    router.addNode({ id: 'D', name: 'Exit D', type: 'emergency-exit', x: 10, y: -5, isOpen: true });
    router.addCorridor({
      fromNodeId: 'B',
      toNodeId: 'D',
      baseDistanceMeters: 5,
      widthMeters: 2.0,
      congestionFactor: 0.0,
      isEmergencyOnly: true, // Only for emergencies!
      isOpen: true
    });

    // Run normal route (should not use emergency path D)
    const normalRoute = router.findRoute('A', 'D', { includeEmergencyPaths: false });
    expect(normalRoute).toBeNull();

    // Run evacuation route from A
    // Nearest exit should be D (via B, 10m + 5m = 15m) instead of C (20m)
    const evacRoute = router.findEvacuationRoute('A');
    expect(evacRoute).not.toBeNull();
    expect(evacRoute?.isEvacuationRoute).toBe(true);
    expect(evacRoute?.path.map(p => p.nodeId)).toEqual(['A', 'B', 'D']);
    expect(evacRoute?.totalDistanceMeters).toBe(15);
  });

  it('should return null if there is no valid path', () => {
    // Let's add an isolated node E
    router.addNode({ id: 'E', name: 'Isolated Section', type: 'seating', x: 100, y: 100, isOpen: true });
    const route = router.findRoute('A', 'E');
    expect(route).toBeNull();
  });
});
