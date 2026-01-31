import { deviceStore } from '../services/deviceStore.js';
import { notificationService } from '../services/notificationService.js';
import { logger } from '../utils/logger.js';

export const deviceController = {
    // REGISTER DEVICE
    register: async (req, res) => {
        try {
            const { id, name } = req.body;
            if (!id) {
                return res.status(400).json({ error: "No ID provided" });
            }

            let device = deviceStore.findDevice(id);

            if (!device) {
                // New Device
                device = deviceStore.addDevice(id, name);
                logger.info(`New Device Registered: ${id} (${device.name})`);

                // Notify via Webhook
                notificationService.send('DEVICE_REGISTERED', {
                    deviceId: id,
                    name: device.name
                });
            } else {
                // Existing Device - just update heartbeat
                deviceStore.updateHeartbeat(device);
            }

            res.json({ ok: true, message: "Device registered/updated" });
        } catch (error) {
            logger.error("Error in register:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // GET DEVICES (DASHBOARD)
    getAll: (req, res) => {
        try {
            const list = deviceStore.getAllDevicesFormatted();
            res.json(list);
        } catch (error) {
            logger.error("Error in getAll:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // SET STATE (DASHBOARD CONTROL)
    setState: async (req, res) => {
        try {
            const { id, state } = req.body;
            const device = deviceStore.findDevice(id);

            if (device) {
                const oldState = device.state;
                device.state = state;
                logger.info(`State updated for ${id}: ${oldState} -> ${state}`);

                // Notify if state actually changed (optional logic, but good practice)
                if (oldState !== state) {
                    notificationService.send('DEVICE_STATE_CHANGED', {
                        deviceId: id,
                        oldState,
                        newState: state
                    });
                }
            } else {
                logger.warn(`Attempt to set state for unknown device: ${id}`);
                // Depending on requirements, might want to return 404, but original code returned ok:true roughly
            }

            res.json({ ok: true });
        } catch (error) {
            logger.error("Error in setState:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // DELETE DEVICE
    removeDevice: (req, res) => {
        try {
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: "Device ID required" });

            const success = deviceStore.deleteDevice(id);
            if (success) {
                logger.info(`Device removed: ${id}`);
                res.json({ ok: true, message: "Device removed" });
            } else {
                res.status(404).json({ error: "Device not found" });
            }
        } catch (error) {
            logger.error("Error in removeDevice:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // CLEAR ALL DEVICES
    clearDevices: (req, res) => {
        try {
            deviceStore.clearAllDevices();
            logger.info("All devices cleared from memory");
            res.json({ ok: true, message: "Store cleared" });
        } catch (error) {
            logger.error("Error in clearDevices:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // POLL (ESP32)
    poll: (req, res) => {
        try {
            const { id } = req.query;
            const device = deviceStore.findDevice(id);

            if (device) {
                deviceStore.updateHeartbeat(device);
                res.json({ state: device.state });
            } else {
                // Unknown device polling? Return default state 0
                res.json({ state: 0 });
            }
        } catch (error) {
            logger.error("Error in poll:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};
