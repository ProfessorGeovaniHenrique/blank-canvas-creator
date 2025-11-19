/**
 * Sistema de métricas para monitoramento do cache
 */

interface CacheMetrics {
  operations: {
    hits: number;
    misses: number;
    saves: number;
    errors: number;
  };
  performance: {
    avgLoadTime: number;
    avgCompressionTime: number;
    avgDecompressionTime: number;
    loadTimes: number[];
  };
  storage: {
    totalSize: number;
    compressionRatio: number;
  };
}

class CacheMetricsManager {
  private metrics: CacheMetrics = {
    operations: { hits: 0, misses: 0, saves: 0, errors: 0 },
    performance: {
      avgLoadTime: 0,
      avgCompressionTime: 0,
      avgDecompressionTime: 0,
      loadTimes: []
    },
    storage: { totalSize: 0, compressionRatio: 0 }
  };

  recordHit() {
    this.metrics.operations.hits++;
  }

  recordMiss() {
    this.metrics.operations.misses++;
  }

  recordSave() {
    this.metrics.operations.saves++;
  }

  recordError() {
    this.metrics.operations.errors++;
  }

  recordLoadTime(ms: number) {
    this.metrics.performance.loadTimes.push(ms);
    if (this.metrics.performance.loadTimes.length > 100) {
      this.metrics.performance.loadTimes.shift();
    }
    this.metrics.performance.avgLoadTime = 
      this.metrics.performance.loadTimes.reduce((a, b) => a + b, 0) / 
      this.metrics.performance.loadTimes.length;
  }

  recordCompressionTime(ms: number) {
    const current = this.metrics.performance.avgCompressionTime;
    this.metrics.performance.avgCompressionTime = 
      current === 0 ? ms : (current + ms) / 2;
  }

  recordDecompressionTime(ms: number) {
    const current = this.metrics.performance.avgDecompressionTime;
    this.metrics.performance.avgDecompressionTime = 
      current === 0 ? ms : (current + ms) / 2;
  }

  updateStorage(totalSize: number, compressionRatio: number) {
    this.metrics.storage.totalSize = totalSize;
    this.metrics.storage.compressionRatio = compressionRatio;
  }

  getMetrics(): Readonly<CacheMetrics> {
    return { ...this.metrics };
  }

  getCacheHitRate(): number {
    const total = this.metrics.operations.hits + this.metrics.operations.misses;
    return total === 0 ? 0 : (this.metrics.operations.hits / total) * 100;
  }

  reset() {
    this.metrics = {
      operations: { hits: 0, misses: 0, saves: 0, errors: 0 },
      performance: {
        avgLoadTime: 0,
        avgCompressionTime: 0,
        avgDecompressionTime: 0,
        loadTimes: []
      },
      storage: { totalSize: 0, compressionRatio: 0 }
    };
  }
}

export const cacheMetrics = new CacheMetricsManager();
