package com.smarthealth.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import lombok.RequiredArgsConstructor;
import com.smarthealth.backend.entity.*;
import com.smarthealth.backend.repository.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

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

    // ✅ Returns flattened trainer list with id, name, email (no password leak)
    @GetMapping("/trainers")
    public List<Map<String, Object>> getAllTrainers() {
        List<User> trainers = userRepository.findByRoles_Name("ROLE_TRAINER");
        return trainers.stream().map(trainer -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", trainer.getId());
            map.put("email", trainer.getEmail());
            if (trainer.getProfile() != null && trainer.getProfile().getName() != null) {
                map.put("name", trainer.getProfile().getName());
                map.put("specialization", trainer.getProfile().getFitnessGoal()); // Using fitnessGoal as specialization for trainers
            } else {
                map.put("name", trainer.getEmail().split("@")[0]);
                map.put("specialization", "General Fitness");
            }
            return map;
        }).collect(Collectors.toList());
    }

    // ✅ Match trainers based on User's fitness goal
    @GetMapping("/trainers/match")
    public List<Map<String, Object>> getRecommendedTrainers(Authentication authentication) {
        String email = authentication.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        String userGoal = "";
        if (userOpt.isPresent() && userOpt.get().getProfile() != null) {
            userGoal = userOpt.get().getProfile().getFitnessGoal();
        }

        final String targetGoal = userGoal != null ? userGoal.toLowerCase() : "";

        List<User> trainers = userRepository.findByRoles_Name("ROLE_TRAINER");
        
        // Sort trainers: those whose 'fitnessGoal' (used as specialization) matches the user's goal come first
        return trainers.stream()
            .sorted((t1, t2) -> {
                String s1 = (t1.getProfile() != null && t1.getProfile().getFitnessGoal() != null) ? t1.getProfile().getFitnessGoal().toLowerCase() : "";
                String s2 = (t2.getProfile() != null && t2.getProfile().getFitnessGoal() != null) ? t2.getProfile().getFitnessGoal().toLowerCase() : "";
                
                boolean match1 = !targetGoal.isEmpty() && s1.contains(targetGoal);
                boolean match2 = !targetGoal.isEmpty() && s2.contains(targetGoal);
                
                if (match1 && !match2) return -1;
                if (!match1 && match2) return 1;
                return 0;
            })
            .map(trainer -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", trainer.getId());
                map.put("email", trainer.getEmail());
                
                String spec = "General Fitness";
                if (trainer.getProfile() != null) {
                    if (trainer.getProfile().getName() != null) map.put("name", trainer.getProfile().getName());
                    else map.put("name", trainer.getEmail().split("@")[0]);
                    
                    if (trainer.getProfile().getFitnessGoal() != null) spec = trainer.getProfile().getFitnessGoal();
                } else {
                    map.put("name", trainer.getEmail().split("@")[0]);
                }
                map.put("specialization", spec);
                
                // Add a matching score/flag
                boolean isMatch = !targetGoal.isEmpty() && spec.toLowerCase().contains(targetGoal);
                map.put("recommended", isMatch);
                
                return map;
            }).collect(Collectors.toList());
    }

    // ✅ Send connection request to a trainer
    @PostMapping("/connect-trainer")
    public ResponseEntity<?> requestConnection(@RequestBody Map<String, String> payload,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            String trainerEmail = payload.get("trainerEmail");

            if (trainerEmail == null || trainerEmail.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trainer email is required"));
            }

            // Check if already connected or pending
            Optional<TrainerConnection> existing = connectionRepository.findByUserEmail(userEmail);
            if (existing.isPresent()) {
                TrainerConnection conn = existing.get();
                if (conn.getStatus().equals("PENDING")) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Connection request already pending"));
                }
                if (conn.getStatus().equals("APPROVED")) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Already connected to a trainer"));
                }
                // If rejected, allow re-request
                conn.setTrainerEmail(trainerEmail);
                conn.setStatus("PENDING");
                connectionRepository.save(conn);
                return ResponseEntity.ok(Map.of("message", "Connection request sent!", "status", "PENDING"));
            }

            TrainerConnection newConnection = new TrainerConnection();
            newConnection.setUserEmail(userEmail);
            newConnection.setTrainerEmail(trainerEmail);
            newConnection.setStatus("PENDING");
            connectionRepository.save(newConnection);
            return ResponseEntity.ok(Map.of("message", "Connection request sent!", "status", "PENDING"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to send connection request: " + e.getMessage()));
        }
    }

    // ✅ Disconnect from current trainer
    @PostMapping("/disconnect-trainer")
    public ResponseEntity<?> disconnectTrainer(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Optional<TrainerConnection> existing = connectionRepository.findByUserEmail(userEmail);
            
            if (existing.isPresent()) {
                connectionRepository.delete(existing.get());
                return ResponseEntity.ok(Map.of("message", "Successfully disconnected from trainer.", "status", "NONE"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", "No active connection found."));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to disconnect: " + e.getMessage()));
        }
    }

    // ✅ Get current connection status for the logged-in user
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
