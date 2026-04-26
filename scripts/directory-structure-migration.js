const fs = require('fs');
const path = require('path');

const currentStructure = {
  'root': [
    'app.js',
    'package.json',
    '.env',
    'script.sql',
    'API_DOCUMENTATION.md',
    '技术文档.md'
  ],
  'bin': ['www'],
  'config': [
    'cors.js',
    'db.js',
    'logger.js'
  ],
  'data': [
    'export'
  ],
  'logs': ['.gitkeep'],
  'middlewares': [
    'apiHandler.js',
    'auth.js',
    'cache.js',
    'index.js',
    'monitoring.js',
    'security.js',
    'validator.js'
  ],
  'public': [
    'javascripts',
    'stylesheets'
  ],
  'routes': [
    'index.js',
    'users.js',
    'api'
  ],
  'scripts': [
    'db-optimize.js',
    'socket-test.js'
  ],
  'services': [
    'cacheService.js',
    'serviceRegistry.js'
  ],
  'socket': [
    'data',
    'logs',
    'data-processor.js',
    'data-storage.js',
    'data-validator.js',
    'socket-server.js'
  ],
  'tests': [
    'complete-api-tests.test.js',
    'jest.config.js',
    'jest.setup.js'
  ],
  'utils': [
    'logger.js',
    'responseFormatter.js'
  ],
  'views': [
    'error.html',
    'index.html',
    'layout.html'
  ]
};

const proposedStructure = {
  'src': {
    'app.js': 'main',
    'bin': {
      'www': 'server'
    },
    'config': {
      '_index.js': 'config',
      'cors.js': 'cors',
      'db.js': 'database',
      'logger.js': 'logger'
    },
    'controllers': {
      'api': 'controllers',
      'index.js': 'index',
      'users.js': 'users'
    },
    'middlewares': {
      'index.js': 'middleware',
      'security.js': 'security',
      'auth.js': 'auth',
      'validator.js': 'validator',
      'cache.js': 'cache',
      'monitoring.js': 'monitoring',
      'apiHandler.js': 'api'
    },
    'models': {
      '_index.js': 'models'
    },
    'routes': {
      'index.js': 'routes',
      'users.js': 'users',
      'api': 'api'
    },
    'services': {
      'index.js': 'service',
      'cacheService.js': 'cache',
      'serviceRegistry.js': 'registry',
      'queryOptimizer.js': 'query'
    },
    'utils': {
      'index.js': 'utils',
      'logger.js': 'logger',
      'responseFormatter.js': 'formatter',
      'securityUtils.js': 'security',
      'cryptoUtils.js': 'crypto',
      'auditLogger.js': 'audit'
    },
    'views': 'views'
  },
  'socket': {
    'index.js': 'socket',
    'data-processor.js': 'processor',
    'data-storage.js': 'storage',
    'data-validator.js': 'validator',
    'data': 'data',
    'logs': 'logs'
  },
  'tests': {
    '_index.js': 'test',
    'complete-api-tests.test.js': 'test',
    'jest.config.js': 'jest',
    'jest.setup.js': 'jest'
  },
  'public': {
    'javascripts': 'js',
    'stylesheets': 'css'
  },
  'scripts': {
    '_index.js': 'script',
    'db-optimize.js': 'db',
    'socket-test.js': 'socket'
  },
  'data': {
    'export': 'export',
    'reports': 'reports'
  },
  'logs': {},
  '.env': 'env',
  'package.json': 'package',
  'README.md': 'readme',
  'script.sql': 'sql'
};

const migrationSteps = [
  {
    step: 1,
    action: 'Create new directory structure',
    description: 'Create src/ directory with all subdirectories',
    command: 'mkdir -p src/{bin,config,controllers,middlewares,models,routes,services,utils,views}'
  },
  {
    step: 2,
    action: 'Move main application files',
    description: 'Move app.js to src/app.js and bin/www to src/bin/www',
    files: [
      { from: 'app.js', to: 'src/app.js' },
      { from: 'bin/www', to: 'src/bin/www' }
    ]
  },
  {
    step: 3,
    action: 'Move configuration files',
    description: 'Move config files to src/config/',
    files: [
      { from: 'config/cors.js', to: 'src/config/cors.js' },
      { from: 'config/db.js', to: 'src/config/db.js' },
      { from: 'config/logger.js', to: 'src/config/logger.js' }
    ]
  },
  {
    step: 4,
    action: 'Move middleware files',
    description: 'Move middleware files to src/middlewares/',
    files: [
      { from: 'middlewares/*.js', to: 'src/middlewares/' }
    ]
  },
  {
    step: 5,
    action: 'Move service files',
    description: 'Move service files to src/services/',
    files: [
      { from: 'services/*.js', to: 'src/services/' }
    ]
  },
  {
    step: 6,
    action: 'Move utility files',
    description: 'Move utility files to src/utils/',
    files: [
      { from: 'utils/*.js', to: 'src/utils/' }
    ]
  },
  {
    step: 7,
    action: 'Move route files',
    description: 'Move route files to src/routes/',
    files: [
      { from: 'routes/*.js', to: 'src/routes/' }
    ]
  },
  {
    step: 8,
    action: 'Move API routes',
    description: 'Move API routes to src/routes/api/',
    files: [
      { from: 'routes/api/*.js', to: 'src/routes/api/' }
    ]
  },
  {
    step: 9,
    action: 'Update import paths',
    description: 'Update all require() statements to reflect new paths',
    note: 'This requires manual review of each file'
  },
  {
    step: 10,
    action: 'Update package.json scripts',
    description: 'Update start scripts to point to new locations',
    scripts: {
      'start': 'node src/bin/www',
      'socket-server': 'node socket/index.js'
    }
  }
];

const pathMapping = {
  './config/db': './src/config/db',
  './config/logger': './src/config/logger',
  './config/cors': './src/config/cors',
  './middlewares/security': './src/middlewares/security',
  './middlewares/auth': './src/middlewares/auth',
  './middlewares/validator': './src/middlewares/validator',
  './middlewares/cache': './src/middlewares/cache',
  './middlewares/monitoring': './src/middlewares/monitoring',
  './middlewares/apiHandler': './src/middlewares/apiHandler',
  './services/cacheService': './src/services/cacheService',
  './services/serviceRegistry': './src/services/serviceRegistry',
  './services/queryOptimizer': './src/services/queryOptimizer',
  './utils/logger': './src/utils/logger',
  './utils/responseFormatter': './src/utils/responseFormatter',
  './utils/securityUtils': './src/utils/securityUtils',
  './utils/cryptoUtils': './src/utils/cryptoUtils',
  './utils/auditLogger': './src/utils/auditLogger'
};

function generateMigrationScript() {
  const script = `#!/bin/bash

echo "Starting directory structure migration..."

echo "Step 1: Creating new directory structure"
mkdir -p src/bin
mkdir -p src/config
mkdir -p src/controllers
mkdir -p src/middlewares
mkdir -p src/models
mkdir -p src/routes/api
mkdir -p src/services
mkdir -p src/utils
mkdir -p src/views
mkdir -p socket/data/{raw,processed}
mkdir -p tests
mkdir -p data/reports

echo "Step 2: Moving main application files"
mv app.js src/app.js
mv bin/www src/bin/www

echo "Step 3: Moving configuration files"
mv config/*.js src/config/

echo "Step 4: Moving middleware files"
mv middlewares/*.js src/middlewares/

echo "Step 5: Moving service files"
mv services/*.js src/services/

echo "Step 6: Moving utility files"
mv utils/*.js src/utils/

echo "Step 7: Moving route files"
mv routes/*.js src/routes/
mv routes/api/*.js src/routes/api/

echo "Step 8: Moving socket files"
mv socket/*.js socket/
mv socket/data socket/

echo "Step 9: Updating file permissions"
chmod +x src/bin/www

echo "Migration completed!"
echo "Note: You need to manually update import paths in all files."
`;

  return script;
}

function verifyStructure(targetDir) {
  console.log('Verifying directory structure at:', targetDir);

  const requiredDirs = [
    'src',
    'src/bin',
    'src/config',
    'src/controllers',
    'src/middlewares',
    'src/models',
    'src/routes',
    'src/routes/api',
    'src/services',
    'src/utils',
    'src/views',
    'socket',
    'tests',
    'public',
    'data',
    'logs'
  ];

  let allExist = true;

  for (const dir of requiredDirs) {
    const fullPath = path.join(targetDir, dir);
    const exists = fs.existsSync(fullPath);

    if (!exists) {
      console.log('Missing directory:', dir);
      allExist = false;
    }
  }

  if (allExist) {
    console.log('All required directories exist!');
  }

  return allExist;
}

module.exports = {
  currentStructure,
  proposedStructure,
  migrationSteps,
  pathMapping,
  generateMigrationScript,
  verifyStructure
};