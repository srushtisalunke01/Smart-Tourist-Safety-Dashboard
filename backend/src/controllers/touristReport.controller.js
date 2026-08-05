const touristReportService = require('../services/touristReportService');

class TouristReportController {
  async getAllReports(req, res, next) {
    try {
      const reports = await touristReportService.getAllReports();
      res.json(reports);
    } catch (err) {
      next(err);
    }
  }

  async getReportById(req, res, next) {
    try {
      const report = await touristReportService.getReportById(req.params.id);
      if (!report) return res.status(404).json({ message: 'Tourist report not found' });
      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  async createReport(req, res, next) {
    try {
      const report = await touristReportService.createReport(req.body);
      res.status(201).json(report);
    } catch (err) {
      next(err);
    }
  }

  async updateReport(req, res, next) {
    try {
      const report = await touristReportService.updateReport(req.params.id, req.body);
      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  async deleteReport(req, res, next) {
    try {
      await touristReportService.deleteReport(req.params.id);
      res.json({ message: 'Tourist report deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TouristReportController();
