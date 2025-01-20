package com.project.crimePrevention.Controller;

import com.project.crimePrevention.Service.NaverAuthService;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;


import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/naver/auth")
public class NaverAuthController {

    private static final Logger logger = LoggerFactory.getLogger(NaverAuthController.class);

    private final NaverAuthService naverAuthService;
    private Map<String, Object> lastUserInfo = new HashMap<>(); // 본인인증 결과 저장

    public NaverAuthController(NaverAuthService naverAuthService) {
        this.naverAuthService = naverAuthService;
    }

    /**
     * ✅ 네이버 로그인 페이지로 이동 (본인인증 시작)
     */
    @GetMapping("/start")
    public ResponseEntity<Map<String, String>> startNaverAuth() {
        logger.info("[INFO] 네이버 본인인증 요청 시작");

        return ResponseEntity.ok(Map.of("url", naverAuthService.getNaverLoginUrl()));
    }

    /**
     * ✅ 네이버 로그인 성공 후 콜백 (Access Token 발급 및 사용자 정보 가져오기)
     */
    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> naverCallback(
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "state", required = false) String state) {

        if (code == null || state == null) {
            logger.error("[ERROR] 네이버 본인인증 코드 또는 state 값이 없습니다.");
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "code 또는 state가 없습니다."));
        }

        logger.info("[INFO] 네이버 로그인 코드 수신: {}", code);
        logger.info("[INFO] 네이버 로그인 상태 수신: {}", state);

        // 네이버 Access Token 요청
        String accessToken = naverAuthService.getNaverAccessToken(code, state);
        if (accessToken == null) {
            logger.error("[ERROR] 네이버 Access Token 발급 실패");
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Access Token 발급 실패"));
        }

        // 네이버 사용자 정보 가져오기
        lastUserInfo = naverAuthService.getNaverUserInfo(accessToken);
        if (lastUserInfo.isEmpty()) {
            logger.error("[ERROR] 네이버 사용자 정보 조회 실패");
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "사용자 정보 조회 실패"));
        }

        logger.info("[INFO] 본인인증 성공 - 이름: {}, 연락처: {}", lastUserInfo.get("reporter"), lastUserInfo.get("phoneNumber"));
        return ResponseEntity.ok(Map.of("success", true, "reporter", lastUserInfo.get("reporter"), "phoneNumber", lastUserInfo.get("phoneNumber")));
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUserInfo() {
        return ResponseEntity.ok(lastUserInfo);
    }
}
