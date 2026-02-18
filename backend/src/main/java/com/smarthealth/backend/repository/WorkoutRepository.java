package com.smarthealth.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.entity.WorkoutLog;

public interface WorkoutRepository extends JpaRepository<WorkoutLog, Long> {

    List<WorkoutLog> findByUser(User user);
}
