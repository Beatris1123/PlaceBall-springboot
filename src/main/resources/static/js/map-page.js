/**
 * map-page.js — map.html 전용 초기화 스크립트
 *
 * 사용 JS: api.js, websocket.js, stadium-map.js, map-page.js (이 파일)
 *
 * 백엔드 연결:
 *   GameController  GET /api/game/state  → zones[], kiaScore, lgScore
 *   GameController  GET /api/game/ticker → ticker 메시지
 *   GameService @Scheduled(2s) → /topic/gamestate
 *   GameService @Scheduled(4s) → /topic/ticker
 *
 * Zone.java: { id(0~5), owner("kia"|"lg"), occupationRate(1~99) }
 *
 * 화면 구성 (map.html):
 *   - 좌측: 220×220 야구장 다이아몬드 캔버스 (stadium-map.js)
 *   - 우측: Zone 상세 정보 테이블 (점령률, 팀, 한국어 라벨)
 *   - 하단: LIVE 티커 (공통 footer)
 */

const MapPage = (() => {

    const ZONE_LABELS = {
        0: '1루 응원석',
        1: '중앙 내야',
        2: '3루 응원석',
        3: '좌외야',
        4: '중외야',
        5: '우외야',
    };

    const ZONE_DESC = {
        0: 'KIA 팬존 — 1루 방향 열기구역',
        1: 'LG 우세 — 내야 중심부 경합',
        2: 'LG 팬존 — 3루 방향 응원석',
        3: 'KIA 점령 — 좌측 외야 펜스',
        4: 'LG 유지 — 중앙 외야 광장',
        5: 'LG 점령 — 우측 외야 내리막',
    };

    const $ = (id) => document.getElementById(id);

    async function init() {
        // 1. 초기 REST 데이터 로드
        let state = null;
        try {
            state = await PlaceballAPI.fetchGameState();
        } catch (e) {
            console.warn('[MapPage] 초기 상태 로드 실패 — 기본값 사용', e);
            state = {
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

        // 2. 점수 배지 업데이트
        _applyScores(state);

        // 3. 캔버스 초기화 (stadium-map.js)
        StadiumMap.init(state.zones);

        // 4. Zone 상세 테이블 렌더
        _renderZoneTable(state.zones);

        // 5. 티커
        try {
            const ticker = await PlaceballAPI.fetchTicker();
            _applyTicker(ticker);
        } catch (e) { /* 무시 */ }

        // 6. WebSocket 실시간 구독
        PlaceballWS.on('gamestate', (gs) => {
            _applyScores(gs);
            StadiumMap.update(gs.zones);
            _updateZoneTable(gs.zones);
        });

        PlaceballWS.on('ticker', _applyTicker);
        PlaceballWS.connect();
    }

    // ── 점수 배지 ──────────────────────────────────────────────

    function _applyScores(state) {
        const fmt = (n) => Number(n).toLocaleString('ko-KR');
        const nk = $('nav-kia'); if (nk) nk.textContent = fmt(state.kiaScore);
        const nl = $('nav-lg');  if (nl) nl.textContent  = fmt(state.lgScore);
        const sk = $('score-kia'); if (sk) sk.textContent = fmt(state.kiaScore);
        const sl = $('score-lg');  if (sl) sl.textContent  = fmt(state.lgScore);
    }

    // ── LIVE 티커 ──────────────────────────────────────────────

    function _applyTicker(ticker) {
        const el = $('ticker-msg');
        if (!el) return;
        el.classList.add('fade-out');
        setTimeout(() => {
            el.textContent = ticker.msg || '';
            el.classList.remove('fade-out');
            el.classList.add('fade-in');
            setTimeout(() => el.classList.remove('fade-in'), 400);
        }, 400);
    }

    // ── Zone 테이블 최초 렌더 ───────────────────────────────────

    function _renderZoneTable(zones) {
        const tbody = $('zone-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        (zones || []).forEach(zone => {
            const tr = document.createElement('tr');
            tr.dataset.zoneId = zone.id;
            tr.className = `zone-row zone-row--${zone.owner}`;

            const ownerLabel = zone.owner === 'kia' ? '🔴 KIA' : zone.owner === 'lg' ? '🔵 LG' : '⬜ 중립';
            const barColor   = zone.owner === 'kia' ? '#DC3250' : zone.owner === 'lg' ? '#3278C8' : '#888';

            tr.innerHTML = `
                <td class="zt__zone">${ZONE_LABELS[zone.id] || `Zone ${zone.id}`}</td>
                <td class="zt__desc">${ZONE_DESC[zone.id] || ''}</td>
                <td class="zt__owner">${ownerLabel}</td>
                <td class="zt__rate">
                    <div class="zt__bar-wrap">
                        <div class="zt__bar" style="width:${zone.occupationRate}%; background:${barColor};"></div>
                    </div>
                    <span class="zt__pct">${zone.occupationRate}%</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ── Zone 테이블 실시간 업데이트 ────────────────────────────

    function _updateZoneTable(zones) {
        const tbody = $('zone-tbody');
        if (!tbody) return;

        (zones || []).forEach(zone => {
            const tr  = tbody.querySelector(`[data-zone-id="${zone.id}"]`);
            if (!tr) return;
            const bar = tr.querySelector('.zt__bar');
            const pct = tr.querySelector('.zt__pct');
            if (bar) bar.style.width = `${zone.occupationRate}%`;
            if (pct) pct.textContent = `${zone.occupationRate}%`;
        });
    }

    // DOMContentLoaded 시 자동 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init };
})();
