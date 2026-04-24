package com.placeballspring.controller;

import com.placeballspring.model.ChatMessage;
import com.placeballspring.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ChatbotController - AI 챗봇 REST API
 *
 * 원본 ChatbotModal.tsx의 상태 관리 및 sendMessage 로직을
 * Spring Boot REST API로 변환합니다.
 *
 * 엔드포인트:
 *   GET    /api/chat/messages  - 채팅 히스토리 조회
 *   POST   /api/chat/send      - 메시지 전송 & AI 응답 수신
 *   DELETE /api/chat/reset     - 채팅 초기화
 */
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /**
     * 채팅 히스토리 전체 조회
     * GET /api/chat/messages
     *
     * 원본: const [messages, setMessages] = useState<Message[]>([...])
     */
    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages() {
        return ResponseEntity.ok(chatbotService.getMessages());
    }

    /**
     * 사용자 메시지 전송 & AI 응답
     * POST /api/chat/send
     * Body: { "text": "메시지 내용" }
     *
     * 원본:
     * const sendMessage = () => {
     *   setMessages((prev) => [...prev, userMsg]);
     *   setTimeout(() => {
     *     const aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
     *     setMessages((prev) => [...prev, aiMsg]);
     *   }, 600);
     * };
     */
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "메시지를 입력해주세요."));
        }

        ChatMessage aiResponse = chatbotService.sendMessage(text);
        if (aiResponse == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "메시지 처리 중 오류가 발생했습니다."));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "aiResponse", aiResponse,
                "messages", chatbotService.getMessages()
        ));
    }

    /**
     * 채팅 초기화
     * DELETE /api/chat/reset
     */
    @DeleteMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetChat() {
        chatbotService.resetChat();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "messages", chatbotService.getMessages()
        ));
    }
}
