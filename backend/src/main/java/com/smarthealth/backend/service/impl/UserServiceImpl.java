package com.smarthealth.backend.service.impl;

import java.util.Set;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.smarthealth.backend.dto.RegisterRequest;
import com.smarthealth.backend.entity.Role;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.entity.Profile;
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

    // ================= REGISTER =================
    @Override
    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role roleUser = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(roleUser))
                .build();
        
        // Create and save profile with name
        Profile profile = Profile.builder()
                .user(user)
                .name(request.getName())
                .build();
        user.setProfile(profile);
        

        return userRepository.save(user);
    }

    // ================= LOGIN =================
    @Override
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        return jwtService.generateToken(user.getEmail());
    }
}
