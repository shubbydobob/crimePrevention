package com.project.crimePrevention.Service;

import com.project.crimePrevention.Model.Board;
import com.project.crimePrevention.Repository.BoardRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BoardService {

    // 로거 객체 생성: 서비스 레벨 로그를 기록
    private static final Logger logger = LoggerFactory.getLogger(BoardService.class);

    private final BoardRepository boardRepository;

    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    // 신고 접수 데이터를 저장
    public void saveReport(Board board) {
        board.setCreateDate(LocalDateTime.now()); // 현재 시간을 생성일로 설정
        board.setProcessingStatus("Pending"); // 기본 처리 상태를 '처리중'으로 설정
        boardRepository.save(board);
        logger.info("신고 데이터 저장 완료: {}", board);
    }

    // 모든 신고 데이터를 조회
    public List<Board> getAllReports() {
        logger.info("모든 신고 데이터 조회 요청");
        return boardRepository.findAll();
    }

    // 해당 접수 번호에 대한 신고 데이터 조회
    public Board getReportById(Long id) {
        logger.info("접수 번호로 데이터 조회 - ID: {}", id);
        return boardRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("ID {}에 해당하는 데이터가 없습니다.", id);
                    return new IllegalArgumentException("ID " + id + "에 해당하는 데이터가 없습니다.");
                });
    }

    // 열럄용 비밀번호 조회
    public Board validatePassword(Long id, String password) {
        logger.info("비밀번호 확인 중 - ID: {}, 입력된 비밀번호: {}", id, password);
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ID " + id + "에 해당하는 데이터가 없습니다."));

        if (!board.getPassword().equals(password)) {
            logger.error("비밀번호 불일치 - ID: {}, 입력된 비밀번호: {}", id, password);
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        logger.info("비밀번호 일치 - ID: {}, Reporter: {}", id, board.getReporter());
        return board;
    }
}
