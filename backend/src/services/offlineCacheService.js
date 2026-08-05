const offlineCacheMetadataRepository = require('../repositories/OfflineCacheMetadataRepository');

class OfflineCacheService {
  async getCacheByUser(userId) {
    return offlineCacheMetadataRepository.find({ user: userId });
  }

  async saveCacheLog(userId, packageId, packageName, packageSize) {
    const existing = await offlineCacheMetadataRepository.findOne({ user: userId, packageId });
    if (existing) {
      return offlineCacheMetadataRepository.update(existing._id, { status: 'downloaded' });
    }
    return offlineCacheMetadataRepository.create({
      user: userId,
      packageId,
      packageName,
      packageSize,
      status: 'downloaded'
    });
  }

  async clearCacheLog(userId, packageId) {
    const existing = await offlineCacheMetadataRepository.findOne({ user: userId, packageId });
    if (existing) {
      return offlineCacheMetadataRepository.update(existing._id, { status: 'cleared' });
    }
    return null;
  }

  async deleteCacheLog(id) {
    return offlineCacheMetadataRepository.delete(id);
  }
}

module.exports = new OfflineCacheService();
