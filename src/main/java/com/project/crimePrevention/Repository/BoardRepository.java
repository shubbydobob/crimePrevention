package com.project.crimePrevention.Repository;

import com.project.crimePrevention.Model.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findAllByOrderByCreateDateDesc(); // 최신순 정렬

    // 페이징을 고려한 최신순 정렬
    Page<Board> findAllByOrderByCreateDateDesc(Pageable pageable);
}
