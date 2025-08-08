import { BUCKET_EXPIRATION_MS, CLEANUP_INTERVAL_MS } from "./constants";

interface Bucket {
  count: number;
  refilledAt: number;
  lastAccessed: number;
}

export interface IRateLimiter<TKey> {
  consume(key: TKey, cost: number): boolean;
}

export class InMemoryRateLimiter<TKey> implements IRateLimiter<TKey> {
  public max: number;
  public refillIntervalSeconds: number;
  private storage = new Map<TKey, Bucket>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(max: number, refillIntervalSeconds: number) {
    this.max = max;
    this.refillIntervalSeconds = refillIntervalSeconds;
    this.startCleanup();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.storage.entries()) {
      if (now - bucket.lastAccessed > BUCKET_EXPIRATION_MS) {
        this.storage.delete(key);
      }
    }
  }

  private startCleanup(): void {
    if (this.cleanupInterval === null) {
      this.cleanupInterval = setInterval(
        () => this.cleanup(),
        CLEANUP_INTERVAL_MS,
      );
    }
  }

  public stopCleanup(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  public consume(key: TKey, cost: number): boolean {
    const now = Date.now();
    const bucket = this.storage.get(key) ?? {
      count: this.max,
      refilledAt: now,
      lastAccessed: now,
    };

    const refillAmount = Math.floor(
      (now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000),
    );

    if (refillAmount > 0) {
      bucket.count = Math.min(bucket.count + refillAmount, this.max);
      bucket.refilledAt = now;
    }

    bucket.lastAccessed = now;

    if (bucket.count < cost) {
      this.storage.set(key, bucket);
      return false;
    }

    bucket.count -= cost;
    this.storage.set(key, bucket);
    return true;
  }
}
