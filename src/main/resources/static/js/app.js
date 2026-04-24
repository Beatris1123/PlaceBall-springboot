/**
 * app.js — PLACEBALL 메인 진입점 (모든 모듈 초기화 + DOM 바인딩)
 *
 * 로딩 순서 (index.html):
 *   1. api.js        → PlaceballAPI  (REST)
 *   2. websocket.js  → PlaceballWS   (STOMP)
 *   3. stadium-map.js→ StadiumMap    (Canvas)
 *   4. chatbot.js    → PlaceballChatbot (챗봇 UI)
 *   5. app.js        → PlaceballApp  (이 파일, 전체 조립)
 *
 * 연결된 백엔드 요약:
 *   GameController    GET /api/game/state   → 초기 zones, kiaScore, lgScore
 *   GameController    GET /api/game/ticker  → 초기 ticker 메시지
 *   GameService       @Scheduled(2s)        → /topic/gamestate (실시간)
 *   GameService       @Scheduled(4s)        → /topic/ticker    (실시간)
 *   ChatbotController GET /api/chat/welcome → (chatbot.js 에서 처리)
 *   ChatbotController POST /api/chat/send   → (chatbot.js 에서 처리)
 *
 * Zone.java 모델:
 *   { id:0~5, owner:"kia"|"lg"|"neutral", occupationRate:1~99 }
 */

const PlaceballApp = (() => {

  // ── Zone 한국어 라벨 매핑 ──────────────────────────────────────
  // 원본 StadiumSeatMap.tsx ZONE_LABELS
  const ZONE_LABELS = {
    0: '1루 응원석',
    1: '중앙 내야',
    2: '3루 응원석',
    3: '좌외야',
    4: '중외야',
    5: '우외야',
  };

  // ── DOM 레퍼런스 ───────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  // ── 초기화 ────────────────────────────────────────────────────

  async function init() {
    console.log('[PlaceballApp] 초기화 시작');

    // 1. 초기 게임 상태 REST 로드 (GameController GET /api/game/state)
    let initialState = null;
    try {
      initialState = await PlaceballAPI.fetchGameState();
      _applyGameState(initialState);
    } catch (e) {
      console.warn('[PlaceballApp] 초기 상태 로드 실패 — 기본값 사용', e);
      // 폴백: GameService.java 초기값과 동일
      initialState = {
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
      _applyGameState(initialState);
    }

    // 2. 초기 ticker 로드 (GameController GET /api/game/ticker)
    try {
      const ticker = await PlaceballAPI.fetchTicker();
      _applyTicker(ticker);
    } catch (e) {
      console.warn('[PlaceballApp] 초기 ticker 로드 실패', e);
    }

    // 3. Stadium Map 초기화 (canvas 렌더링)
    StadiumMap.init(initialState.zones);

    // 4. Zone 게이지 바 초기 생성
    _renderZoneGauges(initialState.zones);

    // 5. WebSocket 연결 및 콜백 등록
    _initWebSocket();

    // 6. 챗봇 초기화
    await PlaceballChatbot.init();

    // 7. 기타 UI 바인딩
    _bindUI();

    console.log('[PlaceballApp] 초기화 완료');
  }

  // ── WebSocket ─────────────────────────────────────────────────

  function _initWebSocket() {
    /**
     * /topic/gamestate 수신 콜백
     * GameService @Scheduled(2s) → GameState { zones, kiaScore, lgScore }
     */
    PlaceballWS.on('gamestate', (gameState) => {
      _applyGameState(gameState);
      StadiumMap.update(gameState.zones);
      _renderZoneGauges(gameState.zones);
    });

    /**
     * /topic/ticker 수신 콜백
     * GameService @Scheduled(4s) → TickerMessage { team, msg }
     */
    PlaceballWS.on('ticker', (ticker) => {
      _applyTicker(ticker);
    });

    PlaceballWS.on('connect', () => {
      console.log('[PlaceballApp] WebSocket 연결됨');
    });

    PlaceballWS.on('disconnect', () => {
      console.warn('[PlaceballApp] WebSocket 끊김 — 재연결 대기');
    });

    PlaceballWS.connect();
  }

  // ── 상태 반영 ─────────────────────────────────────────────────

  /**
   * GameState { zones, kiaScore, lgScore } → DOM 업데이트
   * GameController /api/game/state 또는 /topic/gamestate
   */
  function _applyGameState(state) {
    const kiaEl = $('kia-score');
    const lgEl  = $('lg-score');
    if (kiaEl) kiaEl.textContent = _fmtScore(state.kiaScore);
    if (lgEl)  lgEl.textContent  = _fmtScore(state.lgScore);

    // KIA 활기도: KIA 구역들의 occupationRate 평균
    const kiaZones = (state.zones || []).filter(z => z.owner === 'kia');
    if (kiaZones.length) {
      const avg = Math.round(kiaZones.reduce((s, z) => s + z.occupationRate, 0) / kiaZones.length);
      const vEl = $('kia-vitality');
      if (vEl) vEl.textContent = avg;
    }

    // LG 효율: LG 구역들의 occupationRate 평균
    const lgZones = (state.zones || []).filter(z => z.owner === 'lg');
    if (lgZones.length) {
      const avg = Math.round(lgZones.reduce((s, z) => s + z.occupationRate, 0) / lgZones.length);
      const eEl = $('lg-efficiency');
      if (eEl) eEl.textContent = avg;
    }
  }

  /**
   * TickerMessage { team, msg } → 풋터 메시지 교체 (페이드 효과)
   * GameService @Scheduled(4s) 브로드캐스트 대응
   */
  function _applyTicker(ticker) {
    const el = $('ticker-msg');
    if (!el) return;
    el.classList.add('fade-out');
    setTimeout(() => {
      el.textContent = ticker.msg || ticker.message || '';
      el.classList.remove('fade-out');
      el.classList.add('fade-in');
      setTimeout(() => el.classList.remove('fade-in'), 400);
    }, 400);
  }

  // ── Zone 게이지 바 렌더링 ────────────────────────────────────
  /**
   * Zone[] → #zone-gauges 내 게이지 바 동적 생성/업데이트
   * Zone.java: { id, owner("kia"|"lg"), occupationRate(1~99) }
   */
  function _renderZoneGauges(zones) {
    const container = $('zone-gauges');
    if (!container) return;

    // 첫 렌더: DOM 생성
    if (!container.dataset.ready) {
      container.innerHTML = '';
      (zones || []).forEach(zone => {
        const row = document.createElement('div');
        row.className = 'zone-gauge-row';
        row.dataset.zoneId = zone.id;

        const label = document.createElement('span');
        label.className = 'zone-gauge-row__label';
        label.textContent = ZONE_LABELS[zone.id] || `Zone ${zone.id}`;

        const barWrap = document.createElement('div');
        barWrap.className = 'zone-gauge-row__bar-wrap';

        const bar = document.createElement('div');
        bar.className = `zone-gauge-row__bar zone-gauge-row__bar--${zone.owner}`;
        bar.style.width = `${zone.occupationRate}%`;

        const pct = document.createElement('span');
        pct.className = 'zone-gauge-row__pct';
        pct.textContent = `${zone.occupationRate}%`;

        barWrap.appendChild(bar);
        row.appendChild(label);
        row.appendChild(barWrap);
        row.appendChild(pct);
        container.appendChild(row);
      });
      container.dataset.ready = '1';
      return;
    }

    // 이후 업데이트: 값만 변경
    (zones || []).forEach(zone => {
      const row = container.querySelector(`[data-zone-id="${zone.id}"]`);
      if (!row) return;
      const bar = row.querySelector('.zone-gauge-row__bar');
      const pct = row.querySelector('.zone-gauge-row__pct');
      if (bar) bar.style.width = `${zone.occupationRate}%`;
      if (pct) pct.textContent = `${zone.occupationRate}%`;
    });
  }

  // ── 기타 UI 바인딩 ────────────────────────────────────────────

  function _bindUI() {
    // 직관 버튼 (현재는 간단한 alert — 추후 기능 확장 가능)
    const diaryBtn = $('diary-btn');
    if (diaryBtn) {
      diaryBtn.addEventListener('click', () => {
        alert('📅 직관 일기 기능 준비 중입니다!');
      });
    }
  }

  // ── 유틸 ─────────────────────────────────────────────────────

  /** 숫자를 천단위 쉼표 포맷 */
  function _fmtScore(n) {
    if (n == null) return '0';
    return Number(n).toLocaleString('ko-KR');
  }

  // DOMContentLoaded 시 자동 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
