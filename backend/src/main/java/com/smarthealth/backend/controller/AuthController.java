package com.smarthealth.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarthealth.backend.dto.LoginRequest;
import com.smarthealth.backend.dto.LoginResponse;
import com.smarthealth.backend.dto.RegisterRequest;
import com.smarthealth.backend.dto.UserResponse;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5175")
public class AuthController {

    private final UserService userService;

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {

            User user = userService.findByEmail(request.getEmail());
            String token = userService.login(request.getEmail(), request.getPassword());

            String role = user.getRoles().stream()
                    .map(roleEntity -> roleEntity.getName())
                    .findFirst()
                    .orElse("USER");

            String name = user.getProfile() != null && user.getProfile().getName() != null
                    ? user.getProfile().getName()
                    : user.getEmail().split("@")[0];

            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setRole(role);
            response.setName(name);
            response.setEmail(user.getEmail());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Login failed"));
        }
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request);

            UserResponse response = UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .provider(user.getProvider())
                    .enabled(user.isEnabled())
                    .role(user.getRoles().stream()
                            .map(roleEntity -> roleEntity.getName())
                            .findFirst()
                            .orElse("USER"))   // ✅ send simple role
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }
}
