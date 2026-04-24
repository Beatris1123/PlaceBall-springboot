package com.placeballspring.placeballspring.model;

/**
 * TickerMessage - 하단 LIVE 티커 메시지 모델
 * 
 * 원본 TypeScript 상수 (Home.tsx):
 * const TICKER_MESSAGES = [
 *   { team: "KIA", msg: "현재 KIA 팬들의 응원 화력이 급증 중입니다!" },
 *   { team: "LG",  msg: "LG의 퀴즈 정답률이 92%로 상승했습니다!" },
 *   ...
 * ];
 */
public class TickerMessage {

    private String team;
    private String msg;

    public TickerMessage() {}

    public TickerMessage(String team, String msg) {
        this.team = team;
        this.msg = msg;
    }

    // --- Getters & Setters ---

    public String getTeam() {
        return team;
    }

    public void setTeam(String team) {
        this.team = team;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    @Override
    public String toString() {
        return "TickerMessage{team='" + team + "', msg='" + msg + "'}";
    }
}
