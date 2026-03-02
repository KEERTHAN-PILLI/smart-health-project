package com.smarthealth.backend.service.impl;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.smarthealth.backend.dto.RegisterRequest;
import com.smarthealth.backend.dto.LoginRequest;
import com.smarthealth.backend.entity.Role;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.entity.Profile;
import com.smarthealth.backend.repository.RoleRepository;
import com.smarthealth.backend.repository.UserRepository;
import com.smarthealth.backend.security.jwt.JwtService;
import com.smarthealth.backend.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Map<String, Object> register(RegisterRequest request) {
        // Normalise role: "USER" or "TRAINER" -> "ROLE_USER" or "ROLE_TRAINER"
        String requestedRole = request.getRole() != null ? request.getRole() : "USER";
        String roleName = requestedRole.startsWith("ROLE_") ? requestedRole : "ROLE_" + requestedRole;

        Role userRole = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(new HashSet<>(Collections.singleton(userRole)))
                .enabled(true)
                .provider("LOCAL")
                .build();

        User savedUser = userRepository.save(user);

        // Create initial profile with name
        Profile profile = Profile.builder()
                .name(request.getName())
                .user(savedUser)
                .build();

        // Save profile (CascadeType.ALL on User.profile should handle this if we set
        // it,
        // but User.profile is mappedBy="user" so we must save Profile explicitly or set
        // User.profile)
        // Let's set it on User to be safe if cascade is configured
        savedUser.setProfile(profile);
        userRepository.save(savedUser);

        String token = jwtService.generateToken(savedUser.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", savedUser);
        return response;
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
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Login failed: " + e.getMessage());
        }
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

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

    @Override
    public Map<String, Object> googleLogin(String email, String name, String role) {
        // Normalise: accept "USER"/"TRAINER" or "ROLE_USER"/"ROLE_TRAINER"
        String roleName = role != null && role.startsWith("ROLE_") ? role : "ROLE_" + (role != null ? role : "USER");
        try {
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("Email is required for Google login");
            }

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        // Use the role chosen by the user on the login page
                        Role assignedRole = roleRepository.findByName(roleName)
                                .orElseGet(() -> {
                                    Role newRole = new Role();
                                    newRole.setName(roleName);
                                    return roleRepository.save(newRole);
                                });

                        User newUser = User.builder()
                                .email(email)
                                .provider("GOOGLE")
                                .password("")
                                .enabled(true)
                                .roles(new HashSet<>(Collections.singleton(assignedRole)))
                                .build();
                        User savedUser = userRepository.save(newUser);

                        // Create profile for new Google user
                        Profile profile = Profile.builder()
                                .name(name)
                                .user(savedUser)
                                .build();
                        savedUser.setProfile(profile);
                        return userRepository.save(savedUser);
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

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
