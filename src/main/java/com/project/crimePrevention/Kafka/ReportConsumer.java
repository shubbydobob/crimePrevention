package com.project.crimePrevention.Kafka;

import com.project.crimePrevention.Model.Report;

import com.project.crimePrevention.Repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;


@Service
public class ReportConsumer {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @KafkaListener(topics = "report-topic", groupId = "report-group")
    public void consumeReport(Report report) {
        // 🚀 비동기 처리: MySQL & Redis 저장
        CompletableFuture.runAsync(() -> {
            // MySQL 저장
            reportRepository.save(report);

            // Redis 저장 (TTL 60분)
            String redisKey = "reports::" + UUID.randomUUID().toString();
            redisTemplate.opsForValue().set(redisKey, report.toString(), 60 * 60);
        });
    }
}
