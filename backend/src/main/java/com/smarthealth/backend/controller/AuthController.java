package com.smarthealth.backend.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
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
public class AuthController {
    private final UserService userService;

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Get user details from service
            User user = userService.findByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "User not found"));
            }

            // Validate password
            String token = userService.login(request.getEmail(), request.getPassword());

            // Get user role (get first role or default)
            String role = user.getRoles().stream()
                    .map(r -> r.getName())
                    .findFirst()
                    .orElse("USER");

            // Get user name from profile or use email
            String name = (user.getProfile() != null && user.getProfile().getName() != null) 
                

            // Create response
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setRole(role);
            response.setName(name);
            response.setEmail(user.getEmail());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Login failed: " + e.getMessage()));
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
                    .roles(user.getRoles()
                            .stream()
                            .map(role -> role.getName())
                            .collect(Collectors.toSet()))
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }
}
