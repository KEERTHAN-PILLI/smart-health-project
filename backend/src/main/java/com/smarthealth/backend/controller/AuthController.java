package com.smarthealth.backend.controller;

import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarthealth.backend.dto.LoginRequest;
import com.smarthealth.backend.dto.RegisterRequest;
import com.smarthealth.backend.dto.UserResponse;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        try {
            String token = userService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(token);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        User user = userService.register(request);

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .provider(user.getProvider())
                .enabled(user.isEnabled())
                .roles(user.getRoles()
                        .stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()))
                .build();

        return ResponseEntity.ok(response);
    }
}
