package com.placeball.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * HomeController - 페이지 라우팅
 * 원본 Router (wouter):
 * <Route path={"/"} component={Home} />
 * <Route path={"/404"} component={NotFound} />
 */
@Controller
public class HomeController {

    /**
     * 메인 페이지 (원본 Home.tsx)
     */
    @GetMapping("/")
    public String home() {
        return "index";
    }

    /**
     * 404 페이지 (원본 NotFound.tsx)
     */
    @GetMapping("/404")
    public String notFound() {
        return "not-found";
    }
}
