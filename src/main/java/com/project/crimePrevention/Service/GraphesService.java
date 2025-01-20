package com.project.crimePrevention.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.List;
import java.util.Map;

@Service
public class GraphesService {

    @Autowired
    private RestTemplate restTemplate;

    private static final String FLASK_BASE_URL = "http://127.0.0.1:5000";

    // 현재 시간대 예상 범죄 TOP 3
    public Map getCurrentTimeTop3(int timeRangeIndex) {
        String url = UriComponentsBuilder.fromHttpUrl(FLASK_BASE_URL + "/current_time_top3/{timeRangeIndex}")
                .buildAndExpand(timeRangeIndex)
                .toUriString();

        return restTemplate.getForObject(url, Map.class);
    }

    // 요일별 범죄 발생률
    public Map getDayOfWeekCrime() {
        String url = FLASK_BASE_URL + "/day_of_week_crime";

        return restTemplate.getForObject(url, Map.class);
    }

    // 특정 메인 지역의 세부 지역 리스트
    public List<String> getMainRegions() {
        // Flask 서버의 데이터를 요청
        String url = FLASK_BASE_URL + "/";
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        // regions 데이터를 반환
        return (List<String>) response.get("regions");
    }
}
