package com.smarthealth.backend.service;

import java.time.LocalDate;
import com.smarthealth.backend.entity.User;

public interface DailyLogService {
    void updateWorkoutStats(User user, LocalDate date, int duration, int calories);
    void updateNutritionStats(User user, LocalDate date, int calories);
    void updateWaterLog(User user, LocalDate date, int waterMl);
    void updateSleepLog(User user, LocalDate date, double sleepHours);
}
