/**
 * useGameState - Spring Boot WebSocket 연동 훅
 *
 * 원본: Home.tsx의 React 로컬 상태 + setInterval
 *   - kiaScore, lgScore: useState + setInterval(2s)
 *   - zones: useState + setInterval(2s)
 *   - tickerIdx: useState + setInterval(4s)
 *
 * Spring Boot 전환:
 *   - 초기 데이터: GET /api/game/state, GET /api/game/ticker
 *   - 실시간 업데이트: STOMP WebSocket /topic/gamestate, /topic/ticker
 *   - SockJS 폴백 지원
 */
import { useEffect, useState } from "react";
import axios from "axios";

interface Zone {
  id: number;
  owner: "kia" | "lg" | "neutral";
  occupationRate: number;
}

interface GameState {
  zones: Zone[];
  kiaScore: number;
  lgScore: number;
}

interface TickerMessage {
  team: string;
  msg: string;
}

const INITIAL_ZONES: Zone[] = [
  { id: 0, owner: "kia", occupationRate: 76 },
  { id: 1, owner: "lg",  occupationRate: 72 },
  { id: 2, owner: "lg",  occupationRate: 68 },
  { id: 3, owner: "kia", occupationRate: 61 },
  { id: 4, owner: "lg",  occupationRate: 72 },
  { id: 5, owner: "lg",  occupationRate: 81 },
];

const TICKER_MESSAGES: TickerMessage[] = [
  { team: "KIA", msg: "현재 KIA 팬들의 응원 화력이 급증 중입니다!" },
  { team: "LG",  msg: "LG의 퀴즈 정답률이 92%로 상승했습니다!" },
  { team: "KIA", msg: "KIA 1루 응원석 점령률 76% 돌파!" },
  { team: "LG",  msg: "LG 우외야 구역 역습 포인트 +129 적립!" },
];

export function useGameState() {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [kiaScore, setKiaScore] = useState(3171);
  const [lgScore, setLgScore] = useState(2862);
  const [ticker, setTicker] = useState<TickerMessage>(TICKER_MESSAGES[0]);

  useEffect(() => {
    let wsClient: any = null;

    // 초기 데이터 로드 (REST API)
    const loadInitial = async () => {
      try {
        const [stateRes, tickerRes] = await Promise.all([
          axios.get<GameState>("/api/game/state"),
          axios.get<TickerMessage>("/api/game/ticker"),
        ]);
        const s = stateRes.data;
        setZones(s.zones);
        setKiaScore(s.kiaScore);
        setLgScore(s.lgScore);
        setTicker(tickerRes.data);
      } catch {
        // API 없는 경우(개발 standalone 모드) 로컬 fallback
        startLocalFallback();
      }
    };

    // WebSocket 연결 (SockJS + STOMP)
    const connectWebSocket = async () => {
      try {
        const SockJS = (await import("sockjs-client")).default;
        const Stomp = (await import("stompjs")).default;

        const socket = new SockJS("/ws");
        wsClient = Stomp.over(socket);
        wsClient.debug = null; // 로그 비활성화

        wsClient.connect({}, () => {
          wsClient.subscribe("/topic/gamestate", (msg: any) => {
            const data: GameState = JSON.parse(msg.body);
            setZones(data.zones);
            setKiaScore(data.kiaScore);
            setLgScore(data.lgScore);
          });
          wsClient.subscribe("/topic/ticker", (msg: any) => {
            const data: TickerMessage = JSON.parse(msg.body);
            setTicker(data);
          });
        });
      } catch {
        // WebSocket 불가 시 로컬 폴백
      }
    };

    // 로컬 폴백 (Spring Boot 없이 standalone 실행 시)
    let localIntervals: ReturnType<typeof setInterval>[] = [];
    const startLocalFallback = () => {
      const scoreInterval = setInterval(() => {
        setKiaScore((s) => s + Math.floor(Math.random() * 5));
        setLgScore((s) => s + Math.floor(Math.random() * 4));
        setZones((prev) =>
          prev.map((z) => ({
            ...z,
            occupationRate: Math.min(
              99,
              Math.max(1, z.occupationRate + (Math.random() > 0.5 ? 1 : -1))
            ),
          }))
        );
      }, 2000);

      let tIdx = 0;
      const tickerInterval = setInterval(() => {
        tIdx = (tIdx + 1) % TICKER_MESSAGES.length;
        setTicker(TICKER_MESSAGES[tIdx]);
      }, 4000);

      localIntervals = [scoreInterval, tickerInterval];
    };

    loadInitial();
    connectWebSocket();

    return () => {
      if (wsClient) {
        try { wsClient.disconnect(); } catch {}
      }
      localIntervals.forEach(clearInterval);
    };
  }, []);

  return { zones, kiaScore, lgScore, ticker };
}
