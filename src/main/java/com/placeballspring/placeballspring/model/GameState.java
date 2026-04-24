package com.placeballspring.placeballspring.model;

import java.util.List;

/**
 * GameState - 전체 게임 상태 모델
 * 
 * 원본 React 상태 (Home.tsx):
 *  - zones: Zone[]
 *  - kiaScore: number
 *  - lgScore: number
 * 
 * REST API 응답 및 WebSocket 메시지에 사용됩니다.
 */
public class GameState {

    private List<Zone> zones;
    private int kiaScore;
    private int lgScore;

    public GameState() {}

    public GameState(List<Zone> zones, int kiaScore, int lgScore) {
        this.zones = zones;
        this.kiaScore = kiaScore;
        this.lgScore = lgScore;
    }

    // --- Getters & Setters ---

    public List<Zone> getZones() {
        return zones;
    }

    public void setZones(List<Zone> zones) {
        this.zones = zones;
    }

    public int getKiaScore() {
        return kiaScore;
    }

    public void setKiaScore(int kiaScore) {
        this.kiaScore = kiaScore;
    }

    public int getLgScore() {
        return lgScore;
    }

    public void setLgScore(int lgScore) {
        this.lgScore = lgScore;
    }

    @Override
    public String toString() {
        return "GameState{kiaScore=" + kiaScore + ", lgScore=" + lgScore + ", zones=" + zones + "}";
    }
}
