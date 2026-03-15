package com.smarthealth.backend.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarthealth.backend.entity.DailyLog;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.repository.DailyLogRepository;
import com.smarthealth.backend.service.DailyLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DailyLogServiceImpl implements DailyLogService {

    private final DailyLogRepository dailyLogRepository;

    @Override
    @Transactional
    public void updateWorkoutStats(User user, LocalDate date, int duration, int calories) {
        DailyLog log = getOrCreateLog(user, date);
        log.setWorkoutDuration((log.getWorkoutDuration() == null ? 0 : log.getWorkoutDuration()) + duration);
        log.setCaloriesBurned((log.getCaloriesBurned() == null ? 0 : log.getCaloriesBurned()) + calories);
        dailyLogRepository.save(log);
    }

    @Override
    @Transactional
    public void updateNutritionStats(User user, LocalDate date, int calories) {
        DailyLog log = getOrCreateLog(user, date);
        log.setCaloriesConsumed((log.getCaloriesConsumed() == null ? 0 : log.getCaloriesConsumed()) + calories);
        dailyLogRepository.save(log);
    }

    @Override
    @Transactional
    public void updateWaterLog(User user, LocalDate date, int waterMl) {
        DailyLog log = getOrCreateLog(user, date);
        log.setWaterIntake(waterMl); // Typically we just set the daily total from the UI, but we can also add
        dailyLogRepository.save(log);
    }

    @Override
    @Transactional
    public void updateSleepLog(User user, LocalDate date, double sleepHours) {
        DailyLog log = getOrCreateLog(user, date);
        log.setSleepDuration(sleepHours);
        dailyLogRepository.save(log);
    }

    private DailyLog getOrCreateLog(User user, LocalDate date) {
        List<DailyLog> logs = dailyLogRepository.findByUserAndDateBetweenOrderByDateAsc(user, date, date);
        if (!logs.isEmpty()) {
            return logs.get(0);
        }
        return DailyLog.builder()
                .user(user)
                .date(date)
                .workoutDuration(0)
                .caloriesBurned(0)
                .caloriesConsumed(0)
                .waterIntake(0)
                .sleepDuration(0.0)
                .build();
    }
}
