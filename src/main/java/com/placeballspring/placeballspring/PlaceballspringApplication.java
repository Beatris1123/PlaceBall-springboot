package com.placeballspring.placeballspring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * PLACEBALL Spring Boot Application Entry Point
 * 
 * 원본: TypeScript/Node.js Express 서버 (baseballai-bicevcq9/server/index.ts)
 * 변환: Spring Boot 3.x + Gradle
 * 
 * 주요 기능:
 *  - 야구 경기 실시간 구역 점령 대시보드 (KIA vs LG)
 *  - AI 전략 챗봇 (WebSocket 기반 실시간 통신)
 *  - 구역별 응원 지표 REST API
 */
@SpringBootApplication
public class PlaceballspringApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlaceballspringApplication.class, args);
    }
}
