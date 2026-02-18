package com.smarthealth.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarthealth.backend.entity.Profile;
import com.smarthealth.backend.service.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping
    public Profile createOrUpdateProfile(@RequestBody Profile profile,
                                         Authentication authentication) {

        String email = authentication.getName();

        return profileService.createOrUpdateProfile(profile, email);
    }

    @GetMapping
    public Profile getProfile(Authentication authentication) {

        String email = authentication.getName();

        return profileService.getProfile(email);
    }
}
