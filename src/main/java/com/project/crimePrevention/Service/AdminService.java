package com.project.crimePrevention.Service;

import com.project.crimePrevention.Model.Admin;
import com.project.crimePrevention.Repository.AdminRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // 로그인 검증 메서드
    public boolean login(String admin, String password) {
        Admin foundAdmin = adminRepository.findByAdmin(admin);
        if (foundAdmin != null && foundAdmin.getPassword().equals(password)) {
            return true;
        }
        return false;
    }
}
