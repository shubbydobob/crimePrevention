package com.project.crimePrevention.Controller;

import com.project.crimePrevention.Service.AdminService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class MainPageController {

    // 로거 객체 생성: MainPageController에서 발생하는 로그를 기록
    private static final Logger logger = LoggerFactory.getLogger(MainPageController.class);

    private final AdminService adminService;

    public MainPageController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/Report")
    public String HomePage(Model model) {
        logger.info("홈 페이지로 이동");
        logger.info("홈 페이지로 이동");
        return "/MainPage";
    }

    @GetMapping("/AdminPage")
    public String AdminPage() {
        logger.info("관리자 페이지로 이동");
        return "/AdminPage";
    }

    @GetMapping("/Admin")
    public String AdminLoginPage() {
        logger.info("관리자 로그인 페이지로 이동");
        // 관리자 계정으로 로그인
        return "/AdminLogin";
    }

    // ** 로그인 처리 **
    @PostMapping("/AdminLogin")
    public String login(@RequestParam String admin, @RequestParam String password, HttpSession session, RedirectAttributes redirectAttributes) {

        logger.info("로그인 요청: 관리자 ID [{}]", admin);

        if (adminService.login(admin, password)) {
            session.setAttribute("loggedIn", true);
            session.setAttribute("isAdmin", true); // 관리자 권한 설정
            session.setAttribute("username", admin);
            logger.info("로그인 성공: 관리자 ID [{}]", admin);
            return "redirect:/Report";
        } else {
            redirectAttributes.addFlashAttribute("error", "아이디나 비밀번호가 잘못되었습니다.");
            logger.warn("로그인 실패: 관리자 ID [{}]", admin);
            return "redirect:/AdminLogin";
        }
    }

    // ** 로그아웃 처리 **
    @GetMapping("/Logout")
    public String logout(HttpSession session, HttpServletResponse response) {
        logger.info("로그아웃 요청: 사용자 ID [{}]", session.getAttribute("username"));
        session.invalidate(); // 세션 초기화
        logger.info("로그아웃 완료. 세션 종료");
        

        // 캐시 방지
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        return "redirect:/Admin"; // 로그아웃 후 로그인 페이지로 이동

    }
}
