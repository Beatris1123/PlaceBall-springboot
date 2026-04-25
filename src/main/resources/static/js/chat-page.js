/**
 * chat-page.js — chat.html 전용 풀스크린 챗봇 초기화
 *
 * 사용 JS: api.js, websocket.js, chat-page.js (이 파일)
 * chatbot.js 의 FAB 모달 방식과 달리, 페이지 전체가 챗봇 UI 입니다.
 *
 * 백엔드 연결:
 *   ChatbotController  GET  /api/chat/welcome → 환영 ChatMessage
 *   ChatbotController  POST /api/chat/send    → { text } → AI ChatMessage
 *   ChatMessage.java   : { id, sender("ai"|"user"), text, timestamp }
 *
 *   GameService @Scheduled(2s) → /topic/gamestate → 우측 미니 점수 갱신
 *   GameService @Scheduled(4s) → /topic/ticker    → 하단 LIVE 티커 갱신
 */

const ChatPage = (() => {

    const $ = (id) => document.getElementById(id);

    let isSending = false;

    async function init() {
        const elMessages = $('chat-messages');
        const elInput    = $('chat-input');
        const elSend     = $('chat-send');

        if (!elMessages || !elInput || !elSend) {
            console.warn('[ChatPage] 필수 DOM 요소 없음');
            return;
        }

        // ── 전송 이벤트 바인딩 ──────────────────────────────────
        elSend.addEventListener('click', () => _send(elInput, elMessages));
        elInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.isComposing) _send(elInput, elMessages);
        });

        // ── 환영 메시지 로드 (GET /api/chat/welcome) ───────────
        try {
            const welcome = await PlaceballAPI.fetchWelcome();
            _appendMsg(elMessages, welcome);
        } catch (e) {
            _appendMsg(elMessages, {
                sender: 'ai',
                text: '안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.',
            });
        }

        // ── 빠른 질문 버튼 클릭 ────────────────────────────────
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                elInput.value = btn.dataset.q || btn.textContent;
                _send(elInput, elMessages);
            });
        });

        // ── WebSocket: 점수 + 티커 구독 ────────────────────────
        PlaceballWS.on('gamestate', (gs) => {
            const fmt = (n) => Number(n).toLocaleString('ko-KR');
            const nk = $('mini-kia'); if (nk) nk.textContent = fmt(gs.kiaScore);
            const nl = $('mini-lg');  if (nl) nl.textContent  = fmt(gs.lgScore);
        });

        PlaceballWS.on('ticker', (ticker) => {
            const el = $('ticker-msg');
            if (!el) return;
            el.classList.add('fade-out');
            setTimeout(() => {
                el.textContent = ticker.msg || '';
                el.classList.remove('fade-out');
                el.classList.add('fade-in');
                setTimeout(() => el.classList.remove('fade-in'), 400);
            }, 400);
        });

        PlaceballWS.connect();
    }

    // ── 메시지 전송 (POST /api/chat/send) ──────────────────────

    async function _send(elInput, elMessages) {
        const text = elInput.value.trim();
        if (!text || isSending) return;

        isSending = true;
        elInput.value = '';

        // 사용자 버블 즉시 표시
        _appendMsg(elMessages, { sender: 'user', text });

        // AI 타이핑 인디케이터
        const typing = _appendTyping(elMessages);

        try {
            const aiMsg = await PlaceballAPI.sendChatMessage(text);
            typing.remove();
            _appendMsg(elMessages, aiMsg);
        } catch (e) {
            typing.remove();
            _appendMsg(elMessages, {
                sender: 'ai',
                text: '잠시 후 다시 시도해주세요.',
            });
        } finally {
            isSending = false;
            elInput.focus();
        }
    }

    // ── DOM 헬퍼 ───────────────────────────────────────────────

    function _appendMsg(container, msg) {
        const wrap = document.createElement('div');
        wrap.className = `msg msg--${msg.sender}`;
        const bubble = document.createElement('div');
        bubble.className = 'msg__bubble';
        bubble.textContent = msg.text;
        wrap.appendChild(bubble);
        container.appendChild(wrap);
        container.scrollTop = container.scrollHeight;
        return wrap;
    }

    function _appendTyping(container) {
        const wrap = document.createElement('div');
        wrap.className = 'msg msg--ai msg--typing';
        const bubble = document.createElement('div');
        bubble.className = 'msg__bubble';
        wrap.appendChild(bubble);
        container.appendChild(wrap);
        container.scrollTop = container.scrollHeight;
        return wrap;
    }

    // DOMContentLoaded 시 자동 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init };
})();
