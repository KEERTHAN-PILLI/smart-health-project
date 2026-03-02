package com.smarthealth.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.smarthealth.backend.entity.*;
import com.smarthealth.backend.repository.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
@CrossOrigin
public class TrainerController {

    private final TrainerConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final WorkoutRepository workoutRepository;

    @GetMapping("/dashboard")
    public String trainerDashboard() {
        return "Welcome TRAINER dashboard";
    }

    @GetMapping("/pending-requests")
    public List<Map<String, Object>> getPendingRequests(Authentication authentication) {
        String trainerEmail = authentication.getName();
        List<TrainerConnection> connections = connectionRepository.findByTrainerEmailAndStatus(trainerEmail, "PENDING");

        return connections.stream().map(conn -> {
            Map<String, Object> map = new HashMap<>();
            map.put("connectionId", conn.getId());
            map.put("userEmail", conn.getUserEmail());

            userRepository.findByEmail(conn.getUserEmail()).ifPresent(user -> {
                if (user.getProfile() != null && user.getProfile().getName() != null) {
                    map.put("userName", user.getProfile().getName());
                } else {
                    map.put("userName", user.getEmail());
                }
            });
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping("/approve-client")
    public TrainerConnection approveClient(@RequestBody Map<String, String> payload, Authentication authentication) {
        String trainerEmail = authentication.getName();
        String userEmail = payload.get("userEmail");

        TrainerConnection connection = connectionRepository.findByUserEmailAndTrainerEmail(userEmail, trainerEmail)
                .orElseThrow(() -> new RuntimeException("Connection request not found"));

        if (!connection.getStatus().equals("PENDING")) {
            throw new RuntimeException("Connection is not pending");
        }

        connection.setStatus("APPROVED");
        return connectionRepository.save(connection);
    }

    @GetMapping("/clients")
    public List<User> getConnectedClients(Authentication authentication) {

        String trainerEmail = authentication.getName();

        List<TrainerConnection> connections = connectionRepository.findByTrainerEmailAndStatus(trainerEmail,
                "APPROVED");

        return connections.stream()
                .map(conn -> userRepository.findByEmail(conn.getUserEmail()).orElse(null))
                .collect(Collectors.toList());
    }

    @GetMapping("/client/{clientEmail}/workouts")
    public List<WorkoutLog> getClientWorkouts(
            @PathVariable String clientEmail,
            Authentication authentication) {

        String trainerEmail = authentication.getName();

        // 1. Verify connection exists and is approved
        List<TrainerConnection> connections = connectionRepository.findByTrainerEmailAndStatus(trainerEmail,
                "APPROVED");
        boolean isConnected = connections.stream()
                .anyMatch(conn -> conn.getUserEmail().equals(clientEmail));

        if (!isConnected) {
            throw new RuntimeException("Not authorized to view this client's data.");
        }

        // 2. Fetch User and their workouts
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        return workoutRepository.findByUser(client);
    }
}