package com.placeballspring.service;

import com.placeballspring.model.ScoreData;
import com.placeballspring.model.Zone;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * ZoneService - 야구장 구역 점령 비즈니스 로직
 *
 * 원본 React 상태 관리를 Spring Boot 서비스로 변환:
 * - useState<Zone[]>(INITIAL_ZONES)
 * - useState(3171) / useState(2862) (점수)
 * - 실시간 점수 변동 로직
 * - 티커 메시지 순환
 */
@Service
public class ZoneService {

    private final Random random = new Random();

    // 원본: const INITIAL_ZONES: Zone[]
    private final List<Zone> zones = new ArrayList<>(List.of(
            new Zone(0, "kia", 76),
            new Zone(1, "lg", 72),
            new Zone(2, "lg", 68),
            new Zone(3, "kia", 61),
            new Zone(4, "lg", 72),
            new Zone(5, "lg", 81)
    ));

    // 원본: const [kiaScore, setKiaScore] = useState(3171)
    private int kiaScore = 3171;

    // 원본: const [lgScore, setLgScore] = useState(2862)
    private int lgScore = 2862;

    private int tickerIdx = 0;

    // 원본: const TICKER_MESSAGES
    private final String[][] tickerMessages = {
            {"KIA", "현재 KIA 팬들의 응원 화력이 급증 중입니다!"},
            {"LG",  "LG의 퀴즈 정답률이 92%로 상승했습니다!"},
            {"KIA", "KIA 1루 응원석 점령률 76% 돌파!"},
            {"LG",  "LG 우외야 구역 역습 포인트 +129 적립!"}
    };

    /**
     * 실시간 점수 & 구역 갱신
     * 원본: setInterval(() => { setKiaScore / setLgScore / setZones }, 2000)
     */
    public ScoreData refreshAndGetData() {
        // 점수 갱신
        kiaScore += random.nextInt(5);
        lgScore  += random.nextInt(4);

        // 구역 점령률 갱신
        for (Zone zone : zones) {
            int delta = random.nextBoolean() ? 1 : -1;
            zone.setOccupationRate(zone.getOccupationRate() + delta);
        }

        // 티커 순환
        tickerIdx = (tickerIdx + 1) % tickerMessages.length;

        return buildScoreData();
    }

    /**
     * 현재 상태 조회 (갱신 없이)
     */
    public ScoreData getCurrentData() {
        return buildScoreData();
    }

    /**
     * 구역 목록 조회
     */
    public List<Zone> getZones() {
        return new ArrayList<>(zones);
    }

    /**
     * KIA 점수 조회
     */
    public int getKiaScore() {
        return kiaScore;
    }

    /**
     * LG 점수 조회
     */
    public int getLgScore() {
        return lgScore;
    }

    // ── private 헬퍼 ──────────────────────────────────────────────

    private ScoreData buildScoreData() {
        String[] ticker = tickerMessages[tickerIdx];
        return new ScoreData(
                kiaScore,
                lgScore,
                new ArrayList<>(zones),
                ticker[1],
                ticker[0]
        );
    }
}
