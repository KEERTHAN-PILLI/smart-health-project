package com.smarthealth.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smarthealth.backend.entity.TrainerConnection;
import java.util.List;
import java.util.Optional;

public interface TrainerConnectionRepository
        extends JpaRepository<TrainerConnection, Long> {

    List<TrainerConnection> findByTrainerEmailAndStatus(String trainerEmail, String status);

    Optional<TrainerConnection> findByUserEmail(String email);

    Optional<TrainerConnection> findByUserEmailAndTrainerEmail(String userEmail, String trainerEmail);
}