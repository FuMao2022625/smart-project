const http = require('http');

function checkStatus() {
  console.log('检查 AI 服务状态...\n');

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/ai/status',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('AI 服务状态:');
        console.log('  初始化状态:', response.data?.status?.initialized);
        console.log('  就绪状态:', response.data?.status?.ready);
        console.log('  请求成功:', response.success);
      } catch (error) {
        console.error('解析响应失败:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('请求失败:', error.message);
    console.log('请确保应用已启动 (npm start)');
  });

  req.end();
}

checkStatus();