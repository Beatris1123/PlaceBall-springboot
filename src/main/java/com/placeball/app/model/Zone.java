package com.placeball.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Zone - 야구장 구역 모델
 * 원본 TypeScript interface:
 * interface Zone {
 *   id: number;
 *   owner: "kia" | "lg" | "neutral";
 *   occupationRate: number;
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Zone {

    private int id;
    private String owner;       // "kia" | "lg" | "neutral"
    private int occupationRate; // 1 ~ 99 (%)
}
