# 개발 가이드

## 프로젝트 구조

```
health-coach/
├── frontend/
│   ├── mobile/          # React Native 모바일 앱
│   └── web/             # 관리자 웹 (React.js)
├── backend/
│   ├── api/             # REST API 서버 (Node.js/Express)
│   ├── ai-engine/       # AI 모델 서비스 (Python)
│   └── database/        # 데이터베이스 스키마
├── docs/                # 프로젝트 문서
└── deployment/          # 배포 설정 (Docker, K8s)
```

## 개발 환경 설정

### 1. 필요한 도구 설치

- Node.js (v18 이상)
- Python (v3.9 이상)
- React Native CLI
- Docker (선택사항)

### 2. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd health-coach
npm install
```

### 3. 각 서비스별 설정

#### Frontend (Web)
```bash
cd frontend/web
npm install
npm run dev
```

#### Frontend (Mobile)
```bash
cd frontend/mobile
npm install
# iOS
npm run ios
# Android
npm run android
```

#### Backend API
```bash
cd backend/api
npm install
npm run dev
```

#### AI Engine
```bash
cd backend/ai-engine
pip install -r requirements.txt
python app.py
```

## 개발 워크플로우

### 1. 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

### 2. 커밋 메시지 규칙

```
type(scope): description

예시:
feat(auth): 사용자 로그인 기능 추가
fix(api): 운동 데이터 저장 오류 수정
docs(readme): 설치 가이드 업데이트
```

### 3. 코드 스타일

- ESLint + Prettier 사용
- 변수명: camelCase
- 함수명: camelCase
- 컴포넌트명: PascalCase
- 상수: UPPER_SNAKE_CASE

## API 문서

API 명세서는 Swagger를 통해 제공됩니다.
개발 서버 실행 후 `http://localhost:3000/api-docs`에서 확인 가능합니다.

## 테스트

### 단위 테스트
```bash
npm run test
```

### E2E 테스트
```bash
npm run test:e2e
```

## 배포

### 개발 환경
```bash
npm run deploy:dev
```

### 프로덕션 환경
```bash
npm run deploy:prod
```

## 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   - 다른 포트 사용 또는 프로세스 종료

2. **의존성 오류**
   - `node_modules` 삭제 후 재설치

3. **권한 문제**
   - sudo 없이 npm 설치 권한 설정

## 기여 가이드

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request