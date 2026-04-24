package com.placeballspring.placeballspring.controller;

import com.placeballspring.placeballspring.model.GameState;
import com.placeballspring.placeballspring.model.TickerMessage;
import com.placeballspring.placeballspring.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * GameController - 게임 상태 REST API 컨트롤러
 * 
 * 원본 Node.js Express 라우트 (server/index.ts):
 *  - app.get("*", (_req, res) => res.sendFile(...)) 은 SPA 서빙용
 *  - 게임 상태는 클라이언트 측 React 상태로만 관리되었으나,
 *    Spring Boot 전환 시 서버 사이드 API로 분리
 * 
 * 엔드포인트:
 *  GET /api/game/state  - 현재 게임 상태 (초기 로드용)
 *  GET /api/game/ticker - 현재 티커 메시지
 * 
 * 실시간 업데이트는 WebSocket /topic/gamestate, /topic/ticker 사용
 */
@RestController
@RequestMapping("/api/game")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    /**
     * 현재 게임 상태 조회 (페이지 초기 로드 시 호출)
     * 
     * @return GameState JSON (zones, kiaScore, lgScore)
     */
    @GetMapping("/state")
    public ResponseEntity<GameState> getGameState() {
        GameState state = gameService.getCurrentState();
        return ResponseEntity.ok(state);
    }

    /**
     * 현재 티커 메시지 조회
     * 
     * @return TickerMessage JSON (team, msg)
     */
    @GetMapping("/ticker")
    public ResponseEntity<TickerMessage> getTicker() {
        TickerMessage ticker = gameService.getCurrentTicker();
        return ResponseEntity.ok(ticker);
    }
}
