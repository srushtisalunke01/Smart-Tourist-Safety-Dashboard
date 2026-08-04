const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;

let connection = null;
let emailQueue = null;
let isRedisConnected = false;
let hasConnectionFailed = false;

try {
  connection = new IORedis({
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null, // Required by BullMQ
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) {
        if (!hasConnectionFailed) {
          hasConnectionFailed = true;
          console.log('[Redis] Max connection retries reached. Background jobs will run synchronously.');
        }
        return null; // Stop retrying
      }
      return Math.min(times * 500, 2000);
    }
  });

  connection.on('connect', () => {
    console.log('[Redis] Connected successfully to server.');
    isRedisConnected = true;
    if (!emailQueue) {
      emailQueue = new Queue('EmailQueue', { connection });
    }
  });

  connection.on('error', (err) => {
    isRedisConnected = false;
    // Log connection issues once as warning rather than spamming
    if (!hasConnectionFailed) {
      console.log(`[Redis] Connection issue: ${err.message}`);
    }
  });

  connection.connect().catch(() => {
    isRedisConnected = false;
    if (!hasConnectionFailed) {
      hasConnectionFailed = true;
      console.log('[Redis] Connection failed. Background jobs will fall back to synchronous execution.');
    }
  });
} catch (err) {
  console.error('[Redis] Failed to initialize Redis/BullMQ client:', err.message);
}

module.exports = {
  connection,
  get emailQueue() {
    return emailQueue;
  },
  isRedisConnected: () => isRedisConnected
};
