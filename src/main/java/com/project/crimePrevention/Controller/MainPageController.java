package com.project.crimePrevention.Controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainPageController {

    // 로거 객체 생성: MainPageController에서 발생하는 로그를 기록
    private static final Logger logger = LoggerFactory.getLogger(MainPageController.class);

    @GetMapping("/Report")
    public String HomePage(Model model) {
        logger.info("홈 페이지로 이동");
        // 로그인한 사용자 정보를 추가
        return "/MainPage";
    }
}
