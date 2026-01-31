import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    webhook: {
        mobileApiUrl: process.env.MOBILE_API_URL,
        secret: process.env.WEBHOOK_SECRET
    },
    fcm: {
        topic: process.env.FCM_TOPIC || 'iot_updates',
        serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT
    }
};
