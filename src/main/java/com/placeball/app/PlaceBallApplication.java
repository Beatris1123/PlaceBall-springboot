package com.placeball.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * PlaceBall Application - 야구 팬 응원 점령 대시보드
 * 원본: React/Node.js → 변환: Spring Boot Java
 */
@SpringBootApplication
@EnableScheduling
public class PlaceBallApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlaceBallApplication.class, args);
    }
}
