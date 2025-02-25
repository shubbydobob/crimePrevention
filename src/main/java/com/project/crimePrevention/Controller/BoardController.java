package com.project.crimePrevention.Controller;

import com.project.crimePrevention.Kafka.ReportProducer;
import com.project.crimePrevention.Model.Board;
import com.project.crimePrevention.Model.Report;
import com.project.crimePrevention.Service.AdminService;
import com.project.crimePrevention.Service.BoardService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class BoardController {

    // 로거 객체 생성: BoardController에서 발생하는 로그를 기록
    private static final Logger logger = LoggerFactory.getLogger(BoardController.class);

    @Value("${file.upload-dir}")
    private String uploadDir; // 파일 업로드 경로

    @Autowired
    private BoardService boardService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private ReportProducer reportProducer;

    @GetMapping("/Board")
    public String getBoardPage(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int pageSize, @RequestParam(required = false) Boolean all, // 전체 조회 여부
                               HttpSession session, Model model) {
        logger.info("[INFO] 신고 접수 페이지 요청 - 페이지 번호: {}, 전체 조회 여부: {}", page, all);

        // 페이징 처리된 데이터 가져오기
        List<Board> reports;
        int totalPages;

        if (Boolean.TRUE.equals(all)) {
            // 전체 데이터 조회
            reports = boardService.getAllReports();
            totalPages = 1; // 전체 조회 시 총 페이지는 1로 설정
            logger.info("[INFO] 전체 신고 데이터 조회 - 총 개수: {}", reports.size());
        } else {
            // 페이징된 데이터 조회
            reports = boardService.getPagedReports(page, pageSize);
            totalPages = boardService.getTotalPages(pageSize);
            logger.info("[INFO] 페이징 신고 데이터 조회 - 페이지: {}, 총 페이지 수: {}", page, totalPages);
        }

        // 날짜를 포맷팅하여 새로운 필드 추가
        reports.forEach(report -> report.setFormattedDate(report.getCreateDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))));

        // 모델에 데이터 추가
        model.addAttribute("reports", reports);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", totalPages);
        model.addAttribute("all", all); // 전체 조회 여부 전달

        // 관리자 여부 확인 후 모델에 추가
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        model.addAttribute("isAdmin", isAdmin != null && isAdmin);

        logger.info("[INFO] 신고 데이터 페이징 처리 완료 - 페이지: {}/{}", page, totalPages);
        return "/Board/Board"; // 신고 현황 페이지 반환
    }

//    @PostMapping("/Board")
//    @ResponseBody
//    public String submitBoard(@ModelAttribute Board board,  // Board 엔티티를 폼 데이터로 바인딩
//                              @RequestParam(value = "captcha", required = false) String captchaInput, // 캡차 입력값
//                              @RequestParam(value = "file", required = false) MultipartFile file, // 파일 업로드
//                              HttpSession session, // HTTP 세션 객체
//                              Model model) { // 모델 객체, 뷰로 데이터를 전달
//
//        logger.info("신고 접수 요청 - 데이터: {}", board); // 신고 접수 데이터 로깅
//
//        // CAPTCHA 검증
//        String generatedCaptcha = (String) session.getAttribute("captcha");
//        if (captchaInput == null || !captchaInput.equals(generatedCaptcha)) {
//            logger.warn("CAPTCHA 검증 실패 - 입력된 값: {}, 생성된 값: {}", captchaInput, generatedCaptcha); // 캡차 오류 로깅
//            model.addAttribute("error", "CAPTCHA가 일치하지 않습니다."); // 오류 메시지 설정
//            return "Board/Board"; // 사용자에게 다시 입력하도록 반환
//        }
//
//        // 파일 업로드 처리
//        if (file != null && !file.isEmpty()) {  // 파일이 존재하고 비어 있지 않으면
//            try {
//                logger.info("파일 업로드 시작 - 파일명: {}", file.getOriginalFilename());
//
//                // 업로드 디렉토리 확인 및 생성
//                File directory = new File(uploadDir);
//                if (!directory.exists()) {
//                    directory.mkdirs();
//                }
//
//                // 파일 경로 및 이름 생성
//
//                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
//                String savePath = uploadDir + fileName; // 실제 저장 경로
//                String filePath = "uploads/" + fileName; // 웹 접근 가능 경로
//
//                logger.info("업로드 디렉토리: {}", uploadDir);
//
//                // 서버 디렉토리에 파일 저장
//                file.transferTo(new File(savePath));
//                logger.info("파일 저장 성공 - 경로: {}", filePath); // 파일 저장 완료 로깅
//
//                // 파일 경로를 Board 객체에 저장
//                board.setFilePath(filePath); // 파일 경로를 Board 객체의 filePath 필드에 저장
//
//            } catch (IOException e) {
//                logger.error("파일 업로드 중 오류 발생 - 파일명: {}, 오류 메시지: {}", file.getOriginalFilename(), e.getMessage());
//                model.addAttribute("error", "파일 업로드 중 오류가 발생했습니다.");
//                return "errorPage"; // 오류가 발생하면 오류 페이지로 이동
//            }
//        } else {
//            logger.info("첨부된 파일이 없습니다."); // 파일이 없으면 로그 기록
//        }
//
//        // 신고 데이터 저장
//        try {
//            boardService.saveReport(board); // 신고 데이터 저장
//            logger.info("신고 데이터 저장 완료 - Board ID: {}", board.getId()); // 신고 데이터 저장 완료 로깅
//        } catch (Exception e) {
//            logger.error("신고 데이터 저장 중 오류 발생: {}", e.getMessage());
//            model.addAttribute("error", "신고 저장 중 오류가 발생했습니다.");
//            return "errorPage"; // 오류 발생 시 오류 페이지로 이동
//        }
//
//        logger.info("신고 접수 처리 완료"); // 신고 접수 완료 로깅
//        return "redirect:/Board"; // 신고 처리 후 목록 페이지로 리다이렉트
//    }

    @PostMapping("/submit-direct")
    @ResponseBody
    public ResponseEntity<?> submitBoard(
            @ModelAttribute Board board,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        if (file != null && !file.isEmpty()) {
            try {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                file.transferTo(new File(uploadDir + fileName));
                board.setFilePath("uploads/" + fileName);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "파일 업로드 중 오류 발생"));
            }
        }

        // 🚨 **동기적으로 즉시 DB 저장**
        Board savedBoard = boardService.saveReport(board);

        return ResponseEntity.ok(Map.of("message", "신고 접수 완료", "boardId", savedBoard.getId()));
    }

    @PostMapping("/Board")
    public ResponseEntity<?> submitBoard(
            @RequestBody Board board
//            @RequestParam(value = "captcha", required = false) String captchaInput,
//            @RequestPart(value = "file", required = false) MultipartFile file,
//            HttpSession session
    ) {
//        // CAPTCHA 검증 (테스트 시 필요에 따라 제거하거나 올바른 값 전송)
//        String generatedCaptcha = (String) session.getAttribute("captcha");
//        if (captchaInput == null || !captchaInput.equals(generatedCaptcha)) {
//            return ResponseEntity.badRequest().body(Map.of("error", "CAPTCHA가 일치하지 않습니다."));
//        }

//        // 파일 업로드 처리
//        if (file != null && !file.isEmpty()) {
//            try {
//                File directory = new File(uploadDir);
//                if (!directory.exists()) {
//                    directory.mkdirs();
//                }
//                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
//                String savePath = uploadDir + fileName;
//                String filePath = "uploads/" + fileName;
//                file.transferTo(new File(savePath));
//                board.setFilePath(filePath);
//            } catch (IOException e) {
//                return ResponseEntity
//                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                        .body(Map.of("error", "파일 업로드 중 오류 발생: " + e.getMessage()));
//            }
//        }

        // 신고 데이터 저장 (MySQL에 저장하고, @CachePut에 의해 Redis에도 저장)
        Board savedBoard = boardService.saveReport(board);

       // Board → Report 변환 후 Kafka 전송
        Report report = convertToReport(savedBoard);
        reportProducer.sendReport(report);

        // JSON 응답 반환
        return ResponseEntity.ok(Map.of("message", "신고 접수 완료", "boardId", savedBoard.getId()));
    }

    // Board 리스트 조회 API
    @GetMapping("/reports")
    @ResponseBody
    public List<Board> getAllReports() {
        return boardService.getAllReports();
    }

    // 파일 다운로드 API 추가
    @GetMapping("/Board/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            if (fileName == null || fileName.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
            headers.add(HttpHeaders.CONTENT_TYPE, "application/octet-stream");

            return ResponseEntity.ok().headers(headers).body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 열람 비밀번호 검증 및 관리자 로그인 후 비밀번호 입력 없이 조회
    @GetMapping("Board/validatePassword/{id}")
    @ResponseBody
    public ResponseEntity<?> validatePassword(@PathVariable Long id, @RequestParam(required = false) String password, HttpSession session) {
        logger.info("비밀번호 검증 요청 - ID: {}", id);

        Object isAdmin = session.getAttribute("isAdmin");
        logger.info("세션 관리자 상태: {}", isAdmin);


        // 관리자인지 확인
        if (isAdmin != null && (boolean) isAdmin) {
            logger.info("관리자 로그인 확인됨. 접수번호: {}의 데이터 반환.", id);
            Board board = boardService.getReportById(id);

            // 작성일 포맷 처리
            formatCreateDate(board);
            return ResponseEntity.ok(board); // 관리자에게 데이터 반환
        }

        // 일반 사용자 비밀번호 검증
        try {
            Board board = boardService.validatePassword(id, password);
            logger.info("비밀번호 확인 성공. 접수번호: {}의 데이터 반환.", id);

            // 작성일 포맷 처리
            formatCreateDate(board);
            return ResponseEntity.ok(board);
        } catch (IllegalArgumentException e) {
            logger.warn("비밀번호 확인 실패 - 접수번호: {}, 이유: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 틀렸습니다.");
        }
    }

    // 작성일 포맷 처리 메서드
    private void formatCreateDate(Board board) {
        if (board.getCreateDate() != null) {
            String formattedDate = board.getCreateDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            board.setFormattedDate(formattedDate);
            logger.info("작성일 포맷팅 완료 - 접수번호: {}, 포맷된 날짜: {}", board.getId(), formattedDate);
        }
    }

    @PostMapping("/Board/{id}/reply")
    @ResponseBody
    public ResponseEntity<?> addReply(@PathVariable Long id, @RequestBody Map<String, String> payload, HttpSession session) {
        logger.info("답변 추가 요청 - 신고 ID: {}", id);

        // 관리자 여부 확인
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        if (isAdmin == null || !isAdmin) {
            logger.warn("관리자 권한 없음");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("관리자 권한이 필요합니다.");
        }

        // 답변 내용 추출
        String reply = payload.get("reply");
        if (reply == null || reply.isEmpty()) {
            logger.warn("답변 내용이 비어 있음");
            return ResponseEntity.badRequest().body("답변 내용을 입력하세요.");
        }

        try {
            // 답변 저장 처리
            Board board = boardService.addReply(id, reply);
            return ResponseEntity.ok(board);
        } catch (Exception e) {
            logger.error("답변 저장 실패 - 신고 ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("답변 저장 실패");
        }
    }

    // 답변 수정 엔드포인트
    @PatchMapping("Board/{id}/reply")
    @ResponseBody
    public ResponseEntity<?> updateReply(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        logger.info("[INFO] 답변 수정 요청 접수 - 신고 ID: {}", id);

        String reply = payload.get("reply");
        if (reply == null || reply.isEmpty()) {
            logger.warn("[WARN] 답변 내용이 비어 있음 - 신고 ID: {}", id);
            return ResponseEntity.badRequest().body("답변 내용이 비어 있습니다.");
        }

        try {
            // 서비스 로직 호출하여 답변 수정
            Board board = boardService.updateReply(id, reply);

            // 응답 데이터 구성
            Map<String, String> response = new HashMap<>();
            response.put("reply", board.getReply());
            response.put("processingStatus", board.getProcessingStatus());
            logger.info("[INFO] 답변 수정 완료 - 신고 ID: {}", id);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[ERROR] 답변 수정 실패 - 신고 ID: {}", id, e);
            return ResponseEntity.status(500).body("답변 수정 실패");
        }
    }

    // 답변 삭제
    @DeleteMapping("/Board/{id}/reply")
    @ResponseBody
    public ResponseEntity<?> deleteReply(@PathVariable Long id) {
        logger.info("답변 삭제 요청 - 신고 ID: {}", id);
        boardService.deleteReply(id);
        return ResponseEntity.ok("답변 삭제 완료");
    }
    private Report convertToReport(Board board) {
        return new Report(
                board.getReporter(),
                board.getPhoneNumber(),
                board.getReportTitle(),
                board.getContent(),
                board.getMajorCategory(),
                board.getMiddleCategory(),
                board.getOccurrenceDate().toString(),
                board.getOccurrenceTime().toString(),
                board.getPassword()
        );
    }
}

