package com.project.crimePrevention.Repository;

import com.project.crimePrevention.Model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
