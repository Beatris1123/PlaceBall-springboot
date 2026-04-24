/**
 * const.ts - 클라이언트 측 상수
 *
 * 원본: baseballai-bicevcq9/client/src/const.ts
 * 변경사항:
 *  - OAuth/Manus 관련 상수 제거 (Spring Boot Security로 대체 가능)
 *  - COOKIE_NAME, ONE_YEAR_MS만 유지
 */

export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
