import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

/**
 * Vite 설정 - Spring Boot 통합 빌드용
 * 
 * 원본: baseballai-bicevcq9/vite.config.ts 에서 Spring Boot 통합을 위해 수정
 * - 빌드 출력 경로: ../src/main/resources/static (Spring Boot 정적 리소스 디렉토리)
 * - Manus 플러그인 제거 (Spring Boot 환경에서 불필요)
 * - 개발 서버: 프록시 설정으로 Spring Boot API 연동
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    // Spring Boot 정적 리소스 경로로 직접 빌드
    outDir: path.resolve(import.meta.dirname, "../src/main/resources/static"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    // 개발 시 Spring Boot API 프록시
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
