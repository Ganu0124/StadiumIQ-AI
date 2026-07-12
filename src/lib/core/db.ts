import fs from 'fs';
import path from 'path';

/**
 * Interface representing the database schema stored in db.json.
 */
export interface DbSchema {
  incidents: any[];
  announcements: any[];
}

/**
 * Standard path to the JSON database.
 */
const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

/**
 * A standard Mutex lock implementation to serialize async/sync operations.
 * Enforces database transaction isolation at the Node.js event loop level.
 */
export class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;

  /**
   * Acquires the mutex lock. Returns a release function to unlock it.
   * Operational Complexity: O(1) time complexity.
   * 
   * @returns A promise resolving to a function that releases the lock.
   */
  public async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const release = () => {
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          next?.();
        } else {
          this.locked = false;
        }
      };

      if (this.locked) {
        this.queue.push(() => resolve(release));
      } else {
        this.locked = true;
        resolve(release);
      }
    });
  }
}

// Global mutex instance to synchronize database file access across all API endpoints
const dbMutex = new Mutex();

/**
 * Directly reads and parses the JSON database file.
 * Operational Complexity: O(N) where N is the size of the database.
 * 
 * @returns The parsed database schema.
 * @throws Error if file reading or parsing fails.
 */
export function readDb(): DbSchema {
  try {
    const fileData = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    throw new Error('Database Read Error');
  }
}

/**
 * Directly serializes and writes data to the JSON database file.
 * Operational Complexity: O(N) where N is the size of the database.
 * 
 * @param data The database schema to persist.
 * @throws Error if file writing fails.
 */
export function writeDb(data: DbSchema): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw new Error('Database Write Error');
  }
}

/**
 * Runs a transactional database update with explicit concurrency locks.
 * Acquires a Mutex lock, reads the database file, executes user changes inside the callback,
 * writes the updated state back to the disk, and releases the lock.
 * Operational Complexity: O(N) due to file read/write operations, with O(1) lock synchronization.
 * 
 * @param callback Async or sync function executing changes on the database instance.
 * @returns The value returned by the callback.
 */
export async function runTransaction<T>(
  callback: (db: DbSchema) => Promise<T> | T
): Promise<T> {
  const release = await dbMutex.acquire();
  try {
    const db = readDb();
    const result = await callback(db);
    writeDb(db);
    return result;
  } finally {
    release();
  }
}
