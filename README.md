# PLACEBALL Spring Boot

> **원본 프로젝트**: [PlaceBall-final](https://github.com/Beatris1123/PlaceBall-final)  
> **변환**: TypeScript/Node.js Express → **Spring Boot 3.x + Gradle + Java 17**

---

## 프로젝트 구조

```
placeballspring/
├── build.gradle                          # Gradle 빌드 설정
├── settings.gradle
├── gradlew                               # Gradle Wrapper
├── src/
│   ├── main/
│   │   ├── java/com/placeballspring/placeballspring/
│   │   │   ├── PlaceballspringApplication.java   # 앱 진입점
│   │   │   ├── config/
│   │   │   │   ├── WebSocketConfig.java          # STOMP WebSocket 설정
│   │   │   │   └── WebConfig.java                # 정적 리소스 설정
│   │   │   ├── controller/
│   │   │   │   ├── GameController.java           # GET /api/game/state, /ticker
│   │   │   │   ├── ChatbotController.java        # GET /api/chat/welcome, POST /api/chat/send
│   │   │   │   └── WebController.java            # SPA 라우팅 (index.html 서빙)
│   │   │   ├── model/
│   │   │   │   ├── Zone.java                     # 구역 모델
│   │   │   │   ├── GameState.java                # 게임 상태 모델
│   │   │   │   ├── ChatMessage.java              # 챗봇 메시지 모델
│   │   │   │   └── TickerMessage.java            # LIVE 티커 모델
│   │   │   └── service/
│   │   │       ├── GameService.java              # 실시간 게임 상태 관리 (@Scheduled)
│   │   │       └── ChatbotService.java           # AI 챗봇 응답 서비스
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/                           # React 빌드 결과물 (npm run build 후)
│   └── test/
│       └── java/com/placeballspring/placeballspring/
│           └── PlaceballspringApplicationTests.java
└── frontend/                             # React + Vite 프론트엔드 소스
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── AppErrorBoundary.tsx      # (원본 ErrorBoundary → 이름 변경)
    │   │   ├── ChatbotModal.tsx          # Spring Boot REST 연동
    │   │   ├── StadiumDiamondMap.tsx     # 야구장 다이아몬드 Canvas
    │   │   ├── StadiumSeatMap.tsx        # 야구장 관람석 Canvas
    │   │   ├── Map.tsx                   # Google Maps 컴포넌트
    │   │   └── ui/                       # Shadcn/ui 컴포넌트 (원본 그대로)
    │   ├── hooks/
    │   │   ├── useGameState.ts           # Spring Boot WS/REST 연동 훅 (신규)
    │   │   ├── useChatbot.ts             # 챗봇 API 연동 훅 (신규)
    │   │   ├── useComposition.ts
    │   │   ├── useMobile.tsx
    │   │   └── usePersistFn.ts
    │   ├── contexts/
    │   │   └── ThemeContext.tsx
    │   └── pages/
    │       ├── Home.tsx                  # useGameState 훅 연동
    │       └── NotFound.tsx
    └── shared/
        └── const.ts
```

---

## 원본 → Spring Boot 변환 매핑

| 원본 (TypeScript/Node.js) | Spring Boot 변환 |
|---|---|
| `server/index.ts` (Express) | `PlaceballspringApplication.java` + `WebController.java` |
| `app.use(express.static(...))` | `WebConfig.java` + `src/main/resources/static/` |
| `app.get("*", res.sendFile(...))` | `WebController.java` (SPA forward) |
| `setInterval(2000)` - 점수/구역 | `GameService.java` `@Scheduled(fixedRate=2000)` |
| `setInterval(4000)` - 티커 | `GameService.java` `@Scheduled(fixedRate=4000)` |
| React 로컬 state (zones, scores) | `GameService.java` + WebSocket `/topic/gamestate` |
| `ChatbotModal` 로컬 setTimeout | `ChatbotService.java` + `POST /api/chat/send` |
| `TICKER_MESSAGES` 상수 | `GameService.java` `tickerMessages` 리스트 |
| `INITIAL_ZONES` 상수 | `GameService.java` `zones` 초기화 |
| TypeScript `interface Zone` | `Zone.java` |
| TypeScript `interface Message` | `ChatMessage.java` |

---

## 실행 방법

### 1. 프론트엔드 빌드 (최초 1회)

```bash
cd frontend
npm install
npm run build
# → ../src/main/resources/static/ 에 빌드 결과물 생성
```

### 2. Spring Boot 실행

```bash
# 프로젝트 루트에서
./gradlew bootRun
```

서버 시작 후 → http://localhost:8080

### 3. 개발 모드 (프론트엔드 HMR)

터미널 1: Spring Boot
```bash
./gradlew bootRun
```

터미널 2: Vite dev server (프록시로 Spring Boot 연동)
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## API 엔드포인트

### REST API

| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/game/state` | 현재 게임 상태 (zones, kiaScore, lgScore) |
| GET | `/api/game/ticker` | 현재 LIVE 티커 메시지 |
| GET | `/api/chat/welcome` | AI 챗봇 환영 메시지 |
| POST | `/api/chat/send` | 사용자 메시지 전송 → AI 응답 반환 |

### WebSocket (STOMP)

| 채널 | 방향 | 주기 | 설명 |
|------|------|------|------|
| `/topic/gamestate` | 서버→클라이언트 | 2초 | 게임 상태 실시간 업데이트 |
| `/topic/ticker` | 서버→클라이언트 | 4초 | LIVE 티커 메시지 순환 |
| `/topic/chat` | 서버→클라이언트 | - | AI 챗봇 응답 |
| `/app/chat.send` | 클라이언트→서버 | - | 사용자 메시지 전송 |

---

## 테스트

```bash
./gradlew test
```

---

## 기술 스택

### 백엔드
- **Java 17**
- **Spring Boot 3.2.5**
- **Spring WebSocket** (STOMP)
- **Gradle 8.7**
- **Lombok**

### 프론트엔드 (원본 유지)
- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS 4**
- **Shadcn/ui** (Radix UI)
- **wouter** (라우터)
- **axios** (HTTP)
- **SockJS + STOMP.js** (WebSocket)
