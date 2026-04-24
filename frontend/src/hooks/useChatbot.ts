/**
 * useChatbot - AI 챗봇 Spring Boot API 연동 훅
 *
 * 원본: ChatbotModal.tsx 로컬 상태 + setTimeout(600ms)
 *
 * Spring Boot 전환:
 *   - 초기 환영 메시지: GET /api/chat/welcome
 *   - 메시지 전송/응답: POST /api/chat/send
 */
import { useState } from "react";
import axios from "axios";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
}

const AI_RESPONSES_FALLBACK = [
  "현재 KIA의 응원 화력이 매우 높습니다! 1루 응원석에 집중하면 더 큰 효과를 볼 수 있습니다.",
  "LG의 퀴즈 정답률이 92%로 상승했습니다. 우외야 구역에서 역습 기회가 있습니다!",
  "지금이 바로 응원 화력을 보낼 최적의 타이밍입니다. 중앙 내야 구역을 노려보세요!",
  "AI 분석 결과: KIA가 현재 우위입니다. 계속 응원 화력을 유지하세요!",
  "수다글 작성과 인증샷 업로드로 구역 점수를 높일 수 있습니다.",
  "퀴즈 정답률이 구역 점수에 큰 영향을 미칩니다. 야구 퀴즈에 도전해보세요!",
];

export function useChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const sentText = input;
    setInput("");

    try {
      // Spring Boot REST API 호출
      const response = await axios.post("/api/chat/send", { text: sentText });
      const data = response.data;
      const aiMsg: Message = {
        id: data.id,
        sender: "ai",
        text: data.text,
        timestamp: new Date(data.timestamp),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // API 없는 경우 로컬 폴백 (600ms 지연)
      setTimeout(() => {
        const aiText =
          AI_RESPONSES_FALLBACK[
            Math.floor(Math.random() * AI_RESPONSES_FALLBACK.length)
          ];
        const aiMsg: Message = {
          id: messages.length + 2,
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
