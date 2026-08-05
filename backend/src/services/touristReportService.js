const touristReportRepository = require('../repositories/TouristReportRepository');

class TouristReportService {
  async getAllReports() {
    const count = await touristReportRepository.count();
    if (count === 0) {
      await touristReportRepository.create({ name: "Jaipur", temp: "36°C", condition: "Dry & Clear", safetyScore: 72, advisory: "Watch out for persistent street vendors and fake guide scams.", riskLevel: "Moderate Risk" });
      await touristReportRepository.create({ name: "Delhi", temp: "38°C", condition: "Sunny", safetyScore: 92, advisory: "Highly secure embassy lanes. Keep bags zipped in local bazaars.", riskLevel: "Safe" });
      await touristReportRepository.create({ name: "Goa", temp: "30°C", condition: "Overcast", safetyScore: 84, advisory: "Pay attention to tide warning flags; avoid dark beaches at night.", riskLevel: "Safe" });
      await touristReportRepository.create({ name: "Mumbai", temp: "29°C", condition: "Monsoon", safetyScore: 88, advisory: "Safe tourist stretch. Always ride prepaid meter taxis.", riskLevel: "Safe" });
    }
    return touristReportRepository.find();
  }

  async getReportById(id) {
    return touristReportRepository.findById(id);
  }

  async createReport(data) {
    return touristReportRepository.create(data);
  }

  async updateReport(id, data) {
    return touristReportRepository.update(id, data);
  }

  async deleteReport(id) {
    return touristReportRepository.delete(id);
  }
}

module.exports = new TouristReportService();
