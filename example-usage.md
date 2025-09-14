# GraphQL MCP Server 사용 예제

## 로컬 개발 환경에서 테스트

### 1. 서버 시작

```bash
# 의존성 설치
pnpm install

# 서버 빌드
pnpm run build:server

# 서버 시작
pnpm run start:server
```

### 2. API 테스트

#### 헬스체크
```bash
curl http://localhost:8080/health
```

#### 클라이언트 설정 생성
```bash
curl -X POST http://localhost:8080/mcp/create \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "my-client-123",
    "endpoint": "https://api.example.com/graphql",
    "token": "your-auth-token"
  }'
```

#### 클라이언트 목록 조회
```bash
curl http://localhost:8080/mcp
```

#### 특정 클라이언트 상태 조회
```bash
curl http://localhost:8080/mcp/my-client-123/status
```

#### 클라이언트 설정 삭제
```bash
curl -X DELETE http://localhost:8080/mcp/my-client-123
```

## GCP Cloud Run 배포

### 1. 프로젝트 설정
```bash
# GCP 프로젝트 ID 설정
export PROJECT_ID=your-gcp-project-id

# Google Cloud SDK 로그인
gcloud auth login
gcloud config set project $PROJECT_ID
```

### 2. Cloud Build를 사용한 배포
```bash
# Cloud Build로 배포
gcloud builds submit --config cloudbuild.yaml --project $PROJECT_ID
```

### 3. 수동 배포
```bash
# Docker 이미지 빌드
docker build -t gcr.io/$PROJECT_ID/graphql-mcp-server .

# Container Registry에 푸시
docker push gcr.io/$PROJECT_ID/graphql-mcp-server

# Cloud Run에 배포
gcloud run deploy graphql-mcp-server \
  --image gcr.io/$PROJECT_ID/graphql-mcp-server \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

### 4. 배포된 서비스 테스트
```bash
# 서비스 URL 가져오기
SERVICE_URL=$(gcloud run services describe graphql-mcp-server \
  --region asia-northeast3 \
  --format 'value(status.url)')

# 헬스체크
curl $SERVICE_URL/health

# 클라이언트 설정 생성
curl -X POST $SERVICE_URL/mcp/create \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "production-client",
    "endpoint": "https://your-production-api.com/graphql",
    "token": "your-production-token"
  }'
```

## MCP 클라이언트와 연동

### Claude Desktop 설정

Claude Desktop의 설정 파일에 MCP 서버를 추가:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "graphql-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/graphql-mcp-server/dist/index.js"]
    }
  }
}
```

### Cursor 설정

Cursor의 설정 파일에 MCP 서버를 추가:

```json
{
  "mcp.servers": {
    "graphql-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/graphql-mcp-server/dist/index.js"],
      "env": {}
    }
  },
  "mcp.enabled": true
}
```

## 사용 시나리오

1. **개발 환경**: 로컬에서 HTTP 서버를 실행하고 MCP 클라이언트가 연결
2. **프로덕션 환경**: GCP Cloud Run에 배포하고 여러 클라이언트가 동시에 사용
3. **다중 GraphQL API**: 각 클라이언트가 서로 다른 GraphQL 엔드포인트와 토큰을 사용

## 주의사항

- 각 클라이언트는 고유한 `clientId`를 사용해야 합니다
- GraphQL 엔드포인트와 토큰은 안전하게 관리해야 합니다
- 프로덕션 환경에서는 HTTPS를 사용하세요
- Cloud Run의 메모리와 CPU 리소스를 적절히 설정하세요
