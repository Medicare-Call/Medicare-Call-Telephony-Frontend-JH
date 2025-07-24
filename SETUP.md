# Medicare Call Telephony Frontend 설정 가이드

이 문서는 Medicare-Call-Telephony-Frontend-JH를 Medicare-Call-Telephony-Service-JH 백엔드 서버와 연동하기 위한 설정 방법을 안내합니다.

## 필수 요구사항

1. **백엔드 서버**: Medicare-Call-Telephony-Service-JH가 실행 중이어야 합니다
2. **Node.js**: 18.0.0 이상
3. **Twilio 계정**: 전화번호와 인증 정보가 필요합니다

## 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Twilio Configuration (필수)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Backend Server Configuration (선택사항 - 기본값 사용 가능)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:3000
BACKEND_URL=http://localhost:3000

# Optional: Twilio Webhook URL
TWILIO_WEBHOOK_URL=your_ngrok_or_public_url
```

## 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **브라우저에서 확인**
   - http://localhost:3001 접속 (프론트엔드)
   - 백엔드는 http://localhost:3000에서 실행
   - 체크리스트가 모두 완료되면 통화 기능 사용 가능

## 백엔드 서버 연동 체크리스트

프론트엔드에서 다음 항목들이 자동으로 체크됩니다:

1. ✅ **Twilio 계정 설정**: 환경변수에 Twilio 인증 정보 설정
2. ✅ **Twilio 전화번호 설정**: Twilio 콘솔에서 전화번호 구매/설정
3. ✅ **로컬 WebSocket 서버 시작**: 백엔드 서버가 포트 3000에서 실행 중
4. ✅ **ngrok 시작**: 외부에서 접근 가능한 공개 URL 설정
5. ✅ **Twilio 웹훅 URL 업데이트**: 전화번호에 웹훅 URL 연결

## 주요 기능

### 통화 시작
- **노인 ID**: 통화 대상자의 고유 식별자
- **전화번호**: 국제 형식으로 입력 (예: +821012345678)
- **초기 프롬프트**: AI가 통화 시작시 말할 내용

### 실시간 통화 모니터링
- **통화 상태**: 연결 상태, 통화 시간, 참여자 정보 실시간 표시
- **실시간 통화기록**: 
  - 발화자별 색상 구분 (어르신/AI 어시스턴트/시스템)
  - 실시간 검색 기능
  - 통화 통계 (메시지 수, 함수 호출 수, 응답 시간 등)
  - 통화기록 내보내기 (텍스트 파일)
- **통화 품질**: 연결 품질, 음성 품질, 지연시간 모니터링
- **Function Calls**: AI가 호출하는 함수들 실시간 모니터링
- **Session Configuration**: 음성, 지시사항, 도구 설정

### 향상된 사용자 경험
- **실시간 타이머**: 통화 진행 시간 실시간 표시
- **상태 알림**: 통화 연결/진행/종료 상태 시각적 표시
- **검색 기능**: 대화 내용에서 키워드 검색
- **통계 정보**: 통화 품질 및 성능 지표 제공

## 백엔드 서버 API 엔드포인트

프론트엔드에서 사용하는 백엔드 API:

- `GET /call/public-url`: 공개 URL 확인
- `POST /call`: 통화 시작
- `WebSocket /logs/{sessionId}`: 실시간 로그 스트림
- `GET /tools`: 사용 가능한 도구 목록

## 트러블슈팅

### 1. 백엔드 서버 연결 실패
- 백엔드 서버가 포트 3000에서 실행 중인지 확인
- `.env.local`의 `NEXT_PUBLIC_BACKEND_URL` 설정 확인

### 2. WebSocket 연결 실패
- 방화벽이 WebSocket 연결을 차단하지 않는지 확인
- 백엔드 서버의 CORS 설정 확인

### 3. Twilio 설정 문제
- Twilio 계정 인증 정보가 올바른지 확인
- 전화번호가 활성화되어 있는지 확인
- 웹훅 URL이 올바르게 설정되었는지 확인

### 4. 통화 시작 실패
- 전화번호 형식이 올바른지 확인 (국제 format)
- Twilio 계정에 충분한 잔액이 있는지 확인
- 백엔드 서버 로그에서 에러 메시지 확인

## 개발자 정보

이 프론트엔드는 다음과 같은 구조로 백엔드와 통신합니다:

1. **REST API**: 통화 시작, 설정 확인 등
2. **WebSocket**: 실시간 대화 내용, 함수 호출 정보 스트리밍
3. **Twilio Integration**: 전화번호 관리, 웹훅 설정

모든 통신은 세션 ID 기반으로 관리되며, 통화 시작시 받은 `sessionId`로 WebSocket 연결을 생성합니다. 