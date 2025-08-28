import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCPFromProject() {
  console.log('🔗 Testing MCP server from test project...');
  console.log('Current working directory:', process.cwd());
  
  // StdioClientTransport 생성 (MCP 서버 경로 지정)
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['../graphql-mcp-server/dist/index.js'],
    env: {}
  });
  
  // MCP 클라이언트 생성
  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {}
  });
  
  try {
    // 서버에 연결
    console.log('🔄 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected to MCP server successfully!');
    
    // Search 도구 테스트 (모든 작업 조회)
    console.log('\n🔍 Testing search tool from test project...');
    const searchResult = await client.callTool({
      name: 'search',
      arguments: {}
    });
    
    // 결과 파싱 및 출력
    const resultText = searchResult.content[0].text;
    const result = JSON.parse(resultText.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\n/g, '\n'));
    
    console.log('✅ Search tool result:');
    console.log(`  Endpoint: ${result.endpoint}`);
    console.log(`  Total Operations: ${result.totalOperations}`);
    console.log('  Operations:');
    result.operations.forEach(op => {
      console.log(`    - ${op.name} (${op.type})`);
    });
    
    console.log('\n🎉 MCP server correctly reads .env from test project!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    // 클라이언트 연결 종료
    await client.close();
    console.log('🔚 Test completed.');
  }
}

// 테스트 실행
testMCPFromProject().catch(console.error);
