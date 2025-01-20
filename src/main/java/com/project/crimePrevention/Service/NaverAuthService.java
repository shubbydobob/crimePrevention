package com.project.crimePrevention.Service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class NaverAuthService {

    private static final Logger logger = LoggerFactory.getLogger(NaverAuthService.class);

    private static final String NAVER_AUTH_URL = "https://nid.naver.com/oauth2.0/authorize";
    private static final String NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
    private static final String NAVER_USER_INFO_URL = "https://openapi.naver.com/v1/nid/me";
    private static final String CLIENT_ID = "fw7mIIytrglXB4syGWEE";
    private static final String CLIENT_SECRET = "foImNa0vCc";
    private static final String REDIRECT_URI = "http://localhost:8080/api/naver/auth/callback";
    private static final String STATE = "RANDOM_STATE_STRING"; // CSRF 방지용

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * ✅ 네이버 로그인 URL 생성
     */
    public String getNaverLoginUrl() {
        return NAVER_AUTH_URL +
                "?client_id=" + CLIENT_ID +
                "&redirect_uri=" + REDIRECT_URI +
                "&response_type=code" +
                "&state=" + STATE;
    }

    /**
     * ✅ 네이버 Access Token 요청 (네이버 OAuth API)
     */
    public String getNaverAccessToken(String code, String state) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String requestBody = "grant_type=authorization_code" +
                "&client_id=" + CLIENT_ID +
                "&client_secret=" + CLIENT_SECRET +
                "&code=" + code +
                "&state=" + state;

        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(NAVER_TOKEN_URL, HttpMethod.POST, request, String.class);

        JSONObject jsonResponse = new JSONObject(response.getBody());
        return jsonResponse.optString("access_token", null);
    }

    /**
     * ✅ 네이버 사용자 정보 가져오기
     */
    public Map<String, Object> getNaverUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        // 네이버 사용자 정보 요청
        ResponseEntity<String> response = restTemplate.exchange(NAVER_USER_INFO_URL, HttpMethod.GET, request, String.class);

        JSONObject jsonResponse = new JSONObject(response.getBody());
        JSONObject responseObj = jsonResponse.getJSONObject("response");

        // 네이버에서 제공하는 사용자 정보 매핑
        Map<String, Object> result = new HashMap<>();
        result.put("reporter", responseObj.optString("name", "없음"));
        result.put("phoneNumber", responseObj.optString("mobile", "없음"));

        return result;
    }
}