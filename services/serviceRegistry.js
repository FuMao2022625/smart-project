/**
 * 服务注册中心
 * 提供服务的注册、获取和管理功能
 * 采用插件式架构，支持动态添加服务
 */

class ServiceRegistry {
  constructor() {
    this.services = {};
  }

  /**
   * 注册服务
   * @param {string} name - 服务名称
   * @param {object} service - 服务实例
   * @param {object} options - 服务选项
   */
  register(name, service, options = {}) {
    if (this.services[name]) {
      console.warn(`服务 ${name} 已存在，将被覆盖`);
    }

    this.services[name] = {
      instance: service,
      options,
      registeredAt: new Date().toISOString()
    };

    console.log(`✓ 注册服务: ${name}`);
  }

  /**
   * 获取服务
   * @param {string} name - 服务名称
   * @returns {object|null} 服务实例或null
   */
  get(name) {
    const service = this.services[name];
    return service ? service.instance : null;
  }

  /**
   * 检查服务是否存在
   * @param {string} name - 服务名称
   * @returns {boolean} 是否存在
   */
  has(name) {
    return !!this.services[name];
  }

  /**
   * 移除服务
   * @param {string} name - 服务名称
   * @returns {boolean} 是否移除成功
   */
  remove(name) {
    if (this.services[name]) {
      delete this.services[name];
      console.log(`✓ 移除服务: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * 获取所有服务
   * @returns {object} 所有服务
   */
  getAll() {
    return this.services;
  }

  /**
   * 获取服务列表
   * @returns {array} 服务名称列表
   */
  getServiceNames() {
    return Object.keys(this.services);
  }

  /**
   * 清空所有服务
   */
  clear() {
    this.services = {};
    console.log('✓ 清空所有服务');
  }
}

// 导出单例
module.exports = new ServiceRegistry();