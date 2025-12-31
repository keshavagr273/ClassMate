class PerformanceMetrics {
  constructor() {
    this.requests = [];
    this.endpointStats = new Map();
    this.startTime = Date.now();
  }

  record(method, path, duration, statusCode) {
    const endpoint = `${method} ${path}`;
    
    // Store recent requests (keep last 1000)
    this.requests.push({ method, path, duration, statusCode, timestamp: Date.now() });
    if (this.requests.length > 1000) this.requests.shift();

    // Aggregate endpoint statistics
    if (!this.endpointStats.has(endpoint)) {
      this.endpointStats.set(endpoint, {
        count: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
      });
    }

    const stats = this.endpointStats.get(endpoint);
    stats.count++;
    stats.totalTime += duration;
    stats.minTime = Math.min(stats.minTime, duration);
    stats.maxTime = Math.max(stats.maxTime, duration);
    if (statusCode >= 400) stats.errors++;
  }

  getStats() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const totalRequests = this.requests.length;
    const totalTime = this.requests.reduce((sum, r) => sum + r.duration, 0);
    
    const endpointData = Array.from(this.endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        requests: stats.count,
        avgTime: Math.round(stats.totalTime / stats.count),
        minTime: Math.round(stats.minTime),
        maxTime: Math.round(stats.maxTime),
        errorRate: ((stats.errors / stats.count) * 100).toFixed(1) + '%',
      }))
      .sort((a, b) => b.requests - a.requests);

    return {
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      totalRequests,
      avgResponseTime: totalRequests ? Math.round(totalTime / totalRequests) + 'ms' : '0ms',
      requestsPerMinute: totalRequests > 0 ? ((totalRequests / uptime) * 60).toFixed(2) : '0',
      topEndpoints: endpointData.slice(0, 10),
      recentRequests: this.requests.slice(-20).reverse().map(r => ({
        endpoint: `${r.method} ${r.path}`,
        duration: r.duration + 'ms',
        status: r.statusCode,
        time: new Date(r.timestamp).toISOString(),
      })),
    };
  }

  reset() {
    this.requests = [];
    this.endpointStats.clear();
    this.startTime = Date.now();
  }
}

export default new PerformanceMetrics();
