package com.placeballspring.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * PageController - SPA(Single Page Application) 라우팅 처리
 *
 * 원본 Express 서버:
 * app.get("*", (_req, res) => {
 *   res.sendFile(path.join(staticPath, "index.html"));
 * });
 *
 * API 경로(/api/**)가 아닌 모든 GET 요청을 index.html로 포워딩합니다.
 */
@RestController
public class PageController {

    /**
     * 루트 경로 → index.html 서빙
     * GET /
     */
    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> index() {
        Resource resource = new ClassPathResource("static/index.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

    /**
     * 404 fallback → index.html 서빙
     * GET /404
     */
    @GetMapping(value = "/404", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<Resource> notFound() {
        Resource resource = new ClassPathResource("static/index.html");
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }
}
