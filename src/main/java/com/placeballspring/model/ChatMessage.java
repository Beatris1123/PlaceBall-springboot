package com.placeballspring.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * ChatMessage - AI 챗봇 메시지 모델
 *
 * 원본 TypeScript:
 * interface Message {
 *   id: number;
 *   sender: "ai" | "user";
 *   text: string;
 *   timestamp: Date;
 * }
 */
public class ChatMessage {

    private int id;
    private String sender; // "ai" or "user"
    private String text;
    private String timestamp;

    public ChatMessage() {}

    public ChatMessage(int id, String sender, String text) {
        this.id = id;
        this.sender = sender;
        this.text = text;
        this.timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getSender() {
        return sender;
    }

    public String getText() {
        return text;
    }

    public String getTimestamp() {
        return timestamp;
    }

    // Setters
    public void setId(int id) {
        this.id = id;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public void setText(String text) {
        this.text = text;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ChatMessage{id=" + id + ", sender='" + sender + "', text='" + text + "'}";
    }
}
