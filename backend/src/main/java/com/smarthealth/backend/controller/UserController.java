package com.smarthealth.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import lombok.RequiredArgsConstructor;
import com.smarthealth.backend.entity.*;
import com.smarthealth.backend.repository.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserRepository userRepository;
    private final TrainerConnectionRepository connectionRepository;

    @GetMapping("/dashboard")
    public String userDashboard() {
        return "Welcome USER dashboard";
    }

    @GetMapping("/trainers")
    public List<User> getAllTrainers() {
        return userRepository.findByRoles_Name("ROLE_TRAINER");
    }

    @PostMapping("/connect-trainer")
    public TrainerConnection requestConnection(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        String userEmail = authentication.getName();
        String trainerEmail = payload.get("trainerEmail");

        if (trainerEmail == null || trainerEmail.isEmpty()) {
            throw new RuntimeException("Trainer email is required");
        }

        // Check if already connected or pending
        Optional<TrainerConnection> existing = connectionRepository.findByUserEmail(userEmail);
        if (existing.isPresent()) {
            TrainerConnection conn = existing.get();
            if (conn.getStatus().equals("PENDING") || conn.getStatus().equals("APPROVED")) {
                throw new RuntimeException("Connection request already exists or is approved.");
            } else {
                // If rejected or something else, update it
                conn.setTrainerEmail(trainerEmail);
                conn.setStatus("PENDING");
                return connectionRepository.save(conn);
            }
        }

        TrainerConnection newConnection = new TrainerConnection();
        newConnection.setUserEmail(userEmail);
        newConnection.setTrainerEmail(trainerEmail);
        newConnection.setStatus("PENDING");
        return connectionRepository.save(newConnection);
    }

    @GetMapping("/connection-status")
    public Map<String, Object> getConnectionStatus(Authentication authentication) {
        String userEmail = authentication.getName();
        Optional<TrainerConnection> connOpt = connectionRepository.findByUserEmail(userEmail);

        Map<String, Object> response = new HashMap<>();
        if (connOpt.isPresent()) {
            TrainerConnection conn = connOpt.get();
            response.put("status", conn.getStatus());
            response.put("trainerEmail", conn.getTrainerEmail());

            userRepository.findByEmail(conn.getTrainerEmail()).ifPresent(trainer -> {
                if (trainer.getProfile() != null && trainer.getProfile().getName() != null) {
                    response.put("trainerName", trainer.getProfile().getName());
                } else {
                    response.put("trainerName", trainer.getEmail());
                }
            });
        } else {
            response.put("status", "NONE");
        }
        return response;
    }

    @GetMapping("/debug")
    public Object debug(Authentication authentication) {
        return authentication.getAuthorities();
    }
}
