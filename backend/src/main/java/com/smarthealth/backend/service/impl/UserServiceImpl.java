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

    
}

