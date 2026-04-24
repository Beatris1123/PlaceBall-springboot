package com.placeball.app.controller;

import com.placeball.app.model.GameState;
import com.placeball.app.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * GameRestController - 게임 상태 REST API
 * 원본 프론트엔드 초기 상태 로드용:
 *   const [zones, setZones] = useState(INITIAL_ZONES);
 *   const [kiaScore, setKiaScore] = useState(3171);
 *   const [lgScore, setLgScore] = useState(2862);
 */
@RestController
@RequestMapping("/api")
public class GameRestController {

    private final GameService gameService;

    public GameRestController(GameService gameService) {
        this.gameService = gameService;
    }

    /**
     * GET /api/gamestate - 현재 게임 상태 조회 (초기 로드용)
     */
    @GetMapping("/gamestate")
    public ResponseEntity<GameState> getGameState() {
        return ResponseEntity.ok(gameService.buildGameState());
    }
}
