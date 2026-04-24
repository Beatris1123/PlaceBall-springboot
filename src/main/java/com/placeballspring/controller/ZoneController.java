package com.placeballspring.controller;

import com.placeballspring.model.ScoreData;
import com.placeballspring.model.Zone;
import com.placeballspring.service.ZoneService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ZoneController - 야구장 구역 점령 REST API
 *
 * 원본 Express 서버(server/index.ts)는 정적 파일만 서빙했으므로,
 * React 상태 관리(useState + useEffect)를 Spring Boot REST API로 변환합니다.
 *
 * 엔드포인트:
 *   GET  /api/zones          - 현재 구역 목록 조회
 *   GET  /api/score          - 현재 점수 및 전체 데이터 조회
 *   POST /api/score/refresh  - 점수 & 구역 갱신 (실시간 업데이트 시뮬레이션)
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    /**
     * 구역 목록 조회
     * GET /api/zones
     *
     * 원본: const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES)
     */
    @GetMapping("/zones")
    public ResponseEntity<List<Zone>> getZones() {
        return ResponseEntity.ok(zoneService.getZones());
    }

    /**
     * 현재 점수 및 전체 게임 데이터 조회 (갱신 없음)
     * GET /api/score
     */
    @GetMapping("/score")
    public ResponseEntity<ScoreData> getCurrentScore() {
        return ResponseEntity.ok(zoneService.getCurrentData());
    }

    /**
     * 점수 & 구역 갱신 후 반환
     * POST /api/score/refresh
     *
     * 원본:
     * setInterval(() => {
     *   setKiaScore((s) => s + Math.floor(Math.random() * 5));
     *   setLgScore((s) => s + Math.floor(Math.random() * 4));
     *   setZones((prev) => prev.map((z) => ({ ...z, occupationRate: ... })));
     * }, 2000);
     *
     * 프론트엔드(index.html)에서 2초마다 호출
     */
    @PostMapping("/score/refresh")
    public ResponseEntity<ScoreData> refreshScore() {
        return ResponseEntity.ok(zoneService.refreshAndGetData());
    }
}
