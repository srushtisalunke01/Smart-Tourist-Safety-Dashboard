const womenSafetyDataRepository = require('../repositories/WomenSafetyDataRepository');

class WomenSafetyService {
  async getSafetyDataByUser(userId) {
    let data = await womenSafetyDataRepository.findOne({ user: userId });
    if (!data) {
      data = await womenSafetyDataRepository.create({
        user: userId,
        safeCorridors: [
          { name: "Chanakyapuri Safe Zone", lat: 28.5992, lng: 77.2101 },
          { name: "Lodhi Road Safe Corridor", lat: 28.5888, lng: 77.2222 }
        ],
        familyTracking: { active: false, trackingLink: `http://localhost:3000/track/tourist-${userId}` }
      });
    }
    return data;
  }

  async addSilentSOS(userId, lat, lng) {
    let data = await this.getSafetyDataByUser(userId);
    data.silentSOSLogs.push({ lat, lng, timestamp: new Date() });
    return womenSafetyDataRepository.update(data._id, { silentSOSLogs: data.silentSOSLogs });
  }

  async updateFamilyTracking(userId, active) {
    let data = await this.getSafetyDataByUser(userId);
    data.familyTracking.active = active;
    return womenSafetyDataRepository.update(data._id, { familyTracking: data.familyTracking });
  }

  async updateSafetyData(userId, payload) {
    let data = await this.getSafetyDataByUser(userId);
    return womenSafetyDataRepository.update(data._id, payload);
  }
}

module.exports = new WomenSafetyService();
