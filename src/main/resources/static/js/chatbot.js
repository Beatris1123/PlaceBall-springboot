/**
 * chatbot.js — PLACEBALL AI 전략 챗봇 UI
 *
 * 연결된 백엔드:
 *   ChatbotController.java
 *     GET  /api/chat/welcome → ChatMessage { id, sender:"ai", text, timestamp }
 *       ChatbotService.getWelcomeMessage()
 *
 *     POST /api/chat/send   → body:{ text } → ChatMessage { id, sender:"ai", text, timestamp }
 *       ChatbotService.generateAiResponse(userText)
 *       원본 React: setTimeout(..., 600) → 서버 응답 대기
 *
 *   ChatMessage.java 필드:
 *     long id, String sender("ai"|"user"), String text, LocalDateTime timestamp
 *
 * 원본 TypeScript:
 *   ChatbotModal.tsx — useState, AI_RESPONSES 랜덤 선택, 600ms 딜레이 메시지
 *
 * 외부 의존:
 *   PlaceballAPI (api.js) — fetchWelcome(), sendChatMessage(text)
 *
 * 사용법:
 *   PlaceballChatbot.init()     — 챗봇 UI 초기화 + 환영 메시지 로드
 *   PlaceballChatbot.open()     — 모달 열기
 *   PlaceballChatbot.close()    — 모달 닫기
 *   PlaceballChatbot.toggle()   — 열기/닫기 토글
 */

const PlaceballChatbot = (() => {
  const MODAL_ID      = 'chatbot-modal';
  const MESSAGES_ID   = 'chat-messages';
  const INPUT_ID      = 'chat-input';
  const SEND_BTN_ID   = 'chat-send';
  const FAB_ID        = 'chatbot-fab';
  const CLOSE_BTN_ID  = 'chatbot-close';
  const HINT_ID       = 'fab-hint';

  let isOpen     = false;
  let isSending  = false;

  // ── DOM 참조 ──
  let modal, msgContainer, input, sendBtn, fab, closeBtn, hint;

  /** 초기화: DOM 바인딩 + 환영 메시지 로드 */
  async function init() {
    modal        = document.getElementById(MODAL_ID);
    msgContainer = document.getElementById(MESSAGES_ID);
    input        = document.getElementById(INPUT_ID);
    sendBtn      = document.getElementById(SEND_BTN_ID);
    fab          = document.getElementById(FAB_ID);
    closeBtn     = document.getElementById(CLOSE_BTN_ID);
    hint         = document.getElementById(HINT_ID);

    if (!modal) return;

    // 힌트 말풍선 3초마다 토글 (원본 Home.tsx useEffect 3s)
    let hintVisible = true;
    setInterval(() => {
      hintVisible = !hintVisible;
      if (hint) hint.classList.toggle('hidden', !hintVisible);
    }, 3000);

    // FAB 클릭 → 모달 토글
    fab?.addEventListener('click', toggle);

    // 닫기 버튼
    closeBtn?.addEventListener('click', close);

    // 전송 버튼
    sendBtn?.addEventListener('click', _handleSend);

    // Enter 키 전송
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        _handleSend();
      }
    });

    // 환영 메시지 로드
    // ChatbotController GET /api/chat/welcome → ChatbotService.getWelcomeMessage()
    try {
      const welcome = await PlaceballAPI.fetchWelcome();
      _appendMessage(welcome.sender, welcome.text);
    } catch (e) {
      console.warn('[Chatbot] 환영 메시지 로드 실패, 기본 메시지 사용:', e);
      _appendMessage('ai', '안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.');
    }
  }

  /** 모달 열기 */
  function open() {
    if (!modal) return;
    isOpen = true;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    input?.focus();
  }

  /** 모달 닫기 */
  function close() {
    if (!modal) return;
    isOpen = false;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  /** 열기/닫기 토글 */
  function toggle() {
    if (isOpen) close();
    else open();
  }

  // ─────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────

  /** 전송 버튼/Enter 핸들러 */
  async function _handleSend() {
    if (!input || isSending) return;

    const text = input.value.trim();
    if (!text) return;

    // 1. 사용자 메시지 즉시 표시
    _appendMessage('user', text);
    input.value = '';
    input.disabled = true;
    sendBtn && (sendBtn.disabled = true);
    isSending = true;

    // 2. AI 타이핑 인디케이터
    const typingId = _appendTyping();

    try {
      // 3. POST /api/chat/send → ChatbotController → ChatbotService.generateAiResponse
      //    원본: setTimeout(..., 600ms) 딜레이 → 서버 응답 지연으로 대체
      const aiMsg = await PlaceballAPI.sendChatMessage(text);

      _removeTyping(typingId);
      _appendMessage('ai', aiMsg.text);
    } catch (e) {
      console.error('[Chatbot] 메시지 전송 실패:', e);
      _removeTyping(typingId);
      _appendMessage('ai', '죄송합니다. 잠시 후 다시 시도해주세요.');
    } finally {
      isSending = false;
      if (input) {
        input.disabled = false;
        input.focus();
      }
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  /**
   * 메시지 버블 DOM 생성 및 추가
   * ChatMessage.java: sender="ai" | "user"
   * @param {'ai'|'user'} sender
   * @param {string} text
   */
  function _appendMessage(sender, text) {
    if (!msgContainer) return;

    const div = document.createElement('div');
    div.className = `msg msg--${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg__bubble';
    bubble.textContent = text;

    div.appendChild(bubble);
    msgContainer.appendChild(div);
    _scrollToBottom();
  }

  /**
   * AI 타이핑 인디케이터 버블 추가
   * @returns {string} 고유 id (제거 시 사용)
   */
  function _appendTyping() {
    if (!msgContainer) return '';

    const id = 'typing-' + Date.now();
    const div = document.createElement('div');
    div.className = 'msg msg--ai msg--typing';
    div.id = id;

    const bubble = document.createElement('div');
    bubble.className = 'msg__bubble';
    bubble.textContent = 'AI 분석 중';

    div.appendChild(bubble);
    msgContainer.appendChild(div);
    _scrollToBottom();

    return id;
  }

  /** 타이핑 인디케이터 제거 */
  function _removeTyping(id) {
    const el = document.getElementById(id);
    el?.remove();
  }

  /** 메시지 목록 하단으로 스크롤 */
  function _scrollToBottom() {
    if (msgContainer) {
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  }

  return { init, open, close, toggle };
})();
