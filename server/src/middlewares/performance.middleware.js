import metrics from '../utils/metrics.js';

export const performanceMiddleware = (req, res, next) => {
  const start = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;
    const path = req.route?.path || req.path;
    
    // Record metrics
    metrics.record(req.method, path, duration, res.statusCode);

    // Log slow requests (> 500ms)
    if (duration > 500) {
      console.warn(`⚠️  SLOW REQUEST: ${req.method} ${path} - ${duration}ms`);
    }

    // Call the original end function
    originalEnd.apply(res, args);
  };

  next();
};

export default performanceMiddleware;
