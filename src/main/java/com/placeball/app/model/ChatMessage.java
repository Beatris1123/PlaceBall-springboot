package com.placeball.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ChatMessage - AI 챗봇 메시지 모델
 * 원본 TypeScript:
 * interface Message {
 *   id: number;
 *   sender: "ai" | "user";
 *   text: string;
 *   timestamp: Date;
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    private int id;
    private String sender;      // "ai" | "user"
    private String text;
    private LocalDateTime timestamp;
}
