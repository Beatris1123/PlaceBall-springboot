package com.placeballspring.placeballspring.service;

import com.placeballspring.placeballspring.model.GameState;
import com.placeballspring.placeballspring.model.TickerMessage;
import com.placeballspring.placeballspring.model.Zone;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * GameService - 게임 상태 관리 서비스
 * 
 * 원본 React 상태 로직 (Home.tsx):
 *  - useEffect: 2초마다 점수 + 구역 점령률 랜덤 업데이트
 *  - useEffect: 4초마다 티커 메시지 순환
 * 
 * Spring Boot 전환:
 *  - @Scheduled로 서버 사이드 상태 갱신
 *  - WebSocket(/topic/gamestate)으로 클라이언트에 실시간 브로드캐스트
 */
@Service
@EnableScheduling
public class GameService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    // ── 초기 게임 상태 (원본 Home.tsx INITIAL_ZONES, kiaScore, lgScore) ──
    private final List<Zone> zones = new ArrayList<>(List.of(
        new Zone(0, "kia", 76),
        new Zone(1, "lg",  72),
        new Zone(2, "lg",  68),
        new Zone(3, "kia", 61),
        new Zone(4, "lg",  72),
        new Zone(5, "lg",  81)
    ));

    private final AtomicInteger kiaScore = new AtomicInteger(3171);
    private final AtomicInteger lgScore  = new AtomicInteger(2862);

    // ── 티커 메시지 (원본 Home.tsx TICKER_MESSAGES) ──
    private final List<TickerMessage> tickerMessages = List.of(
        new TickerMessage("KIA", "현재 KIA 팬들의 응원 화력이 급증 중입니다!"),
        new TickerMessage("LG",  "LG의 퀴즈 정답률이 92%로 상승했습니다!"),
        new TickerMessage("KIA", "KIA 1루 응원석 점령률 76% 돌파!"),
        new TickerMessage("LG",  "LG 우외야 구역 역습 포인트 +129 적립!")
    );
    private int tickerIdx = 0;

    public GameService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 2초마다 점수 및 구역 점령률 업데이트 후 WebSocket으로 브로드캐스트
     * 원본: setInterval(..., 2000) in Home.tsx
     */
    @Scheduled(fixedRate = 2000)
    public void updateGameState() {
        // 점수 랜덤 증가
        kiaScore.addAndGet(random.nextInt(5));
        lgScore.addAndGet(random.nextInt(4));

        // 구역 점령률 랜덤 변동 (-1 or +1)
        synchronized (zones) {
            for (Zone zone : zones) {
                int delta = (random.nextDouble() > 0.5) ? 1 : -1;
                int newRate = Math.min(99, Math.max(1, zone.getOccupationRate() + delta));
                zone.setOccupationRate(newRate);
            }
        }

        // WebSocket으로 상태 전송
        messagingTemplate.convertAndSend("/topic/gamestate", getCurrentState());
    }

    /**
     * 4초마다 티커 메시지 순환 후 WebSocket으로 브로드캐스트
     * 원본: setInterval(() => setTickerIdx(...), 4000) in Home.tsx
     */
    @Scheduled(fixedRate = 4000)
    public void updateTicker() {
        tickerIdx = (tickerIdx + 1) % tickerMessages.size();
        messagingTemplate.convertAndSend("/topic/ticker", tickerMessages.get(tickerIdx));
    }

    /**
     * 현재 게임 상태 반환 (REST API 초기 데이터 제공용)
     */
    public GameState getCurrentState() {
        List<Zone> snapshot;
        synchronized (zones) {
            snapshot = new ArrayList<>(zones);
        }
        return new GameState(snapshot, kiaScore.get(), lgScore.get());
    }

    /**
     * 현재 티커 메시지 반환 (REST API 초기 데이터 제공용)
     */
    public TickerMessage getCurrentTicker() {
        return tickerMessages.get(tickerIdx);
    }
}
