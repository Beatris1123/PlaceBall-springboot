/**
 * app.js - PlaceBall 메인 애플리케이션 로직
 *
 * 원본 변환:
 *   - client/src/pages/Home.tsx  → 상태 관리 + UI 업데이트
 *   - client/src/components/ChatbotModal.tsx → 채팅 로직
 *   - client/src/App.tsx → 라우팅 (단순 SPA)
 *
 * Spring Boot REST API 연동:
 *   POST /api/score/refresh → 2초마다 점수 & 구역 갱신
 *   POST /api/chat/send    → 챗봇 메시지 전송
 */

'use strict';

// ── 상태 (원본 React useState) ─────────────────────────────
const state = {
  zones: [
    { id: 0, owner: 'kia', occupationRate: 76 },
    { id: 1, owner: 'lg',  occupationRate: 72 },
    { id: 2, owner: 'lg',  occupationRate: 68 },
    { id: 3, owner: 'kia', occupationRate: 61 },
    { id: 4, owner: 'lg',  occupationRate: 72 },
    { id: 5, owner: 'lg',  occupationRate: 81 }
  ],
  kiaScore:  3171,
  lgScore:   2862,
  chatOpen:  false,
  tickerIdx: 0,
  showHint:  true
};

// 원본: const TICKER_MESSAGES = [...]
const TICKER_MESSAGES = [
  { team: 'KIA', msg: '현재 KIA 팬들의 응원 화력이 급증 중입니다!' },
  { team: 'LG',  msg: 'LG의 퀴즈 정답률이 92%로 상승했습니다!' },
  { team: 'KIA', msg: 'KIA 1루 응원석 점령률 76% 돌파!' },
  { team: 'LG',  msg: 'LG 우외야 구역 역습 포인트 +129 적립!' }
];

// ── DOM 요소 캐싱 ────────────────────────────────────────────
const els = {
  kiaScore:    () => document.getElementById('kia-score'),
  lgScore:     () => document.getElementById('lg-score'),
  tickerMsg:   () => document.getElementById('ticker-msg'),
  chatModal:   () => document.getElementById('chatbot-modal'),
  chatHint:    () => document.getElementById('chatbot-hint'),
  chatInput:   () => document.getElementById('chat-input'),
  chatMessages: () => document.getElementById('chat-messages')
};

// ── UI 업데이트 함수 ─────────────────────────────────────────

/**
 * 점수 업데이트
 * 원본: {kiaScore.toLocaleString()} / {lgScore.toLocaleString()}
 */
function updateScores(kia, lg) {
  const kiaEl = els.kiaScore();
  const lgEl  = els.lgScore();
  if (kiaEl) kiaEl.textContent = kia.toLocaleString();
  if (lgEl)  lgEl.textContent  = lg.toLocaleString();
}

/**
 * 티커 메시지 업데이트
 * 원본: const ticker = TICKER_MESSAGES[tickerIdx]
 */
function updateTicker(msg) {
  const el = els.tickerMsg();
  if (el) el.textContent = msg;
}

/**
 * 전체 UI 렌더링
 * 원본: return (<div>...</div>) in Home.tsx
 */
function renderAll() {
  updateScores(state.kiaScore, state.lgScore);
  drawStadiumDiamondMap(state.zones);   // stadium.js
  updateZoneGauges(state.zones);        // stadium.js
  updateTicker(TICKER_MESSAGES[state.tickerIdx].msg);
}

// ── Spring Boot API 호출 ──────────────────────────────────────

/**
 * 점수 & 구역 갱신 요청
 * 원본: setInterval(..., 2000) in useEffect
 * → POST /api/score/refresh
 */
async function refreshScoreFromServer() {
  try {
    const res = await fetch('/api/score/refresh', { method: 'POST' });
    if (!res.ok) throw new Error('서버 응답 오류: ' + res.status);

    const data = await res.json();

    // 상태 업데이트
    state.kiaScore = data.kiaScore;
    state.lgScore  = data.lgScore;
    state.zones    = data.zones;

    // 티커 메시지 (서버에서 받거나 로컬 순환)
    if (data.tickerMessage) {
      updateTicker(data.tickerMessage);
    }

    // Canvas & Gauges 재렌더링
    drawStadiumDiamondMap(state.zones);
    updateZoneGauges(state.zones);
    updateScores(state.kiaScore, state.lgScore);

  } catch (err) {
    // API 실패 시 로컬 시뮬레이션 (fallback)
    state.kiaScore += Math.floor(Math.random() * 5);
    state.lgScore  += Math.floor(Math.random() * 4);
    state.zones = state.zones.map((z) => ({
      ...z,
      occupationRate: Math.min(99, Math.max(1,
        z.occupationRate + (Math.random() > 0.5 ? 1 : -1)))
    }));
    drawStadiumDiamondMap(state.zones);
    updateZoneGauges(state.zones);
    updateScores(state.kiaScore, state.lgScore);
  }
}

// ── 챗봇 ─────────────────────────────────────────────────────

/**
 * 챗봇 모달 토글
 * 원본: setChatOpen(!chatOpen)
 */
function toggleChat() {
  state.chatOpen = !state.chatOpen;
  const modal = els.chatModal();
  if (modal) {
    if (state.chatOpen) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  }
}

/**
 * 채팅 메시지 추가 (DOM)
 * 원본: setMessages((prev) => [...prev, msg])
 *
 * @param {'ai'|'user'} sender
 * @param {string} text
 */
function appendChatMessage(sender, text) {
  const container = els.chatMessages();
  if (!container) return;

  const row = document.createElement('div');
  row.className = `msg-row ${sender}`;

  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${sender}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  container.appendChild(row);

  // 스크롤 하단 이동
  container.scrollTop = container.scrollHeight;
}

/**
 * 메시지 전송
 * 원본: const sendMessage = () => { ... } in ChatbotModal.tsx
 * → POST /api/chat/send
 */
async function sendChatMessage() {
  const input = els.chatInput();
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // 사용자 메시지 즉시 표시
  appendChatMessage('user', text);
  input.value = '';

  try {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error('채팅 서버 응답 오류: ' + res.status);

    const data = await res.json();

    // AI 응답 표시 (원본: setTimeout 600ms)
    setTimeout(() => {
      if (data.aiResponse && data.aiResponse.text) {
        appendChatMessage('ai', data.aiResponse.text);
      }
    }, 600);

  } catch (err) {
    // API 실패 시 로컬 폴백 응답
    const fallbackResponses = [
      '현재 KIA의 응원 화력이 매우 높습니다! 1루 응원석에 집중하면 더 큰 효과를 볼 수 있습니다.',
      'LG의 퀴즈 정답률이 92%로 상승했습니다. 우외야 구역에서 역습 기회가 있습니다!',
      'AI 분석 결과: 계속 응원 화력을 유지하세요!',
      '수다글 작성과 인증샷 업로드로 구역 점수를 높일 수 있습니다.'
    ];
    setTimeout(() => {
      const aiText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      appendChatMessage('ai', aiText);
    }, 600);
  }
}

// ── 챗봇 힌트 애니메이션 ────────────────────────────────────

/**
 * 챗봇 말풍선 힌트 표시/숨김 토글
 * 원본: setInterval(() => setShowHint((prev) => !prev), 3000)
 */
function toggleHint() {
  state.showHint = !state.showHint;
  const hint = els.chatHint();
  if (hint) {
    hint.style.display = state.showHint ? 'block' : 'none';
  }
}

// ── 티커 순환 ─────────────────────────────────────────────────

/**
 * 티커 메시지 순환
 * 원본: setInterval(() => setTickerIdx((i) => (i + 1) % TICKER_MESSAGES.length), 4000)
 */
function cycleTicker() {
  state.tickerIdx = (state.tickerIdx + 1) % TICKER_MESSAGES.length;
  updateTicker(TICKER_MESSAGES[state.tickerIdx].msg);
}

// ── 초기화 & 인터벌 설정 ──────────────────────────────────────

/**
 * 앱 초기화
 * 원본: useEffect 등록 in Home.tsx
 */
function init() {
  // 초기 렌더링
  renderAll();

  // 2초마다 점수 & 구역 갱신 (서버 API 호출)
  // 원본: setInterval(..., 2000)
  setInterval(refreshScoreFromServer, 2000);

  // 4초마다 티커 순환
  // 원본: setInterval(..., 4000)
  setInterval(cycleTicker, 4000);

  // 3초마다 힌트 토글
  // 원본: setInterval(() => setShowHint(...), 3000)
  setInterval(toggleHint, 3000);
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', init);
