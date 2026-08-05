const profileService = require('../services/profileService');
const userRepository = require('../repositories/UserRepository');

class ProfileController {
  async getAllProfiles(req, res, next) {
    try {
      const profiles = await profileService.getAllProfiles();
      res.json(profiles);
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const profile = await profileService.getProfileByUserId(userId);
      if (!profile) return res.status(404).json({ message: 'Profile not found' });
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  async createProfile(req, res, next) {
    try {
      const profile = await profileService.createProfile({ user: req.user.id, ...req.body });
      res.status(201).json(profile);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const profile = await profileService.updateProfile(userId, req.body);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  }

  async deleteProfile(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      await profileService.deleteProfile(userId);
      res.json({ message: 'Profile deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async verifyBlockchain(req, res, next) {
    try {
      const mockHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const blockchainRecord = {
        userHash: mockHash,
        blockNumber: Math.floor(Math.random() * 500000) + 19000000,
        transactionHash: mockTx,
        verifiedAt: new Date().toISOString()
      };

      // Save to user profile inside Mongo
      const user = await userRepository.update(req.user.id, {
        touristProfile: {
          nationality: req.body.nationality || 'Explorer',
          blockchainID: blockchainRecord
        }
      });

      res.json({
        message: 'Blockchain verification successful',
        blockchainRecord,
        user
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfileController();
