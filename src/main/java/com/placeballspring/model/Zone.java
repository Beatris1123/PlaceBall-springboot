package com.placeballspring.model;

/**
 * Zone - 야구장 구역 점령 정보 모델
 *
 * 원본 TypeScript:
 * interface Zone {
 *   id: number;
 *   owner: "kia" | "lg" | "neutral";
 *   occupationRate: number;
 * }
 */
public class Zone {

    private int id;
    private String owner; // "kia", "lg", "neutral"
    private int occupationRate; // 점령률 (1~99)

    public Zone() {}

    public Zone(int id, String owner, int occupationRate) {
        this.id = id;
        this.owner = owner;
        this.occupationRate = occupationRate;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getOwner() {
        return owner;
    }

    public int getOccupationRate() {
        return occupationRate;
    }

    // Setters
    public void setId(int id) {
        this.id = id;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public void setOccupationRate(int occupationRate) {
        // 1~99 범위로 제한
        this.occupationRate = Math.min(99, Math.max(1, occupationRate));
    }

    @Override
    public String toString() {
        return "Zone{id=" + id + ", owner='" + owner + "', occupationRate=" + occupationRate + "}";
    }
}
