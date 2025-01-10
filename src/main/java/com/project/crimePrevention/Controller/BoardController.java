package com.project.crimePrevention.Controller;

import com.project.crimePrevention.Model.Board;
import com.project.crimePrevention.Service.BoardService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Controller
public class BoardController {

    // 로거 객체 생성: BoardController에서 발생하는 로그를 기록
    private static final Logger logger = LoggerFactory.getLogger(BoardController.class);
    private final BoardService boardService;

    @Value("${file.upload-dir}")
    private String uploadDir; // 파일 업로드 경로

    public BoardController(BoardService boardService) {
        this.boardService = boardService;

    }

    @GetMapping("/Board")
    public String getBoardPage(Model model) {
        List<Board> reports = boardService.getAllReports(); // 모든 신고 데이터 조회
        // 날짜를 포맷팅하여 새로운 필드 추가
        reports.forEach(report -> report.setFormattedDate(report.getCreateDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))));
        model.addAttribute("reports", reports); // 조회 결과를 모델에 추가
        logger.info("신고 현황 페이지 데이터: {}", reports);
        return "/Board/Board"; // 신고 현황 페이지 반환
    }

    @PostMapping("/Board")
    @ResponseBody
    public String submitBoard(
            @ModelAttribute Board board,  // Board 엔티티를 폼 데이터로 바인딩
            @RequestParam(value = "captcha", required = false) String captchaInput, // 캡차 입력값
            @RequestParam(value = "file", required = false) MultipartFile file, // 파일 업로드
            HttpSession session, // HTTP 세션 객체
            Model model) { // 모델 객체, 뷰로 데이터를 전달

        logger.info("신고 접수 요청 - 데이터: {}", board); // 신고 접수 데이터 로깅

        // CAPTCHA 검증
        String generatedCaptcha = (String) session.getAttribute("captcha");
        if (captchaInput == null || !captchaInput.equals(generatedCaptcha)) {
            logger.warn("CAPTCHA 검증 실패 - 입력된 값: {}, 생성된 값: {}", captchaInput, generatedCaptcha); // 캡차 오류 로깅
            model.addAttribute("error", "CAPTCHA가 일치하지 않습니다."); // 오류 메시지 설정
            return "Board/Board"; // 사용자에게 다시 입력하도록 반환
        }

        // 파일 업로드 처리
        if (file != null && !file.isEmpty()) {  // 파일이 존재하고 비어 있지 않으면
            try {
                logger.info("파일 업로드 시작 - 파일명: {}", file.getOriginalFilename());

                // 파일 경로 및 이름 생성
                String originalName = file.getOriginalFilename(); // 원본 파일명
                String fileName = UUID.randomUUID().toString() + "_" + originalName; // 고유한 파일명 생성
                String filePath = uploadDir + fileName; // 저장할 파일 경로 설정

                // 서버 디렉토리에 파일 저장
                file.transferTo(new File(filePath));
                logger.info("파일 저장 성공 - 경로: {}", filePath); // 파일 저장 완료 로깅

                // 파일 경로를 Board 객체에 저장
                board.setFilePath(filePath); // 파일 경로를 Board 객체의 filePath 필드에 저장

            } catch (IOException e) {
                logger.error("파일 업로드 중 오류 발생 - 파일명: {}, 오류 메시지: {}", file.getOriginalFilename(), e.getMessage());
                model.addAttribute("error", "파일 업로드 중 오류가 발생했습니다.");
                return "errorPage"; // 오류가 발생하면 오류 페이지로 이동
            }
        } else {
            logger.info("첨부된 파일이 없습니다."); // 파일이 없으면 로그 기록
        }

        // 신고 데이터 저장
        try {
            boardService.saveReport(board); // 신고 데이터 저장
            logger.info("신고 데이터 저장 완료 - Board ID: {}", board.getId()); // 신고 데이터 저장 완료 로깅
        } catch (Exception e) {
            logger.error("신고 데이터 저장 중 오류 발생: {}", e.getMessage());
            model.addAttribute("error", "신고 저장 중 오류가 발생했습니다.");
            return "errorPage"; // 오류 발생 시 오류 페이지로 이동
        }

        logger.info("신고 접수 처리 완료"); // 신고 접수 완료 로깅
        return "redirect:/Board"; // 신고 처리 후 목록 페이지로 리다이렉트
    }


    // 열람용 비밀번호 검증
    @GetMapping("/Board/validatePassword/{id}")
    public ResponseEntity<Board> validatePassword(
            @PathVariable Long id,
            @RequestParam String password) {
        logger.info("비밀번호 검증 요청 - ID: {}, Password: {}", id, password);

        try {
            Board board = boardService.validatePassword(id, password);
            logger.info("비밀번호 검증 성공 - ID: {}, Reporter: {}", id, board.getReporter());

            // Format the createDate and set it to formattedDate
            if (board.getCreateDate() != null) {
                String formattedDate = board.getCreateDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                board.setFormattedDate(formattedDate);
            }
            return ResponseEntity.ok(board);
        } catch (IllegalArgumentException e) {
            logger.error("비밀번호 검증 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }
}


