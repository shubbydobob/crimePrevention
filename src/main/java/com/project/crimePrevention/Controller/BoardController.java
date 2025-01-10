package com.project.crimePrevention.Controller;

import com.project.crimePrevention.Model.Board;
import com.project.crimePrevention.Service.BoardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Controller
public class BoardController {

    // 로거 객체 생성: BoardController에서 발생하는 로그를 기록
    private static final Logger logger = LoggerFactory.getLogger(BoardController.class);

    private final BoardService boardService;

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
    public String submitBoard(@ModelAttribute Board board,
                              @RequestParam(value = "file", required = false) MultipartFile file,
                              Model model) {
        if (file != null && !file.isEmpty()) {
            String uploadDir = "D:/240828study/crimePrevention/crimePrevention/uploads/";
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID() + "_" + originalFileName;
            String filePath = uploadDir + uniqueFileName;

            logger.info("파일 이름: {}", originalFileName);
            logger.info("파일 크기: {} bytes", file.getSize());
            logger.info("파일 타입: {}", file.getContentType());


            try {
                // 파일 저장
                file.transferTo(new File(filePath));
                board.setFile(uniqueFileName); // 파일 이름 저장
                logger.info("파일 업로드 완료: {}", uniqueFileName);
            } catch (IOException e) {
                logger.error("파일 업로드 실패", e);
                model.addAttribute("error", "파일 업로드 실패: " + e.getMessage());
                return "/Board";
            }
        } else {
            board.setFile(null); // 파일 없으면 null 설정
        }

        // 신고 내용 저장
        boardService.saveReport(board);
        return "redirect:/Board";
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


