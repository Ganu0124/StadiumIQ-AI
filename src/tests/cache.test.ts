import { InMemoryCache } from '../lib/core/cache';

describe('InMemoryCache (Redis-like Caching Layer)', () => {
  // Test O(1) CRUD operations
  it('should set and get values successfully', () => {
    const cache = new InMemoryCache<string, number>({ maxSize: 10, defaultTtlMs: 0 });
    
    expect(cache.set('a', 1)).toBe(true);
    expect(cache.get('a')).toBe(1);
    expect(cache.has('a')).toBe(true);
    
    expect(cache.getStats().hits).toBe(1);
    expect(cache.getStats().misses).toBe(0);
  });

  it('should return undefined and register miss on non-existent keys', () => {
    const cache = new InMemoryCache<string, string>({ maxSize: 10, defaultTtlMs: 0 });
    
    expect(cache.get('non-existent')).toBeUndefined();
    expect(cache.getStats().misses).toBe(1);
  });

  // Test LRU Eviction Policy
  it('should evict Least Recently Used item when maxSize is reached', () => {
    const evictedKeys: string[] = [];
    const cache = new InMemoryCache<string, string>(
      { maxSize: 3, defaultTtlMs: 0 },
      {
        onEvict: (key) => {
          evictedKeys.push(key);
        },
      }
    );

    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    cache.set('k3', 'v3');
    
    // Access k1 to make it Most Recently Used
    cache.get('k1');
    
    // Adding k4 should trigger eviction of k2 (k2 was LRU since k1 was accessed, and k3 was added later)
    cache.set('k4', 'v4');

    expect(cache.has('k2')).toBe(false);
    expect(cache.has('k1')).toBe(true);
    expect(cache.has('k3')).toBe(true);
    expect(cache.has('k4')).toBe(true);
    
    expect(evictedKeys).toContain('k2');
    expect(cache.getStats().evictions).toBe(1);
  });

  // Test TTL Expiration
  it('should expire keys automatically after TTL duration', async () => {
    const expiredKeys: string[] = [];
    const cache = new InMemoryCache<string, string>(
      { maxSize: 10, defaultTtlMs: 50 }, // 50ms TTL
      {
        onExpire: (key) => {
          expiredKeys.push(key);
        },
      }
    );

    cache.set('k1', 'val1');
    expect(cache.get('k1')).toBe('val1');

    // Wait for 60ms to let k1 expire
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(cache.get('k1')).toBeUndefined();
    expect(cache.has('k1')).toBe(false);
    expect(expiredKeys).toContain('k1');
    expect(cache.getStats().expirations).toBe(1);
  });

  // Test custom TTL override
  it('should support override TTL for specific keys', async () => {
    const cache = new InMemoryCache<string, string>({ maxSize: 10, defaultTtlMs: 1000 });
    
    // Set k1 with 10ms custom override TTL
    cache.set('k1', 'val1', 10);
    
    await new Promise((resolve) => setTimeout(resolve, 20));
    
    expect(cache.get('k1')).toBeUndefined();
  });

  // Test stats calculation
  it('should track correct hit rate percentage metrics', () => {
    const cache = new InMemoryCache<string, number>({ maxSize: 5, defaultTtlMs: 0 });
    
    cache.set('k1', 10);
    
    cache.get('k1'); // hit
    cache.get('k1'); // hit
    cache.get('k2'); // miss
    
    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatePercentage).toBe(66.67);
  });
});
