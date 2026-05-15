/**
 * 测试手机号密码登录功能
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function runTests() {
  console.log('=== 开始测试手机号密码登录功能 ===\n');

  // 连接数据库
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12305',
    database: 'lpl'
  });

  try {
    // 测试1: 验证用户表结构
    console.log('测试1: 验证用户表结构...');
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users'"
    );
    
    const requiredColumns = ['phone_number', 'password', 'password_reset_token', 'password_reset_expire', 'email_verified'];
    const foundColumns = columns.map(col => col.COLUMN_NAME);
    
    const allRequiredFound = requiredColumns.every(col => foundColumns.includes(col));
    if (allRequiredFound) {
      console.log('✓ 用户表结构验证通过');
      console.log('  已找到所有必需字段:', requiredColumns.join(', '));
    } else {
      console.log('✗ 用户表结构验证失败');
      console.log('  缺少字段:', requiredColumns.filter(col => !foundColumns.includes(col)).join(', '));
      process.exit(1);
    }
    console.log();

    // 测试2: 测试密码加密功能
    console.log('测试2: 测试bcrypt密码加密...');
    const testPassword = 'test123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    
    if (isMatch) {
      console.log('✓ bcrypt密码加密验证通过');
      console.log('  原始密码:', testPassword);
      console.log('  加密后密码长度:', hashedPassword.length);
    } else {
      console.log('✗ bcrypt密码加密验证失败');
      process.exit(1);
    }
    console.log();

    // 测试3: 测试手机号唯一性约束
    console.log('测试3: 测试手机号唯一性约束...');
    const testPhone = '13800138001';
    
    // 先尝试插入一个用户
    try {
      const [result1] = await connection.query(
        'INSERT INTO users (username, phone_number, password, status) VALUES (?, ?, ?, "active")',
        [testPhone, testPhone, hashedPassword]
      );
      console.log('  成功插入第一个用户，ID:', result1.insertId);
      
      // 尝试插入重复手机号
      try {
        await connection.query(
          'INSERT INTO users (username, phone_number, password, status) VALUES (?, ?, ?, "active")',
          [testPhone + '_2', testPhone, hashedPassword]
        );
        console.log('✗ 手机号唯一性约束验证失败 - 插入了重复手机号');
        process.exit(1);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('✓ 手机号唯一性约束验证通过 - 正确阻止了重复手机号插入');
        } else {
          throw err;
        }
      }
      
      // 清理测试数据
      await connection.query('DELETE FROM users WHERE phone_number = ?', [testPhone]);
      console.log('  测试数据已清理');
    } catch (err) {
      console.log('✗ 测试3执行失败:', err.message);
      process.exit(1);
    }
    console.log();

    // 测试4: 测试用户注册和登录流程
    console.log('测试4: 测试用户注册和登录流程...');
    const registerPhone = '13900139001';
    const registerPassword = 'password123';
    
    try {
      // 模拟注册流程
      const registerHashedPassword = await bcrypt.hash(registerPassword, 10);
      const [registerResult] = await connection.query(
        'INSERT INTO users (username, nickname, phone_number, password, role_id, status, bind_status) VALUES (?, ?, ?, ?, 1, "active", \'{"wechat": false, "qq": false}\')',
        [registerPhone, '测试用户', registerPhone, registerHashedPassword]
      );
      console.log('  用户注册成功，ID:', registerResult.insertId);
      
      // 模拟登录验证流程
      const [users] = await connection.query('SELECT * FROM users WHERE phone_number = ?', [registerPhone]);
      const user = users[0];
      
      if (!user) {
        console.log('✗ 用户查询失败');
        process.exit(1);
      }
      
      const passwordMatch = await bcrypt.compare(registerPassword, user.password);
      if (passwordMatch) {
        console.log('✓ 密码验证通过');
        console.log('  用户信息:', {
          id: user.id,
          username: user.username,
          phone_number: user.phone_number,
          status: user.status
        });
      } else {
        console.log('✗ 密码验证失败');
        process.exit(1);
      }
      
      // 更新登录时间（模拟登录）
      await connection.query('UPDATE users SET last_login_time = NOW() WHERE id = ?', [user.id]);
      console.log('  登录时间更新成功');
      
      // 清理测试数据
      await connection.query('DELETE FROM users WHERE phone_number = ?', [registerPhone]);
      console.log('  测试数据已清理');
    } catch (err) {
      console.log('✗ 测试4执行失败:', err.message);
      // 尝试清理可能残留的数据
      await connection.query('DELETE FROM users WHERE phone_number = ?', [registerPhone]).catch(() => {});
      process.exit(1);
    }
    console.log();

    // 测试5: 测试密码修改流程
    console.log('测试5: 测试密码修改流程...');
    const changePhone = '13700137001';
    const oldPassword = 'oldpassword';
    const newPassword = 'newpassword123';
    
    try {
      // 创建测试用户
      const oldHashed = await bcrypt.hash(oldPassword, 10);
      const [createResult] = await connection.query(
        'INSERT INTO users (username, phone_number, password, status) VALUES (?, ?, ?, "active")',
        [changePhone, changePhone, oldHashed]
      );
      
      // 查询用户
      const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [createResult.insertId]);
      const testUser = users[0];
      
      // 验证旧密码
      const oldMatch = await bcrypt.compare(oldPassword, testUser.password);
      if (!oldMatch) {
        console.log('✗ 旧密码验证失败');
        process.exit(1);
      }
      
      // 修改密码
      const newHashed = await bcrypt.hash(newPassword, 10);
      await connection.query('UPDATE users SET password = ? WHERE id = ?', [newHashed, testUser.id]);
      
      // 验证新密码
      const [updatedUsers] = await connection.query('SELECT password FROM users WHERE id = ?', [testUser.id]);
      const newMatch = await bcrypt.compare(newPassword, updatedUsers[0].password);
      
      if (newMatch) {
        console.log('✓ 密码修改流程验证通过');
      } else {
        console.log('✗ 密码修改流程验证失败');
        process.exit(1);
      }
      
      // 清理测试数据
      await connection.query('DELETE FROM users WHERE phone_number = ?', [changePhone]);
      console.log('  测试数据已清理');
    } catch (err) {
      console.log('✗ 测试5执行失败:', err.message);
      await connection.query('DELETE FROM users WHERE phone_number = ?', [changePhone]).catch(() => {});
      process.exit(1);
    }
    console.log();

    console.log('=== 所有测试通过！===');
    
  } finally {
    await connection.end();
  }
}

runTests().catch(err => {
  console.error('测试执行失败:', err.message);
  process.exit(1);
});