package com.smarthealth.backend.service;

import com.smarthealth.backend.dto.RegisterRequest;
import com.smarthealth.backend.entity.User;

public interface UserService {

    User register(RegisterRequest request);
    String login(String email, String password);

}
