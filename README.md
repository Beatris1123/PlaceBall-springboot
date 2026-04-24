# PLACEBALL - Spring Boot

> 원본 레포지토리 [PlaceBall-final](https://github.com/Beatris1123/PlaceBall-final)의 TypeScript/Node.js 기반 프로젝트를  
> **Spring Boot 3.x + Gradle + Java 17** 로 코드 손실 없이 변환한 버전입니다.

---

## 📋 프로젝트 구조

```
placeballspring/
├── build.gradle                          # Gradle 빌드 설정
├── settings.gradle
├── gradlew / gradlew.bat
├── src/
│   ├── main/
│   │   ├── java/com/placeballspring/placeballspring/
│   │   │   ├── PlaceballspringApplication.java     # 진입점
│   │   │   ├── config/
│   │   │   │   ├── WebSocketConfig.java            # STOMP WebSocket 설정
│   │   │   │   └── WebConfig.java                  # 정적 리소스 서빙
│   │   │   ├── controller/
│   │   │   │   ├── GameController.java             # GET /api/game/state, /ticker
│   │   │   │   ├── ChatbotController.java          # GET /api/chat/welcome, POST /api/chat/send
│   │   │   │   └── WebController.java              # SPA 라우팅 (index.html 서빙)
│   │   │   ├── model/
│   │   │   │   ├── Zone.java                       # 구역 모델
│   │   │   │   ├── GameState.java                  # 게임 상태 모델
│   │   │   │   ├── ChatMessage.java                # 챗봇 메시지 모델
│   │   │   │   └── TickerMessage.java              # 티커 메시지 모델
│   │   │   └── service/
│   │   │       ├── GameService.java                # 게임 상태 관리 + WebSocket 브로드캐스트
│   │   │       └── ChatbotService.java             # AI 챗봇 응답 생성
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/                             # React 빌드 결과물 (vite build 후 자동 생성)
│   └── test/
│       └── java/...
└── frontend/                             # React + TypeScript 소스 (원본 보존)
    ├── src/
    │   ├── pages/Home.tsx                # 메인 대시보드 (useGameState 훅 연동)
    │   ├── components/
    │   │   ├── ChatbotModal.tsx          # AI 챗봇 모달 (useChatbot 훅 연동)
    │   │   ├── StadiumDiamondMap.tsx     # 야구장 Canvas 맵
    │   │   └── StadiumSeatMap.tsx        # 관람석 Canvas 맵
    │   └── hooks/
    │       ├── useGameState.ts           # 게임 상태 WebSocket 연동 훅 (신규)
    │       └── useChatbot.ts             # 챗봇 REST API 연동 훅 (신규)
    ├── package.json
    └── vite.config.ts                    # Spring Boot 통합 빌드 설정
```

---

## 🔄 원본 → Spring Boot 변환 매핑

| 원본 (TypeScript/Node.js)              | Spring Boot 전환                          |
|----------------------------------------|-------------------------------------------|
| `server/index.ts` (Express 서버)       | `PlaceballspringApplication.java`         |
| `app.use(express.static(...))`         | `WebConfig.java` + `application.properties` |
| `app.get("*", res.sendFile(...))`      | `WebController.java` (SPA 라우팅)         |
| `Home.tsx` useState + setInterval(2s) | `GameService.java` @Scheduled + WebSocket |
| `Home.tsx` ticker setInterval(4s)     | `GameService.java` @Scheduled + WebSocket |
| `ChatbotModal.tsx` setTimeout(600ms)  | `ChatbotService.java` + REST API          |
| TypeScript interface `Zone`            | `Zone.java`                               |
| TypeScript interface `Message`         | `ChatMessage.java`                        |
| TICKER_MESSAGES 상수                   | `GameService.java` tickerMessages List    |
| AI_RESPONSES 상수                      | `ChatbotService.java` AI_RESPONSES List   |

---

## 🚀 실행 방법

### 1. 프론트엔드 빌드

```bash
cd frontend
npm install    # 또는 pnpm install
npm run build  # src/main/resources/static/ 으로 자동 빌드
```

### 2. Spring Boot 실행

```bash
# 프로젝트 루트에서
./gradlew bootRun

# 또는 JAR 빌드 후 실행
./gradlew build
java -jar build/libs/placeballspring-0.0.1-SNAPSHOT.jar
```

### 3. 접속

```
http://localhost:8080
```

---

## 📡 API 엔드포인트

### REST API

| Method | Endpoint            | 설명                          |
|--------|---------------------|-------------------------------|
| GET    | `/api/game/state`   | 현재 게임 상태 (zones, scores) |
| GET    | `/api/game/ticker`  | 현재 LIVE 티커 메시지          |
| GET    | `/api/chat/welcome` | AI 챗봇 환영 메시지            |
| POST   | `/api/chat/send`    | 사용자 메시지 → AI 응답        |

### WebSocket (STOMP)

| 채널                  | 방향               | 설명                     |
|-----------------------|--------------------|--------------------------|
| `/topic/gamestate`    | 서버 → 클라이언트  | 2초마다 게임 상태 업데이트 |
| `/topic/ticker`       | 서버 → 클라이언트  | 4초마다 티커 메시지 업데이트 |
| `/topic/chat`         | 서버 → 클라이언트  | AI 챗봇 응답 브로드캐스트  |

---

## 🛠 기술 스택

**백엔드**
- Java 17
- Spring Boot 3.2.5
- Spring WebSocket (STOMP)
- Gradle 8.7

**프론트엔드** (원본 유지)
- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Canvas API (StadiumDiamondMap, StadiumSeatMap)
