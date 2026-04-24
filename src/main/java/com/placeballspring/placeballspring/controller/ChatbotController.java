package com.placeballspring.placeballspring.controller;

import com.placeballspring.placeballspring.model.ChatMessage;
import com.placeballspring.placeballspring.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * ChatbotController - AI 챗봇 컨트롤러
 * 
 * 원본 ChatbotModal.tsx 로직:
 *  - 사용자가 메시지 입력 → AI가 600ms 후 응답
 *  - REST API (POST /api/chat/send) 및 WebSocket(/app/chat) 지원
 * 
 * REST 엔드포인트:
 *  GET  /api/chat/welcome   - 초기 환영 메시지
 *  POST /api/chat/send      - 사용자 메시지 전송 → AI 응답 반환
 * 
 * WebSocket 엔드포인트:
 *  /app/chat.send    → /topic/chat 으로 브로드캐스트
 */
@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /**
     * 초기 환영 메시지 반환
     * 원본: ChatbotModal.tsx messages 초기 상태
     *
     * @return 환영 ChatMessage
     */
    @GetMapping("/welcome")
    public ResponseEntity<ChatMessage> getWelcomeMessage() {
        return ResponseEntity.ok(chatbotService.getWelcomeMessage());
    }

    /**
     * 사용자 메시지 전송 및 AI 응답 반환 (REST)
     * 원본: sendMessage() setTimeout(..., 600ms) (ChatbotModal.tsx)
     *
     * @param body { "text": "사용자 입력" }
     * @return AI 응답 ChatMessage
     */
    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, String> body) {
        String userText = body.getOrDefault("text", "");
        if (userText.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        ChatMessage aiResponse = chatbotService.generateAiResponse(userText);
        return ResponseEntity.ok(aiResponse);
    }
}
