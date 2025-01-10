package com.project.crimePrevention.Controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.Random;


@Controller
public class ReportController {

    // 로거 객체 생성: ReportController에서 발생하는 로그를 기록
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

    // CAPTCHA 생성 메서드
    @GetMapping("/captcha")
    public void generateCaptcha(HttpSession session, HttpServletResponse response) throws Exception {
        logger.info("CAPTCHA 생성 요청");

        // CAPTCHA 텍스트 생성
        String captchaText = String.valueOf(1000 + new Random().nextInt(9000));

        // 세션에 CAPTCHA 저장
        session.setAttribute("captcha", captchaText);

        // CAPTCHA 이미지 생성
        int width = 150;
        int height = 50;
        BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = bufferedImage.createGraphics();

        // 배경색 설정
        g2d.setColor(new Color(240, 240, 240));
        g2d.fillRect(0, 0, width, height);

        // 텍스트 색상 및 폰트 설정
        g2d.setColor(Color.BLACK);
        g2d.setFont(new Font("Arial", Font.BOLD, 28));

        // CAPTCHA 텍스트 그리기
        g2d.drawString(captchaText, 25, 35);

        // 리소스 해제
        g2d.dispose();

        // HTTP 응답으로 이미지 전송
        response.setContentType("image/png");
        ImageIO.write(bufferedImage, "png", response.getOutputStream());

        // CAPTCHA 생성 완료 로그
        logger.info("CAPTCHA 생성 완료: [{}]", captchaText);
    }
}