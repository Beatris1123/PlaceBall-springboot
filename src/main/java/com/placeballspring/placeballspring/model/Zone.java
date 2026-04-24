package com.placeballspring.placeballspring.model;

/**
 * Zone - 야구장 구역 모델
 * 
 * 원본 TypeScript 인터페이스:
 * interface Zone {
 *   id: number;
 *   owner: "kia" | "lg" | "neutral";
 *   occupationRate: number;
 * }
 * 
 * 구역 목록:
 *  - id 0: 1루 응원석 (KIA)
 *  - id 1: 중앙 내야 (LG)
 *  - id 2: 3루 응원석 (LG)
 *  - id 3: 좌외야석 (KIA)
 *  - id 4: 중외야석 (LG)
 *  - id 5: 우외야석 (LG)
 */
public class Zone {

    private int id;
    private String owner; // "kia" | "lg" | "neutral"
    private int occupationRate;

    public Zone() {}

    public Zone(int id, String owner, int occupationRate) {
        this.id = id;
        this.owner = owner;
        this.occupationRate = occupationRate;
    }

    // --- Getters & Setters ---

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public int getOccupationRate() {
        return occupationRate;
    }

    public void setOccupationRate(int occupationRate) {
        this.occupationRate = occupationRate;
    }

    @Override
    public String toString() {
        return "Zone{id=" + id + ", owner='" + owner + "', occupationRate=" + occupationRate + "}";
    }
}
