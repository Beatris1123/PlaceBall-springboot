/*
 * Home.tsx - PLACEBALL: 사용자 관점의 세련된 전문 대시보드
 * 디자인: 초슬림 상단바 + 가독성 중심 글래스모피즘 + 원본 일러스트
 *
 * Spring Boot 전환:
 *  - 로컬 useState + setInterval → useGameState 훅 (REST API + WebSocket)
 *  - ChatbotModal → useChatbot 훅 (REST API)
 */
import { useState, useEffect } from "react";
import StadiumDiamondMap from "@/components/StadiumDiamondMap";
import ChatbotModal from "@/components/ChatbotModal";
import { useGameState } from "@/hooks/useGameState";

// 일러스트 CDN URL (새로운 배경)
const ILLUSTRATION_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663555046363/MNHzhWkk75iGVRjusfbvzN/Gemini_Generated_Image_t2t6jzt2t6jzt2t6_5ac76708.png";

export default function Home() {
  // Spring Boot WebSocket/REST API 연동 훅
  const { zones, kiaScore, lgScore, ticker } = useGameState();

  const [chatOpen, setChatOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // 챗봇 말풍선 애니메이션 (원본 유지)
  useEffect(() => {
    const hintInterval = setInterval(() => {
      setShowHint((prev) => !prev);
    }, 3000);
    return () => clearInterval(hintInterval);
  }, []);

  const kiaOccupation = zones
    .filter((z) => z.owner === "kia")
    .reduce((sum, z) => sum + z.occupationRate, 0) /
    Math.max(1, zones.filter((z) => z.owner === "kia").length);
  const lgOccupation = zones
    .filter((z) => z.owner === "lg")
    .reduce((sum, z) => sum + z.occupationRate, 0) /
    Math.max(1, zones.filter((z) => z.owner === "lg").length);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.10)), 
                     url('${ILLUSTRATION_URL}') center / cover fixed no-repeat`,
        backgroundBlendMode: "multiply",
        color: "#FFFFFF",
        fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── 초슬림 상단 헤더 ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          height: 70,
          background: "#FFFFFF",
          borderBottom: "1px solid #EEEEEE",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          zIndex: 10,
        }}
      >
        {/* 로고 */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color: "#1A1A1A",
          }}
        >
          PLACEBALL
        </div>

        {/* 중앙 점수판 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* KIA 점수 */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 5,
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 11, color: "#333333" }}>🔴</span>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  fontFamily: "'Courier New', monospace",
                  color: "#DC3250",
                  lineHeight: 1,
                  letterSpacing: "0.05em",
                }}
              >
                {kiaScore.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                fontSize: 8,
                color: "#DC3250",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              KIA
            </div>
          </div>

          {/* LG 점수 */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 5,
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 11, color: "#333333" }}>🔵</span>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  fontFamily: "'Courier New', monospace",
                  color: "#3278C8",
                  lineHeight: 1,
                  letterSpacing: "0.05em",
                }}
              >
                {lgScore.toLocaleString()}
              </div>
            </div>
            <div
              style={{
                fontSize: 8,
                color: "#3278C8",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              LG
            </div>
          </div>
        </div>

        {/* 우측 직관 다이어리 (Ghost Button) */}
        <button
          style={{
            background: "rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 5,
            padding: "6px 12px",
            color: "#1A1A1A",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.04)";
          }}
        >
          📅 직관
        </button>
      </header>

      {/* ── 메인 콘텐츠 ── */}
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 20,
          padding: "24px 40px",
          overflow: "hidden",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        {/* ── 좌측 위젯: KIA 응원 지표 ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.28)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflow: "auto",
            width: "fit-content",
            maxWidth: "100%",
            height: "fit-content",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: "#1A1A1A", letterSpacing: "0.1em" }}>
            🔴 KIA TIGERS
          </div>

          {/* 수다글 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "#1A1A1A" }}>💬 수다글</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1 }}>2,847</div>
            <div style={{ fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>평균 업로드</div>
          </div>

          {/* 인증샷 속도 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "#1A1A1A" }}>📸 인증샷 속도</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1 }}>0.8</div>
            <div style={{ fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>초/건</div>
          </div>

          {/* 활기도 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "#1A1A1A" }}>🔥 활기도</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1 }}>89</div>
            <div style={{ fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>현재 수준</div>
          </div>
        </div>

        {/* ── 중앙 위젯: 점령 맵 (도면 느낌) ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
            width: "280px",
            height: "auto",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <StadiumDiamondMap zones={zones} />
          </div>
          
          {/* 관람석별 응원 게이지 */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
            {zones.map((zone) => (
              <div key={zone.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "#1A1A1A", minWidth: "40px" }}>
                  {zone.owner === "kia" ? "🔴" : "🔵"} 구역{zone.id + 1}
                </div>
                <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "3px", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${zone.occupationRate}%`,
                      background: zone.owner === "kia" ? "rgba(220,50,80,0.8)" : "rgba(50,120,200,0.8)",
                      borderRadius: "3px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#1A1A1A", minWidth: "30px", textAlign: "right" }}>
                  {zone.occupationRate}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 우측 위젯: LG 전략 지표 ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.28)",
            backdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflow: "auto",
            width: "fit-content",
            maxWidth: "100%",
            height: "fit-content",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: "#1A1A1A", letterSpacing: "0.1em" }}>
            🔵 LG TWINS
          </div>

          {/* 퀴즈 정답률 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "#1A1A1A" }}>❓ 퀴즈 정답률</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1 }}>92</div>
            <div style={{ fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>%</div>
          </div>

          {/* 역습 포인트 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "#1A1A1A" }}>⚡ 역습 포인트</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1 }}>+129</div>
            <div style={{ fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>누적</div>
          </div>

          {/* 효율 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: "#1A1A1A" }}>📈 효율</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#FFFFFF", lineHeight: 1 }}>78</div>
            <div style={{ fontSize: 9, fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>%</div>
          </div>
        </div>
      </main>

      {/* ── 하단 AI 브리핑 (LIVE 티커) ── */}
      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 40px",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          fontSize: 13,
          fontWeight: 500,
          color: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: "#FF3333",
            animation: "blink 1s infinite",
            letterSpacing: "0.15em",
            whiteSpace: "nowrap",
          }}
        >
          LIVE
        </div>
        <span style={{ fontSize: 14, whiteSpace: "nowrap" }}>🤖</span>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
          {ticker.msg}
        </div>

        <style>{`
          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0.4; }
          }
        `}</style>
      </footer>

      {/* ── AI 챗봇 플로팅 버튼 ── */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 50,
        }}
      >
        {/* 말풍선 힌트 */}
        {showHint && (
          <div
            style={{
              position: "absolute",
              bottom: 80,
              right: 0,
              background: "rgba(0,0,0,0.8)",
              color: "#FFFFFF",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: "nowrap",
              animation: "fadeInOut 0.3s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            전략 분석을 시작할까요?
          </div>
        )}

        {/* 챗봇 버튼 */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#3278C8",
            border: "none",
            color: "#FFFFFF",
            fontSize: 24,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(50,120,200,0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(50,120,200,0.6)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(50,120,200,0.4)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          🤖
        </button>

        <style>{`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>

      {/* ── 챗봇 모달 ── */}
      <ChatbotModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
