package com.project.crimePrevention;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.project.crimePrevention.Model")  // ✅ 엔티티 스캔 추가
@EnableJpaRepositories("com.project.crimePrevention.Repository") // ✅ 리포지토리 스캔 추가
public class CrimePreventionApplication {

	public static void main(String[] args) {
		SpringApplication.run(CrimePreventionApplication.class, args);
	}

}
