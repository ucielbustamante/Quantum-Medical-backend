const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Cantidad total de requests HTTP',
  labelNames: ['method', 'path', 'status_code'],
});
register.registerMetric(httpRequestCounter);

const latencyHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de las requests HTTP',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5]
});
register.registerMetric(latencyHistogram);

function metricsMiddleware(req, res, next) {
  const path = req.route?.path || req.originalUrl?.split('?')[0] || req.path;

  const labels = {
    method: req.method,
    path: path,
    status_code: undefined,
  };

  const end = latencyHistogram.startTimer(labels);

  res.on('finish', () => {
    labels.status_code = String(res.statusCode);
    httpRequestCounter.labels(labels.method, labels.path, labels.status_code).inc();
    end();
  });

  next();
}

function metricsEndpoint(req, res) {
  res.set('Content-Type', register.contentType);
  register.metrics().then(metrics => res.send(metrics));
}

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
};
