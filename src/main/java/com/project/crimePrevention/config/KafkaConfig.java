package com.project.crimePrevention.config;

import com.project.crimePrevention.Model.Report;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    private static final String KAFKA_BROKER = "localhost:9092";
    private static final String GROUP_ID = "report-group";

    // Kafka Consumer 설정 (리포트 수신)
    @Bean
    public ConsumerFactory<String, Report> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, KAFKA_BROKER);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, GROUP_ID);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*"); // JSON 변환 허용

        props.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1048576); // 최소 1MB 크기일 때 메시지 가져옴
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 5000); // 한 번에 가져올 수 있는 최대 레코드 수 증가

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), new JsonDeserializer<>(Report.class));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Report> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Report> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(5); // 병렬 소비 활성화
        return factory;
    }

    //  Kafka Producer 설정 (신고 데이터 전송)
    @Bean
    public ProducerFactory<String, Report> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, KAFKA_BROKER);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // 성능 최적화 옵션
        configProps.put(ProducerConfig.ACKS_CONFIG, "1"); // 최소 1개 브로커가 메시지를 수신하면 응답
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 10); // 5ms 동안 메시지를 모아 배치 처리
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 131072); // 배치 크기 증가

        return new DefaultKafkaProducerFactory<>(configProps);
    }

    //  KafkaTemplate Bean 추가
    @Bean
    public KafkaTemplate<String, Report> reportKafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}