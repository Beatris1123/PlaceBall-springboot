package com.placeballspring.placeballspring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig — MPA 정적 리소스 서빙 설정
 *
 * Spring Boot 는 classpath:/static/ 을 기본적으로 서빙하므로
 * index.html, map.html, chat.html, 404.html 은 자동 서빙됩니다.
 *
 * 이 클래스는 하위 디렉터리별 명시적 핸들러를 추가하여
 * 캐시 제어 등 향후 확장을 대비합니다.
 *
 * 정적 리소스 구조 (src/main/resources/static/):
 *   /css/common.css   → 모든 MPA 페이지 공통 스타일
 *   /css/style.css    → index.html 전용 대시보드 스타일
 *   /js/api.js        → REST API 클라이언트
 *   /js/websocket.js  → STOMP WebSocket 클라이언트
 *   /js/stadium-map.js→ Canvas 야구장 렌더러
 *   /js/chatbot.js    → 챗봇 FAB 모달 (index.html 전용)
 *   /js/app.js        → 대시보드 전체 조립 (index.html 전용)
 *   /js/map-page.js   → map.html 전용 Zone 테이블 로직
 *   /js/chat-page.js  → chat.html 전용 풀스크린 챗봇 로직
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // CSS 파일
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");

        // JS 파일
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");

        // 이미지, 아이콘 등 기타 에셋
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        // 루트 정적 파일 (favicon.ico, robots.txt 등)
        registry.addResourceHandler("/*.ico", "/*.txt", "/*.png", "/*.svg", "/*.webmanifest")
                .addResourceLocations("classpath:/static/");
    }
}
