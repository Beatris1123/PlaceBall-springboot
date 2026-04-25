package com.placeballspring.placeballspring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * WebController — MPA(Multi-Page Application) URL 매핑
 *
 * SPA forward-everything 방식에서 MPA 방식으로 전환.
 * 각 경로를 static/ 폴더의 개별 HTML 파일로 forward 합니다.
 *
 * URL 구조:
 *   GET /        → forward:/index.html  (대시보드 — 실시간 점수 + 야구장 맵 + 챗봇 FAB)
 *   GET /map     → forward:/map.html    (구역 지도 — Zone 테이블 + 캔버스)
 *   GET /chat    → forward:/chat.html   (AI 전략 챗봇 — 풀스크린)
 *   GET /404     → forward:/404.html    (에러 페이지)
 *
 * 정적 파일(/css/*, /js/*, *.html 직접 접근)은
 * Spring Boot 기본 정적 서빙(classpath:/static/) + WebConfig.java 가 처리합니다.
 *
 * REST API (/api/**) 및 WebSocket (/ws) 은 이 컨트롤러가 가로채지 않습니다.
 */
@Controller
public class WebController {

    /**
     * GET /  →  대시보드
     * 사용 JS: api.js, websocket.js, stadium-map.js, chatbot.js, app.js
     */
    @GetMapping("/")
    public String dashboard() {
        return "forward:/index.html";
    }

    /**
     * GET /map  →  야구장 구역 지도 페이지
     * 사용 JS: api.js, websocket.js, stadium-map.js, map-page.js
     */
    @GetMapping("/map")
    public String mapPage() {
        return "forward:/map.html";
    }

    /**
     * GET /chat  →  AI 전략 챗봇 풀스크린 페이지
     * 사용 JS: api.js, websocket.js, chat-page.js
     */
    @GetMapping("/chat")
    public String chatPage() {
        return "forward:/chat.html";
    }

    /**
     * GET /404  →  404 에러 페이지
     */
    @GetMapping("/404")
    public String notFound() {
        return "forward:/404.html";
    }
}
