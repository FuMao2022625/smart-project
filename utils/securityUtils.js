const crypto = require('crypto');

class SecurityUtils {
  static generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashSensitiveData(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  static sanitizeString(str, maxLength = 1000) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/[<>'"]/g, '')
      .substring(0, maxLength)
      .trim();
  }

  static escapeHTML(str) {
    if (typeof str !== 'string') return str;
    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  static sanitizeSQLWildcards(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[%_]/g, '\\$&');
  }

  static generateSecureRandom(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  static constantTimeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    a = Buffer.from(a);
    b = Buffer.from(b);
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  }
}

module.exports = SecurityUtils;