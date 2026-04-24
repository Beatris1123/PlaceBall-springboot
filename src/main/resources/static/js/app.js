/**
 * app.js - PLACEBALL 메인 애플리케이션 로직
 * 원본: client/src/pages/Home.tsx + client/src/components/ChatbotModal.tsx
 * 변환: Vanilla JS (React useState/useEffect → DOM 조작 + WebSocket)
 */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   앱 상태 (원본 React useState)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let state = {
  // 원본: const [zones, setZones] = useState(INITIAL_ZONES)
  zones: [
    { id: 0, owner: 'kia', occupationRate: 76 },
    { id: 1, owner: 'lg',  occupationRate: 72 },
    { id: 2, owner: 'lg',  occupationRate: 68 },
    { id: 3, owner: 'kia', occupationRate: 61 },
    { id: 4, owner: 'lg',  occupationRate: 72 },
    { id: 5, owner: 'lg',  occupationRate: 81 },
  ],
  // 원본: const [kiaScore, setKiaScore] = useState(3171)
  kiaScore: 3171,
  // 원본: const [lgScore, setLgScore] = useState(2862)
  lgScore: 2862,
  // 원본: const [chatOpen, setChatOpen] = useState(false)
  chatOpen: false,
  // 원본: const [tickerIdx, setTickerIdx] = useState(0)
  tickerIdx: 0,
  // 원본: const [showHint, setShowHint] = useState(true)
  showHint: true,
  // 챗봇 메시지 ID 카운터
  chatMsgId: 2,
};

// 원본 TICKER_MESSAGES 배열
const TICKER_MESSAGES = [
  { team: 'KIA', msg: '현재 KIA 팬들의 응원 화력이 급증 중입니다!' },
  { team: 'LG',  msg: 'LG의 퀴즈 정답률이 92%로 상승했습니다!' },
  { team: 'KIA', msg: 'KIA 1루 응원석 점령률 76% 돌파!' },
  { team: 'LG',  msg: 'LG 우외야 구역 역습 포인트 +129 적립!' },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DOM 업데이트 함수들
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * 점수판 업데이트
 * 원본: setKiaScore / setLgScore → score.toLocaleString()
 */
function updateScoreboard() {
  document.getElementById('kia-score').textContent = state.kiaScore.toLocaleString('ko-KR');
  document.getElementById('lg-score').textContent  = state.lgScore.toLocaleString('ko-KR');
}

/**
 * 구역 게이지 업데이트 (원본 zones.map())
 */
function updateZoneGauges() {
  const container = document.getElementById('zone-gauges');
  if (!container) return;

  container.innerHTML = state.zones.map(zone => `
    <div class="zone-gauge-row">
      <div class="zone-gauge-label">
        ${zone.owner === 'kia' ? '🔴' : '🔵'} 구역${zone.id + 1}
      </div>
      <div class="zone-gauge-track">
        <div
          class="zone-gauge-fill ${zone.owner}"
          style="width: ${zone.occupationRate}%"
        ></div>
      </div>
      <div class="zone-gauge-pct">${zone.occupationRate}%</div>
    </div>
  `).join('');
}

/**
 * 캔버스 맵 + 게이지 동시 업데이트
 */
function updateMap() {
  drawStadiumDiamondMap(state.zones);
  updateZoneGauges();
}

/**
 * 티커 메시지 업데이트
 * 원본: setTickerIdx(i => (i + 1) % TICKER_MESSAGES.length)
 */
function updateTicker() {
  const ticker = TICKER_MESSAGES[state.tickerIdx];
  document.getElementById('ticker-text').textContent = ticker.msg;
}

/**
 * 챗봇 말풍선 힌트 토글
 * 원본: setShowHint(prev => !prev) (3초 간격)
 */
function updateHint() {
  const hint = document.getElementById('chat-hint');
  if (!hint) return;
  if (state.showHint) {
    hint.classList.remove('hidden');
    hint.classList.add('visible');
  } else {
    hint.classList.remove('visible');
    hint.classList.add('hidden');
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   WebSocket 연결 (Spring Boot STOMP)
   서버에서 2초마다 브로드캐스트된 GameState 수신
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function connectWebSocket() {
  try {
    const socket = new SockJS('/ws');
    const stompClient = Stomp.over(socket);

    // 연결 로그 숨기기
    stompClient.debug = null;

    stompClient.connect({}, function () {
      // /topic/gamestate 구독 (GameService.updateGameState()가 브로드캐스트)
      stompClient.subscribe('/topic/gamestate', function (message) {
        const gameState = JSON.parse(message.body);
        applyGameState(gameState);
      });
    }, function (error) {
      // WebSocket 연결 실패 시 폴백: REST API 폴링
      console.warn('WebSocket 연결 실패, REST 폴링으로 전환:', error);
      startRestPolling();
    });
  } catch (e) {
    console.warn('WebSocket 초기화 실패:', e);
    startRestPolling();
  }
}

/**
 * 서버에서 받은 GameState 적용
 * 원본 React setState 일괄 처리와 동일
 */
function applyGameState(gameState) {
  if (gameState.kiaScore)  state.kiaScore = gameState.kiaScore;
  if (gameState.lgScore)   state.lgScore  = gameState.lgScore;
  if (gameState.zones)     state.zones    = gameState.zones;

  updateScoreboard();
  updateMap();
}

/**
 * REST 폴링 폴백 (WebSocket 불가 시)
 * 원본 React setInterval 2000ms 동작 대체
 */
function startRestPolling() {
  setInterval(async () => {
    try {
      const res = await fetch('/api/gamestate');
      if (res.ok) {
        const gameState = await res.json();
        applyGameState(gameState);
      }
    } catch (e) {
      // 조용히 무시
    }
  }, 2000);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   챗봇 기능 (원본 ChatbotModal.tsx)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * 채팅 모달 열기/닫기 토글
 * 원본: setChatOpen(!chatOpen)
 */
function toggleChat() {
  state.chatOpen = !state.chatOpen;
  const modal = document.getElementById('chatbot-modal');
  if (state.chatOpen) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

/**
 * 채팅 메시지 추가 (원본 setMessages(prev => [...prev, msg]))
 */
function appendChatMessage(sender, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  div.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
  container.appendChild(div);

  // 자동 스크롤
  container.scrollTop = container.scrollHeight;
}

/**
 * 메시지 전송 (원본 sendMessage())
 * 원본:
 *   const userMsg = { id, sender: "user", text: input, timestamp: new Date() };
 *   setMessages(prev => [...prev, userMsg]);
 *   setTimeout(() => {
 *     const aiText = AI_RESPONSES[random];
 *     const aiMsg  = { id, sender: "ai", text: aiText, timestamp: new Date() };
 *     setMessages(prev => [...prev, aiMsg]);
 *   }, 600);
 */
async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text  = input ? input.value.trim() : '';
  if (!text) return;

  // 유저 메시지 표시
  appendChatMessage('user', text);
  input.value = '';

  // 600ms 후 AI 응답 (원본 setTimeout 600ms 동일)
  setTimeout(async () => {
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const aiMsg = await res.json();
        appendChatMessage('ai', aiMsg.text);
      }
    } catch (e) {
      appendChatMessage('ai', 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, 600);
}

/**
 * HTML 이스케이프 (XSS 방지)
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   초기화 (원본 React 마운트 시 useEffect 처리)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.addEventListener('DOMContentLoaded', async function () {

  // 1. 초기 렌더링
  updateScoreboard();
  updateMap();
  updateTicker();

  // 2. 서버에서 초기 상태 로드
  try {
    const res = await fetch('/api/gamestate');
    if (res.ok) {
      const gameState = await res.json();
      applyGameState(gameState);
    }
  } catch (e) {
    console.warn('초기 상태 로드 실패, 기본값 사용');
  }

  // 3. 챗봇 초기 메시지 로드
  try {
    const res = await fetch('/api/chat/welcome');
    if (res.ok) {
      const welcomeMsg = await res.json();
      appendChatMessage('ai', welcomeMsg.text);
    }
  } catch (e) {
    // 초기 메시지 기본값
    appendChatMessage(
      'ai',
      '안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.'
    );
  }

  // 4. WebSocket 연결 (실시간 업데이트)
  connectWebSocket();

  // 5. 티커 순환 (원본 setInterval 4000ms)
  setInterval(() => {
    state.tickerIdx = (state.tickerIdx + 1) % TICKER_MESSAGES.length;
    updateTicker();
  }, 4000);

  // 6. 챗봇 말풍선 토글 (원본 setInterval 3000ms)
  setInterval(() => {
    state.showHint = !state.showHint;
    updateHint();
  }, 3000);
});
