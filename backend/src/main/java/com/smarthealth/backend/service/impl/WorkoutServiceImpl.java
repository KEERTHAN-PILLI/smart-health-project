package com.smarthealth.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.entity.WorkoutLog;
import com.smarthealth.backend.repository.UserRepository;
import com.smarthealth.backend.repository.WorkoutRepository;
import com.smarthealth.backend.service.WorkoutService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutServiceImpl implements WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;

    @Override
    public WorkoutLog addWorkout(String email, WorkoutLog workout) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        workout.setUser(user);
        return workoutRepository.save(workout);
    }

    @Override
    public List<WorkoutLog> getUserWorkouts(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return workoutRepository.findByUser(user);
    }

    @Override
    public void deleteWorkout(Long id, String email) {

        WorkoutLog workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        if (!workout.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        workoutRepository.delete(workout);
    }
    
}
