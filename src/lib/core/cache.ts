/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cache entry metadata including value and absolute expiration timestamp.
 */
interface CacheEntry<V> {
  /** The cached value of type V. */
  value: V;
  /** Absolute epoch timestamp (ms) when the key expires. 0 means infinite TTL. */
  expiresAt: number;
}

/**
 * Event callbacks for monitoring and logs.
 */
export interface CacheEvents<K, V> {
  /** Triggered when an item is retrieved. */
  onGet?: (key: K, value: V) => void;
  /** Triggered when a new item is inserted. */
  onSet?: (key: K, value: V) => void;
  /** Triggered when an item is evicted due to max size limits. */
  onEvict?: (key: K, value: V) => void;
  /** Triggered when an item is lazily expired. */
  onExpire?: (key: K, value: V) => void;
}

/**
 * Configuration options for InMemoryCache.
 */
export interface CacheConfig {
  /** Maximum number of keys allowed in the cache before LRU eviction occurs. */
  maxSize: number;
  /** Default Time To Live (TTL) in milliseconds for new entries. */
  defaultTtlMs: number;
}

/**
 * High-performance, in-memory caching layer mimicking Redis operations.
 * Implements O(1) reads, writes, LRU (Least Recently Used) eviction,
 * and automated TTL (Time To Live) expiration.
 */
export class InMemoryCache<K = string, V = any> {
  private readonly store = new Map<K, CacheEntry<V>>();
  private readonly config: CacheConfig;
  private readonly events: CacheEvents<K, V>;

  // Performance metrics counters
  private hitsCount = 0;
  private missesCount = 0;
  private evictionsCount = 0;
  private expirationsCount = 0;

  /**
   * Constructs the cache with custom thresholds to prevent hardcoded constraints.
   * 
   * @param config The size limits and default expiration terms.
   * @param events Optional callback hooks for key actions.
   */
  constructor(config: CacheConfig, events: CacheEvents<K, V> = {}) {
    if (config.maxSize <= 0) {
      throw new Error('Cache maxSize must be a positive integer');
    }
    if (config.defaultTtlMs < 0) {
      throw new Error('Cache defaultTtlMs cannot be negative');
    }
    this.config = config;
    this.events = events;
  }

  /**
   * Retrieves an item from the cache. Performs lazy expiration checks 
   * and updates LRU order if valid.
   * Operational Complexity: O(1) lookup and Map insertion.
   * 
   * @param key The key to look up.
   * @returns The value if found and not expired, undefined otherwise.
   */
  public get(key: K): V | undefined {
    try {
      const entry = this.store.get(key);

      // Cache Miss
      if (!entry) {
        this.missesCount++;
        return undefined;
      }

      const now = Date.now();

      // Lazy expiration check
      if (entry.expiresAt > 0 && now > entry.expiresAt) {
        this.store.delete(key);
        this.expirationsCount++;
        this.missesCount++;

        if (this.events.onExpire) {
          try {
            this.events.onExpire(key, entry.value);
          } catch (cbError) {
            // Callback execution error caught silently
          }
        }
        return undefined;
      }

      // Cache Hit: Update LRU position by deleting and re-inserting
      this.store.delete(key);
      this.store.set(key, entry);
      this.hitsCount++;

      if (this.events.onGet) {
        try {
          this.events.onGet(key, entry.value);
        } catch (cbError) {
          // Callback execution error caught silently
        }
      }

      return entry.value;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Inserts or updates a value in the cache with a custom or default TTL.
   * Enforces LRU eviction if size limits are reached.
   * Operational Complexity: O(1) map set and deletion.
   * 
   * @param key The cache key.
   * @param value The value to cache.
   * @param ttlMs Optional override TTL in milliseconds. Use 0 for infinite duration.
   * @returns boolean true if set successfully, false on failure.
   */
  public set(key: K, value: V, ttlMs?: number): boolean {
    try {
      const targetTtl = ttlMs !== undefined ? ttlMs : this.config.defaultTtlMs;

      if (targetTtl < 0) {
        throw new Error('Override TTL cannot be negative');
      }

      const now = Date.now();
      const expiresAt = targetTtl === 0 ? 0 : now + targetTtl;

      // If key already exists, delete it first to renew LRU sequence order
      if (this.store.has(key)) {
        this.store.delete(key);
      } else if (this.store.size >= this.config.maxSize) {
        // Enforce LRU eviction: remove the oldest item (first key in map iterator)
        const oldestKey = this.store.keys().next().value;
        if (oldestKey !== undefined) {
          const oldestEntry = this.store.get(oldestKey);
          this.store.delete(oldestKey);
          this.evictionsCount++;

          if (this.events.onEvict && oldestEntry) {
            try {
              this.events.onEvict(oldestKey, oldestEntry.value);
            } catch (cbError) {
              // Callback execution error caught silently
            }
          }
        }
      }

      // Store entry
      this.store.set(key, { value, expiresAt });

      if (this.events.onSet) {
        try {
          this.events.onSet(key, value);
        } catch (cbError) {
          // Callback execution error caught silently
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Deletes a key from the cache store.
   * Operational Complexity: O(1) map deletion.
   * 
   * @param key The key to evict.
   * @returns boolean true if key existed and was deleted, false otherwise.
   */
  public delete(key: K): boolean {
    try {
      return this.store.delete(key);
    } catch (error) {
      return false;
    }
  }

  /**
   * Clears all elements inside the cache store and resets metrics.
   * Operational Complexity: O(1).
   */
  public clear(): void {
    try {
      this.store.clear();
      this.hitsCount = 0;
      this.missesCount = 0;
      this.evictionsCount = 0;
      this.expirationsCount = 0;
    } catch (error) {
      // Clear error caught silently
    }
  }

  /**
   * Checks existence of a key without updating its LRU position or hits counters.
   * Operational Complexity: O(1).
   * 
   * @param key The key to inspect.
   * @returns boolean true if the key exists and is unexpired, false otherwise.
   */
  public has(key: K): boolean {
    try {
      const entry = this.store.get(key);
      if (!entry) return false;

      if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
        // Trigger lazy cleanup
        this.store.delete(key);
        this.expirationsCount++;
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retrieves operational metrics of the caching layer.
   * Operational Complexity: O(1).
   * 
   * @returns Cache statistics including hit rates, size, evictions.
   */
  public getStats() {
    const totalRequests = this.hitsCount + this.missesCount;
    const hitRate = totalRequests > 0 ? (this.hitsCount / totalRequests) * 100 : 0;

    return {
      size: this.store.size,
      maxSize: this.config.maxSize,
      defaultTtlMs: this.config.defaultTtlMs,
      hits: this.hitsCount,
      misses: this.missesCount,
      evictions: this.evictionsCount,
      expirations: this.expirationsCount,
      hitRatePercentage: parseFloat(hitRate.toFixed(2)),
    };
  }
}

