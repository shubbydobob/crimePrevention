package com.project.crimePrevention.Controller;

import com.project.crimePrevention.Service.GraphesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/graphes") // REST API 및 HTML 경로를 관리
public class GraphesController {

    @Autowired
    private GraphesService graphesService;

    // HTML 페이지 반환
    @GetMapping("/graphes.html")
    public String renderGraphesPage() {
        return "graphes"; // "templates/graphes.html"을 반환
    }

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
    @GetMapping("/subregions/{mainRegion}")
    @ResponseBody // JSON 응답
    public ResponseEntity<Map<String, Object>> getSubRegions(@PathVariable String mainRegion) {
        Map<String, Object> response = graphesService.getSubRegions(mainRegion);
        return ResponseEntity.ok(response);
    }
}
