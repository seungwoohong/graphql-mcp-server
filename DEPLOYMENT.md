# Cloud Run 배포 가이드

## 1. Google Cloud CLI 설치

### Mac
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

### Windows
```bash
# Google Cloud CLI 설치 파일 다운로드
# https://cloud.google.com/sdk/docs/install
```

## 2. 프로젝트 설정

```bash
# Google Cloud 프로젝트 설정
gcloud config set project YOUR_PROJECT_ID

# Cloud Run API 활성화
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## 3. 배포 실행

```bash
# Cloud Run에 직접 배포
gcloud run deploy graphql-mcp-server \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## 4. 배포 확인

배포가 완료되면 다음과 같은 URL이 제공됩니다:
```
Service URL: https://graphql-mcp-server-xxxxx-uc.a.run.app
```

## 5. 사용 방법

### Cursor에서 사용
```json
{
  "mcpServers": {
    "graphql-mcp-server": {
      "command": "node",
      "args": ["dist/sse-mcp-server.js"]
    }
  }
}
```

### 웹 브라우저에서 사용
```javascript
const eventSource = new EventSource('https://your-service-url.run.app/mcp');
eventSource.onmessage = (event) => {
  console.log(JSON.parse(event.data));
};
```

### API 테스트
```bash
curl -X POST https://your-service-url.run.app/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}},"id":1}'
```

## 6. 환경 변수 설정

Cloud Run에서 환경 변수를 설정하려면:

```bash
gcloud run services update graphql-mcp-server \
  --region asia-northeast3 \
  --set-env-vars "NODE_ENV=production"
```

## 7. 로그 확인

```bash
gcloud run services logs read graphql-mcp-server --region asia-northeast3
```

## 8. 서비스 삭제

```bash
gcloud run services delete graphql-mcp-server --region asia-northeast3
```
