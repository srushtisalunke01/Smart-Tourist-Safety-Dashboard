const notificationRepository = require('../repositories/NotificationRepository');

class NotificationService {
  async getNotificationsByUser(userId) {
    return notificationRepository.find({ userId }, { sort: { createdAt: -1 }, limit: 50 });
  }

  async markAsRead(id, userId) {
    return notificationRepository.update(id, { isRead: true });
  }

  async markAllAsRead(userId) {
    return notificationRepository.updateMany({ userId, isRead: false }, { isRead: true });
  }

  async createNotification(data) {
    return notificationRepository.create(data);
  }

  async deleteNotification(id) {
    return notificationRepository.delete(id);
  }
}

module.exports = new NotificationService();
