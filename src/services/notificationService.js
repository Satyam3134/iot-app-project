import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class NotificationService {
    constructor() {
        this.webhookUrl = config.webhook.mobileApiUrl;
        this.secret = config.webhook.secret;
        this.fcmTopic = config.fcm.topic;

        // Initialize Firebase
        try {
            const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
            if (fs.existsSync(serviceAccountPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                this.fcmEnabled = true;
                logger.info('Firebase Admin initialized successfully.');
            } else {
                this.fcmEnabled = false;
                logger.warn('firebase-service-account.json not found. FCM disabled.');
            }
        } catch (error) {
            this.fcmEnabled = false;
            logger.error('Failed to initialize Firebase Admin:', error.message);
        }
    }

    /**
     * Send notifications via Webhook and FCM
     * @param {string} eventType - e.g., 'DEVICE_REGISTERED', 'STATE_CHANGED'
     * @param {object} payload - The data to send
     */
    async send(eventType, payload) {
        const timestamp = new Date().toISOString();

        // 1. Send Webhook
        await this._sendWebhook(eventType, payload, timestamp);

        // 2. Send FCM Push Notification
        if (this.fcmEnabled) {
            await this._sendFCM(eventType, payload, timestamp);
        }
    }

    async _sendWebhook(eventType, payload, timestamp) {
        if (!this.webhookUrl) return;

        try {
            logger.info(`Sending Webhook [${eventType}] to ${this.webhookUrl}`);
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': this.secret || ''
                },
                body: JSON.stringify({ event: eventType, timestamp, data: payload })
            });

            if (!response.ok) {
                logger.error(`Webhook failed: ${response.status}`);
            }
        } catch (error) {
            logger.error('Webhook Error:', error.message);
        }
    }

    async _sendFCM(eventType, payload, timestamp) {
        try {
            const message = {
                notification: {
                    title: `IoT Alert: ${eventType}`,
                    body: this._formatFCMBody(eventType, payload)
                },
                topic: this.fcmTopic,
                data: {
                    event: eventType,
                    timestamp,
                    deviceId: payload.deviceId || payload.id || 'unknown'
                }
            };

            logger.info(`Sending FCM Notification to topic: ${this.fcmTopic}`);
            const response = await admin.messaging().send(message);
            logger.info(`FCM Sent Successfully: ${response}`);
        } catch (error) {
            logger.error('FCM Error:', error.message);
        }
    }

    _formatFCMBody(event, data) {
        switch (event) {
            case 'DEVICE_REGISTERED': return `New device ${data.name || data.id} registered.`;
            case 'DEVICE_STATE_CHANGED': return `Device ${data.deviceId} state changed to ${data.newState}.`;
            default: return `New event: ${event}`;
        }
    }
}

export const notificationService = new NotificationService();
