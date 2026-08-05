const communityPostRepository = require('../repositories/CommunityPostRepository');

class CommunityService {
  async getAllPosts(queryOptions = {}) {
    return communityPostRepository.find({}, queryOptions);
  }

  async getPostById(id) {
    return communityPostRepository.findById(id, { populate: 'user' });
  }

  async createPost(data) {
    return communityPostRepository.create(data);
  }

  async updatePost(id, data) {
    return communityPostRepository.update(id, data);
  }

  async deletePost(id) {
    return communityPostRepository.delete(id);
  }
}

module.exports = new CommunityService();
