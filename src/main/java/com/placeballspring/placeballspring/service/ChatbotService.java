package com.placeballspring.placeballspring.service;

import com.placeballspring.placeballspring.model.ChatMessage;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

/**
 * ChatbotService - AI 전략 챗봇 서비스
 * 
 * 원본 TypeScript 로직 (ChatbotModal.tsx):
 * const AI_RESPONSES = [
 *   "현재 KIA의 응원 화력이 매우 높습니다!...",
 *   "LG의 퀴즈 정답률이 92%로 상승했습니다...",
 *   ...
 * ];
 * 
 * 사용자 메시지 수신 → 600ms 지연 후 AI 응답 반환
 */
@Service
public class ChatbotService {

    private final Random random = new Random();
    private final AtomicLong idCounter = new AtomicLong(1);

    // ── AI 응답 목록 (원본 ChatbotModal.tsx AI_RESPONSES) ──
    private static final List<String> AI_RESPONSES = List.of(
        "현재 KIA의 응원 화력이 매우 높습니다! 1루 응원석에 집중하면 더 큰 효과를 볼 수 있습니다.",
        "LG의 퀴즈 정답률이 92%로 상승했습니다. 우외야 구역에서 역습 기회가 있습니다!",
        "지금이 바로 응원 화력을 보낼 최적의 타이밍입니다. 중앙 내야 구역을 노려보세요!",
        "AI 분석 결과: KIA가 현재 우위입니다. 계속 응원 화력을 유지하세요!",
        "수다글 작성과 인증샷 업로드로 구역 점수를 높일 수 있습니다.",
        "퀴즈 정답률이 구역 점수에 큰 영향을 미칩니다. 야구 퀴즈에 도전해보세요!"
    );

    /**
     * 초기 환영 메시지 생성
     * 원본: messages 초기값 (ChatbotModal.tsx)
     */
    public ChatMessage getWelcomeMessage() {
        return new ChatMessage(
            idCounter.getAndIncrement(),
            "ai",
            "안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.",
            LocalDateTime.now()
        );
    }

    /**
     * 사용자 메시지를 받아 AI 응답 생성
     * 원본: sendMessage() setTimeout(..., 600) (ChatbotModal.tsx)
     *
     * @param userText 사용자 입력 텍스트
     * @return AI 응답 ChatMessage
     */
    public ChatMessage generateAiResponse(String userText) {
        String aiText = AI_RESPONSES.get(random.nextInt(AI_RESPONSES.size()));
        return new ChatMessage(
            idCounter.getAndIncrement(),
            "ai",
            aiText,
            LocalDateTime.now()
        );
    }

    /**
     * 사용자 메시지 ChatMessage 객체 생성
     *
     * @param userText 사용자 입력 텍스트
     * @return 사용자 ChatMessage
     */
    public ChatMessage createUserMessage(String userText) {
        return new ChatMessage(
            idCounter.getAndIncrement(),
            "user",
            userText,
            LocalDateTime.now()
        );
    }
}
