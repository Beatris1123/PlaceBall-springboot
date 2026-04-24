package com.placeball.app.service;

import com.placeball.app.model.GameState;
import com.placeball.app.model.TickerMessage;
import com.placeball.app.model.Zone;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * GameService - 게임 상태 관리 서비스
 * 원본 React useEffect (2초 인터벌 점수/구역 업데이트):
 *
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     setKiaScore(s => s + Math.floor(Math.random() * 5));
 *     setLgScore(s => s + Math.floor(Math.random() * 4));
 *     setZones(prev => prev.map(z => ({
 *       ...z,
 *       occupationRate: Math.min(99, Math.max(1, z.occupationRate + (Math.random() > 0.5 ? 1 : -1)))
 *     })));
 *   }, 2000);
 * }, []);
 */
@Service
public class GameService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    // 원본 초기값: kiaScore=3171, lgScore=2862
    private final AtomicInteger kiaScore = new AtomicInteger(3171);
    private final AtomicInteger lgScore  = new AtomicInteger(2862);

    // 원본 TICKER_MESSAGES 배열
    private static final List<TickerMessage> TICKER_MESSAGES = List.of(
        new TickerMessage("KIA", "현재 KIA 팬들의 응원 화력이 급증 중입니다!"),
        new TickerMessage("LG",  "LG의 퀴즈 정답률이 92%로 상승했습니다!"),
        new TickerMessage("KIA", "KIA 1루 응원석 점령률 76% 돌파!"),
        new TickerMessage("LG",  "LG 우외야 구역 역습 포인트 +129 적립!")
    );

    private int tickerIdx = 0;

    // 원본 INITIAL_ZONES
    private final List<Zone> zones = new ArrayList<>(List.of(
        new Zone(0, "kia", 76),
        new Zone(1, "lg",  72),
        new Zone(2, "lg",  68),
        new Zone(3, "kia", 61),
        new Zone(4, "lg",  72),
        new Zone(5, "lg",  81)
    ));

    public GameService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 2초마다 점수 & 구역 업데이트 (원본 setInterval 2000ms)
     */
    @Scheduled(fixedDelay = 2000)
    public void updateGameState() {
        // 점수 업데이트 (원본: Math.floor(Math.random() * 5) / * 4))
        kiaScore.addAndGet(random.nextInt(5));
        lgScore.addAndGet(random.nextInt(4));

        // 구역 점령률 업데이트 (원본: Math.min(99, Math.max(1, rate + (random > 0.5 ? 1 : -1))))
        zones.replaceAll(z -> {
            int delta = random.nextBoolean() ? 1 : -1;
            int newRate = Math.min(99, Math.max(1, z.getOccupationRate() + delta));
            z.setOccupationRate(newRate);
            return z;
        });

        // WebSocket으로 브로드캐스트
        GameState state = buildGameState();
        messagingTemplate.convertAndSend("/topic/gamestate", state);
    }

    /**
     * 4초마다 티커 순환 (원본: setInterval 4000ms)
     */
    @Scheduled(fixedDelay = 4000)
    public void updateTicker() {
        tickerIdx = (tickerIdx + 1) % TICKER_MESSAGES.size();
    }

    /**
     * 현재 게임 상태 조회 (REST API용)
     */
    public GameState buildGameState() {
        double kiaOcc = zones.stream()
            .filter(z -> "kia".equals(z.getOwner()))
            .mapToInt(Zone::getOccupationRate)
            .average()
            .orElse(0);

        double lgOcc = zones.stream()
            .filter(z -> "lg".equals(z.getOwner()))
            .mapToInt(Zone::getOccupationRate)
            .average()
            .orElse(0);

        return new GameState(
            kiaScore.get(),
            lgScore.get(),
            new ArrayList<>(zones),
            TICKER_MESSAGES.get(tickerIdx),
            Math.round(kiaOcc * 10.0) / 10.0,
            Math.round(lgOcc  * 10.0) / 10.0
        );
    }
}
