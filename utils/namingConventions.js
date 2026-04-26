const namingPatterns = {
  files: {
    javascript: {
      pattern: /^[a-z][a-z0-9_-]*\.js$/,
      examples: ['userService.js', 'auth_middleware.js', 'api-handler.js'],
      description: 'JavaScript文件应使用小写字母开头的驼峰命名或下划线命名'
    },
    test: {
      pattern: /^[a-z][a-z0-9_-]*\.test\.js$/,
      examples: ['userService.test.js', 'auth_middleware.test.js'],
      description: '测试文件应使用 .test.js 后缀'
    },
    config: {
      pattern: /^[a-z][a-z0-9_-]*\.js$/,
      examples: ['db.js', 'redis_config.js'],
      description: '配置文件应使用描述性名称'
    }
  },

  variables: {
    camelCase: {
      pattern: /^[a-z][a-zA-Z0-9]*$/,
      examples: ['userName', 'getUserById', 'totalCount'],
      description: '变量使用小写字母开头的驼峰命名'
    },
    constants: {
      pattern: /^[A-Z][A-Z0-9_]*$/,
      examples: ['MAX_CONNECTIONS', 'DEFAULT_TIMEOUT', 'API_VERSION'],
      description: '常量使用全大写字母和下划线'
    }
  },

  functions: {
    camelCase: {
      pattern: /^[a-z][a-zA-Z0-9]*$/,
      examples: ['getUserData', 'calculateTotal', 'validateInput'],
      description: '函数使用小写字母开头的驼峰命名'
    },
    async: {
      pattern: /^(get|fetch|load|retrieve)[A-Z][a-zA-Z0-9]*$/,
      examples: ['getUserData', 'fetchProducts', 'loadConfiguration'],
      description: '异步获取数据的函数应以 get/fetch/load/retrieve 开头'
    },
    boolean: {
      pattern: /^(is|has|can|should|will|did)[A-Z][a-zA-Z0-9]*$/,
      examples: ['isActive', 'hasPermission', 'canAccess', 'shouldUpdate'],
      description: '返回布尔值的函数应以 is/has/can/should/will/did 开头'
    }
  },

  classes: {
    PascalCase: {
      pattern: /^[A-Z][a-zA-Z0-9]*$/,
      examples: ['UserService', 'DatabasePool', 'CacheManager'],
      description: '类名使用帕斯卡命名（大写字母开头）'
    }
  },

  database: {
    tables: {
      pattern: /^[a-z][a-z0-9_]*$/,
      examples: ['users', 'user_roles', 'device_data'],
      description: '数据库表名使用小写字母和下划线'
    },
    columns: {
      pattern: /^[a-z][a-zA-Z0-9_]*$/,
      examples: ['user_id', 'created_at', 'is_active'],
      description: '数据库列名使用小写字母和下划线'
    }
  },

  api: {
    endpoints: {
      pattern: /^\/[a-z][a-z0-9_-]*$/,
      examples: ['/api/users', '/api/devices/:id', '/api/reports'],
      description: 'API端点使用小写字母和下划线'
    },
    methods: {
      GET: '获取资源',
      POST: '创建资源',
      PUT: '更新资源（完整）',
      PATCH: '更新资源（部分）',
      DELETE: '删除资源'
    }
  }
};

const validateNaming = (type, name) => {
  const rules = namingPatterns[type];

  if (!rules) {
    return {
      valid: false,
      message: `Unknown naming type: ${type}`
    };
  }

  if (typeof rules === 'object' && rules.pattern) {
    const result = rules.pattern.test(name);
    return {
      valid: result,
      message: result ? 'Valid' : `Invalid ${type} name: ${name}`,
      pattern: rules.pattern.toString(),
      examples: rules.examples
    };
  }

  for (const ruleName in rules) {
    const rule = rules[ruleName];
    if (rule.pattern && rule.pattern.test(name)) {
      return {
        valid: true,
        message: `Valid ${type}.${ruleName} naming`,
        rule: ruleName,
        examples: rule.examples
      };
    }
  }

  return {
    valid: false,
    message: `Name "${name}" does not match any ${type} naming convention`,
    suggestions: Object.values(rules).map(r => r.examples).flat()
  };
};

const getNamingGuide = () => {
  const guide = {};

  for (const category in namingPatterns) {
    guide[category] = {};

    for (const type in namingPatterns[category]) {
      const rule = namingPatterns[category][type];
      guide[category][type] = {
        pattern: rule.pattern ? rule.pattern.toString() : null,
        examples: rule.examples,
        description: rule.description
      };
    }
  }

  return guide;
};

const suggestNaming = (type, context = '') => {
  const suggestions = [];

  switch (type) {
    case 'variable':
      suggestions.push(
        context.charAt(0).toLowerCase() + context.slice(1).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      );
      break;

    case 'function':
      suggestions.push(
        context.charAt(0).toLowerCase() + context.slice(1).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
      );
      break;

    case 'class':
      suggestions.push(
        context.charAt(0).toUpperCase() + context.slice(1).replace(/_[a-z]/g, letter => letter.charAt(1).toUpperCase())
      );
      break;

    case 'table':
      suggestions.push(
        context.toLowerCase().replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '')
      );
      break;
  }

  return suggestions;
};

module.exports = {
  namingPatterns,
  validateNaming,
  getNamingGuide,
  suggestNaming
};