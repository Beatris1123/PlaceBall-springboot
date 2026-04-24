package com.placeball.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TickerMessage - 하단 LIVE 티커 메시지 모델
 * 원본 TypeScript:
 * const TICKER_MESSAGES = [
 *   { team: "KIA", msg: "..." },
 *   { team: "LG",  msg: "..." },
 * ];
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TickerMessage {

    private String team;
    private String msg;
}
