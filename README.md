# PLACEBALL - Spring Boot

> 원본 React/Node.js 프로젝트를 **Spring Boot Java**로 완전 변환한 야구 팬 응원 점령 대시보드

---

## 프로젝트 구조

```
placeballspring/
├── pom.xml
└── src/
    └── main/
        ├── java/com/placeball/app/
        │   ├── PlaceBallApplication.java       ← 메인 진입점
        │   ├── config/
        │   │   └── WebSocketConfig.java         ← STOMP WebSocket 설정
        │   ├── controller/
        │   │   ├── HomeController.java           ← 페이지 라우팅 (/, /404)
        │   │   ├── GameRestController.java       ← GET /api/gamestate
        │   │   └── ChatbotController.java        ← POST /api/chat/send
        │   ├── model/
        │   │   ├── Zone.java                    ← 야구장 구역 모델
        │   │   ├── TickerMessage.java            ← LIVE 티커 메시지
        │   │   ├── GameState.java               ← 전체 게임 상태
        │   │   └── ChatMessage.java             ← AI 챗봇 메시지
        │   └── service/
        │       ├── GameService.java             ← 2초 인터벌 점수/구역 업데이트
        │       └── ChatbotService.java          ← AI 응답 생성
        └── resources/
            ├── application.properties
            ├── templates/
            │   ├── index.html                   ← 메인 페이지 (Thymeleaf)
            │   └── not-found.html               ← 404 페이지
            └── static/
                ├── css/style.css                ← 전체 스타일 (글래스모피즘)
                └── js/
                    ├── stadium-map.js           ← Canvas 야구장 다이아몬드 맵
                    └── app.js                   ← 앱 로직 (WebSocket + DOM)
```

---

## 원본 → 변환 대응표

| 원본 (React/Node.js) | 변환 (Spring Boot Java) |
|---|---|
| `server/index.ts` (Express) | `PlaceBallApplication.java` + `HomeController.java` |
| `pages/Home.tsx` (React) | `templates/index.html` + `js/app.js` |
| `components/StadiumDiamondMap.tsx` | `js/stadium-map.js` |
| `components/ChatbotModal.tsx` | `ChatbotController.java` + `ChatbotService.java` |
| `useState(INITIAL_ZONES)` | `GameService.zones` (List<Zone>) |
| `setInterval(2000ms)` 점수 업데이트 | `@Scheduled(fixedDelay=2000)` |
| `setInterval(4000ms)` 티커 순환 | `@Scheduled(fixedDelay=4000)` |
| WebSocket (없음, 폴링 방식) | Spring STOMP + SockJS WebSocket |
| `interface Zone` (TypeScript) | `Zone.java` (Lombok) |
| `interface Message` (TypeScript) | `ChatMessage.java` (Lombok) |
| `AI_RESPONSES[random]` | `ChatbotService.generateAiResponse()` |
| `index.css` (Tailwind) | `static/css/style.css` (Vanilla CSS) |

---

## 실행 방법

### 사전 조건
- Java 17 이상
- Maven 3.6 이상

### 실행

```bash
# 의존성 다운로드 & 빌드
mvn clean install

# 실행
mvn spring-boot:run
```

접속: http://localhost:8080

---

## API 엔드포인트

| Method | URL | 설명 |
|---|---|---|
| `GET` | `/` | 메인 대시보드 페이지 |
| `GET` | `/404` | 404 페이지 |
| `GET` | `/api/gamestate` | 현재 게임 상태 JSON |
| `GET` | `/api/chat/welcome` | AI 초기 인사 메시지 |
| `POST` | `/api/chat/send` | AI 채팅 메시지 전송 |
| `WS` | `/ws` | STOMP WebSocket (실시간 업데이트) |

---

## 기술 스택

- **Backend**: Spring Boot 3.2.5, Java 17
- **Template**: Thymeleaf
- **WebSocket**: Spring STOMP + SockJS
- **Frontend**: Vanilla JS + Canvas API
- **Style**: Vanilla CSS (글래스모피즘)
- **Build**: Maven
