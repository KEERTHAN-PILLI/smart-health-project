package com.smarthealth.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarthealth.backend.entity.DailyLog;
import com.smarthealth.backend.entity.Goal;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.repository.DailyLogRepository;
import com.smarthealth.backend.repository.GoalRepository;
import com.smarthealth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/analytics")
@RequiredArgsConstructor
@CrossOrigin
public class AnalyticsController {

    private final DailyLogRepository dailyLogRepository;
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    // ==========================================
    // DAILY LOGS
    // ==========================================

    @PostMapping("/log")
    public ResponseEntity<?> addOrUpdateLog(@RequestBody DailyLog payload, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            LocalDate logDate = payload.getDate() != null ? payload.getDate() : LocalDate.now();

            // Check if log for this date already exists for this user
            List<DailyLog> existingLogs = dailyLogRepository.findByUserAndDateBetweenOrderByDateAsc(user, logDate, logDate);
            DailyLog logToSave;
            if (!existingLogs.isEmpty()) {
                logToSave = existingLogs.get(0);
                // Update fields
                if (payload.getWorkoutDuration() != null) logToSave.setWorkoutDuration(payload.getWorkoutDuration());
                if (payload.getCaloriesBurned() != null) logToSave.setCaloriesBurned(payload.getCaloriesBurned());
                if (payload.getCaloriesConsumed() != null) logToSave.setCaloriesConsumed(payload.getCaloriesConsumed());
                if (payload.getWaterIntake() != null) logToSave.setWaterIntake(payload.getWaterIntake());
                if (payload.getSleepDuration() != null) logToSave.setSleepDuration(payload.getSleepDuration());
            } else {
                logToSave = payload;
                logToSave.setUser(user);
                logToSave.setDate(logDate);
            }

            DailyLog saved = dailyLogRepository.save(logToSave);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<DailyLog> logs = dailyLogRepository.findByUserOrderByDateAsc(user);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // GOALS
    // ==========================================

    @PostMapping("/goal")
    public ResponseEntity<?> addGoal(@RequestBody Goal payload, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            payload.setUser(user);
            if (payload.getAchieved() == null) {
                payload.setAchieved(false);
            }
            if (payload.getCurrentValue() == null) {
                payload.setCurrentValue(0.0);
            }
            Goal saved = goalRepository.save(payload);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/goals")
    public ResponseEntity<?> getGoals(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Goal> goals = goalRepository.findByUser(user);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/goal/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody Goal payload, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Goal> existingOpt = goalRepository.findById(id);
            if (!existingOpt.isPresent() || !existingOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized or Not Found"));
            }

            Goal existing = existingOpt.get();
            if (payload.getGoalType() != null) existing.setGoalType(payload.getGoalType());
            if (payload.getTargetValue() != null) existing.setTargetValue(payload.getTargetValue());
            if (payload.getCurrentValue() != null) existing.setCurrentValue(payload.getCurrentValue());
            if (payload.getUnit() != null) existing.setUnit(payload.getUnit());
            if (payload.getStartDate() != null) existing.setStartDate(payload.getStartDate());
            if (payload.getEndDate() != null) existing.setEndDate(payload.getEndDate());
            if (payload.getAchieved() != null) existing.setAchieved(payload.getAchieved());

            Goal saved = goalRepository.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/goal/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Goal> existingOpt = goalRepository.findById(id);
            if (!existingOpt.isPresent() || !existingOpt.get().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized or Not Found"));
            }

            goalRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Goal deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
