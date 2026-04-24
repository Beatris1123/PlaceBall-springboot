package com.placeballspring.service;

import com.placeballspring.model.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ChatbotService - AI 챗봇 비즈니스 로직
 *
 * 원본 React ChatbotModal.tsx 로직을 Spring Boot 서비스로 변환:
 * - AI_RESPONSES 배열
 * - sendMessage() 함수
 * - 메시지 히스토리 관리
 */
@Service
public class ChatbotService {

    private final Random random = new Random();
    private final AtomicInteger idCounter = new AtomicInteger(2);
    private final List<ChatMessage> messageHistory = new ArrayList<>();

    // 원본: const AI_RESPONSES = [...]
    private final String[] aiResponses = {
            "현재 KIA의 응원 화력이 매우 높습니다! 1루 응원석에 집중하면 더 큰 효과를 볼 수 있습니다.",
            "LG의 퀴즈 정답률이 92%로 상승했습니다. 우외야 구역에서 역습 기회가 있습니다!",
            "지금이 바로 응원 화력을 보낼 최적의 타이밍입니다. 중앙 내야 구역을 노려보세요!",
            "AI 분석 결과: KIA가 현재 우위입니다. 계속 응원 화력을 유지하세요!",
            "수다글 작성과 인증샷 업로드로 구역 점수를 높일 수 있습니다.",
            "퀴즈 정답률이 구역 점수에 큰 영향을 미칩니다. 야구 퀴즈에 도전해보세요!"
    };

    public ChatbotService() {
        // 초기 AI 웰컴 메시지
        messageHistory.add(new ChatMessage(
                1,
                "ai",
                "안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다."
        ));
    }

    /**
     * 메시지 전체 히스토리 조회
     */
    public List<ChatMessage> getMessages() {
        return new ArrayList<>(messageHistory);
    }

    /**
     * 사용자 메시지 전송 & AI 응답 생성
     * 원본: const sendMessage = () => { ... setTimeout(aiResponse, 600) }
     *
     * @param userText 사용자 입력 텍스트
     * @return AI 응답 메시지
     */
    public ChatMessage sendMessage(String userText) {
        if (userText == null || userText.trim().isEmpty()) {
            return null;
        }

        // 사용자 메시지 추가
        int userId = idCounter.getAndIncrement();
        ChatMessage userMsg = new ChatMessage(userId, "user", userText.trim());
        messageHistory.add(userMsg);

        // AI 응답 생성 (원본: Math.random() * AI_RESPONSES.length)
        String aiText = aiResponses[random.nextInt(aiResponses.length)];
        int aiId = idCounter.getAndIncrement();
        ChatMessage aiMsg = new ChatMessage(aiId, "ai", aiText);
        messageHistory.add(aiMsg);

        return aiMsg;
    }

    /**
     * 채팅 초기화
     */
    public void resetChat() {
        messageHistory.clear();
        idCounter.set(2);
        messageHistory.add(new ChatMessage(
                1,
                "ai",
                "안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다."
        ));
    }
}
