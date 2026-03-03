package com.smarthealth.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.smarthealth.backend.entity.Message;
import com.smarthealth.backend.entity.TrainerConnection;
import com.smarthealth.backend.repository.MessageRepository;
import com.smarthealth.backend.repository.TrainerConnectionRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin
public class MessageController {

    private final MessageRepository messageRepository;
    private final TrainerConnectionRepository connectionRepository;

    // ✅ Send a message (only if APPROVED connection exists)
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> payload, Authentication authentication) {
        try {
            String senderEmail = authentication.getName();
            String receiverEmail = payload.get("receiverEmail");
            String content = payload.get("content");

            if (receiverEmail == null || content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Receiver and content are required"));
            }

            // Verify approved connection exists between sender and receiver
            boolean isConnected = isApprovedConnection(senderEmail, receiverEmail);
            if (!isConnected) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "You can only message users you are connected to"));
            }

            Message message = Message.builder()
                    .senderEmail(senderEmail)
                    .receiverEmail(receiverEmail)
                    .content(content.trim())
                    .timestamp(LocalDateTime.now())
                    .build();

            messageRepository.save(message);
            return ResponseEntity.ok(Map.of("message", "Message sent!", "id", message.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send message: " + e.getMessage()));
        }
    }

    // ✅ Get conversation with another user (only if APPROVED connection exists)
    @GetMapping("/{otherEmail}")
    public ResponseEntity<?> getConversation(@PathVariable String otherEmail, Authentication authentication) {
        try {
            String myEmail = authentication.getName();

            // Verify approved connection exists
            boolean isConnected = isApprovedConnection(myEmail, otherEmail);
            if (!isConnected) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "You can only view messages with connected users"));
            }

            List<Message> messages = messageRepository.findConversation(myEmail, otherEmail);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to load messages: " + e.getMessage()));
        }
    }

    // Helper: check if an APPROVED connection exists between two emails (in either
    // direction)
    private boolean isApprovedConnection(String email1, String email2) {
        // Check user→trainer direction
        var conn1 = connectionRepository.findByUserEmailAndTrainerEmail(email1, email2);
        if (conn1.isPresent() && "APPROVED".equals(conn1.get().getStatus()))
            return true;

        // Check trainer→user direction
        var conn2 = connectionRepository.findByUserEmailAndTrainerEmail(email2, email1);
        if (conn2.isPresent() && "APPROVED".equals(conn2.get().getStatus()))
            return true;

        return false;
    }
}
