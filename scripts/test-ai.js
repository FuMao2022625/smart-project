const http = require('http');

function testChat() {
  console.log('测试 AI 聊天功能...\n');

  const postData = JSON.stringify({
    prompt: '你好，请介绍一下自己',
    options: {
      model: 'qwen3.6-plus',
      enableThinking: true
    }
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/ai/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('AI 回复:');
        console.log(response.data?.response || '无响应');
      } catch (error) {
        console.error('解析响应失败:', error.message);
        console.log('原始响应:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('请求失败:', error.message);
    console.log('请确保应用已启动 (npm start)');
  });

  req.write(postData);
  req.end();
}

testChat();