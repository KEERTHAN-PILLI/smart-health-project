package com.smarthealth.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smarthealth.backend.entity.NutritionLog;
import com.smarthealth.backend.entity.User;

@Repository
public interface NutritionLogRepository extends JpaRepository<NutritionLog, Long> {
    List<NutritionLog> findByUserAndLogDate(User user, LocalDate logDate);
    List<NutritionLog> findByUserAndLogDateBetween(User user, LocalDate startDate, LocalDate endDate);
}
