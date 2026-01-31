# 🌐 IoT & Mobile Notification Eco-System

This project acts as the **Central Bridge** between your Physical Hardware (IoT) and your Mobile Application.

---

## 🗺️ The Connection Flow (Who talks to whom?)

### 1. IoT Device ➡️ Server (Registration & Heartbeat)
*   **Protocol:** HTTP POST
*   **Frequency:** When device starts up + every 30-60 seconds (Heartbeat).
*   **Endpoint:** `POST /api/device/register`
*   **Purpose:** The device tells the server it is online. If it's a new device, the server creates a record and triggers a "New Device" notification.

### 2. Server ⬅️➡️ IoT Device (Polling for Control)
*   **Protocol:** HTTP GET
*   **Frequency:** Every 1-5 seconds (Real-time responsiveness).
*   **Endpoint:** `GET /api/device/poll?id=DEVICE_ID`
*   **Purpose:** IoT devices (like ESP32) are often behind firewalls. They "ask" the server: *"Is there a new state for me?"* (e.g., Should the light be ON or OFF?). The server responds with the current `state`.

### 3. Dashboard/App ➡️ Server (Controlling Hardware)
*   **Protocol:** HTTP POST
*   **Endpoint:** `POST /api/setState`
*   **Purpose:** When you click a button in your mobile app to turn on a light, the app calls this. The server updates the device state and immediately triggers a Webhook/FCM notification to notify other users.

### 4. Server ➡️ Mobile App (Push Notifications)
*   **Protocol:** Firebase Cloud Messaging (FCM)
*   **Mechanism:** Topic Subscription (`iot_updates`)
*   **Purpose:** Real-time alerts on the phone (e.g., "Motion Detected!", "Device Offline").

---

## 🛠️ Testing with your IoT Hardware (ESP32/Arduino)

To connect your physical hardware to this API, follow these steps:

### 1. Identify your Laptop IP
Your ESP32 cannot use `localhost`. It must use your laptop's Local IP address.
*   **Mac/Linux:** Run `ifconfig` (usually looks like `192.168.1.XX`)
*   **Windows:** Run `ipconfig`

### 2. ESP32 Code Snippet (C++)
Use the `HTTPClient` library in Arduino IDE:

```cpp
#include <HTTPClient.h>
#include <WiFi.h>

const char* serverUrl = "https://iot-app-project.onrender.com/api/device/register";

void sendHeartbeat() {
    if(WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        
        String payload = "{\"id\":\"esp32_01\",\"name\":\"Living Room Sensor\"}";
        int httpResponseCode = http.POST(payload);
        
        if (httpResponseCode > 0) {
            Serial.print("Response: ");
            Serial.println(http.getString());
        }
        http.end();
    }
}
```

---

## 🧪 API Reference (Quick Test Table)

| Target | Method | Endpoint | Payload Example |
| :--- | :--- | :--- | :--- |
| **IoT -> Server** | `POST` | `/api/device/register` | `{"id": "dev1", "name": "Fan"}` |
| **IoT -> Server** | `GET` | `/api/device/poll` | `?id=dev1` |
| **App -> Server** | `GET` | `/api/devices` | *None (Returns all device status)* |
| **App -> Server** | `POST` | `/api/setState` | `{"id": "dev1", "state": 1}` |
| **Manual Test** | `POST` | `/api/notify/test` | `{"event": "TEST", "data": {}}` |

---

## 🚀 How they connect (The Final Chain)
1. **Physical Sensor** detects smoke.
2. **ESP32** calls `POST /api/device/register`.
3. **Your Server** receives it ➡️ Updates internal state ➡️ Calls **Firebase FCM**.
4. **Google Firebase** pushes the message to your **Mobile App**.
5. **Mobile App** vibrates and shows "🚨 SMOKE DETECTED!".
