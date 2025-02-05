package com.project.crimePrevention.Controller;

import com.project.crimePrevention.Service.GraphesService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.ui.Model;

import java.util.Map;

@Controller
@RequestMapping("/graphes") // REST API 및 HTML 경로를 관리
public class GraphesController {


    private final GraphesService graphesService;

    public GraphesController(GraphesService graphesService) {
        this.graphesService = graphesService;
    }

    // 현재 시간대 예상 범죄 TOP 3 (REST API)
    @GetMapping("/current_time_top3/{timeRangeIndex}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCurrentTimeTop3(@PathVariable int timeRangeIndex) {
        Map<String, Object> response = graphesService.getCurrentTimeTop3(timeRangeIndex);
        return ResponseEntity.ok(response);
    }

    // 요일별 범죄 발생률
    @GetMapping("/day_of_week_crime")
    @ResponseBody // JSON 응답
    public ResponseEntity<Map<String, Object>> getDayOfWeekCrime() {
        Map<String, Object> response = graphesService.getDayOfWeekCrime();
        return ResponseEntity.ok(response);
    }

    // 서브지역 목록 (REST API 프록시)
    @GetMapping("/subregions/{mainRegion}")
    @ResponseBody
    public ResponseEntity<List<String>> getSubregions(@PathVariable String mainRegion) {
        List<String> subregions = graphesService.getSubregions(mainRegion);
        return ResponseEntity.ok(subregions);
    }

    // 특정 세부 지역 범죄 데이터 (REST API 프록시)
    @GetMapping("/plot/{mainRegion}/{subRegion}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getPlot(@PathVariable String mainRegion, @PathVariable String subRegion) {
        Map<String, Object> response = graphesService.getPlot(mainRegion, subRegion);
        return ResponseEntity.ok(response);
    }
    
    // Thymeleaf를 이용한 HTML 페이지 렌더링
    @GetMapping("")
    public String getGraphesPage(Model model) {
        List<String> regions = graphesService.getMainRegions();
        String defaultDate = graphesService.getDefaultDate();
        String htmlTable = graphesService.getHtmlTable();
        List<Map<String, Object>> initialArticles = graphesService.getInitialArticles();

        // 기존 예측 데이터도 함께 추가 (필요시)
        Map<String, Object> currentTimeTop3 = graphesService.getCurrentTimeTop3(3);
        Map<String, Object> dayOfWeekCrime = graphesService.getDayOfWeekCrime();

        model.addAttribute("regions", regions);
        model.addAttribute("default_date", defaultDate);
        model.addAttribute("html_table", htmlTable);
        model.addAttribute("initial_articles", initialArticles);
        model.addAttribute("currentTimeTop3", currentTimeTop3);
        model.addAttribute("dayOfWeekCrime", dayOfWeekCrime);

        return "graphes"; // src/main/resources/templates/graphes.html
    }
}
