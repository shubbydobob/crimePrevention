package com.project.crimePrevention.Controller;

import com.project.crimePrevention.Service.GraphesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.ui.Model;

import java.util.Map;

@Controller
@RequestMapping("/graphes") // REST API 및 HTML 경로를 관리
public class GraphesController {

    @Autowired
    private GraphesService graphesService;

    // 현재 시간대 예상 범죄 TOP 3 (REST API)
    @GetMapping("/current-time-top3/{timeRangeIndex}")
    @ResponseBody // JSON 응답
    public ResponseEntity<Map<String, Object>> getCurrentTimeTop3(@PathVariable int timeRangeIndex) {
        Map<String, Object> response = graphesService.getCurrentTimeTop3(timeRangeIndex);
        return ResponseEntity.ok(response);
    }

    // 요일별 범죄 발생률
    @GetMapping("/day-of-week-crime")
    @ResponseBody // JSON 응답
    public ResponseEntity<Map<String, Object>> getDayOfWeekCrime() {
        Map<String, Object> response = graphesService.getDayOfWeekCrime();
        return ResponseEntity.ok(response);
    }

    // 특정 메인 지역의 세부 지역
    @GetMapping("/graphes")
    public String getGraphesPage(Model model) {
        // Flask에서 메인 지역 데이터를 가져옴
        List<String> regions = graphesService.getMainRegions();

        // 데이터를 템플릿에 전달
        model.addAttribute("regions", regions);

        return "graphes"; // graphes.html 템플릿을 렌더링
    }
}
