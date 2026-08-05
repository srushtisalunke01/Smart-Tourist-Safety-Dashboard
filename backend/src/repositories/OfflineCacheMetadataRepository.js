const BaseRepository = require('./BaseRepository');
const OfflineCacheMetadata = require('../models/OfflineCacheMetadata');

class OfflineCacheMetadataRepository extends BaseRepository {
  constructor() {
    super(OfflineCacheMetadata);
  }
}

module.exports = new OfflineCacheMetadataRepository();
