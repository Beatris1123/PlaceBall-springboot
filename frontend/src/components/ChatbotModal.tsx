/**
 * ChatbotModal.tsx - AI 전략 사령관 (Spring Boot REST API 연동)
 *
 * 원본: baseballai-bicevcq9/client/src/components/ChatbotModal.tsx
 * 변경사항:
 *  - 로컬 useState + setTimeout → useChatbot 훅으로 분리
 *  - Spring Boot POST /api/chat/send 연동
 *  - 폴백: API 없을 시 로컬 랜덤 응답 (원본 동작 유지)
 */
import { useChatbot } from "@/hooks/useChatbot";

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const { messages, input, setInput, sendMessage } = useChatbot();

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
          AI 명령
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
          X
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
                borderRadius:
                  msg.sender === "user"
                    ? "12px 12px 3px 12px"
                    : "12px 12px 12px 3px",
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
