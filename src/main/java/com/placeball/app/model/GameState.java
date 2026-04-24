package com.placeball.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * GameState - 전체 게임 상태 (WebSocket 브로드캐스트용)
 * 원본 React state:
 *   const [zones, setZones] = useState(INITIAL_ZONES);
 *   const [kiaScore, setKiaScore] = useState(3171);
 *   const [lgScore, setLgScore] = useState(2862);
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameState {

    private int kiaScore;
    private int lgScore;
    private List<Zone> zones;
    private TickerMessage currentTicker;
    private double kiaOccupation;
    private double lgOccupation;
}
