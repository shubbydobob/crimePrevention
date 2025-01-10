package com.project.crimePrevention.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Admin {

    @Id //기본키 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 관리자 계정번호
    
    private String admin; // 관리자 계정
    private String password; // 관리자 비밀번호

    public String getAdmin() {
        return admin;
    }

    public void setAdmin(String admin) {
        this.admin = admin;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "Admin{" +
                "admin='" + admin + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
