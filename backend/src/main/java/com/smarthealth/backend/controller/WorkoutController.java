package com.smarthealth.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.entity.WorkoutLog;
import com.smarthealth.backend.service.WorkoutService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    // ➕ Add Workout
    @PostMapping
    public WorkoutLog addWorkout(@RequestBody WorkoutLog workout,
                                  Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        return workoutService.addWorkout(user.getEmail(), workout);
    }

    // 📋 Get Workouts
    @GetMapping
    public List<WorkoutLog> getWorkouts(Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        return workoutService.getUserWorkouts(user.getEmail());
    }

    // ❌ Delete Workout
    @DeleteMapping("/{id}")
    public String deleteWorkout(@PathVariable Long id,
                                 Authentication authentication) {

        User user = (User) authentication.getPrincipal();
        workoutService.deleteWorkout(id, user.getEmail());
        return "Workout deleted successfully";
    }
}
