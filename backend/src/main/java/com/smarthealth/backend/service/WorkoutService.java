package com.smarthealth.backend.service;

import java.util.List;

import com.smarthealth.backend.entity.WorkoutLog;

public interface WorkoutService {

    WorkoutLog addWorkout(String email, WorkoutLog workout);

    List<WorkoutLog> getUserWorkouts(String email);

    void deleteWorkout(Long id, String email);
}
