package com.smarthealth.backend.service.impl;

import java.util.Collections;
import java.util.HashSet;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.smarthealth.backend.dto.RegisterRequest;
import com.smarthealth.backend.entity.Role;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.repository.RoleRepository;
import com.smarthealth.backend.repository.UserRepository;
import com.smarthealth.backend.security.jwt.JwtService;
import com.smarthealth.backend.service.UserService;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import java.util.Map;
import java.util.HashMap;
import com.smarthealth.backend.dto.LoginRequest;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

@Override
public User register(RegisterRequest request) {
    // Get or create ROLE_USER
    Role userRole = roleRepository.findByName("ROLE_USER")
            .orElseGet(() -> {
                Role role = new Role();
                role.setName("ROLE_USER");
                return roleRepository.save(role);
            });
    
    User user = User.builder()
            .email(request.getEmail())
            .password(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder()
                    .encode(request.getPassword()))
            .roles(new HashSet<>(Collections.singleton(userRole)))  // ✅ CORRECT: userRole is guaranteed non-null
            .enabled(true)
            .provider("LOCAL")
            .build();

    return userRepository.save(user);
}




    @Override
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        return jwtService.generateToken(user.getEmail());
    }

    // 🔥 ADD THIS METHOD
    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    
}    private final JavaMailSender mailSender;

    @Override
    public void generateResetOtp(String email) {
        User user = findByEmail(email);
        String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
        user.setResetOtp(otp);
        user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        sendEmail(email, "Password Reset OTP", "Your OTP is: " + otp);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        User user = findByEmail(email);
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }
        if (user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}

    @Override
    public Map<String, Object> login(LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Invalid password");
            }
            
            String token = jwtService.generateToken(user.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            return response;
        } catch (Exception e) {
            throw new IllegalArgumentException("Login failed: " + e.getMessage());
        }
    }
    
    @Override
    public Map<String, Object> googleLogin(String credential) {
        // For now, return a simple implementation
        // In production, decode JWT credential and verify with Google
        try {
            // TODO: Decode the JWT credential
            // For now, assume the credential contains encoded user data
            // This is a placeholder implementation
            
            String email = "google-user@smarthealth.com"; // TODO: Extract from credential
            
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        // Create new user if doesn't exist
                        Role userRole = roleRepository.findByName("ROLE_USER")
                                .orElseGet(() -> {
                                    Role role = new Role();
                                    role.setName("ROLE_USER");
                                    return roleRepository.save(role);
                                });
                        
                        User newUser = User.builder()
                                .email(email)
                                .provider("GOOGLE")
                                .password("") // Google users don't have passwords
                                .enabled(true)
                                .roles(new HashSet<>(Collections.singleton(userRole)))
                                .build();
                        return userRepository.save(newUser);
                    });
            
            String token = jwtService.generateToken(user.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            return response;
        } catch (Exception e) {
            throw new IllegalArgumentException("Google login failed: " + e.getMessage());
        }
    }
