const { Worker } = require('bullmq');
const redisConfig = require('../config/redis');
const { sendMailDirect } = require('../services/mail.service');

let worker = null;

const initEmailWorker = () => {
  const connection = redisConfig.connection;
  if (!connection) {
    console.log('[Jobs] Redis connection not active. BullMQ background worker will not start.');
    return null;
  }

  const startWorker = () => {
    if (worker) return;
    worker = new Worker('EmailQueue', async (job) => {
      console.log(`[Jobs] Processing job ${job.id} for email: ${job.data.to}`);
      await sendMailDirect(job.data);
    }, { 
      connection,
      concurrency: 5
    });

    worker.on('completed', (job) => {
      console.log(`[Jobs] Email job ${job.id} completed successfully!`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[Jobs] Email job ${job.id} failed: ${err.message}`);
    });
    
    console.log('[Jobs] BullMQ background email worker started successfully.');
  };

  if (redisConfig.isRedisConnected()) {
    startWorker();
  } else {
    // Wait until connection succeeds before initializing the worker
    connection.on('connect', () => {
      startWorker();
    });
  }
};

module.exports = {
  initEmailWorker
};
