import { spawn } from 'child_process';

// MCP 서버 프로세스 시작
const serverProcess = spawn('node', ['../graphql-mcp-server/dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;

// 서버 출력 모니터링
serverProcess.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      // 초기화 완료 후 도구 테스트
      if (response.result && response.result.serverInfo) {
        testSearchTool();
      }
    } catch (e) {
      // JSON이 아닌 출력은 무시
    }
  });
});

serverProcess.stderr.on('data', (data) => {
  console.log('Server log:', data.toString().trim());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// 초기화 메시지 전송
function initialize() {
  const message = {
    jsonrpc: '2.0',
    id: messageId++,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  console.log('Sending initialize message...');
  serverProcess.stdin.write(JSON.stringify(message) + '\n');
}

// Search 도구 테스트
function testSearchTool() {
  const searchMessage = {
    jsonrpc: '2.0',
    id: messageId++,
    method: 'tools/call',
    params: {
      name: 'search',
      arguments: {}
    }
  };
  
  console.log('Testing search tool from test project...');
  serverProcess.stdin.write(JSON.stringify(searchMessage) + '\n');
  
  // 3초 후 서버 종료
  setTimeout(() => {
    console.log('Test completed. Terminating server...');
    serverProcess.kill();
    process.exit(0);
  }, 3000);
}

// 테스트 시작
console.log('Starting test from test project...');
console.log('Current directory:', process.cwd());
initialize();
