package com.smarthealth.backend.service.impl;

import org.springframework.stereotype.Service;

import com.smarthealth.backend.entity.Profile;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.repository.ProfileRepository;
import com.smarthealth.backend.repository.UserRepository;
import com.smarthealth.backend.service.ProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Override
    public Profile createOrUpdateProfile(Profile profile, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        profile.setUser(user);

        return profileRepository.save(profile);
    }

    @Override
    public Profile getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return profileRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
    }
}
