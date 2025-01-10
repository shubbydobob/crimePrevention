package com.project.crimePrevention.Repository;

import com.project.crimePrevention.Model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Admin findByAdmin(String admin);
}
