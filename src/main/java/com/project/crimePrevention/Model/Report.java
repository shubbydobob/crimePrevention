package com.project.crimePrevention.Model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Report implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String reporter;
    private String phoneNumber;
    private String reportTitle;
    private String content;
    private String majorCategory;
    private String middleCategory;
    private String occurrenceDate; // Kafka 전송을 위해 String 타입 사용
    private String occurrenceTime;
    private String password;

    // ID를 제외한 생성자 추가 (기존 BoardController와 호환)
    public Report(String reporter, String phoneNumber, String reportTitle, String content,
                  String majorCategory, String middleCategory, String occurrenceDate,
                  String occurrenceTime, String password) {
        this.reporter = reporter;
        this.phoneNumber = phoneNumber;
        this.reportTitle = reportTitle;
        this.content = content;
        this.majorCategory = majorCategory;
        this.middleCategory = middleCategory;
        this.occurrenceDate = occurrenceDate;
        this.occurrenceTime = occurrenceTime;
        this.password = password;
    }
}
