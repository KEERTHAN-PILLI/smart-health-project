package com.smarthealth.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    // ✅ Get all pending connection requests for this trainer
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
                    map.put("userName", user.getEmail().split("@")[0]);
                }
            });
            return map;
        }).collect(Collectors.toList());
    }

    // ✅ Approve a pending connection request
    @PostMapping("/approve-client")
    public ResponseEntity<?> approveClient(@RequestBody Map<String, String> payload, Authentication authentication) {
        try {
            String trainerEmail = authentication.getName();
            String userEmail = payload.get("userEmail");

            TrainerConnection connection = connectionRepository.findByUserEmailAndTrainerEmail(userEmail, trainerEmail)
                    .orElseThrow(() -> new RuntimeException("Connection request not found"));

            if (!connection.getStatus().equals("PENDING")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Connection is not pending"));
            }

            connection.setStatus("APPROVED");
            connectionRepository.save(connection);
            return ResponseEntity.ok(Map.of("message", "Client approved!", "status", "APPROVED"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Reject a pending connection request
    @PostMapping("/reject-client")
    public ResponseEntity<?> rejectClient(@RequestBody Map<String, String> payload, Authentication authentication) {
        try {
            String trainerEmail = authentication.getName();
            String userEmail = payload.get("userEmail");

            TrainerConnection connection = connectionRepository.findByUserEmailAndTrainerEmail(userEmail, trainerEmail)
                    .orElseThrow(() -> new RuntimeException("Connection request not found"));

            if (!connection.getStatus().equals("PENDING")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Connection is not pending"));
            }

            connection.setStatus("REJECTED");
            connectionRepository.save(connection);
            return ResponseEntity.ok(Map.of("message", "Client rejected", "status", "REJECTED"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Get all approved (connected) clients — returns flattened data
    @GetMapping("/clients")
    public List<Map<String, Object>> getConnectedClients(Authentication authentication) {
        String trainerEmail = authentication.getName();
        List<TrainerConnection> connections = connectionRepository.findByTrainerEmailAndStatus(trainerEmail,
                "APPROVED");

        return connections.stream().map(conn -> {
            Map<String, Object> map = new HashMap<>();
            map.put("email", conn.getUserEmail());

            userRepository.findByEmail(conn.getUserEmail()).ifPresent(user -> {
                map.put("id", user.getId());
                if (user.getProfile() != null && user.getProfile().getName() != null) {
                    map.put("name", user.getProfile().getName());
                } else {
                    map.put("name", user.getEmail().split("@")[0]);
                }
                // Include profile data so trainer can track
                if (user.getProfile() != null) {
                    map.put("age", user.getProfile().getAge());
                    map.put("weight", user.getProfile().getWeight());
                    map.put("height", user.getProfile().getHeight());
                    map.put("fitnessGoal", user.getProfile().getFitnessGoal());
                }
            });
            return map;
        }).collect(Collectors.toList());
    }

    // ✅ Get a specific client's workouts
    @GetMapping("/client/{clientEmail}/workouts")
    public ResponseEntity<?> getClientWorkouts(
            @PathVariable String clientEmail,
            Authentication authentication) {
        try {
            String trainerEmail = authentication.getName();

            // Verify connection exists and is approved
            List<TrainerConnection> connections = connectionRepository.findByTrainerEmailAndStatus(trainerEmail,
                    "APPROVED");
            boolean isConnected = connections.stream()
                    .anyMatch(conn -> conn.getUserEmail().equals(clientEmail));

            if (!isConnected) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authorized to view this client's data."));
            }

            User client = userRepository.findByEmail(clientEmail)
                    .orElseThrow(() -> new RuntimeException("Client not found"));

            return ResponseEntity.ok(workoutRepository.findByUser(client));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}