# PlaceBall Spring Boot

> **원본 프로젝트**: [PlaceBall-final](https://github.com/Beatris1123/PlaceBall-final)  
> 야구장 구역 점령 대시보드를 **React + Express (TypeScript)** → **Spring Boot Java** 로 완전 변환

---

## 📁 프로젝트 구조

```
placeballspring/
├── src/
│   ├── main/
│   │   ├── java/com/placeballspring/
│   │   │   ├── PlaceballspringApplication.java   # 메인 진입점
│   │   │   ├── config/
│   │   │   │   └── WebConfig.java                # CORS, 정적 파일 설정
│   │   │   ├── controller/
│   │   │   │   ├── ZoneController.java           # 구역/점수 REST API
│   │   │   │   ├── ChatbotController.java        # 챗봇 REST API
│   │   │   │   └── PageController.java           # SPA 라우팅
│   │   │   ├── model/
│   │   │   │   ├── Zone.java                     # 구역 모델
│   │   │   │   ├── ChatMessage.java              # 채팅 메시지 모델
│   │   │   │   └── ScoreData.java                # 점수 데이터 모델
│   │   │   └── service/
│   │   │       ├── ZoneService.java              # 구역 점령 비즈니스 로직
│   │   │       └── ChatbotService.java           # AI 챗봇 비즈니스 로직
│   │   └── resources/
│   │       ├── application.properties            # Spring Boot 설정
│   │       └── static/
│   │           ├── index.html                    # SPA 메인 HTML
│   │           ├── css/style.css                 # 전체 스타일시트
│   │           └── js/
│   │               ├── stadium.js                # Canvas 야구장 지도
│   │               └── app.js                    # 메인 애플리케이션 로직
│   └── test/java/com/placeballspring/
│       └── PlaceballspringApplicationTests.java
└── pom.xml
```

---

## 🔄 원본 → Spring Boot 변환 매핑

| 원본 파일 (TypeScript/React) | Spring Boot 파일 |
|---|---|
| `server/index.ts` (Express 서버) | `PlaceballspringApplication.java` + `WebConfig.java` |
| `client/src/pages/Home.tsx` (상태/UI) | `ZoneService.java` + `static/js/app.js` + `static/index.html` |
| `client/src/components/ChatbotModal.tsx` | `ChatbotService.java` + `ChatbotController.java` |
| `client/src/components/StadiumDiamondMap.tsx` | `static/js/stadium.js` |
| `client/src/index.css` (Tailwind) | `static/css/style.css` (순수 CSS) |
| React `useState` / `useEffect` | Spring Service + JavaScript `setInterval` / `fetch` |

---

## 🚀 실행 방법

### 필요 환경
- Java 17+
- Maven 3.6+

### 빌드 & 실행

```bash
# 의존성 설치 & 빌드
mvn clean install

# 실행
mvn spring-boot:run
```

브라우저에서 `http://localhost:8080` 접속

---

## 🌐 REST API 엔드포인트

### 구역/점수 API

| Method | URL | 설명 |
|--------|-----|------|
| `GET`  | `/api/zones` | 구역 목록 조회 |
| `GET`  | `/api/score` | 현재 점수 조회 |
| `POST` | `/api/score/refresh` | 점수 & 구역 갱신 |

### 챗봇 API

| Method | URL | 설명 |
|--------|-----|------|
| `GET`    | `/api/chat/messages` | 채팅 히스토리 조회 |
| `POST`   | `/api/chat/send` | 메시지 전송 & AI 응답 |
| `DELETE` | `/api/chat/reset` | 채팅 초기화 |

---

## ✨ 주요 기능

- **실시간 점수 대시보드**: KIA vs LG 팀 점수 2초마다 자동 갱신
- **야구장 구역 점령 맵**: Canvas API로 구현된 다이아몬드 지도
- **구역 점령률 게이지**: 6개 구역의 실시간 점령 현황
- **LIVE 티커**: 실시간 AI 브리핑 메시지 순환
- **AI 챗봇**: 전략 분석 챗봇 (플로팅 버튼)
- **글래스모피즘 UI**: 반투명 위젯 & 배경 블러 효과

---

## 🛠 기술 스택

| 구분 | 원본 | Spring Boot 변환 |
|------|------|-----------------|
| 서버 | Express.js (TypeScript) | Spring Boot 3.2 (Java 17) |
| 빌드 | Vite + esbuild | Maven |
| 프론트엔드 | React 19 + TypeScript | 순수 HTML5 + CSS3 + JavaScript |
| 스타일 | Tailwind CSS v4 | 순수 CSS (CSS Variables) |
| 상태관리 | React useState/useEffect | JavaScript 전역 state + fetch API |
| API | Express static serving | Spring MVC REST API |
