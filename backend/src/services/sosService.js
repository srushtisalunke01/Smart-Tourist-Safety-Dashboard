const sosRequestRepository = require('../repositories/SOSRequestRepository');

class SOSService {
  async getAllSOS() {
    return sosRequestRepository.find({}, { populate: 'user' });
  }

  async getActiveSOS() {
    return sosRequestRepository.find({ status: 'active' }, { populate: 'user', sort: { createdAt: -1 } });
  }

  async createSOS(userId, lat, lng) {
    return sosRequestRepository.create({ user: userId, lat, lng, status: 'active' });
  }

  async resolveSOS(id, resolvedBy) {
    return sosRequestRepository.update(id, { status: 'resolved', resolvedAt: new Date(), resolvedBy });
  }

  async deleteSOS(id) {
    return sosRequestRepository.delete(id);
  }
}

module.exports = new SOSService();
