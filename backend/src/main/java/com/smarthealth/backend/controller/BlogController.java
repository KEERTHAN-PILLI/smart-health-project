package com.smarthealth.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smarthealth.backend.entity.BlogComment;
import com.smarthealth.backend.entity.BlogPost;
import com.smarthealth.backend.entity.User;
import com.smarthealth.backend.repository.BlogCommentRepository;
import com.smarthealth.backend.repository.BlogPostRepository;
import com.smarthealth.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
@CrossOrigin
public class BlogController {

    private final BlogPostRepository blogPostRepository;
    private final BlogCommentRepository blogCommentRepository;
    private final UserRepository userRepository;

    // Helper to format user details for response
    private Map<String, Object> formatUser(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        if (user.getProfile() != null && user.getProfile().getName() != null) {
            map.put("name", user.getProfile().getName());
        } else {
            map.put("name", user.getEmail().split("@")[0]);
        }
        return map;
    }

    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts() {
        try {
            List<BlogPost> posts = blogPostRepository.findAllByOrderByCreatedAtDesc();
            List<Map<String, Object>> result = posts.stream().map(post -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", post.getId());
                map.put("title", post.getTitle());
                map.put("content", post.getContent());
                map.put("likes", post.getLikes());
                map.put("createdAt", post.getCreatedAt());
                map.put("author", formatUser(post.getAuthor()));
                return map;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/post")
    public ResponseEntity<?> createPost(@RequestBody BlogPost payload, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            
            payload.setAuthor(user);
            BlogPost saved = blogPostRepository.save(payload);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/post/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody BlogPost payload, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            
            BlogPost existing = blogPostRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
            
            // Check authorization
            if (!existing.getAuthor().getId().equals(user.getId()) && user.getRoles().stream().noneMatch(r -> r.getName().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
            }

            if (payload.getTitle() != null) existing.setTitle(payload.getTitle());
            if (payload.getContent() != null) existing.setContent(payload.getContent());

            BlogPost saved = blogPostRepository.save(existing);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/post/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            
            BlogPost existing = blogPostRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
            
            if (!existing.getAuthor().getId().equals(user.getId()) && user.getRoles().stream().noneMatch(r -> r.getName().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
            }

            // Also delete all comments associated with this post. Handled typically by cascade but let's be explicit because we fetch LAZY and cascade isn't set.
            List<BlogComment> comments = blogCommentRepository.findByPostOrderByCreatedAtAsc(existing);
            blogCommentRepository.deleteAll(comments);
            blogPostRepository.delete(existing);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/post/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id, Authentication authentication) {
        try {
            BlogPost existing = blogPostRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
            existing.setLikes(existing.getLikes() + 1);
            blogPostRepository.save(existing);
            return ResponseEntity.ok(Map.of("message", "Liked successfully", "likes", existing.getLikes()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/post/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long id) {
        try {
            BlogPost existing = blogPostRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
            List<BlogComment> comments = blogCommentRepository.findByPostOrderByCreatedAtAsc(existing);
            
            List<Map<String, Object>> result = comments.stream().map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("text", c.getText());
                map.put("createdAt", c.getCreatedAt());
                map.put("user", formatUser(c.getUser()));
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/post/{id}/comment")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            
            BlogPost existing = blogPostRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
            
            String text = payload.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Comment text is required"));
            }

            BlogComment comment = new BlogComment();
            comment.setPost(existing);
            comment.setUser(user);
            comment.setText(text);
            
            BlogComment saved = blogCommentRepository.save(comment);
            
            // Return formatted comment
            Map<String, Object> map = new HashMap<>();
            map.put("id", saved.getId());
            map.put("text", saved.getText());
            map.put("createdAt", saved.getCreatedAt());
            map.put("user", formatUser(saved.getUser()));
            
            return ResponseEntity.ok(map);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
