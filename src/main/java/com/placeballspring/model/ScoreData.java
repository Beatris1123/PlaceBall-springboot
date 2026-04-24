package com.placeballspring.model;

import java.util.List;

/**
 * ScoreData - 실시간 점수 및 구역 데이터 응답 모델
 * API 응답에 사용되는 복합 데이터 객체
 */
public class ScoreData {

    private int kiaScore;
    private int lgScore;
    private List<Zone> zones;
    private String tickerMessage;
    private String tickerTeam;

    public ScoreData() {}

    public ScoreData(int kiaScore, int lgScore, List<Zone> zones,
                     String tickerMessage, String tickerTeam) {
        this.kiaScore = kiaScore;
        this.lgScore = lgScore;
        this.zones = zones;
        this.tickerMessage = tickerMessage;
        this.tickerTeam = tickerTeam;
    }

    // Getters
    public int getKiaScore() {
        return kiaScore;
    }

    public int getLgScore() {
        return lgScore;
    }

    public List<Zone> getZones() {
        return zones;
    }

    public String getTickerMessage() {
        return tickerMessage;
    }

    public String getTickerTeam() {
        return tickerTeam;
    }

    // Setters
    public void setKiaScore(int kiaScore) {
        this.kiaScore = kiaScore;
    }

    public void setLgScore(int lgScore) {
        this.lgScore = lgScore;
    }

    public void setZones(List<Zone> zones) {
        this.zones = zones;
    }

    public void setTickerMessage(String tickerMessage) {
        this.tickerMessage = tickerMessage;
    }

    public void setTickerTeam(String tickerTeam) {
        this.tickerTeam = tickerTeam;
    }
}
