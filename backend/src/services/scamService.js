const scamReportRepository = require('../repositories/ScamReportRepository');
const AIService = require('./ai.service');

class ScamService {
  async getAllReports(queryOptions = {}) {
    return scamReportRepository.find({}, queryOptions);
  }

  async getReportById(id) {
    return scamReportRepository.findById(id);
  }

  async createReport(data) {
    return scamReportRepository.create(data);
  }

  async verifyReport(id, status) {
    return scamReportRepository.update(id, { status });
  }

  async deleteReport(id) {
    return scamReportRepository.delete(id);
  }

  async getHotspots() {
    const verifiedReports = await scamReportRepository.find({ status: 'verified' });
    return AIService.detectScamHotspots(verifiedReports);
  }
}

module.exports = new ScamService();
