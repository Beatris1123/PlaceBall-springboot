package com.placeballspring.placeballspring.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig - 정적 리소스 서빙 설정
 * 
 * 원본 Express 서버 (server/index.ts):
 *  app.use(express.static(staticPath));
 * 
 * Spring Boot는 기본적으로 src/main/resources/static/ 을 서빙하나,
 * React 빌드 결과물을 포함시키기 위한 추가 설정입니다.
 * 
 * React 빌드 파일 위치:
 *  src/main/resources/static/ (vite build 결과물 복사)
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 정적 파일 서빙 (React 빌드 결과물)
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");
        registry.addResourceHandler("/*.js", "/*.css", "/*.ico", "/*.png", "/*.svg")
                .addResourceLocations("classpath:/static/");
    }
}
