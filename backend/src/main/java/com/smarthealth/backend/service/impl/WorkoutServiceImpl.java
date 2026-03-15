package com.smarthealth.backend.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.entity.WorkoutLog;
import com.smarthealth.backend.repository.UserRepository;
import com.smarthealth.backend.repository.WorkoutRepository;
import com.smarthealth.backend.service.DailyLogService;
import com.smarthealth.backend.service.WorkoutService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutServiceImpl implements WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final DailyLogService dailyLogService;

    @Override
    public WorkoutLog addWorkout(String email, WorkoutLog workout) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (workout.getDate() == null) {
            workout.setDate(LocalDate.now());
        }

        workout.setUser(user);
        WorkoutLog saved = workoutRepository.save(workout);
        
        // Sync with DailyLog
        dailyLogService.updateWorkoutStats(user, saved.getDate(), saved.getDurationMinutes(), saved.getCaloriesBurned());
        
        return saved;
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
        
        // Update DailyLog (Subtracting stats)
        dailyLogService.updateWorkoutStats(workout.getUser(), workout.getDate(), 
                                         -workout.getDurationMinutes(), -workout.getCaloriesBurned());
    }
    
}
