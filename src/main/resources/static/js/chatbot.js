/**
 * chatbot.js — PLACEBALL AI 전략 챗봇 UI
 *
 * 연결된 백엔드:
 *   ChatbotController.java
 *     GET  /api/chat/welcome  → ChatMessage { id, sender:"ai", text, timestamp }
 *     POST /api/chat/send     → body:{ text } → ChatMessage { id, sender:"ai", text, timestamp }
 *
 *   ChatbotService.java
 *     getWelcomeMessage()    → 초기 환영 메시지
 *     generateAiResponse()   → AI_RESPONSES 목록에서 랜덤 응답 (600ms 지연 없이 즉시)
 *     createUserMessage()    → 사용자 메시지 객체 생성
 *
 *   ChatMessage.java 모델: { id, sender("ai"|"user"), text, timestamp }
 *
 * 원본 참조: ChatbotModal.tsx
 */

const PlaceballChatbot = (() => {
  // DOM 레퍼런스 (app.js 의 init() 후 사용 가능)
  let elModal    = null;
  let elMessages = null;
  let elInput    = null;
  let elSend     = null;
  let elFab      = null;
  let elHint     = null;
  let elClose    = null;

  let isOpen      = false;
  let isSending   = false;
  let hintTimer   = null;

  /** 챗봇 초기화 — DOM 바인딩 + 환영 메시지 로드 */
  async function init() {
    elModal    = document.getElementById('chatbot-modal');
    elMessages = document.getElementById('chat-messages');
    elInput    = document.getElementById('chat-input');
    elSend     = document.getElementById('chat-send');
    elFab      = document.getElementById('chatbot-fab');
    elHint     = document.getElementById('fab-hint');
    elClose    = document.getElementById('chatbot-close');

    if (!elModal) { console.warn('[Chatbot] DOM 요소 없음'); return; }

    // FAB 클릭 → 모달 토글
    elFab.addEventListener('click', toggle);
    // 닫기 버튼
    elClose.addEventListener('click', close);
    // 전송 버튼
    elSend.addEventListener('click', _sendMessage);
    // Enter 키
    elInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.isComposing) _sendMessage();
    });

    // 힌트 말풍선 3초마다 토글 (원본 Home.tsx hintVisible useEffect)
    _startHintToggle();

    // 환영 메시지 로드 (GET /api/chat/welcome)
    await _loadWelcome();
  }

  /** 모달 열기 */
  function open() {
    isOpen = true;
    elModal.classList.add('open');
    elModal.setAttribute('aria-hidden', 'false');
    elFab.setAttribute('aria-expanded', 'true');
    // 힌트 숨기기
    elHint.classList.add('hidden');
    clearInterval(hintTimer);
    // 입력창 포커스
    setTimeout(() => elInput && elInput.focus(), 200);
    // 스크롤 맨 아래
    _scrollToBottom();
  }

  /** 모달 닫기 */
  function close() {
    isOpen = false;
    elModal.classList.remove('open');
    elModal.setAttribute('aria-hidden', 'true');
    elFab.setAttribute('aria-expanded', 'false');
    _startHintToggle();
  }

  /** 토글 */
  function toggle() {
    isOpen ? close() : open();
  }

  // ── 내부 로직 ─────────────────────────────────────────────────

  /** GET /api/chat/welcome → 환영 메시지 버블 표시 */
  async function _loadWelcome() {
    try {
      const msg = await PlaceballAPI.fetchWelcome();
      _appendMessage(msg);
    } catch (e) {
      console.warn('[Chatbot] 환영 메시지 로드 실패', e);
      // 폴백: 하드코딩 환영 메시지
      _appendMessage({
        id: 0,
        sender: 'ai',
        text: '안녕하세요! 🤖 AI 전략 사령관입니다. 현재 경기 상황을 분석하고 최적의 응원 전략을 제안해드립니다.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /** POST /api/chat/send → 사용자 메시지 전송 + AI 응답 수신 */
  async function _sendMessage() {
    const text = elInput ? elInput.value.trim() : '';
    if (!text || isSending) return;

    isSending = true;
    elSend.disabled = true;
    elInput.value = '';

    // 사용자 메시지 버블 즉시 표시
    _appendMessage({ id: Date.now(), sender: 'user', text });

    // 타이핑 인디케이터
    const typingEl = _appendTyping();

    try {
      // POST /api/chat/send  (ChatbotController.java)
      const aiMsg = await PlaceballAPI.sendChatMessage(text);
      typingEl.remove();
      _appendMessage(aiMsg);
    } catch (e) {
      console.warn('[Chatbot] 메시지 전송 실패', e);
      typingEl.remove();
      _appendMessage({
        id: Date.now() + 1,
        sender: 'ai',
        text: '잠시 후 다시 시도해주세요.',
      });
    } finally {
      isSending = false;
      elSend.disabled = false;
      elInput.focus();
    }
  }

  /**
   * ChatMessage 객체를 받아 메시지 버블 DOM 생성
   * sender="ai"   → .msg--ai   (왼쪽, 반투명 흰 배경)
   * sender="user" → .msg--user (오른쪽, 파란 배경)
   */
  function _appendMessage(msg) {
    const wrap = document.createElement('div');
    wrap.className = `msg msg--${msg.sender}`;
    wrap.dataset.id = msg.id || '';

    const bubble = document.createElement('div');
    bubble.className = 'msg__bubble';
    bubble.textContent = msg.text;

    wrap.appendChild(bubble);
    elMessages.appendChild(wrap);
    _scrollToBottom();
    return wrap;
  }

  /** AI 타이핑 인디케이터 추가 */
  function _appendTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'msg msg--ai msg--typing';
    const bubble = document.createElement('div');
    bubble.className = 'msg__bubble';
    bubble.textContent = '';
    wrap.appendChild(bubble);
    elMessages.appendChild(wrap);
    _scrollToBottom();
    return wrap;
  }

  /** 메시지 스크롤 맨 아래 */
  function _scrollToBottom() {
    if (elMessages) {
      elMessages.scrollTop = elMessages.scrollHeight;
    }
  }

  /**
   * 힌트 말풍선 3초마다 토글
   * 원본: Home.tsx hintVisible useEffect (setInterval 3000ms)
   */
  function _startHintToggle() {
    if (isOpen) return;
    elHint && elHint.classList.remove('hidden');
    hintTimer = setInterval(() => {
      if (!elHint || isOpen) return;
      elHint.classList.toggle('hidden');
    }, 3000);
  }

  return { init, open, close, toggle };
})();
