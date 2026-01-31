/**
 * In-memory storage for IoT devices.
 * In a production app, this would be replaced with a database (e.g., MongoDB, PostgreSQL).
 */
class DeviceStore {
    constructor() {
        this.devices = [];
    }

    /**
     * Find a device by ID
     * @param {string} id 
     * @returns {object|undefined}
     */
    findDevice(id) {
        return this.devices.find(d => d.id === id);
    }

    /**
     * Add a new device
     * @param {string} id 
     * @param {string} name 
     * @returns {object} The new device
     */
    addDevice(id, name) {
        const device = {
            id,
            name: name || "ESP32 Device",
            state: 0,
            lastSeen: Date.now()
        };
        this.devices.push(device);
        return device;
    }

    /**
     * Update device timestamp and optionally other fields
     * @param {object} device 
     */
    updateHeartbeat(device) {
        device.lastSeen = Date.now();
    }

    /**
     * Get all devices with online status
     * @returns {Array}
     */
    getAllDevicesFormatted() {
        const now = Date.now();
        return this.devices.map(d => ({
            id: d.id,
            name: d.name,
            state: d.state,
            // Online if seen in the last 10 seconds
            online: (now - d.lastSeen) < 10000
        }));
    }
    /**
     * Delete a device by ID
     * @param {string} id 
     * @returns {boolean} True if deleted, false if not found
     */
    deleteDevice(id) {
        const index = this.devices.findIndex(d => d.id === id);
        if (index !== -1) {
            this.devices.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Clear all registered devices
     */
    clearAllDevices() {
        this.devices = [];
    }
}

// Singleton instance
export const deviceStore = new DeviceStore();
