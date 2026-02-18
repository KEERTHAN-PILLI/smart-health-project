package com.smarthealth.backend.service;

import com.smarthealth.backend.entity.Profile;

public interface ProfileService {

    Profile createOrUpdateProfile(Profile profile, String email);

    Profile getProfile(String email);
}
