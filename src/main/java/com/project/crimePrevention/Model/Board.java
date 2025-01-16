package com.project.crimePrevention.Model;

import jakarta.persistence.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "Board")
public class Board {

    @Id //기본키 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 신고 접수번호

    @Column(name = "reporter", nullable = false)
    private String reporter; // 신고자

    @Column(name = "phoneNumber", nullable = false)
    private String phoneNumber; // 신고자 연락처

    @Column(name = "reportTitle", nullable = false)
    private String reportTitle; // 신고 사유

    @Column(name = "content", nullable = false)
    private String content; // 신고 내용

    @Column(name = "majorCategory", nullable = false)
    private String majorCategory; // 범죄 대분류

    @Column(name = "middleCategory", nullable = false)
    private String middleCategory; // 범죄 중분류

    @Column(name = "occurrence_date", nullable = false)
    private LocalDate occurrenceDate; // 범죄 발생날짜

    @Column(name = "occurrence_time", nullable = false)
    private LocalTime occurrenceTime; // 범죄 발생시간

    // 파일을 String이 아닌 MultipartFile로 받아야 합니다.
    @Transient  // DB에 저장되지 않도록 Transient 어노테이션을 사용
    private MultipartFile file; // 파일 업로드를 위한 필드

    @Column(name = "file_path")  // DB에서 파일 경로를 저장할 필드
    private String filePath;  // 파일 경로 저장

    @Column(name = "password", nullable = false)
    private String password; // 게시물 열람용 비밀번호

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate; // 작성일

    @Column(nullable = true)
    private String processingStatus = "접수 중"; // 기본값 설정

    @Transient
    private String formattedDate; // 포맷팅된 날짜를 저장하기 위한 필드

    @Column(name = "reply")
    private String reply; // 답변 내용

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReporter() {
        return reporter;
    }

    public void setReporter(String reporter) {
        this.reporter = reporter;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getReportTitle() {
        return reportTitle;
    }

    public void setReportTitle(String reportTitle) {
        this.reportTitle = reportTitle;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMajorCategory() {
        return majorCategory;
    }

    public void setMajorCategory(String majorCategory) {
        this.majorCategory = majorCategory;
    }

    public String getMiddleCategory() {
        return middleCategory;
    }

    public void setMiddleCategory(String middleCategory) {
        this.middleCategory = middleCategory;
    }

    public LocalDate getOccurrenceDate() {
        return occurrenceDate;
    }

    public void setOccurrenceDate(LocalDate occurrenceDate) {
        this.occurrenceDate = occurrenceDate;
    }

    public LocalTime getOccurrenceTime() {
        return occurrenceTime;
    }

    public void setOccurrenceTime(LocalTime occurrenceTime) {
        this.occurrenceTime = occurrenceTime;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public String getProcessingStatus() {
        return processingStatus;
    }

    public void setProcessingStatus(String processingStatus) {
        this.processingStatus = processingStatus;
    }

    public String getFormattedDate() {
        return formattedDate;
    }

    public void setFormattedDate(String formattedDate) {
        this.formattedDate = formattedDate;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    @Override
    public String toString() {
        return "Board{" +
                "id=" + id +
                ", reporter='" + reporter + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", reportTitle='" + reportTitle + '\'' +
                ", content='" + content + '\'' +
                ", majorCategory='" + majorCategory + '\'' +
                ", middleCategory='" + middleCategory + '\'' +
                ", occurrenceDate=" + occurrenceDate +
                ", occurrenceTime=" + occurrenceTime +
                ", file=" + file +
                ", filePath='" + filePath + '\'' +
                ", password='" + password + '\'' +
                ", createDate=" + createDate +
                ", processingStatus='" + processingStatus + '\'' +
                ", formattedDate='" + formattedDate + '\'' +
                ", reply='" + reply + '\'' +
                '}';
    }
}

