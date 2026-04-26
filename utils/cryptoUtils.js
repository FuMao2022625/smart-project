const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

class CryptoUtils {
  static generateSecureKey(password, salt = null) {
    const useSalt = salt || crypto.randomBytes(SALT_LENGTH).toString('hex');
    const key = crypto.pbkdf2Sync(
      password,
      useSalt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
    return { key: key.toString('hex'), salt: useSalt };
  }

  static encrypt(text, masterKey = null) {
    if (!text) return null;

    const key = masterKey || this.getMasterKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv, {
      authTagLength: AUTH_TAG_LENGTH
    });

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  static decrypt(encryptedData, masterKey = null) {
    if (!encryptedData) return null;

    try {
      const key = masterKey || this.getMasterKey();
      const { encrypted, iv, authTag } = encryptedData;

      const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(key, 'hex'),
        Buffer.from(iv, 'hex'),
        { authTagLength: AUTH_TAG_LENGTH }
      );

      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  static hashPassword(password) {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
    return {
      hash: hash.toString('hex'),
      salt
    };
  }

  static verifyPassword(password, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(
      password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(verifyHash.toString('hex'), 'hex')
    );
  }

  static getMasterKey() {
    const masterKey = process.env.ENCRYPTION_MASTER_KEY;
    if (!masterKey) {
      throw new Error('ENCRYPTION_MASTER_KEY is not set in environment variables');
    }
    return masterKey;
  }

  static encryptField(value) {
    if (!value) return value;

    if (typeof value === 'object') {
      const encryptedObj = {};
      for (const key in value) {
        encryptedObj[key] = this.encryptField(value[key]);
      }
      return encryptedObj;
    }

    if (typeof value === 'string') {
      const result = this.encrypt(value);
      return Buffer.from(JSON.stringify(result)).toString('base64');
    }

    return value;
  }

  static decryptField(value) {
    if (!value) return value;

    try {
      const parsed = JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
      return this.decrypt(parsed);
    } catch (error) {
      return value;
    }
  }

  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashData(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(JSON.stringify(data)).digest('hex');
  }

  static generateApiKey() {
    const timestamp = Date.now().toString();
    const randomPart = crypto.randomBytes(32).toString('hex');
    return `ak_${timestamp}_${randomPart}`;
  }

  static generateSecureRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    return result;
  }

  static maskSensitiveData(data, fields = ['password', 'token', 'secret', 'key', 'credential']) {
    if (typeof data !== 'object' || data === null) return data;

    const masked = Array.isArray(data) ? [...data] : { ...data };

    for (const key in masked) {
      if (fields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        if (typeof masked[key] === 'string') {
          const value = masked[key];
          if (value.length > 8) {
            masked[key] = value.substring(0, 4) + '****' + value.substring(value.length - 4);
          } else {
            masked[key] = '****';
          }
        }
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskSensitiveData(masked[key], fields);
      }
    }

    return masked;
  }
}

module.exports = CryptoUtils;