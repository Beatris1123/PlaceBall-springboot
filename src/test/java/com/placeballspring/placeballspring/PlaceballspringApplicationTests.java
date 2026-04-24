package com.placeballspring.placeballspring;

import com.placeballspring.placeballspring.model.GameState;
import com.placeballspring.placeballspring.model.Zone;
import com.placeballspring.placeballspring.model.ChatMessage;
import com.placeballspring.placeballspring.service.ChatbotService;
import com.placeballspring.placeballspring.service.GameService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PlaceballspringApplicationTests - Spring Boot 통합 테스트
 *
 * 테스트 항목:
 *  1. Spring Boot 컨텍스트 로드 확인
 *  2. GameService - 초기 게임 상태 검증
 *  3. GameService - Zone 점령률 범위(1~99) 검증
 *  4. ChatbotService - 환영 메시지 검증
 *  5. ChatbotService - AI 응답 생성 검증
 */
@SpringBootTest
class PlaceballspringApplicationTests {

    @MockBean
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private GameService gameService;

    @Autowired
    private ChatbotService chatbotService;

    /**
     * 테스트 1: Spring Boot 컨텍스트 로드
     */
    @Test
    void contextLoads() {
        assertThat(gameService).isNotNull();
        assertThat(chatbotService).isNotNull();
    }

    /**
     * 테스트 2: 초기 게임 상태 검증
     * 원본 Home.tsx INITIAL_ZONES 및 초기 점수 기준
     */
    @Test
    void initialGameStateIsValid() {
        GameState state = gameService.getCurrentState();

        // 6개 구역 존재 확인
        assertThat(state.getZones()).hasSize(6);
        // 초기 KIA 점수
        assertThat(state.getKiaScore()).isGreaterThanOrEqualTo(3171);
        // 초기 LG 점수
        assertThat(state.getLgScore()).isGreaterThanOrEqualTo(2862);
    }

    /**
     * 테스트 3: 구역 점령률 범위 검증 (1~99%)
     * 원본: Math.min(99, Math.max(1, ...)) in Home.tsx
     */
    @Test
    void zoneOccupationRateIsInValidRange() {
        GameState state = gameService.getCurrentState();
        for (Zone zone : state.getZones()) {
            assertThat(zone.getOccupationRate())
                    .as("Zone %d occupationRate should be 1-99", zone.getId())
                    .isBetween(1, 99);
        }
    }

    /**
     * 테스트 4: 구역 소유자 값 검증 (kia | lg | neutral)
     */
    @Test
    void zoneOwnerIsValid() {
        GameState state = gameService.getCurrentState();
        for (Zone zone : state.getZones()) {
            assertThat(zone.getOwner())
                    .as("Zone %d owner should be kia, lg, or neutral", zone.getId())
                    .isIn("kia", "lg", "neutral");
        }
    }

    /**
     * 테스트 5: 챗봇 환영 메시지 검증
     * 원본 ChatbotModal.tsx 초기 메시지 기준
     */
    @Test
    void chatbotWelcomeMessageIsNotEmpty() {
        ChatMessage welcome = chatbotService.getWelcomeMessage();
        assertThat(welcome).isNotNull();
        assertThat(welcome.getSender()).isEqualTo("ai");
        assertThat(welcome.getText()).isNotBlank();
    }

    /**
     * 테스트 6: AI 응답 생성 검증
     */
    @Test
    void chatbotGeneratesAiResponse() {
        ChatMessage response = chatbotService.generateAiResponse("KIA 응원 전략 알려줘");
        assertThat(response).isNotNull();
        assertThat(response.getSender()).isEqualTo("ai");
        assertThat(response.getText()).isNotBlank();
        assertThat(response.getTimestamp()).isNotNull();
    }

    /**
     * 테스트 7: 사용자 메시지 생성 검증
     */
    @Test
    void chatbotCreatesUserMessage() {
        String userText = "안녕하세요";
        ChatMessage userMsg = chatbotService.createUserMessage(userText);
        assertThat(userMsg.getSender()).isEqualTo("user");
        assertThat(userMsg.getText()).isEqualTo(userText);
    }

    /**
     * 테스트 8: 티커 메시지 검증
     */
    @Test
    void tickerMessageIsNotNull() {
        assertThat(gameService.getCurrentTicker()).isNotNull();
        assertThat(gameService.getCurrentTicker().getTeam()).isIn("KIA", "LG");
        assertThat(gameService.getCurrentTicker().getMsg()).isNotBlank();
    }
}
