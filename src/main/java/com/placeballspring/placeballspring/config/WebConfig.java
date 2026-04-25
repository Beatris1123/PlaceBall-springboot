package com.placeballspring.placeballspring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig — MPA 정적 리소스 서빙 설정
 *
 * src/main/resources/static/ 하위 파일을 URL 경로별로 서빙합니다.
 *
 * 디렉토리 구조:
 *   static/
 *     index.html       ← GET /       (WebController)
 *     map.html         ← GET /map    (WebController)
 *     chat.html        ← GET /chat   (WebController)
 *     css/
 *       common.css     ← GET /css/common.css  (공통 Nav, 변수, 카드)
 *       style.css      ← GET /css/style.css   (대시보드 전용)
 *     js/
 *       api.js         ← GET /js/api.js
 *       websocket.js   ← GET /js/websocket.js
 *       stadium-map.js ← GET /js/stadium-map.js
 *       chatbot.js     ← GET /js/chatbot.js
 *       app.js         ← GET /js/app.js
 *       map-page.js    ← GET /js/map-page.js
 *       chat-page.js   ← GET /js/chat-page.js
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // CSS 파일 서빙
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");

        // JS 파일 서빙
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");

        // 이미지, 파비콘, 기타 에셋
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        // 루트 레벨 정적 파일 (favicon.ico 등)
        registry.addResourceHandler("/*.ico", "/*.png", "/*.svg", "/*.webmanifest")
                .addResourceLocations("classpath:/static/");
    }
}
