# API 명세서

## 개요

AI Health Coach API는 사용자의 건강 데이터, 운동 기록, 식단 정보를 관리하고 AI 기반 개인 맞춤 추천을 제공합니다.

## 기본 정보

- **Base URL**: `https://api.healthcoach.com/v1`
- **인증**: JWT Bearer Token
- **데이터 형식**: JSON
- **문자 인코딩**: UTF-8

## 인증

모든 API 요청에는 Authorization 헤더가 필요합니다.

```
Authorization: Bearer <access_token>
```

## API 엔드포인트

### 1. 사용자 관리

#### 1.1 회원가입
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "홍길동",
  "birthDate": "1990-01-01",
  "gender": "male"
}
```

#### 1.2 로그인
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "홍길동"
    }
  }
}
```

### 2. 사용자 프로필

#### 2.1 프로필 조회
```http
GET /users/profile
```

#### 2.2 프로필 업데이트
```http
PUT /users/profile
```

**Request Body:**
```json
{
  "height": 175,
  "weight": 70,
  "bodyFatPercentage": 15,
  "fitnessGoal": "weight_loss",
  "activityLevel": "moderate",
  "medicalConditions": ["none"],
  "allergies": ["nuts"]
}
```

### 3. 운동 관리

#### 3.1 운동 루틴 추천 받기
```http
GET /workouts/recommendations
```

**Query Parameters:**
- `date`: 날짜 (YYYY-MM-DD)
- `type`: 운동 타입 (strength, cardio, flexibility)

#### 3.2 운동 기록 저장
```http
POST /workouts/records
```

**Request Body:**
```json
{
  "workoutId": "workout_id",
  "exercises": [
    {
      "exerciseId": "exercise_id",
      "sets": 3,
      "reps": 12,
      "weight": 50,
      "duration": 30,
      "restTime": 60
    }
  ],
  "totalDuration": 45,
  "caloriesBurned": 300,
  "difficulty": "medium",
  "notes": "좋은 운동이었음"
}
```

#### 3.3 자세 분석 결과 저장
```http
POST /workouts/pose-analysis
```

**Request Body:**
```json
{
  "exerciseId": "exercise_id",
  "videoData": "base64_encoded_video",
  "analysisResults": {
    "correctForm": 85,
    "speed": "appropriate",
    "angleAccuracy": 90,
    "suggestions": ["등을 더 곧게 세우세요"]
  }
}
```

### 4. 식단 관리

#### 4.1 식단 기록 저장
```http
POST /nutrition/meals
```

**Request Body:**
```json
{
  "mealType": "breakfast",
  "foods": [
    {
      "name": "계란",
      "quantity": 2,
      "unit": "개",
      "calories": 140,
      "protein": 12,
      "carbs": 1,
      "fat": 10
    }
  ],
  "totalCalories": 500,
  "mealTime": "2024-01-01T08:00:00Z",
  "imageUrl": "meal_photo_url"
}
```

#### 4.2 영양 분석 조회
```http
GET /nutrition/analysis
```

**Query Parameters:**
- `startDate`: 시작 날짜
- `endDate`: 종료 날짜
- `period`: 기간 (daily, weekly, monthly)

#### 4.3 식단 추천 받기
```http
GET /nutrition/recommendations
```

### 5. AI 챗봇

#### 5.1 챗봇과 대화
```http
POST /ai/chat
```

**Request Body:**
```json
{
  "message": "오늘 운동 어떻게 해야 하나요?",
  "context": {
    "currentWorkout": "chest_day",
    "userGoal": "muscle_gain",
    "previousConversation": ["이전 대화 기록"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "가슴 운동을 위해 벤치프레스부터 시작해보세요!",
    "suggestions": ["운동 루틴 보기", "자세 확인하기"],
    "actionRequired": false
  }
}
```

### 6. 웰니스 트래킹

#### 6.1 생활 데이터 기록
```http
POST /wellness/tracking
```

**Request Body:**
```json
{
  "date": "2024-01-01",
  "sleepHours": 7.5,
  "waterIntake": 2.5,
  "stressLevel": 3,
  "mood": "good",
  "weight": 70.5,
  "steps": 8000,
  "heartRate": 72
}
```

### 7. 분석 및 리포트

#### 7.1 진척도 리포트 조회
```http
GET /analytics/progress
```

**Query Parameters:**
- `period`: weekly, monthly, quarterly
- `metrics`: weight,muscle,cardio,nutrition

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "summary": {
      "weightChange": -2.5,
      "muscleGain": 1.2,
      "workoutCompliance": 85,
      "nutritionScore": 78
    },
    "charts": {
      "weightTrend": [...],
      "workoutFrequency": [...],
      "nutritionBalance": [...]
    },
    "insights": [
      "지난 달 대비 체중이 2.5kg 감소했습니다",
      "운동 루틴 준수율이 향상되었습니다"
    ]
  }
}
```

## 에러 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 500 | Internal Server Error | 서버 내부 오류 |

## 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

### 오류 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "오류 메시지",
    "details": "상세 오류 정보"
  }
}
```