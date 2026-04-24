/**
 * websocket.js — PLACEBALL STOMP/SockJS WebSocket 클라이언트
 *
 * 연결된 백엔드:
 *   WebSocketConfig.java
 *     endpoint : /ws  (SockJS 폴백 포함)
 *     broker   : /topic
 *     app dest : /app
 *
 *   GameService.java @Scheduled
 *     fixedRate=2000ms → /topic/gamestate  (GameState: zones, kiaScore, lgScore)
 *     fixedRate=4000ms → /topic/ticker     (TickerMessage: team, msg)
 */

const PlaceballWS = (() => {
  let stompClient = null;
  let connected = false;

  // 외부 콜백 (app.js 에서 등록)
  let onGameState = null;   // (gameState) => void
  let onTicker    = null;   // (tickerMsg) => void
  let onConnect   = null;   // ()          => void
  let onDisconnect = null;  // ()          => void

  /**
   * WebSocket 연결 시작
   * WebSocketConfig.java: registry.addEndpoint("/ws").withSockJS()
   */
  function connect() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    // STOMP 디버그 로그 비활성화 (운영 환경)
    stompClient.debug = null;

    stompClient.connect({}, _onConnected, _onError);
  }

  function _onConnected() {
    connected = true;
    console.log('[PlaceballWS] STOMP 연결 완료');

    /**
     * /topic/gamestate 구독
     * GameService.updateGameState() → 2초마다 브로드캐스트
     * payload: GameState { zones:[{id,owner,occupationRate}], kiaScore, lgScore }
     */
    stompClient.subscribe('/topic/gamestate', (frame) => {
      try {
        const gameState = JSON.parse(frame.body);
        if (typeof onGameState === 'function') onGameState(gameState);
      } catch (e) {
        console.warn('[PlaceballWS] gamestate 파싱 오류', e);
      }
    });

    /**
     * /topic/ticker 구독
     * GameService.updateTicker() → 4초마다 브로드캐스트
     * payload: TickerMessage { team, msg }
     */
    stompClient.subscribe('/topic/ticker', (frame) => {
      try {
        const ticker = JSON.parse(frame.body);
        if (typeof onTicker === 'function') onTicker(ticker);
      } catch (e) {
        console.warn('[PlaceballWS] ticker 파싱 오류', e);
      }
    });

    if (typeof onConnect === 'function') onConnect();
  }

  function _onError(err) {
    connected = false;
    console.warn('[PlaceballWS] 연결 오류 — 5초 후 재연결 시도', err);
    setTimeout(connect, 5000);
    if (typeof onDisconnect === 'function') onDisconnect();
  }

  /** 연결 해제 */
  function disconnect() {
    if (stompClient && connected) {
      stompClient.disconnect(() => {
        connected = false;
        console.log('[PlaceballWS] 연결 해제');
      });
    }
  }

  /** 외부 콜백 등록 */
  function on(event, cb) {
    if (event === 'gamestate')   onGameState  = cb;
    else if (event === 'ticker') onTicker     = cb;
    else if (event === 'connect')    onConnect    = cb;
    else if (event === 'disconnect') onDisconnect = cb;
  }

  function isConnected() { return connected; }

  return { connect, disconnect, on, isConnected };
})();
