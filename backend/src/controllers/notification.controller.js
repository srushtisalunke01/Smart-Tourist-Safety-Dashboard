const notificationService = require('../services/notificationService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const notifs = await notificationService.getNotificationsByUser(req.user.id);
      res.json(notifs);
    } catch (err) {
      next(err);
    }
  }

  async createNotification(req, res, next) {
    try {
      const notif = await notificationService.createNotification({
        userId: req.body.userId || req.user.id,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type || 'INFO'
      });
      res.status(201).json(notif);
    } catch (err) {
      next(err);
    }
  }


  async markAsRead(req, res, next) {
    try {
      const notif = await notificationService.markAsRead(req.params.id, req.user.id);
      if (!notif) return res.status(404).json({ message: 'Notification not found' });
      res.json(notif);
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.id);
      res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
