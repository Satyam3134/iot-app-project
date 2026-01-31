import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load the service account
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: firebase-service-account.json not found in the root directory!');
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// 2. Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

console.log('✅ Firebase Admin initialized successfully.');

// 3. Define a test message
const message = {
    notification: {
        title: 'Laptop Test Notification',
        body: 'If you see this, your FCM connection is working perfectly!'
    },
    topic: 'iot_updates',
    data: {
        test: 'true',
        source: 'laptop'
    }
};

// 4. Send the message
console.log('⏳ Sending message to topic "iot_updates"...');

admin.messaging().send(message)
    .then((response) => {
        console.log('🚀 SUCCESS! Message successfully sent to FCM.');
        console.log('Message ID:', response);
        console.log('\n--- NEXT STEPS ---');
        console.log('To see this notification on a real device:');
        console.log('1. Open your Mobile App project.');
        console.log('2. Ensure it uses the same Firebase Project ID.');
        console.log('3. Subscribe the app to the topic: "iot_updates"');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ FCM Error:');
        console.error(error.message);
        process.exit(1);
    });
