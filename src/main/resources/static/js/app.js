/**
 * app.js — PLACEBALL 메인 애플리케이션 초기화 & DOM 바인딩
 *
 * 로딩 순서 (index.html 기준):
 *   1. api.js        → PlaceballAPI     (REST 호출)
 *   2. websocket.js  → PlaceballWS      (STOMP 구독)
 *   3. stadium-map.js→ StadiumMap       (Canvas 드로우)
 *   4. chatbot.js    → PlaceballChatbot (챗봇 UI)
 *   5. app.js        → 이 파일 (전체 오케스트레이션)
 *
 * 담당 기능:
 *   A. 초기 REST 데이터 로드 (GameController /api/game/state, /api/game/ticker)
 *   B. Zone 게이지 바 동적 생성 (#zone-gauges)
 *   C. 점수판 DOM 업데이트 (#kia-score, #lg-score)
 *   D. 티커 메시지 DOM 업데이트 (#ticker-msg) — 페이드 애니메이션 포함
 *   E. WebSocket 구독 콜백 연결 (GameService @Scheduled 2s / 4s)
 *   F. KIA/LG 사이드 위젯 활기도·효율 표시
 *   G. "직관" 버튼 더미 핸들러
 */

// Zone 한국어 라벨 (GameService.java 코멘트와 동일)
const ZONE_LABELS = {
  0: '1루 응원석',
  1: '중앙 내야',
  2: '3루 응원석',
  3: '좌외야',
  4: '중외야',
  5: '우외야',
};

/** DOMContentLoaded 이후 진입점 */
document.addEventListener('DOMContentLoaded', async () => {

  // ── A. 초기 REST 데이터 로드 ──────────────────────────────────────
  let initialState = null;

  try {
    // GameController GET /api/game/state
    // GameState.java: { zones:[Zone], kiaScore, lgScore }
    initialState = await PlaceballAPI.fetchGameState();

    _updateScores(initialState.kiaScore, initialState.lgScore);
    _renderZoneGauges(initialState.zones);
    StadiumMap.draw(initialState.zones);
    _updateSideWidgets(initialState.zones);

  } catch (e) {
    console.warn('[App] 초기 게임 상태 로드 실패 (백엔드 미연결?), 기본값 사용:', e);
    // 백엔드 미연결 시 GameService 초기값으로 폴백
    initialState = _defaultGameState();
    _updateScores(initialState.kiaScore, initialState.lgScore);
    _renderZoneGauges(initialState.zones);
    StadiumMap.draw(initialState.zones);
    _updateSideWidgets(initialState.zones);
  }

  try {
    // GameController GET /api/game/ticker
    // TickerMessage.java: { team:"KIA"|"LG", msg:"..." }
    const ticker = await PlaceballAPI.fetchTicker();
    _updateTicker(ticker.msg);
  } catch (e) {
    console.warn('[App] 초기 티커 로드 실패:', e);
  }

  // ── B. 챗봇 초기화 ─────────────────────────────────────────────────
  // ChatbotController GET /api/chat/welcome → 환영 메시지
  await PlaceballChatbot.init();

  // ── C. WebSocket 연결 ──────────────────────────────────────────────
  // WebSocketConfig.java: /ws SockJS endpoint
  PlaceballWS.connect(
    // /topic/gamestate → GameService @Scheduled(2s)
    // payload: GameState { zones, kiaScore, lgScore }
    function onGameState(gameState) {
      _updateScores(gameState.kiaScore, gameState.lgScore);
      _updateZoneGauges(gameState.zones);
      StadiumMap.update(gameState.zones);
      _updateSideWidgets(gameState.zones);
    },

    // /topic/ticker → GameService @Scheduled(4s)
    // payload: TickerMessage { team, msg }
    function onTicker(ticker) {
      _updateTicker(ticker.msg);
    }
  );

  // ── D. "직관" 버튼 ─────────────────────────────────────────────────
  document.getElementById('diary-btn')?.addEventListener('click', () => {
    alert('⚾ 직관 일기 기능은 준비 중입니다!');
  });

});

// ─────────────────────────────────────────────────────────────────────
// DOM 업데이트 함수들
// ─────────────────────────────────────────────────────────────────────

/**
 * 점수판 DOM 업데이트
 * GameState.java: kiaScore, lgScore
 * @param {number} kia
 * @param {number} lg
 */
function _updateScores(kia, lg) {
  const kiaEl = document.getElementById('kia-score');
  const lgEl  = document.getElementById('lg-score');
  if (kiaEl) kiaEl.textContent = kia.toLocaleString();
  if (lgEl)  lgEl.textContent  = lg.toLocaleString();
}

/**
 * Zone 게이지 바 동적 생성 (최초 1회)
 * Zone.java: { id, owner, occupationRate }
 * @param {Array<{id:number,owner:string,occupationRate:number}>} zones
 */
function _renderZoneGauges(zones) {
  const container = document.getElementById('zone-gauges');
  if (!container) return;

  container.innerHTML = '';  // 기존 내용 초기화

  zones.forEach(zone => {
    const label  = ZONE_LABELS[zone.id] || `구역 ${zone.id}`;
    const owner  = zone.owner;  // "kia" | "lg" | "neutral"
    const rate   = zone.occupationRate;

    const row = document.createElement('div');
    row.className  = 'zone-gauge-row';
    row.dataset.zoneId = zone.id;

    // 라벨
    const labelEl = document.createElement('div');
    labelEl.className   = 'zone-gauge-row__label';
    labelEl.textContent = label;

    // 바 래퍼
    const barWrap = document.createElement('div');
    barWrap.className = 'zone-gauge-row__bar-wrap';

    // 바 채움
    const bar = document.createElement('div');
    bar.className = `zone-gauge-row__bar zone-gauge-row__bar--${owner}`;
    bar.style.width = `${rate}%`;

    barWrap.appendChild(bar);

    // 퍼센트 텍스트
    const pctEl = document.createElement('div');
    pctEl.className   = 'zone-gauge-row__pct';
    pctEl.textContent = `${rate}%`;

    row.appendChild(labelEl);
    row.appendChild(barWrap);
    row.appendChild(pctEl);

    container.appendChild(row);
  });
}

/**
 * Zone 게이지 바 실시간 업데이트 (WebSocket 수신 시)
 * @param {Array<{id:number,owner:string,occupationRate:number}>} zones
 */
function _updateZoneGauges(zones) {
  zones.forEach(zone => {
    const row = document.querySelector(`.zone-gauge-row[data-zone-id="${zone.id}"]`);
    if (!row) return;

    const bar   = row.querySelector('.zone-gauge-row__bar');
    const pctEl = row.querySelector('.zone-gauge-row__pct');

    if (bar)   bar.style.width     = `${zone.occupationRate}%`;
    if (pctEl) pctEl.textContent   = `${zone.occupationRate}%`;
  });
}

/**
 * 티커 메시지 DOM 페이드 업데이트
 * GameService @Scheduled(4s) → /topic/ticker → TickerMessage { team, msg }
 * @param {string} msg
 */
function _updateTicker(msg) {
  const el = document.getElementById('ticker-msg');
  if (!el) return;

  // 페이드 아웃 → 텍스트 교체 → 페이드 인
  el.classList.add('fade-out');
  setTimeout(() => {
    el.textContent = msg;
    el.classList.remove('fade-out');
    el.classList.add('fade-in');
    setTimeout(() => el.classList.remove('fade-in'), 400);
  }, 400);
}

/**
 * 사이드 위젯 활기도(KIA) · 효율(LG) 실시간 업데이트
 * Zone owner="kia" 구역의 평균 점령률 → KIA 활기도
 * Zone owner="lg"  구역의 평균 점령률 → LG 효율
 * @param {Array<{id:number,owner:string,occupationRate:number}>} zones
 */
function _updateSideWidgets(zones) {
  const kiaZones = zones.filter(z => z.owner === 'kia');
  const lgZones  = zones.filter(z => z.owner === 'lg');

  if (kiaZones.length > 0) {
    const avg = Math.round(kiaZones.reduce((s, z) => s + z.occupationRate, 0) / kiaZones.length);
    const el  = document.getElementById('kia-vitality');
    if (el) el.textContent = avg;
  }

  if (lgZones.length > 0) {
    const avg = Math.round(lgZones.reduce((s, z) => s + z.occupationRate, 0) / lgZones.length);
    const el  = document.getElementById('lg-efficiency');
    if (el) el.textContent = avg;
  }
}

/**
 * 백엔드 미연결 시 폴백 기본값
 * GameService.java 초기값과 동일
 */
function _defaultGameState() {
  return {
    zones: [
      { id: 0, owner: 'kia', occupationRate: 76 },
      { id: 1, owner: 'lg',  occupationRate: 72 },
      { id: 2, owner: 'lg',  occupationRate: 68 },
      { id: 3, owner: 'kia', occupationRate: 61 },
      { id: 4, owner: 'lg',  occupationRate: 72 },
      { id: 5, owner: 'lg',  occupationRate: 81 },
    ],
    kiaScore: 3171,
    lgScore:  2862,
  };
}
