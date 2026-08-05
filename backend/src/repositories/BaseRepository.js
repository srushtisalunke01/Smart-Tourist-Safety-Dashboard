class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(query = {}, options = {}) {
    let q = this.model.find(query);
    if (options.populate) q = q.populate(options.populate);
    if (options.sort) q = q.sort(options.sort);
    if (options.limit) q = q.limit(options.limit);
    if (options.skip) q = q.skip(options.skip);
    return q.exec();
  }

  async findOne(query = {}, options = {}) {
    let q = this.model.findOne(query);
    if (options.populate) q = q.populate(options.populate);
    return q.exec();
  }

  async findById(id, options = {}) {
    let q = this.model.findById(id);
    if (options.populate) q = q.populate(options.populate);
    return q.exec();
  }

  async create(data) {
    const doc = new this.model(data);
    return doc.save();
  }

  async update(id, data, options = { new: true }) {
    let q = this.model.findByIdAndUpdate(id, data, options);
    if (options.populate) q = q.populate(options.populate);
    return q.exec();
  }

  async updateMany(query, data, options = {}) {
    return this.model.updateMany(query, data, options).exec();
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteMany(query) {
    return this.model.deleteMany(query).exec();
  }

  async count(query = {}) {
    return this.model.countDocuments(query).exec();
  }
}

module.exports = BaseRepository;
