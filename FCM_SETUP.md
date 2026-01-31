# 🔥 Firebase Cloud Messaging (FCM) Setup Guide

To enable actual push notifications on mobile devices, the **Mobile API (Port 5000)** must be integrated with Firebase. This guide covers the end-to-end setup.

---

## Part 1: Firebase Console Setup (Cloud Side)

1.  **Create a Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click **"Add Project"** and follow the setup wizard.
2.  **Generate Service Account Key:**
    - Go to **Project Settings** (the gear icon) > **Service Accounts**.
    - Click **"Generate New Private Key"**.
    - This downloads a `.json` file. **Rename it to `firebase-service-account.json`**.
    - ⚠️ **CRITICAL:** Never commit this file to GitHub! Add it to your `.gitignore`.
3.  **Get Project ID:**
    - Note down your `project-id` from the Project Settings page.

---

## Part 2: Mobile API Implementation (Server Side)

In your **Mobile API** project (the one running on port 5000), follow these steps:

### 1. Install Dependencies
```bash
npm install firebase-admin
```

### 2. Initialize Firebase Admin
```javascript
import admin from 'firebase-admin';
import serviceAccount from './firebase-service-account.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const fcm = admin.messaging();
```

### 3. Handle the Webhook from IoT Server
When your IoT Server calls the Webhook, the Mobile API should do this:

```javascript
// Inside your Mobile API Webhook Controller
app.post('/api/notifications/webhook', async (req, res) => {
    const { event, data, timestamp } = req.body;
    
    // 1. Validate Secret
    if (req.headers['x-webhook-secret'] !== process.env.WEBHOOK_SECRET) {
        return res.status(403).send('Forbidden');
    }

    // 2. Prepare FCM Message
    const message = {
        notification: {
            title: `IoT Alert: ${event}`,
            body: `Device Event at ${timestamp}`
        },
        topic: 'iot_updates', // Or send to a specific device token: token: 'USER_DEVICE_TOKEN'
        data: {
          ...data // Attach extra data for the app to handle
        }
    };

    // 3. Send Push Notification
    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        res.json({ success: true });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'FCM push failed' });
    }
});
```

---

## Part 3: Mobile App Setup (Client Side)

The Flutter, React Native, or Native app must:
1.  **Register:** Use the Firebase SDK to get a unique `Device Token`.
2.  **Subscribe:** Optionally subscribe to a topic (e.g., `iot_updates`) or send their token to the Mobile API to be saved in a database.
3.  **Background Listeners:** Implement listeners to show notification popups when the app is closed.

---

## 💡 Pro Tips for FCM
*   **Topics vs Tokens:** Use **Topics** for "Broadcasts" (e.g., fire alarm for all users). Use **Tokens** for private notifications (e.g., "Your" bedroom light).
*   **Data Messages:** If you want the app to do something silently in the background, use `data` fields without the `notification` block.
*   **TTL (Time to Live):** For IoT, set a short TTL if the alert is time-sensitive (e.g., a "motion detected" alert is useless if it arrives 2 hours late).
