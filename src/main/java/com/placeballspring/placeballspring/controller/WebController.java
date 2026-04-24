package com.placeballspring.placeballspring.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * WebController - SPA(Single Page Application) 라우팅 컨트롤러
 * 
 * 원본 Express 서버 (server/index.ts):
 *  app.get("*", (_req, res) => {
 *    res.sendFile(path.join(staticPath, "index.html"));
 *  });
 * 
 * React Router(wouter) 기반 클라이언트 측 라우팅을 지원하기 위해
 * 모든 알 수 없는 경로에서 index.html을 반환합니다.
 * 
 * 지원 경로:
 *  /        → Home.tsx
 *  /404     → NotFound.tsx
 *  그 외    → NotFound.tsx (wouter fallback)
 */
@Controller
public class WebController {

    /**
     * SPA 진입점 - index.html 반환
     * /api/** 및 /static/** 를 제외한 모든 경로 처리
     */
    @RequestMapping(value = {
        "/",
        "/404",
        "/{path:[^\\.]*}",
        "/{path:[^\\.]*}/{subpath:[^\\.]*}"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
