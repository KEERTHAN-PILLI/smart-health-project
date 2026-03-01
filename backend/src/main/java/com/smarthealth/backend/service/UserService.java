package com.smarthealth.backend.service;

import com.smarthealth.backend.dto.RegisterRequest;
import com.smarthealth.backend.dto.LoginRequest;
import java.util.Map;
import com.smarthealth.backend.entity.User;

public interface UserService {

    User register(RegisterRequest request);
    
    Map<String, Object> login(com.smarthealth.backend.dto.LoginRequest request);

    Map<String, Object> googleLogin(String credential);

    User findByEmail(String email);
}    void generateResetOtp(String email);
    void resetPassword(String email, String otp, String newPassword);
}
