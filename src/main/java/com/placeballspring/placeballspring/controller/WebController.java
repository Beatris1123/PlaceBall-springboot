package com.placeballspring.placeballspring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * WebController — MPA(Multi-Page Application) 라우팅 컨트롤러
 *
 * SPA 방식(모든 경로 → index.html)을 폐기하고,
 * 기능별로 분리된 HTML 파일을 각 URL 에 매핑합니다.
 *
 * 페이지 구조:
 *   GET /       → forward:/index.html  (대시보드 — 점수판, 야구장 맵, 챗봇 FAB)
 *   GET /map    → forward:/map.html    (구역 지도 — Zone 상세 테이블 + 캔버스)
 *   GET /chat   → forward:/chat.html   (AI 전략 챗봇 — 풀스크린 챗봇 UI)
 *
 * 연결된 정적 파일 (WebConfig.java 가 /css/**, /js/** 서빙):
 *   /css/common.css    — 공통 Nav, 변수, 카드, 챗봇 모달 스타일
 *   /css/style.css     — 대시보드 전용 스타일
 *   /js/api.js         — GameController / ChatbotController REST 호출
 *   /js/websocket.js   — STOMP /topic/gamestate, /topic/ticker 구독
 *   /js/stadium-map.js — Zone Canvas 렌더링
 *   /js/chatbot.js     — 대시보드 FAB 모달 챗봇
 *   /js/app.js         — 대시보드 전체 조립
 *   /js/map-page.js    — map.html 전용 Zone 테이블 + 조립
 *   /js/chat-page.js   — chat.html 전용 풀스크린 챗봇
 */
@Controller
public class WebController {

    /**
     * 대시보드 — index.html
     * 점수판, 야구장 다이아몬드 맵, Zone 게이지, 챗봇 FAB 모달
     * JS: api.js, websocket.js, stadium-map.js, chatbot.js, app.js
     */
    @GetMapping("/")
    public String home() {
        return "forward:/index.html";
    }

    /**
     * 구역 지도 페이지 — map.html
     * Zone 상세 테이블 + 야구장 캔버스 + 실시간 점수
     * JS: api.js, websocket.js, stadium-map.js, map-page.js
     */
    @GetMapping("/map")
    public String map() {
        return "forward:/map.html";
    }

    /**
     * AI 전략 챗봇 페이지 — chat.html
     * 풀스크린 챗봇 UI + 빠른 질문 사이드바 + 실시간 점수
     * JS: api.js, websocket.js, chat-page.js
     */
    @GetMapping("/chat")
    public String chat() {
        return "forward:/chat.html";
    }

    /**
     * 404 페이지 — index.html 로 리다이렉트
     * 존재하지 않는 경로는 대시보드로 안내
     */
    @GetMapping("/404")
    public String notFound() {
        return "forward:/index.html";
    }
}
