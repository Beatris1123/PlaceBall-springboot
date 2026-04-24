package com.placeball.app.controller;

import com.placeball.app.model.ChatMessage;
import com.placeball.app.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * ChatbotController - AI 챗봇 REST API
 * 원본 ChatbotModal.tsx:
 *   const sendMessage = () => {
 *     const userMsg = { id, sender: "user", text: input, timestamp: new Date() };
 *     setTimeout(() => {
 *       const aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
 *       const aiMsg  = { id, sender: "ai", text: aiText, timestamp: new Date() };
 *     }, 600);
 *   };
 */
@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /**
     * GET /api/chat/welcome - 초기 AI 인사 메시지
     */
    @GetMapping("/welcome")
    public ResponseEntity<ChatMessage> getWelcomeMessage() {
        return ResponseEntity.ok(chatbotService.getWelcomeMessage());
    }

    /**
     * POST /api/chat/send - 유저 메시지 전송 → AI 응답 반환
     * 요청 Body: { "text": "..." }
     */
    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, String> body) {
        String userText = body.getOrDefault("text", "");

        if (userText.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // AI 응답 생성 (원본 600ms setTimeout 대신 즉시 응답, 지연은 프론트엔드 처리)
        ChatMessage aiResponse = chatbotService.generateAiResponse(userText);
        return ResponseEntity.ok(aiResponse);
    }
}
