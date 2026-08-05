const userRepository = require('../repositories/UserRepository');

class UserService {
  async getAllUsers() {
    return userRepository.find();
  }

  async getUserById(id) {
    return userRepository.findById(id);
  }

  async createUser(data) {
    return userRepository.create(data);
  }

  async updateUser(id, data) {
    return userRepository.update(id, data);
  }

  async deleteUser(id) {
    return userRepository.delete(id);
  }
}

module.exports = new UserService();
