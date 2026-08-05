const tripRepository = require('../repositories/TripRepository');

class TripService {
  async getAllTrips() {
    return tripRepository.find();
  }

  async getTripsByUser(userId) {
    return tripRepository.find({ user: userId });
  }

  async getTripById(id) {
    return tripRepository.findById(id);
  }

  async createTrip(data) {
    return tripRepository.create(data);
  }

  async updateTrip(id, data) {
    return tripRepository.update(id, data);
  }

  async deleteTrip(id) {
    return tripRepository.delete(id);
  }
}

module.exports = new TripService();
