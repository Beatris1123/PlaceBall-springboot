package com.placeballspring.placeballspring.model;

import java.time.LocalDateTime;

/**
 * ChatMessage - AI 챗봇 메시지 모델
 * 
 * 원본 TypeScript 인터페이스 (ChatbotModal.tsx):
 * interface Message {
 *   id: number;
 *   sender: "ai" | "user";
 *   text: string;
 *   timestamp: Date;
 * }
 * 
 * WebSocket 채널(/topic/chat)을 통해 실시간 전송됩니다.
 */
public class ChatMessage {

    private long id;
    private String sender; // "ai" | "user"
    private String text;
    private LocalDateTime timestamp;

    public ChatMessage() {}

    public ChatMessage(long id, String sender, String text, LocalDateTime timestamp) {
        this.id = id;
        this.sender = sender;
        this.text = text;
        this.timestamp = timestamp;
    }

    // --- Getters & Setters ---

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "ChatMessage{id=" + id + ", sender='" + sender + "', text='" + text + "'}";
    }
}
