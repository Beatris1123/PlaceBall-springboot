package com.placeballspring.placeballspring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig - WebSocket 설정
 * 
 * 원본 Node.js Express에서 TypeScript/React 클라이언트 간 통신은
 * props drilling 방식의 클라이언트 상태로만 관리되었으나,
 * Spring Boot 전환 시 STOMP over WebSocket으로 서버 → 클라이언트
 * 실시간 브로드캐스트를 구현합니다.
 * 
 * 채널:
 *  - /topic/gamestate  : 2초마다 게임 상태 업데이트
 *  - /topic/ticker     : 4초마다 티커 메시지 업데이트
 *  - /topic/chat       : AI 챗봇 메시지 브로드캐스트
 *  - /app/chat.send    : 클라이언트 → 서버 메시지 발송
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 서버 → 클라이언트 브로드캐스트 채널 접두사
        config.enableSimpleBroker("/topic");
        // 클라이언트 → 서버 메시지 접두사
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // STOMP WebSocket 엔드포인트 (SockJS 폴백 지원)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
