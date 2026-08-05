const womenSafetyService = require('../services/womenSafetyService');

class WomenSafetyController {
  async getSafetyData(req, res, next) {
    try {
      const data = await womenSafetyService.getSafetyDataByUser(req.user.id);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async addSilentSOS(req, res, next) {
    const { lat, lng } = req.body;
    try {
      const data = await womenSafetyService.addSilentSOS(req.user.id, Number(lat), Number(lng));
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  async updateFamilyTracking(req, res, next) {
    const { active } = req.body;
    try {
      const data = await womenSafetyService.updateFamilyTracking(req.user.id, active);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async updateSafetyData(req, res, next) {
    try {
      const data = await womenSafetyService.updateSafetyData(req.user.id, req.body);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WomenSafetyController();
