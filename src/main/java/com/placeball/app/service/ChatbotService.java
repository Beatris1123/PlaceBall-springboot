package com.placeball.app.service;

import com.placeball.app.model.ChatMessage;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ChatbotService - AI 챗봇 응답 서비스
 * 원본 TypeScript:
 * const AI_RESPONSES = [
 *   "현재 KIA의 응원 화력이 매우 높습니다! ...",
 *   "LG의 퀴즈 정답률이 92%로 상승했습니다. ...",
 *   ...
 * ];
 * const aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
 */
@Service
public class ChatbotService {

    private final Random random = new Random();
    private final AtomicInteger messageIdCounter = new AtomicInteger(1);

    // 원본 AI_RESPONSES 배열
    private static final List<String> AI_RESPONSES = List.of(
        "현재 KIA의 응원 화력이 매우 높습니다! 1루 응원석에 집중하면 더 큰 효과를 볼 수 있습니다.",
        "LG의 퀴즈 정답률이 92%로 상승했습니다. 우외야 구역에서 역습 기회가 있습니다!",
        "지금이 바로 응원 화력을 보낼 최적의 타이밍입니다. 중앙 내야 구역을 노려보세요!",
        "AI 분석 결과: KIA가 현재 우위입니다. 계속 응원 화력을 유지하세요!",
        "수다글 작성과 인증샷 업로드로 구역 점수를 높일 수 있습니다.",
        "퀴즈 정답률이 구역 점수에 큰 영향을 미칩니다. 야구 퀴즈에 도전해보세요!"
    );

    /**
     * 초기 AI 인사 메시지 (원본 useState 초기값)
     */
    public ChatMessage getWelcomeMessage() {
        return new ChatMessage(
            1,
            "ai",
            "안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.",
            LocalDateTime.now()
        );
    }

    /**
     * 유저 메시지에 대한 AI 응답 생성
     * 원본: const aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
     */
    public ChatMessage generateAiResponse(String userText) {
        String aiText = AI_RESPONSES.get(random.nextInt(AI_RESPONSES.size()));
        return new ChatMessage(
            messageIdCounter.incrementAndGet(),
            "ai",
            aiText,
            LocalDateTime.now()
        );
    }

    public int nextMessageId() {
        return messageIdCounter.incrementAndGet();
    }
}
