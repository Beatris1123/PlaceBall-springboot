/**
 * useChatbot - AI 챗봇 Spring Boot REST API 연동 훅
 *
 * 원본: ChatbotModal.tsx 로컬 상태 + setTimeout(600ms)
 *
 * Spring Boot 전환:
 *   - POST /api/chat/send → AI 응답 반환
 *   - Spring Boot 없이 standalone 실행 시 로컬 fallback (600ms 지연, 원본 동작 유지)
 */
import { useState } from "react";
import axios from "axios";

export interface ChatMessageItem {
  id: number;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
}

// 원본 ChatbotModal.tsx AI_RESPONSES 배열 그대로 유지
const AI_RESPONSES_FALLBACK = [
  "현재 KIA의 응원 화력이 매우 높습니다! 1루 응원석에 집중하면 더 큰 효과를 볼 수 있습니다.",
  "LG의 퀴즈 정답률이 92%로 상승했습니다. 우외야 구역에서 역습 기회가 있습니다!",
  "지금이 바로 응원 화력을 보낼 최적의 타이밍입니다. 중앙 내야 구역을 노려보세요!",
  "AI 분석 결과: KIA가 현재 우위입니다. 계속 응원 화력을 유지하세요!",
  "수다글 작성과 인증샷 업로드로 구역 점수를 높일 수 있습니다.",
  "퀴즈 정답률이 구역 점수에 큰 영향을 미칩니다. 야구 퀴즈에 도전해보세요!",
];

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 1,
      sender: "ai",
      text: "안녕하세요! AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessageItem = {
      id: Date.now(),
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const sentText = input;
    setInput("");

    try {
      // Spring Boot REST API 호출
      const response = await axios.post<{ id: number; sender: string; text: string; timestamp: string }>(
        "/api/chat/send",
        { text: sentText },
        { timeout: 3000 }
      );
      const data = response.data;
      const aiMsg: ChatMessageItem = {
        id: data.id,
        sender: "ai",
        text: data.text,
        timestamp: new Date(data.timestamp),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // API 없는 경우 로컬 폴백 (원본 600ms 지연)
      setTimeout(() => {
        const aiText =
          AI_RESPONSES_FALLBACK[Math.floor(Math.random() * AI_RESPONSES_FALLBACK.length)];
        const aiMsg: ChatMessageItem = {
          id: Date.now(),
          sender: "ai",
          text: aiText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }, 600);
    }
  };

  return { messages, input, setInput, sendMessage };
}
