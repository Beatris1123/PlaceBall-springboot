/**
 * api.js — PLACEBALL REST API 클라이언트
 *
 * 연결된 백엔드:
 *   GameController.java
 *     GET  /api/game/state   → { zones:[{id,owner,occupationRate},...], kiaScore, lgScore }
 *     GET  /api/game/ticker  → { team, msg }
 *
 *   ChatbotController.java
 *     GET  /api/chat/welcome → ChatMessage { id, sender:"ai", text, timestamp }
 *     POST /api/chat/send    → body:{ text } → ChatMessage { id, sender:"ai", text, timestamp }
 *
 * Zone 모델 (Zone.java):
 *   id 0 — 1루 응원석  (owner:"kia")
 *   id 1 — 중앙 내야   (owner:"lg")
 *   id 2 — 3루 응원석  (owner:"lg")
 *   id 3 — 좌외야      (owner:"kia")
 *   id 4 — 중외야      (owner:"lg")
 *   id 5 — 우외야      (owner:"lg")
 */

const PlaceballAPI = (() => {
  const BASE = '';  // 같은 Origin (Spring Boot 서빙)

  /**
   * GET /api/game/state
   * GameController.java → GameService.getCurrentState()
   * @returns {Promise<{zones: Zone[], kiaScore: number, lgScore: number}>}
   */
  async function fetchGameState() {
    const res = await fetch(`${BASE}/api/game/state`);
    if (!res.ok) throw new Error(`/api/game/state 오류: ${res.status}`);
    return res.json();
  }

  /**
   * GET /api/game/ticker
   * GameController.java → GameService.getCurrentTicker()
   * @returns {Promise<{team: string, msg: string}>}
   */
  async function fetchTicker() {
    const res = await fetch(`${BASE}/api/game/ticker`);
    if (!res.ok) throw new Error(`/api/game/ticker 오류: ${res.status}`);
    return res.json();
  }

  /**
   * GET /api/chat/welcome
   * ChatbotController.java → ChatbotService.getWelcomeMessage()
   * @returns {Promise<{id:number, sender:string, text:string, timestamp:string}>}
   */
  async function fetchWelcome() {
    const res = await fetch(`${BASE}/api/chat/welcome`);
    if (!res.ok) throw new Error(`/api/chat/welcome 오류: ${res.status}`);
    return res.json();
  }

  /**
   * POST /api/chat/send
   * ChatbotController.java → ChatbotService.generateAiResponse(text)
   * @param {string} text — 사용자 입력 텍스트
   * @returns {Promise<{id:number, sender:string, text:string, timestamp:string}>}
   */
  async function sendChatMessage(text) {
    const res = await fetch(`${BASE}/api/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`/api/chat/send 오류: ${res.status}`);
    return res.json();
  }

  return { fetchGameState, fetchTicker, fetchWelcome, sendChatMessage };
})();
