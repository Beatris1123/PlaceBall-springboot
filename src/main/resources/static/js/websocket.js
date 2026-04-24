/**
 * websocket.js — PLACEBALL STOMP WebSocket 클라이언트
 *
 * 연결된 백엔드:
 *   WebSocketConfig.java
 *     registry.addEndpoint("/ws").withSockJS()
 *     config.enableSimpleBroker("/topic")
 *
 *   GameService.java
 *     @Scheduled(fixedRate=2000) → /topic/gamestate
 *       payload: { zones:[{id,owner,occupationRate},...], kiaScore, lgScore }
 *     @Scheduled(fixedRate=4000) → /topic/ticker
 *       payload: { team:"KIA"|"LG", msg:"..." }
 *
 * 사용법:
 *   PlaceballWS.connect(onGameState, onTicker)
 *   PlaceballWS.disconnect()
 */

const PlaceballWS = (() => {
  let stompClient = null;
  let reconnectTimer = null;
  const RECONNECT_DELAY = 5000;

  /**
   * WebSocket 연결 및 구독
   *
   * @param {function(gameState: {zones, kiaScore, lgScore}): void} onGameState
   *   GameService @Scheduled(2s) → /topic/gamestate 수신 콜백
   *
   * @param {function(ticker: {team, msg}): void} onTicker
   *   GameService @Scheduled(4s) → /topic/ticker 수신 콜백
   */
  function connect(onGameState, onTicker) {
    // WebSocketConfig.java: registry.addEndpoint("/ws").withSockJS()
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    // 콘솔 로그 최소화
    stompClient.debug = null;

    stompClient.connect(
      {},
      // ── 연결 성공 ──
      function onConnected() {
        console.log('[PlaceballWS] STOMP 연결 성공');

        /**
         * /topic/gamestate 구독
         * GameService.updateGameState() @Scheduled(2s) 가 브로드캐스트
         * payload: GameState { zones:[Zone], kiaScore, lgScore }
         *   Zone: { id:int, owner:"kia"|"lg"|"neutral", occupationRate:1~99 }
         */
        stompClient.subscribe('/topic/gamestate', function (frame) {
          try {
            const gameState = JSON.parse(frame.body);
            onGameState(gameState);
          } catch (e) {
            console.error('[PlaceballWS] gamestate 파싱 오류', e);
          }
        });

        /**
         * /topic/ticker 구독
         * GameService.updateTicker() @Scheduled(4s) 가 브로드캐스트
         * payload: TickerMessage { team:"KIA"|"LG", msg:"..." }
         */
        stompClient.subscribe('/topic/ticker', function (frame) {
          try {
            const ticker = JSON.parse(frame.body);
            onTicker(ticker);
          } catch (e) {
            console.error('[PlaceballWS] ticker 파싱 오류', e);
          }
        });
      },
      // ── 연결 실패 → 자동 재연결 ──
      function onError(error) {
        console.warn('[PlaceballWS] 연결 실패, 재시도 예정:', error);
        scheduleReconnect(onGameState, onTicker);
      }
    );
  }

  /** 자동 재연결 스케줄러 */
  function scheduleReconnect(onGameState, onTicker) {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      console.log('[PlaceballWS] 재연결 시도...');
      connect(onGameState, onTicker);
    }, RECONNECT_DELAY);
  }

  /** WebSocket 연결 해제 */
  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => {
        console.log('[PlaceballWS] 연결 해제');
      });
    }
    stompClient = null;
  }

  /** 연결 상태 확인 */
  function isConnected() {
    return stompClient !== null && stompClient.connected;
  }

  return { connect, disconnect, isConnected };
})();
