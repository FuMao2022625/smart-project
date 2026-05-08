const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function executeSql() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12305',
    multipleStatements: true
  });

  try {
    console.log('正在删除已存在的数据库...');
    await connection.query('DROP DATABASE IF EXISTS lpl');
    console.log('删除完成。');

    console.log('正在创建数据库 lpl...');
    await connection.query('CREATE DATABASE lpl DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('创建完成。');

    const sqlPath = path.join(__dirname, '..', 'script.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('开始执行SQL脚本...');
    await connection.query(`USE lpl; ${sql}`);
    console.log('SQL脚本执行成功！');

    const [rows] = await connection.query('SHOW TABLES');
    console.log('\n已创建的表:');
    rows.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log('  - ' + tableName);
    });

  } catch (error) {
    console.error('SQL执行失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

executeSql();
