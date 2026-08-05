const scamService = require('../services/scamService');
const AuditLog = require('../models/AuditLog');
const { uploadToCloudinary } = require('../middlewares/upload');
const { getIO } = require('../config/socket');

class ScamController {
  async getAllReports(req, res, next) {
    try {
      const { search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20, category, status } = req.query;

      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { category: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { address: new RegExp(search, 'i') }
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;

      const skip = (Number(page) - 1) * Number(limit);

      const reports = await scamService.getAllReports({
        sort: sortOptions,
        limit: Number(limit),
        skip: skip
      });

      res.json(reports);
    } catch (err) {
      next(err);
    }
  }

  async getReportById(req, res, next) {
    try {
      const report = await scamService.getReportById(req.params.id);
      if (!report) return res.status(404).json({ message: 'Scam report not found' });
      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  async createReport(req, res, next) {
    try {
      const { category, description, address, lat, lng } = req.body;
      
      let imageUrl = '';
      if (req.file) {
        imageUrl = await uploadToCloudinary(req.file);
      }

      const report = await scamService.createReport({
        user: req.user.id,
        category,
        description,
        address,
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        imageUrl
      });

      const io = getIO();
      if (io) {
        io.emit('new_scam_report', report);
      }

      res.status(201).json(report);
    } catch (err) {
      next(err);
    }
  }

  async verifyReport(req, res, next) {
    try {
      const report = await scamService.verifyReport(req.params.id, req.body.status);
      
      await AuditLog.create({
        userId: req.user.id,
        action: 'Verify',
        resource: 'ScamReport',
        details: `Scam report ${req.params.id} verification status changed to ${req.body.status}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.json(report);
    } catch (err) {
      next(err);
    }
  }

  async deleteReport(req, res, next) {
    try {
      await scamService.deleteReport(req.params.id);
      res.json({ message: 'Scam report deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getHotspots(req, res, next) {
    try {
      const hotspots = await scamService.getHotspots();
      res.json(hotspots);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ScamController();
