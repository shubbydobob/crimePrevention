package com.project.crimePrevention.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class GraphesService {

    private static final String FLASK_BASE_URL = "http://127.0.0.1:5000";
    private final RestTemplate restTemplate = new RestTemplate();

    // 특정 메인 지역의 세부 지역 리스트
    public List<String> getMainRegions() {
        String url = FLASK_BASE_URL + "/graphes";
        List<String> regions = restTemplate.getForObject(url, List.class);
        return regions != null ? regions : Collections.emptyList();
    }

    // 서브지역 목록 (프록시)
    public List<String> getSubregions(String mainRegion) {
        String url = FLASK_BASE_URL + "/subregions/" + mainRegion;
        List<String> subregions = restTemplate.getForObject(url, List.class);
        return subregions != null ? subregions : Collections.emptyList();
    }

    // 특정 세부 지역 범죄 데이터 (프록시)
    public Map<String, Object> getPlot(String mainRegion, String subRegion) {
        String url = FLASK_BASE_URL + "/plot/" + mainRegion + "/" + subRegion;
        return restTemplate.getForObject(url, Map.class);
    }

    // Flask API에서 뉴스 데이터를 가져와 default_date 반환
    public String getDefaultDate() {
        String url = FLASK_BASE_URL + "/graphes/news";
        Map<String, Object> newsData = restTemplate.getForObject(url, Map.class);
        return newsData != null ? (String) newsData.get("default_date") : "";
    }

    // Flask API에서 뉴스 데이터를 가져와 html_table 반환
    public String getHtmlTable() {
        String url = FLASK_BASE_URL + "/graphes/news";
        Map<String, Object> newsData = restTemplate.getForObject(url, Map.class);
        return newsData != null ? (String) newsData.get("html_table") : "";
    }

    // Flask API에서 뉴스 데이터를 가져와 초기 기사 리스트 반환
    public List<Map<String, Object>> getInitialArticles() {
        String url = FLASK_BASE_URL + "/graphes/news";
        Map<String, Object> newsData = restTemplate.getForObject(url, Map.class);
        if (newsData != null && newsData.containsKey("initial_articles")) {
            return (List<Map<String, Object>>) newsData.get("initial_articles");
        }
        return Collections.emptyList();
    }

    // 현재 시간대 예상 범죄 TOP 3
    public Map<String, Object> getCurrentTimeTop3(int timeRangeIndex) {
        String url = UriComponentsBuilder.fromHttpUrl(FLASK_BASE_URL + "/graphes/current_time_top3/{timeRangeIndex}")
                .buildAndExpand(timeRangeIndex)
                .toUriString();
        return restTemplate.getForObject(url, Map.class);
    }

    // 요일별 범죄 발생률
    public Map<String, Object> getDayOfWeekCrime() {
        String url = FLASK_BASE_URL + "/graphes/day_of_week_crime";
        return restTemplate.getForObject(url, Map.class);
    }

}
