import { config } from './config/env.js';
import app from './app.js';
import { logger } from './utils/logger.js';

const { port } = config;

app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Mobile API Webhook Target: ${config.webhook.mobileApiUrl || 'NOT SET'}`);
});
