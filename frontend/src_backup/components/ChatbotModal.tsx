/**
 * ChatbotModal - AI 전략 사령관 (미니멀 글래스모피즘)
 */
import { useState } from "react";

interface Message {
  id: number;
  sender: "ai" | "user";
  text: string;
  timestamp: Date;
}

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_RESPONSES = [
  "현재 KIA의 응원 화력이 매우 높습니다! 1루 응원석에 집중하면 더 큰 효과를 볼 수 있습니다.",
  "LG의 퀴즈 정답률이 92%로 상승했습니다. 우외야 구역에서 역습 기회가 있습니다!",
  "지금이 바로 응원 화력을 보낼 최적의 타이밍입니다. 중앙 내야 구역을 노려보세요!",
  "AI 분석 결과: KIA가 현재 우위입니다. 계속 응원 화력을 유지하세요!",
  "수다글 작성과 인증샷 업로드로 구역 점수를 높일 수 있습니다.",
  "퀴즈 정답률이 구역 점수에 큰 영향을 미칩니다. 야구 퀴즈에 도전해보세요!",
];

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: messages.length + 1,
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const aiText = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiMsg: Message = {
        id: messages.length + 2,
        sender: "ai",
        text: aiText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        right: 32,
        width: 300,
        height: 420,
        background: "rgba(20,30,50,0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        zIndex: 300,
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 13 }}>
          🤖 AI 명령
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 16,
            cursor: "pointer",
            padding: 0,
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          ✕
        </button>
      </div>

      {/* 메시지 영역 */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "9px 13px",
                borderRadius: msg.sender === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
                background:
                  msg.sender === "user"
                    ? "rgba(100,150,255,0.75)"
                    : "rgba(255,255,255,0.1)",
                color: "#FFFFFF",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          gap: 6,
          background: "rgba(0,0,0,0.1)",
        }}
      >
        <input
          type="text"
          placeholder="메시지..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: "7px 11px",
            color: "#FFFFFF",
            fontSize: 12,
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            background: "rgba(100,150,255,0.75)",
            border: "none",
            borderRadius: 6,
            padding: "7px 13px",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(100,150,255,0.95)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(100,150,255,0.75)";
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
