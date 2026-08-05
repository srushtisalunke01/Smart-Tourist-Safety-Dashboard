const savedTripRepository = require('../repositories/SavedTripRepository');

class SavedTripService {
  async getAllSavedTrips() {
    return savedTripRepository.find();
  }

  async getSavedTripsByUser(userId) {
    return savedTripRepository.find({ user: userId }, { populate: 'trip' });
  }

  async saveTrip(userId, tripId) {
    const existing = await savedTripRepository.findOne({ user: userId, trip: tripId });
    if (existing) return existing;
    return savedTripRepository.create({ user: userId, trip: tripId });
  }

  async unsaveTrip(userId, tripId) {
    return savedTripRepository.deleteMany({ user: userId, trip: tripId });
  }
}

module.exports = new SavedTripService();
