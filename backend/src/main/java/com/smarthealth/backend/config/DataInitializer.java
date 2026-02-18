package com.smarthealth.backend.config;

import org.springframework.stereotype.Component;

import com.smarthealth.backend.entity.Role;
import com.smarthealth.backend.repository.RoleRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final RoleRepository roleRepository;

    @PostConstruct
    public void initRoles() {

        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            roleRepository.save(Role.builder().name("ROLE_USER").build());
        }

        if (roleRepository.findByName("ROLE_TRAINER").isEmpty()) {
            roleRepository.save(Role.builder().name("ROLE_TRAINER").build());
        }
    }
}
