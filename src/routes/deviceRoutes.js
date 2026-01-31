import express from 'express';
import { deviceController } from '../controllers/deviceController.js';

const router = express.Router();

// Device Registration
router.post('/device/register', deviceController.register);

// Dashboard: Get All Devices
router.get('/devices', deviceController.getAll);

// Dashboard: Set Device State
router.post('/setState', deviceController.setState);

// Device: Poll for updates
router.get('/device/poll', deviceController.poll);

// Device: Remove specific device
router.delete('/device/remove', deviceController.removeDevice);

// Device: Clear all devices
router.delete('/devices/clear', deviceController.clearDevices);

// TEST ROUTE: Manually trigger a notification
router.post('/notify/test', async (req, res) => {
    try {
        const { event, data } = req.body;
        // Circular dependency fix: Import service here or inject? 
        // Ideally controller handles validation and calls service.
        // For simplicity, we'll inline a quick test or add a controller method.
        // Let's stick to "Code Like a Pro" and NOT import service in routes directly if we can avoid it.
        // But for this test route, we'll just skip adding it to controller to keep controller clean or add a test method.
        // I'll add a simple inline handler that uses the imported service from a higher level or just dynamic import?
        // Actually, importing the service here is fine for a test route.
        const { notificationService } = await import('../services/notificationService.js');
        await notificationService.send(event || 'TEST_EVENT', data || { msg: "Hello" });
        res.json({ ok: true, message: "Test notification triggered" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
