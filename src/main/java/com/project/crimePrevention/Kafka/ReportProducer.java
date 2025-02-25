package com.project.crimePrevention.Kafka;

import com.fasterxml.jackson.databind.JsonSerializer;
import com.project.crimePrevention.Model.Report;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ReportProducer {

    private static final String REPORT_TOPIC = "report-topic";

    private final KafkaTemplate<String, Report> kafkaTemplate; // JSON 문자열을 보내야 하므로 <String, String> 사용

    @Autowired
    public ReportProducer(@Qualifier("reportKafkaTemplate") KafkaTemplate<String, Report> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendReport(Report report) {
        kafkaTemplate.send(REPORT_TOPIC, report);
    }
}
