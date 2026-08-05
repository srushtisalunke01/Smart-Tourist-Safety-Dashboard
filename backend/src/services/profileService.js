const profileRepository = require('../repositories/ProfileRepository');

class ProfileService {
  async getAllProfiles() {
    return profileRepository.find();
  }

  async getProfileByUserId(userId) {
    return profileRepository.findOne({ user: userId });
  }

  async createProfile(data) {
    return profileRepository.create(data);
  }

  async updateProfile(userId, data) {
    let profile = await profileRepository.findOne({ user: userId });
    if (!profile) {
      return profileRepository.create({ user: userId, ...data });
    }
    return profileRepository.update(profile._id, data);
  }

  async deleteProfile(userId) {
    return profileRepository.deleteMany({ user: userId });
  }
}

module.exports = new ProfileService();
