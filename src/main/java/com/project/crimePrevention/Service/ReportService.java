package com.project.crimePrevention.Service;

import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import com.project.crimePrevention.Repository.ReportRepository;
import com.project.crimePrevention.Model.Report;

@Service
public class ReportService {

    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    // 🚀 신고 데이터 저장 시 Redis 캐싱 적용
    @CachePut(value = "reports", key = "#report.id")
    public Report saveReport(Report report) {
        return reportRepository.save(report);
    }

    // 🚀 신고 데이터 조회 시 Redis 캐싱 적용
    @Cacheable(value = "reports", key = "#id", unless = "#result == null", cacheManager = "redisCacheManager")
    public Report getReport(Long id) {
        return reportRepository.findById(id).orElse(null);
    }
}
