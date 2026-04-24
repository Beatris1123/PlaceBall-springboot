import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

/**
 * vite.config.ts - Spring Boot 통합 빌드 설정
 *
 * 원본: baseballai-bicevcq9/vite.config.ts 에서 Spring Boot 연동용으로 수정
 * 변경사항:
 *  - outDir: src/main/resources/static (Spring Boot 정적 리소스)
 *  - root: frontend/ (현재 디렉토리)
 *  - Manus/Manus-Runtime 플러그인 제거
 *  - 개발 서버 프록시: Spring Boot localhost:8080 연동
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "../src/main/resources/static"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
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
