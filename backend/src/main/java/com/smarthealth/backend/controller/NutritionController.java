package com.smarthealth.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smarthealth.backend.entity.NutritionLog;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.repository.NutritionLogRepository;
import com.smarthealth.backend.repository.UserRepository;
import com.smarthealth.backend.service.DailyLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/nutrition")
@RequiredArgsConstructor
@CrossOrigin
public class NutritionController {

    private final NutritionLogRepository nutritionRepository;
    private final UserRepository userRepository;
    private final DailyLogService dailyLogService;

    @PostMapping
    public ResponseEntity<?> addNutritionLog(@RequestBody NutritionLog log, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        log.setUser(user);
        if (log.getLogDate() == null) {
            log.setLogDate(LocalDate.now());
        }

        NutritionLog saved = nutritionRepository.save(log);
        
        // Sync with DailyLog
        dailyLogService.updateNutritionStats(user, saved.getLogDate(), saved.getCalories());
        
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<?> getNutritionLogs(
            @RequestParam(required = false) String date,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        LocalDate queryDate = (date != null && !date.isEmpty()) ? LocalDate.parse(date) : LocalDate.now();
        List<NutritionLog> logs = nutritionRepository.findByUserAndLogDate(user, queryDate);
        return ResponseEntity.ok(logs);
    }
}
